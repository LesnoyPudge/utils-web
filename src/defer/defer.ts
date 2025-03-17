import { createDefer } from '@root/createDefer';



/**
 * Returns promise that resolves when provided callback is executed.
 * Execution happens when main thread is idle.
 */
export const defer = <_Return>(
    fn: () => _Return | Promise<_Return>,
    options?: createDefer.Options,
): Promise<_Return> => {
    return new Promise((resolve) => {
        const { startDefer } = createDefer(() => {
            const result = fn();

            if (result instanceof Promise) {
                void result.then(resolve);
                return;
            }

            resolve(result);
        }, options);

        startDefer();
    });
};