import { T } from '@lesnoypudge/types-utils-base/namespace';
import { DerivedPromiseControls, autoBind, derivedPromise, noop } from '@root';



type QueueItem<Args extends unknown[], Return> = (
    DerivedPromiseControls<Return> & {
        promise: Promise<Return>;
        args: Args;
    }
);

export class InlineWorker<Arg extends unknown[] = unknown[], Return = void> {
    private worker: Worker | null;
    private queue: QueueItem<Arg, Return>[];
    private fn: T.AnyFunction<Arg, Return>;
    private onSuccess: T.AnyFunction<[Return]>;
    private onError: T.AnyFunction<[ErrorEvent]>;

    constructor(
        fn: T.AnyFunction<Arg, Return>,
        onSuccess: T.AnyFunction<[Return]> = noop,
        onError: T.AnyFunction<[ErrorEvent]> = noop,
    ) {
        this.worker = null;
        this.queue = [];
        this.fn = fn;
        this.onSuccess = onSuccess;
        this.onError = onError;

        autoBind(this);
    }

    private createWorker(fn: T.AnyFunction<Arg, Return>) {
        const workerCode = (`
            const workerFunction = (${fn.toString()});
        
            onmessage = (event) => {
                const args = event.data;
                const result = workerFunction(...args);
                postMessage(result);
            };
        `);
        const workerBlob = new Blob([workerCode], {
            type: 'application/javascript',
        });
        const worker = new Worker(URL.createObjectURL(workerBlob));

        worker.onerror = (event) => {
            this.queue[0]?.reject(event);
            this.onError(event);
        };

        worker.onmessage = (event: MessageEvent<Return>) => {
            this.queue[0]?.resolve(event.data);
            this.onSuccess(event.data);
        };

        return worker;
    }

    start(...args: Arg): Promise<Return> {
        if (!this.worker) {
            this.worker = this.createWorker(this.fn);
        }

        const [promise, controls] = derivedPromise<Return>();

        void promise.finally(() => {
            this.queue.shift();

            if (this.queue.length) {
                this.worker?.postMessage(this.queue[0]?.args);
            }
        });

        this.queue.push({
            promise,
            args,
            ...controls,
        });

        if (this.queue.length <= 1) {
            this.worker.postMessage(this.queue[0]?.args);
        }

        return promise;
    }

    cancel() {
        this.queue[0]?.reject();
    }

    terminate() {
        this.worker?.terminate();
        this.worker = null;
        const items = [...this.queue];
        this.queue = [];

        items.forEach((item) => item.reject());
    }
}