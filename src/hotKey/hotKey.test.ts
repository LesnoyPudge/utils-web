import { hotKey } from './hotKey';
import { KEY, noop } from '@lesnoypudge/utils';



describe('hotKey', () => {
    it('should trigger callback on key combo match', () => {
        const e1 = new KeyboardEvent('keydown', { key: KEY.W });
        const e2 = new KeyboardEvent('keydown', { key: KEY.Space });
        const e3 = new KeyboardEvent('keydown', { ctrlKey: true });
        const e4 = new KeyboardEvent('keydown', {});
        const e5 = new KeyboardEvent(
            'keydown',
            { key: KEY.A, shiftKey: true },
        );

        expect(hotKey.make([KEY.W])(noop)(e1)).toBe(true);
        expect(hotKey.make([KEY.A])(noop)(e1)).toBe(false);
        expect(hotKey.make([KEY.W, KEY.A])(noop)(e1)).toBe(false);
        expect(hotKey.make([KEY.Control, KEY.W])(noop)(e1)).toBe(false);
        expect(
            hotKey.make([KEY.Control, KEY.Alt, KEY.W])(noop)(e1),
        ).toBe(false);

        expect(hotKey.make([KEY.Space])(noop)(e2)).toBe(true);
        expect(hotKey.make([KEY.Control, KEY.Space])(noop)(e2)).toBe(false);
        expect(hotKey.make([KEY.Space + KEY.Space])(noop)(e2)).toBe(false);

        expect(hotKey.make([KEY.Control])(noop)(e3)).toBe(true);
        expect(hotKey.make([KEY.Control, KEY.S])(noop)(e3)).toBe(false);

        expect(hotKey.make([])(noop)(e4)).toBe(true);

        expect(hotKey.make([KEY.A])(noop)(e5)).toBe(false);
        expect(hotKey.make([KEY.A, KEY.Shift])(noop)(e5)).toBe(true);
    });

    it('should limit amount of triggers', () => {
        const e1 = new KeyboardEvent('keydown', { key: KEY.W });
        const spy = vi.fn();

        const res = hotKey.one(
            hotKey.make([KEY.W])(spy),
            hotKey.make([KEY.W])(spy),
        )(e1);

        expect(res).toBe(true);
        expect(spy).toBeCalledTimes(1);
    });

    it('should trigger all callbacks', () => {
        const e1 = new KeyboardEvent('keydown', { key: KEY.W.toLowerCase() });
        const spy = vi.fn();

        const res = hotKey.many(
            hotKey.make([KEY.W])(spy),
            hotKey.make([KEY.W])(spy),
        )(e1);

        expect(res).toBe(true);
        expect(spy).toBeCalledTimes(2);
    });
});