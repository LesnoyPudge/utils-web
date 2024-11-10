import { T } from '@lesnoypudge/types-utils-base/namespace';
import { autoBind, derivedPromise, noop } from '@lesnoypudge/utils';



type QueueItem<_Args extends unknown[], _Return> = (
    derivedPromise.Controls<_Return> & {
        promise: Promise<_Return>;
        args: _Args;
    }
);

export class InlineWorker<
    _Arg extends unknown[] = unknown[],
    _Return = void,
> {
    private worker: Worker | null;
    private queue: QueueItem<_Arg, _Return>[];
    private fn: T.AnyFunction<_Arg, _Return>;
    private onSuccess: T.AnyFunction<[_Return]>;
    private onError: T.AnyFunction<[ErrorEvent]>;

    constructor(
        fn: T.AnyFunction<_Arg, _Return>,
        onSuccess: T.AnyFunction<[_Return]> = noop,
        onError: T.AnyFunction<[ErrorEvent]> = noop,
    ) {
        this.worker = null;
        this.queue = [];
        this.fn = fn;
        this.onSuccess = onSuccess;
        this.onError = onError;

        autoBind(this);
    }

    private createWorker(fn: T.AnyFunction<_Arg, _Return>) {
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

        worker.addEventListener('error', (event) => {
            this.queue[0]?.reject(event);
            this.onError(event);
        });

        worker.addEventListener('message', (event: MessageEvent<_Return>) => {
            this.queue[0]?.resolve(event.data);
            this.onSuccess(event.data);
        });

        return worker;
    }

    start(...args: _Arg): Promise<_Return> {
        if (!this.worker) {
            this.worker = this.createWorker(this.fn);
        }

        const [promise, controls] = derivedPromise<_Return>();

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