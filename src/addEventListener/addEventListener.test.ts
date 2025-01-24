import { userEvent } from '@vitest/browser/context';
import { addEventListener } from './addEventListener';



describe('addEventListener', () => {
    it('1', async () => {
        const spy = vi.fn();
        const div = document.createElement('div');

        div.textContent = 'test';
        document.body.append(div);

        const unsub = addEventListener(div, 'click', spy);

        await userEvent.click(div);

        expect(spy).toBeCalledTimes(1);

        unsub();

        await userEvent.click(div);

        expect(spy).toBeCalledTimes(1);
    });
});