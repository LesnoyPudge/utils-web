import { autoBind, ListenerStore } from '@lesnoypudge/utils';



export namespace SharedResizeObserver {
    export type Args = [entry: ResizeObserverEntry];

    export type StoreCallback = ListenerStore.Callback<Args>;

    export type Options = ResizeObserverOptions;
}

/**
 * A class for managing resize observers and their listeners.
 * Allows observing, unobserving elements, and disconnecting the
 * resize observer.
 */
export class SharedResizeObserver {
    private listeners: ListenerStore<
        Element,
        SharedResizeObserver.Args
    >;

    private observer: ResizeObserver;

    constructor() {
        this.listeners = new ListenerStore();
        this.observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                this.listeners.trigger(entry.target, entry);
            });
        });

        autoBind(this);
    }

    observe(
        element: Element,
        listener: SharedResizeObserver.StoreCallback,
        options?: SharedResizeObserver.Options,
    ) {
        this.listeners.add(element, listener);
        this.observer.observe(element, options);
    }

    unobserve(
        element: Element,
        listener: SharedResizeObserver.StoreCallback,
    ) {
        this.listeners.remove(element, listener);
        this.observer.unobserve(element);
    }

    disconnect() {
        this.observer.disconnect();
    }
}