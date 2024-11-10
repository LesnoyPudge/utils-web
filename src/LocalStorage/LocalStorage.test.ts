import { Counter } from '@lesnoypudge/utils';
import { LocalStorage } from './LocalStorage';



type TestStorage = {
    testValue: number;
    someValue: null;
};

describe('LocalStorage', () => {
    test('1', () => {
        const storage = new LocalStorage<TestStorage>();
        const c = new Counter();
        let expectedCounter = 0;

        storage.onChange('testValue', () => c.inc());

        expect(storage.get('testValue')).toBe(undefined);

        expectedCounter++;
        expect(storage.get('testValue', 4)).toBe(4);
        expect(storage.get('testValue')).toBe(4);

        expectedCounter++;
        storage.remove('testValue');

        expect(storage.get('testValue')).toBe(undefined);

        expectedCounter++;
        storage.set('testValue', 5);

        expect(storage.get('testValue')).toBe(5);

        expectedCounter++;
        storage.clear();

        expect(storage.get('testValue')).toBe(undefined);

        expect(c.get()).toBe(expectedCounter);
    });

    test('2', () => {
        const storage1 = new LocalStorage<TestStorage>();
        const storage2 = new LocalStorage<TestStorage>();
        const c = new Counter();

        storage2.onChange('testValue', () => c.inc());
        storage1.set('testValue', 10);

        expect(storage2.get('testValue')).toBe(10);
        expect(c.get()).toBe(1);
    });
});