import { SharedResizeObserver } from './SharedResizeObserver';



describe('SharedResizeObserver', () => {
    it('should trigger callback on resize', async () => {
        const observer = new SharedResizeObserver();
        const div = document.createElement('div');
        const spy = vi.fn();

        observer.observe(div, spy);

        div.textContent = 'test';

        await vi.waitFor(() => {
            expect(spy).toBeCalledTimes(1);
        });
    });

    it('should unobserve and stop triggering callback', async () => {
        const observer = new SharedResizeObserver();
        const div = document.createElement('div');
        const listener = vi.fn();

        observer.observe(div, listener);
        observer.unobserve(div, listener);

        div.textContent = 'test';

        await vi.waitFor(() => {
            expect(listener).toBeCalledTimes(0);
        });
    });

    it('should disconnect and stop observing all elements', async () => {
        const observer = new SharedResizeObserver();
        const div = document.createElement('div');
        const listener = vi.fn();

        observer.observe(div, listener);
        observer.disconnect();

        div.textContent = 'test';

        await vi.waitFor(() => {
            expect(listener).toBeCalledTimes(0);
        });
    });
});