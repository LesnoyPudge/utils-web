import { T } from '@lesnoypudge/types-utils-base/namespace';
import { combinedFunction, ListenerStore, parseJSON } from '@lesnoypudge/utils';
import { addEventListener } from '@root/addEventListener';



type Store = ListenerStore<string, [any]>;

const sharedStore = new ListenerStore();

/**
 * A class for managing local storage with support for event-based
 * listeners and change tracking. Allows setting, getting, removing
 * items, and subscribing to changes.
 */
export class LocalStorage<
    _Schema extends Record<string, unknown>,
> {
    private globalListeners: Store;
    private localListeners: Store;
    private cleanupCallback;

    constructor() {
        this.globalListeners = sharedStore;
        this.localListeners = new ListenerStore();

        this.cleanupCallback = addEventListener(window, 'storage', (e) => {
            // clear event
            if (e.key === null) {
                this.localListeners.triggerAll(undefined);
                return;
            }

            // remove event
            if (e.newValue === null) {
                this.localListeners.trigger(e.key, undefined);
                return;
            }

            // set event
            this.localListeners.trigger(e.key, parseJSON(e.newValue));
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
        this.globalListeners.trigger(key, value);
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
        this.globalListeners.trigger(key, undefined);
    }

    clear() {
        localStorage.clear();
        this.globalListeners.triggerAll(undefined);
    }

    onChange<_Key extends T.StringKeyOf<_Schema>>(
        key: _Key,
        callback: (value: _Schema[_Key] | undefined) => void,
    ): VoidFunction {
        return combinedFunction(
            this.globalListeners.add(key, callback),
            this.localListeners.add(key, callback),
        );
    }
}