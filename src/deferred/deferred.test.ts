import { deferred } from './deferred';



afterEach(vi.useRealTimers);

describe('deferred', () => {
    it('should execute function with delay', () => {
        vi.useFakeTimers();

        const spy = vi.fn();

        const deferredSpy = deferred(spy);

        void deferredSpy();

        expect(spy).toBeCalledTimes(0);

        vi.advanceTimersByTime(100);

        expect(spy).toBeCalledTimes(1);
    });

    it('should provide promise', async () => {
        const spy = vi.fn();

        await deferred(spy)();

        expect(spy).toBeCalledTimes(1);
    });
});