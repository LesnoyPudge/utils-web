import { autoBind, ListenerStore } from '@lesnoypudge/utils';



type Args = [entry: ResizeObserverEntry];
type StoreCallback = ListenerStore.Callback<Args>;

export class SharedResizeObserver {
    private listeners: ListenerStore<Element, Args>;
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
        listener: StoreCallback,
        options?: ResizeObserverOptions,
    ) {
        this.listeners.add(element, listener);
        this.observer.observe(element, options);
    }

    unobserve(element: Element, listener: StoreCallback) {
        this.listeners.remove(element, listener);
        this.observer.unobserve(element);
    }

    disconnect() {
        this.observer.disconnect();
    }
}