import { defer } from './defer';



vi.useFakeTimers();

describe('defer', () => {
    it('should execute function with delay', () => {
        const spy = vi.fn();

        defer(spy);

        expect(spy).toBeCalledTimes(0);

        vi.advanceTimersByTime(100);

        expect(spy).toBeCalledTimes(1);
    });
});