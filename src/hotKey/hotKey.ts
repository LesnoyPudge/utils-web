import { KEY } from '@root';


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

const matcher = (keyCombo: hotKey.KeyCombo) => {
    return (e: KeyboardEvent) => {
        const activeKeys = Array.from(new Set([
            e.altKey && KEY.Alt.toLowerCase(),
            e.ctrlKey && KEY.Control.toLowerCase(),
            e.shiftKey && KEY.Shift.toLowerCase(),
            e.metaKey && KEY.Meta.toLowerCase(),
            e.key.toLowerCase(),
        ].filter(Boolean)));

        if (activeKeys.length !== keyCombo.length) return false;

        const isMatch = (
            keyCombo.map((key) => activeKeys.includes(key.toLowerCase()))
            .find((res) => !res)
            ?? true
        );

        return isMatch;
    };
};

const make: hotKey.Make = (...keyCombos) => {
    return (action, options) => {
        return (e) => {
            const isMatch = keyCombos.map((keyCombo) => {
                return matcher(keyCombo)(e);
            }).some((res) => res);

            if (!isMatch) return false;

            options?.prevent && e.preventDefault();
            options?.stop && e.stopPropagation();
            options?.stopImmediate && e.stopImmediatePropagation();

            action(e);

            return true;
        };
    };
};

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

export const hotKey = {
    make,
    many: uniter(Infinity),
    one: uniter(1),
    matcher,
};