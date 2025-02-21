import { userEvent } from '@vitest/browser/context';
import { focusVisibleManager } from './focusVisibleManager';



// focus behavior is tested in https://github.com/WICG/focus-visible
describe('focusVisibleManager', () => {
    it('should work', async () => {
        const inSpy = vi.fn();
        const outSpy = vi.fn();

        focusVisibleManager.start();

        focusVisibleManager.onIn(inSpy);
        focusVisibleManager.onOut(outSpy);

        const button = document.createElement('button');

        document.body.append(button);

        expect(document.body).toBe(document.activeElement);

        await userEvent.tab();

        expect(inSpy).toBeCalledTimes(1);
        expect(outSpy).toBeCalledTimes(0);

        expect(button).toBe(document.activeElement);

        expect(
            focusVisibleManager.isFocusVisible(button),
        ).toBe(true);

        await userEvent.click(document.body);

        expect(inSpy).toBeCalledTimes(1);
        expect(outSpy).toBeCalledTimes(1);

        expect(button).not.toBe(document.activeElement);

        expect(
            focusVisibleManager.isFocusVisible(button),
        ).toBe(false);

        focusVisibleManager.stop();

        expect(document.body).toBe(document.activeElement);

        await userEvent.tab();

        expect(inSpy).toBeCalledTimes(1);
        expect(outSpy).toBeCalledTimes(1);

        expect(button).toBe(document.activeElement);

        expect(
            focusVisibleManager.isFocusVisible(button),
        ).toBe(false);
    });
});