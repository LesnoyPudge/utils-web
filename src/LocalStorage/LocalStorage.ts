import { T } from '@lesnoypudge/types-utils-base/namespace';
import { ListenerStore, parseJSON } from '@lesnoypudge/utils';
import { addEventListener } from '@root';



let externalListeners: ListenerStore<string, [unknown]> | undefined;

export class LocalStorage<
    _Schema extends Record<string, unknown>,
> {
    private listeners;
    private cleanupCallback;

    constructor() {
        if (externalListeners === undefined) {
            externalListeners = new ListenerStore();
        }

        this.listeners = externalListeners;
        this.cleanupCallback = addEventListener(window, 'storage', (e) => {
            // clear event
            if (e.key === null) {
                this.listeners.triggerAll(undefined);
                return;
            }

            // remove event
            if (e.newValue === null) {
                this.listeners.trigger(e.key, undefined);
                return;
            }

            // set event
            this.listeners.trigger(e.key, parseJSON(e.newValue));
        });
    }

    cleanup() {
        this.cleanupCallback();
    }

    set<_Key extends T.StringKeyOf<_Schema>>(
        key: _Key,
        value: _Schema[_Key],
    ) {
        localStorage.setItem(key, JSON.stringify(value));
        this.listeners.trigger(key, value);
    }

    get<
        _Key extends T.StringKeyOf<_Schema>,
        _DefaultValue extends (_Schema[_Key] | undefined),
    >(
        key: _Key,
        defaultValue?: _DefaultValue,
    ): (
        _DefaultValue extends undefined
            ? (_Schema[_Key] | undefined)
            : _Schema[_Key]
        ) {
        const rawValue = localStorage.getItem(String(key));
        if (rawValue === null) {
            if (defaultValue !== undefined) {
                this.set(key, defaultValue);
            }

            // @ts-expect-error
            return defaultValue;
        }

        const value = parseJSON(rawValue) as _Schema[_Key];
        if (value === undefined) {
            if (defaultValue !== undefined) {
                this.set(key, defaultValue);
            }
            // @ts-expect-error
            return defaultValue;
        };

        return value;
    }

    remove<_Key extends T.StringKeyOf<_Schema>>(key: _Key) {
        localStorage.removeItem(key);
        this.listeners.trigger(key, undefined);
    }

    clear() {
        localStorage.clear();
        this.listeners.triggerAll(undefined);
    }

    onChange<_Key extends T.StringKeyOf<_Schema>>(
        key: _Key,
        callback: (value: _Schema[_Key] | undefined) => void,
    ) {
        // @ts-expect-error
        return this.listeners.add(key, callback);
    }
}