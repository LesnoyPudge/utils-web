import { LocalStorage } from './LocalStorage';



type TestStorage = {
    testValue: number;
    someValue: null;
};

beforeEach(() => {
    localStorage.clear();
});

describe('LocalStorage', () => {
    test('should update value and trigger onChange callback', () => {
        const storage = new LocalStorage<TestStorage>();
        const spy = vi.fn();

        storage.onChange('testValue', spy);

        expect(storage.get('testValue')).toBe(undefined);
        expect(storage.get('testValue', 4)).toBe(4);
        expect(storage.get('testValue')).toBe(undefined);

        storage.set('testValue', 5);

        expect(storage.get('testValue')).toBe(5);

        storage.clear();

        expect(storage.get('testValue')).toBe(undefined);
        expect(spy).toBeCalledTimes(2);
    });

    test('should work across all instances', () => {
        const storage1 = new LocalStorage<TestStorage>();
        const storage2 = new LocalStorage<TestStorage>();
        const spy = vi.fn();

        storage2.onChange('testValue', spy);

        storage1.set('testValue', 10);

        expect(storage2.get('testValue')).toBe(10);
        expect(spy).toBeCalledTimes(1);
    });

    test('should work with native localStorage', async () => {
        const storage = new LocalStorage<TestStorage>();
        const spy = vi.fn();

        storage.onChange('testValue', spy);

        localStorage.setItem('testValue', '10');

        await vi.waitFor(() => {
            expect(storage.get('testValue')).toBe(10);
            expect(spy).toBeCalledTimes(1);
        });
    });
});