import { T } from '@lesnoypudge/types-utils-base/namespace';
import { autoBind, ListenerStore } from '@lesnoypudge/utils';



export namespace SharedMutationObserver {
    type RequiredOptions = T.RequireAtLeastOne<Pick<
        MutationObserverInit,
        'attributes' | 'childList' | 'characterData'
    >>;

    export type Args = [entry: MutationRecord];

    export type StoreCallback = ListenerStore.Callback<Args>;

    export type Options = (
        RequiredOptions
        & T.Except<MutationObserverInit, keyof RequiredOptions>
    );
}

/**
 * A class for managing mutation observers and their listeners.
 * Allows observing, unobserving elements, and disconnecting all
 * observers.
 */
export class SharedMutationObserver {
    private listeners: ListenerStore<
        Node,
        SharedMutationObserver.Args
    >;

    private observer: MutationObserver;
    private elementsToOptionsMap: Map<
        Node,
        SharedMutationObserver.Options
    >;

    constructor() {
        this.listeners = new ListenerStore();
        this.elementsToOptionsMap = new Map();

        this.observer = new MutationObserver(this.processRecords.bind(this));

        autoBind(this);
    }

    private processRecords(records: MutationRecord[]) {
        records.forEach((record) => {
            this.listeners.trigger(record.target, record);
        });
    }

    observe(
        element: Element,
        listener: SharedMutationObserver.StoreCallback,
        options: SharedMutationObserver.Options,
    ) {
        this.elementsToOptionsMap.set(element, options);
        this.listeners.add(element, listener);
        this.observer.observe(element, options);
    }

    unobserve(
        element: Element,
        listener: SharedMutationObserver.StoreCallback,
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