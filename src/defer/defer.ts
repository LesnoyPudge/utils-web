import { createDefer } from '@root/createDefer';



/**
 * Executes provided callback when main thread is idle.
 */
export const defer = (
    fn: VoidFunction,
    options?: createDefer.Options,
) => {
    const { startDefer } = createDefer(fn, options);

    startDefer();
};