import { T } from '@lesnoypudge/types-utils-base/namespace';
import { autoBind, combinedFunction, ListenerStore, parseJSON, patch } from '@lesnoypudge/utils';
import { addEventListener } from '@root/addEventListener';



type GetGetReturnType<
    _Schema extends Record<string, unknown>,
    _Key extends T.StringKeyOf<_Schema>,
    _DefaultValue extends (_Schema[_Key] | undefined),
> = (
    _DefaultValue extends undefined
        ? (_Schema[_Key] | undefined)
        : _DefaultValue
);

/**
 * A class for managing local storage with support for event-based
 * listeners and change tracking. Allows setting, getting, removing
 * items, and subscribing to changes.
 * Returned values are parsed.
 */
export class LocalStorage<
    _Schema extends Record<string, unknown>,
> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private listeners: ListenerStore<string, [any]>;
    private cleanupCallback;

    constructor() {
        this.listeners = new ListenerStore();

        const updateFn = (
            key: string | null,
            newValue: string | null,
        ) => {
            // clear event
            if (key === null) {
                this.listeners.triggerAll(undefined);
                return;
            }

            // remove event
            if (newValue === null) {
                this.listeners.trigger(key, undefined);
                return;
            }

            // set event
            this.listeners.trigger(key, parseJSON(newValue));
        };

        const prototype = Object.getPrototypeOf(localStorage) as Storage;

        this.cleanupCallback = combinedFunction(
            patch({
                objectToPatch: prototype,
                providedThis: localStorage,
                methodName: 'setItem',
                patchedMethodFactory: (fn) => {
                    return (key, value) => {
                        fn(key, value);
                        updateFn(key, value);
                    };
                },
            }),

            patch({
                objectToPatch: prototype,
                providedThis: localStorage,
                methodName: 'removeItem',
                patchedMethodFactory: (fn) => {
                    return (key) => {
                        fn(key);
                        // remove event
                        updateFn(key, null);
                    };
                },
            }),

            patch({
                objectToPatch: prototype,
                providedThis: localStorage,
                methodName: 'clear',
                patchedMethodFactory: (fn) => {
                    return () => {
                        fn();
                        // clear event
                        updateFn(null, null);
                    };
                },
            }),

            addEventListener(window, 'storage', (e) => {
                updateFn(e.key, e.newValue);
            }),
        );

        autoBind(this);
    }

    cleanup() {
        this.cleanupCallback();
    }

    set<_Key extends T.StringKeyOf<_Schema>>(
        key: _Key,
        value: _Schema[_Key],
    ) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    get<
        _Key extends T.StringKeyOf<_Schema>,
        _DefaultValue extends (_Schema[_Key] | undefined),
    >(
        key: _Key,
        defaultValue?: _DefaultValue,
    ): GetGetReturnType<_Schema, _Key, _DefaultValue> {
        const rawValue = localStorage.getItem(String(key));
        if (rawValue === null) return defaultValue as (
            GetGetReturnType<_Schema, _Key, _DefaultValue>
        );

        const value = parseJSON(rawValue) as _Schema[_Key] | undefined;

        return (value ?? defaultValue) as (
            GetGetReturnType<_Schema, _Key, _DefaultValue>
        );
    }

    remove<_Key extends T.StringKeyOf<_Schema>>(key: _Key) {
        localStorage.removeItem(key);
    }

    clear() {
        localStorage.clear();
    }

    onChange<_Key extends T.StringKeyOf<_Schema>>(
        key: _Key,
        callback: (value: _Schema[_Key] | undefined) => void,
    ): VoidFunction {
        return this.listeners.add(key, callback);
    }
}