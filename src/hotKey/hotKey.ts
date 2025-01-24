import { KEY } from '@lesnoypudge/utils';


export namespace hotKey {
    export type Action = (e: KeyboardEvent) => void;

    export type Handler = (e: KeyboardEvent) => boolean;

    export type HotKeyOptions = {
        prevent?: boolean;
        stop?: boolean;
        stopImmediate?: boolean;
    };

    export type HotKey = (action: Action, options?: HotKeyOptions) => Handler;

    export type KeyCombo = string[];

    export type Make = (...keys: KeyCombo[]) => HotKey;

    export type EventLike = KeyboardEvent & {
        nativeEvent?: KeyboardEvent;
    };
}

/**
 * Matches a keyboard event against a specified key combination.
 */
const matcher = (keyCombo: hotKey.KeyCombo) => {
    return (e: KeyboardEvent) => {
        const activeKeys = [...new Set([
            e.altKey && KEY.Alt.toLowerCase(),
            e.ctrlKey && KEY.Control.toLowerCase(),
            e.shiftKey && KEY.Shift.toLowerCase(),
            e.metaKey && KEY.Meta.toLowerCase(),
            e.key.toLowerCase(),
        ].filter(Boolean))];

        if (activeKeys.length !== keyCombo.length) return false;

        const isMatch = (
            keyCombo.map((key) => {
                return activeKeys.includes(key.toLowerCase());
            }).find((res) => !res)
            ?? true
        );

        return isMatch;
    };
};

/**
 * Creates an action that triggers when any of the provided key
 * combinations are matched in a keyboard event.
 */
const make: hotKey.Make = (...keyCombos) => {
    return (action, options) => {
        return (e) => {
            const isMatch = keyCombos.map((keyCombo) => {
                return matcher(keyCombo)(e);
            }).some(Boolean);

            if (!isMatch) return false;

            options?.prevent && e.preventDefault();
            options?.stop && e.stopPropagation();
            options?.stopImmediate && e.stopImmediatePropagation();

            action(e);

            return true;
        };
    };
};

/**
 * Creates a function that limits the number of handler calls to
 * the specified maximum.
 */
const uniter = (maxCalls: number) => {
    return (...handlers: hotKey.Handler[]) => {
        return (e: hotKey.EventLike): boolean => {
            let count = 0;
            let bail = count >= maxCalls;
            const event = e.nativeEvent ?? e;

            handlers.forEach((handler) => {
                if (bail) return;

                const isHandled = handler(event);
                if (isHandled) count++;

                bail = count >= maxCalls;
            });

            return !!count;
        };
    };
};

/**
 * Provides utility functions for handling hotkey combinations
 * and event management, including action creation and handler
 * limiting.
 */
export const hotKey = {
    make,
    many: uniter(Infinity),
    one: uniter(1),
    matcher,
};