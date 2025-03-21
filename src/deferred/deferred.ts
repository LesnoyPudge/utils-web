import { defer } from '@root/defer';



/**
 * Wraps provided function in `defer`.
 *
 * Returns function that executes provided callback
 * when main thread is idle.
 */
export const deferred = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _Args extends any[],
    _Return,
>(fn: (...args: _Args) => _Return) => {
    return (...args: _Args) => {
        return defer(() => fn(...args));
    };
};