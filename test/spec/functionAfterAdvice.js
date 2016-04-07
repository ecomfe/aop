import * as aop from '../../src/main';

describe('#afterAdvice', () => {
    function toAdvise(toThrow) {
        if (toThrow) {
            throw toThrow;
        }

        return {result: 1};
    }

    it('should invoke after the advised function execution or throwing exception in the same context', () => {
        let context1 = null;
        let context2 = null;
        let obj = {prop: 1};
        let error = {};
        let count = 0;

        let advisedFunction = aop.after(toAdvise, function () {
            ++count;
            if (count === 1) {
                context1 = this;
            }
            if (count === 2) {
                context2 = this;
            }
        });

        // normal call
        let result = advisedFunction.call(obj);
        expect(result).toEqual({result: 1});
        expect(count).toBe(1);
        expect(context1).toBe(obj);

        // exceptional call
        expect(() => advisedFunction.call(obj, error)).toThrow(error);
        expect(count).toBe(2);
        expect(context2).toBe(obj);
    });

    it('should invoke after the advised constructor execution or throwing exception in the same context', () => {
        let error = 1;
        let count = 0;
        let context1 = null;
        let context2 = null;
        class Context {
            constructor(a, toThrow) {
                this.a = a;
                if (toThrow) {
                    throw toThrow;
                }
            }
        }

        let AdvisedContext = aop.after(Context, function () {
            ++count;
            if (count === 1) {
                context1 = this;
            }
            if (count === 2) {
                context2 = this;
            }
        });

        let instance = new AdvisedContext('a');
        expect(instance.a).toBe('a');
        expect(instance instanceof Context).toBe(true);
        expect(count).toBe(1);
        expect(context1).toBe(instance);

        expect(() => new AdvisedContext('a', error)).toThrow(error);
        expect(context2.a).toBe('a');
        expect(count).toBe(2);
    });
});
