import { SharedIntersectionObserver } from './SharedIntersectionObserver';



describe('SharedIntersectionObserver', () => {
    it('should trigger callback on intersection change', async () => {
        const observer = new SharedIntersectionObserver();
        const spy = vi.fn();
        const div = document.createElement('div');

        document.body.append(div);

        div.style.position = 'fixed';

        observer.observe(div, (entry) => {
            spy(entry.isIntersecting);
        });

        await vi.waitFor(() => {
            expect(spy).toBeCalledTimes(1);
            expect(spy).toHaveBeenLastCalledWith(true);
        });

        div.style.left = '-9999px';

        await vi.waitFor(() => {
            expect(spy).toBeCalledTimes(2);
            expect(spy).toHaveBeenLastCalledWith(false);
        });
    });
});