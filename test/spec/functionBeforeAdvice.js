import * as aop from '../../src/main';

describe('#before', () => {

    it('should invoke before advised function in the same context', () => {
        let context = null;
        let obj = {prop: 1};

        function toAdvise() {
            return [].slice.call(arguments, 0);
        }

        let flag = false;
        let argRef = null;
        let advisedFunction = aop.before(toAdvise, function (...args) {
            context = this;
            flag = true;
            argRef = args;
        });

        let result = advisedFunction.call(obj, 1, 2);
        expect(result).toEqual(argRef);
        expect(flag).toBe(true);
        expect(obj).toBe(context);
    });


    it('can modify context properties but should not affect the exec result of the function to be advised', () => {
        class Context {
            constructor(a, b) {
                this.a = a + ' ' + this.beforeProperty;
                this.b = b;
                return 10;
            }
        }

        let AdvisedContext = aop.before(Context, function (a, b) {
            a = null;
            b = null;
            this.beforeProperty = 'beforeProperty';
        });

        let instance = new AdvisedContext('a', 'b');
        expect(instance.a).toBe('a beforeProperty');
        expect(instance.b).toBe('b');
        expect(instance.beforeProperty).toBe('beforeProperty');
        expect(instance instanceof Context).toBe(true);
    });

    it('should behave the same as the constructor when return object from function', () => {
        let obj = {prop: 1};

        function Factory() {
            return obj;
        }

        let AdvisedFactory = aop.before(Factory, function () {
            this.beforeProperty = 'beforeProperty';
        });

        let instance = new AdvisedFactory();
        expect(instance).toBe(obj);
    });
});
