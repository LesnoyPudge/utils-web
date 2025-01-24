import { autoBind, Cache, ListenerStore } from '@lesnoypudge/utils';



export namespace SharedIntersectionObserver {
    export type Args = [entry: IntersectionObserverEntry];

    export type StoreCallback = ListenerStore.Callback<Args>;

    export type Options = IntersectionObserverInit;
}

/**
 * A class for managing intersection observers and their listeners.
 * Allows observing, unobserving elements, and disconnecting all
 * observers.
 */
export class SharedIntersectionObserver {
    private listeners: ListenerStore<
        Element,
        SharedIntersectionObserver.Args
    >;

    private observers: Cache<IntersectionObserver>;
    private elementsToOptionsMap: Map<
        Node,
        SharedIntersectionObserver.Options | undefined
    >;

    constructor() {
        this.listeners = new ListenerStore();
        this.observers = new Cache();
        this.elementsToOptionsMap = new Map();

        autoBind(this);
    }

    private observerCallback(entries: IntersectionObserverEntry[]) {
        entries.forEach((entry) => {
            this.listeners.trigger(entry.target, entry);
        });
    }

    observe(
        element: Element,
        listener: SharedIntersectionObserver.StoreCallback,
        options?: SharedIntersectionObserver.Options,
    ) {
        this.elementsToOptionsMap.set(element, options);
        const observer = this.observers.getOrSet(
            [options],
            () => new IntersectionObserver(this.observerCallback, options),
        );

        this.listeners.add(element, listener);
        observer.observe(element);
    }

    unobserve(
        element: Element,
        listener: SharedIntersectionObserver.StoreCallback,
    ) {
        const options = this.elementsToOptionsMap.get(element);
        const observer = this.observers.get([options]);
        if (!observer) return;

        this.elementsToOptionsMap.delete(element);
        this.listeners.remove(element, listener);
        observer.unobserve(element);
    }

    disconnect() {
        this.elementsToOptionsMap.clear();
        this.listeners.removeAll();
        this.observers.destroy();
    }
}