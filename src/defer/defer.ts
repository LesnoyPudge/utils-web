import { createDefer } from '@root/createDefer';



/**
 * Returns a promise that resolves when
 * the provided callback executes.
 *
 * Execution occurs when the main thread is idle.
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