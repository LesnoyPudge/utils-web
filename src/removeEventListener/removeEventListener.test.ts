import { userEvent } from '@vitest/browser/context';
import { removeEventListener } from './removeEventListener';



describe('removeEventListener', () => {
    it('should remove event', async () => {
        const spy = vi.fn();
        const div = document.createElement('div');

        div.textContent = 'test';
        document.body.append(div);

        div.addEventListener('click', spy);

        await userEvent.click(div);

        expect(spy).toBeCalledTimes(1);

        removeEventListener(div, 'click', spy);

        await userEvent.click(div);

        expect(spy).toBeCalledTimes(1);
    });
});