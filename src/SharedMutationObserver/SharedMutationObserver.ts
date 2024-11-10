import { autoBind, ListenerStore } from '@lesnoypudge/utils';



type Args = [entry: MutationRecord];
type StoreCallback = ListenerStore.Callback<Args>;

export class SharedMutationObserver {
    private listeners: ListenerStore<Node, Args>;
    private observer: MutationObserver;
    private elementsToOptionsMap: Map<Node, MutationObserverInit | undefined>;

    constructor() {
        this.listeners = new ListenerStore();
        this.observer = new MutationObserver(this.processRecords);
        this.elementsToOptionsMap = new Map();

        autoBind(this);
    }

    private processRecords(records: MutationRecord[]) {
        records.forEach((record) => {
            this.listeners.trigger(record.target, record);
        });
    }

    observe(
        element: Element,
        listener: StoreCallback,
        options?: MutationObserverInit,
    ) {
        this.elementsToOptionsMap.set(element, options);
        this.listeners.add(element, listener);
        this.observer.observe(element, options);
    }

    unobserve(
        element: Element,
        listener: StoreCallback,
    ) {
        this.listeners.remove(element, listener);
        this.elementsToOptionsMap.delete(element);

        if (this.listeners.getSize() < 1) {
            this.disconnect();
            return;
        }

        this.processRecords(this.observer.takeRecords());
        this.disconnect();

        this.elementsToOptionsMap.forEach((options) => {
            this.observe(element, listener, options);
        });
    }

    disconnect() {
        this.elementsToOptionsMap.clear();
        this.listeners.removeAll();
        this.observer.disconnect();
    }
}