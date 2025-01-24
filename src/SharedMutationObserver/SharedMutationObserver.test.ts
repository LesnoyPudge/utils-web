import { SharedMutationObserver } from './SharedMutationObserver';



describe('SharedMutationObserver', () => {
    it('should trigger callback on change', async () => {
        const observer = new SharedMutationObserver();
        const spy = vi.fn();
        const div = document.createElement('div');

        document.body.append(div);

        observer.observe(div, (entry) => {
            spy(entry.target);
        }, { attributes: true });

        expect(spy).toBeCalledTimes(0);

        div.style.left = '-9999px';

        await vi.waitFor(() => {
            expect(spy).toBeCalledTimes(1);
            expect(spy).toHaveBeenLastCalledWith(div);
        });
    });
});