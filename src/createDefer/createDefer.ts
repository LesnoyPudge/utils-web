


const isIdleSupported = typeof window.requestIdleCallback === 'function';

const defaultOptions: createDefer.Options = {
    timeout: 2_000,
};

export namespace createDefer {
    export type StartDefer = VoidFunction;

    export type CancelDefer = VoidFunction;

    export type Options = IdleRequestOptions;

    export type Return = {
        startDefer: StartDefer;
        cancelDefer: CancelDefer;
    };
}

/**
 * Creates controls for deferred execution of provided callback.
 */
export const createDefer = (
    fn: VoidFunction,
    options?: createDefer.Options,
): createDefer.Return => {
    let idRaf: number | null = null;
    let idIdle: number | null = null;

    const startDefer: createDefer.StartDefer = () => {
        cancelDefer();

        if (isIdleSupported) {
            idIdle = window.requestIdleCallback(() => {
                idRaf = window.requestAnimationFrame(fn);
            }, options ?? defaultOptions);

            return;
        }

        idRaf = window.requestAnimationFrame(fn);
    };

    const cancelDefer: createDefer.CancelDefer = () => {
        if (idIdle !== null) {
            window.cancelIdleCallback(idIdle);
            idIdle = null;
        }

        if (idRaf !== null) {
            window.cancelAnimationFrame(idRaf);
            idRaf = null;
        }
    };

    return {
        startDefer,
        cancelDefer,
    };
};