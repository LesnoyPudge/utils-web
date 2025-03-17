import { sleep } from '@lesnoypudge/utils';
import { createDefer } from './createDefer';



// for some reason cancelIdleCallback does not work with fake timers
describe('createDefer', () => {
    it('should execute function with delay', async () => {
        const spy = vi.fn();

        const { startDefer } = createDefer(spy);

        startDefer();

        expect(spy).toBeCalledTimes(0);

        await sleep(100);

        expect(spy).toBeCalledTimes(1);
    });

    it('should not execute', async () => {
        const spy = vi.fn();

        const {
            startDefer,
            cancelDefer,
        } = createDefer(spy);

        startDefer();

        cancelDefer();

        await sleep(100);

        expect(spy).toBeCalledTimes(0);
    });
});