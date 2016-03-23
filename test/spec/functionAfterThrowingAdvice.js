import * as aop from '../../src/main';

describe('#afterThrowingAdvice', () => {
    function toAdvise(toThrow) {
        if (toThrow) {
            throw toThrow;
        }

        return {result: 1};
    }

    it('should invoke after the advised function throwing exception in the same context', () => {
        let context = null;
        let obj = {prop: 1};
        let error = {};
        let flag = false;
        let expectException = null;

        let advisedFunction = aop.afterThrowing(toAdvise, function (exception) {
            context = this;
            flag = true;
            expectException = exception;
        });

        let result = advisedFunction.call(obj);
        expect(expectException).toBe(null);
        expect(result).toEqual({result: 1});
        expect(flag).toBe(false);
        expect(context).toBe(null);

        expect(() => advisedFunction.call(obj, error)).toThrow(error);
        expect(expectException).toBe(error);
        expect(flag).toBe(true);
        expect(context).toBe(obj);
    });

    it('should invoke after the constructor throwing exception in the same context', () => {
        let error = 1;
        let expectException = null;
        class Context {
            constructor(a, toThrow) {
                this.a = a;
                if (toThrow) {
                    throw toThrow;
                }
            }
        }

        let AdvisedContext = aop.afterThrowing(Context, function (execption) {
            expectException = execption;
        });

        let instance = new AdvisedContext('a');
        expect(instance.a).toBe('a');
        expect(instance instanceof Context).toBe(true);

        expect(() => new AdvisedContext('a', error)).toThrow(error);
        expect(expectException).toBe(error);
    });
});
