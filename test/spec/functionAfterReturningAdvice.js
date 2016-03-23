import * as aop from '../../src/main';

describe('#afterReturning', () => {

    it('should invoke after the advised function in the same context', () => {
        let context = null;
        let obj = {prop: 1};

        function toAdvise() {
            return {};
        }

        let flag = false;
        let expectResult = null;
        let advisedFunction = aop.afterReturning(toAdvise, function (execResult) {
            context = this;
            flag = true;
            expectResult = execResult;
        });

        let result = advisedFunction.call(obj);
        expect(result).toBe(expectResult);
        expect(flag).toBe(true);
        expect(obj).toBe(context);
    });

    it('can modify context properties but should not affect the exec result of the function to be advised', () => {
        class Context {
            constructor(a, b) {
                this.a = a;
                this.b = b;
                return 10;
            }
        }

        let AdvisedContext = aop.afterReturning(Context, function (result) {
            expect(result).toBe(this);
            this.afterReturningProperty = this.a + this.b;
        });

        let instance = new AdvisedContext('a', 'b');
        expect(instance.a).toBe('a');
        expect(instance.b).toBe('b');
        expect(instance.afterReturningProperty).toBe('ab');
        expect(instance instanceof Context).toBe(true);
    });

    it('should behave the same as the constructor when return object from function', () => {
        let obj = {prop: 'prop'};

        function Factory() {
            return obj;
        }

        let AdvisedFactory = aop.afterReturning(Factory, function (result) {
            expect(obj).toBe(result);
            this.afterReturningProperty = this.prop + ' afterReturningProperty';
        });

        let instance = new AdvisedFactory();
        expect(instance).toBe(obj);
        expect(instance.afterReturningProperty).toBe('prop afterReturningProperty');
    });
});
