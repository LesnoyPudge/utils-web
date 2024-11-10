import { autoBind, Cache, ListenerStore } from '@lesnoypudge/utils';



type Args = [entry: IntersectionObserverEntry];
type StoreCallback = ListenerStore.Callback<Args>;
export class SharedIntersectionObserver {
    private listeners: ListenerStore<Element, Args>;
    private observers: Cache<IntersectionObserver>;
    private elementsToOptionsMap: Map<
        Node,
        IntersectionObserverInit | undefined
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
        listener: StoreCallback,
        options?: IntersectionObserverInit,
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
        listener: StoreCallback,
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