import { hotKey } from '@root';
import { Counter, KEY, noop } from '@lesnoypudge/utils';



describe('hotKey', () => {
    test('1', () => {
        const e1 = new KeyboardEvent('keydown', { key: KEY.W });
        const e2 = new KeyboardEvent('keydown', { key: KEY.Space });
        const e3 = new KeyboardEvent('keydown', { ctrlKey: true });
        const e4 = new KeyboardEvent('keydown', {});

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
    });

    test('2', () => {
        const e1 = new KeyboardEvent('keydown', { key: KEY.W });
        const { get, inc } = new Counter();

        const res = hotKey.one(
            hotKey.make([KEY.W])(() => inc()),
            hotKey.make([KEY.W])(() => inc()),
        )(e1);

        expect(res).toBe(true);
        expect(get()).toBe(1);
    });

    test('3', () => {
        const e1 = new KeyboardEvent('keydown', { key: KEY.W.toLowerCase() });
        const { get, inc } = new Counter();

        const res = hotKey.many(
            hotKey.make([KEY.W])(() => inc()),
            hotKey.make([KEY.W])(() => inc()),
        )(e1);

        expect(res).toBe(true);
        expect(get()).toBe(2);
    });

    test('4', () => {
        const e1 = new KeyboardEvent('keydown', { key: KEY.S });
        const { get, inc } = new Counter();

        const res = hotKey.many(
            hotKey.make([KEY.W])(() => inc()),
            hotKey.make([KEY.A])(() => inc()),
        )(e1);

        expect(res).toBe(false);
        expect(get()).toBe(0);
    });
});