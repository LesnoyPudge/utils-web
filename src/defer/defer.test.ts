import { defer } from './defer';



afterEach(vi.useRealTimers);

describe('defer', () => {
    it('should execute function with delay', () => {
        vi.useFakeTimers();

        const spy = vi.fn();

        void defer(spy);

        expect(spy).toBeCalledTimes(0);

        vi.advanceTimersByTime(100);

        expect(spy).toBeCalledTimes(1);
    });

    it('should provide promise', async () => {
        const spy = vi.fn();

        await defer(spy);

        expect(spy).toBeCalledTimes(1);
    });
});