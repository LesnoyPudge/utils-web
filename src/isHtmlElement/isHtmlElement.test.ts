import { isHtmlElement } from './isHtmlElement';



describe('isHtmlElement', () => {
    it('should match html element', () => {
        const div = document.createElement('div');

        expect(isHtmlElement(div)).toBe(true);
        expect(isHtmlElement(window)).toBe(false);
    });
});