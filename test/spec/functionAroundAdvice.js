import * as aop from '../../src/main';

describe('#aroundAdvice', () => {
    let fixture = null;
    beforeEach(() => {
        fixture = {
            toAdvise(toThrow, ...args) {
                if (toThrow) {
                    throw toThrow;
                }
                return args.toString();
            }
        };

        spyOn(fixture, 'toAdvise').and.callThrough();
    });

    it('should invoke original function with original arguments when call joinPoint.proceed', () => {
        let context = null;
        let obj = {prop: 1};
        let error = {};

        let advisedFunction = aop.around(fixture.toAdvise, function (joinPoint) {
            context = joinPoint.target;
            joinPoint.proceed();
            return joinPoint.proceed();
        });

        // normal call
        let result = advisedFunction.call(obj, false, 'a', 'b', 'c');
        expect(fixture.toAdvise).toHaveBeenCalledWith(false, 'a', 'b', 'c');
        expect(fixture.toAdvise.calls.count()).toBe(2);
        expect(context).toBe(obj);
        expect(result).toBe(['a', 'b', 'c'].toString());
        context = null;
        fixture.toAdvise.calls.reset();

        // exceptional call
        expect(() => advisedFunction.call(obj, error, 'a')).toThrow(error);
        expect(fixture.toAdvise).toHaveBeenCalledWith(error, 'a');
        expect(fixture.toAdvise.calls.count()).toBe(1);
        expect(context).toBe(obj);
    });

    it('should invoke original function with custom arguments and context when call joinPoint.proceedApply', () => {
        let context = null;
        let obj = {prop: 1};
        let error = {};

        let advisedFunction = aop.around(fixture.toAdvise, function (joinPoint) {
            context = joinPoint.target;
            if (joinPoint.args[0] === error) {
                return joinPoint.proceedApply(obj, error);
            }
            return joinPoint.proceedApply(obj, false, 'a', 'b', 'c');
        });

        // normal call
        let result = advisedFunction();
        expect(fixture.toAdvise).toHaveBeenCalledWith(false, 'a', 'b', 'c');
        expect(context).toBe(this);
        expect(result).toBe(['a', 'b', 'c'].toString());
        context = null;
        fixture.toAdvise.calls.reset();

        // exceptional call
        expect(() => advisedFunction.call(obj, error)).toThrow(error);
        expect(fixture.toAdvise.calls.first()).toEqual({object: obj, args: [error]});
        expect(context).toBe(obj);
    });

    it('should advise a constructor with original arguments when call joinPoint.proceed', () => {
        let error = {};
        let context = null;
        let returnPrimitive = false;
        class Context {
            static toThrow = null;
            static shouldApply = false;

            constructor(...args) {
                this.property = args.toString();
                if (this.constructor.toThrow) {
                    throw this.constructor.toThrow;
                }
            }
        }

        let AdvisedContext = aop.around(Context, function (joinPoint) {
            expect(joinPoint.target).toBe(this);

            context = joinPoint.target;
            if (returnPrimitive) {
                // should return instance of AdvisedContext
                return 1;
            }
            if (Context.shouldApply) {
                return joinPoint.proceedApply(null, ['a', 'b', 'c']);
            }

            return joinPoint.proceed();

        });

        // proceed call
        let instance = new AdvisedContext('a');
        expect(instance.property).toBe('a');
        expect(instance instanceof Context).toBe(true);
        expect(context).toBe(instance);
        context = null;

        // proceedApply call
        Context.shouldApply = true;
        instance = new AdvisedContext();
        expect(instance.property).toBe(['a', 'b', 'c'].toString());
        expect(instance instanceof Context).toBe(true);
        expect(context).toBe(instance);

        // exception call
        Context.toThrow = error;
        expect(() => new AdvisedContext()).toThrow(error);

        // primitive return
        returnPrimitive = true;
        instance = new AdvisedContext('a');
        expect(instance instanceof AdvisedContext).toBe(true);
        expect(instance.a).toBe(undefined);
    });
});
