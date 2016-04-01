import * as aop from '../../src/main';
import FixtureAspect from './FixtureAspect';
import Fixture from './Fixture';

function testMethod(proxy, aspect, origin, methodName) {
    let originLog = {
        beforeCount: aspect.beforeLog.count,
        aroundCount: aspect.aroundLog.count,
        afterReturningCount: aspect.afterReturningLog.count,
        afterThrowingCount: aspect.afterThrowingLog.count,
        afterCount: aspect.afterLog.count
    };

    proxy[methodName](1, 2, 3);

    expect(aspect.beforeLog.count).toBe(originLog.beforeCount + 1);
    expect(aspect.beforeLog.args.toString()).toBe('1,2,3');

    expect(aspect.aroundLog.count).toBe(originLog.aroundCount + 1);
    expect(aspect.aroundLog.joinPoint.target).toBe(proxy);
    expect(aspect.aroundLog.joinPoint.args.toString()).toBe('1,2,3');

    expect(aspect.afterReturningLog.count).toBe(originLog.afterReturningCount + 1);
    expect(aspect.afterReturningLog.return).toBe(proxy[methodName + 'Result']);

    expect(aspect.afterThrowingLog.count).toBe(originLog.afterThrowingCount);

    expect(aspect.afterLog.count).toBe(originLog.afterCount + 1);

    // exception
    if (methodName === 'method1') {
        proxy.throwError = new Error('error');
        aspect.afterReturningLog.return = null;
        expect(() => proxy[methodName]('exception')).toThrowError('error');
        expect(aspect.beforeLog.count).toBe(originLog.beforeCount + 2);
        expect(aspect.beforeLog.args.toString()).toBe('exception');

        expect(aspect.aroundLog.count).toBe(originLog.aroundCount + 2);
        expect(aspect.aroundLog.joinPoint.target).toBe(proxy);
        expect(aspect.aroundLog.joinPoint.args.toString()).toBe('exception');
        expect(aspect.aroundLog.joinPoint.method).toBe(methodName);

        expect(aspect.afterReturningLog.count).toBe(originLog.afterReturningCount + 1);
        expect(aspect.afterReturningLog.return).toBe(null);

        expect(aspect.afterThrowingLog.count).toBe(originLog.afterThrowingCount + 1);
        expect(aspect.afterThrowingLog.error).toBe(proxy.throwError);

        expect(aspect.afterLog.count).toBe(originLog.afterCount + 2);
    }
}

describe('#createObjectProxy', () => {
    let fixture = null;
    let fixtureAdvices = null;

    beforeEach(() => {
        fixture = new Fixture();
        fixtureAdvices = FixtureAspect.getAdvices();
    });

    it('should not affect the origin object intercepted', () => {
        let proxy = aop.createObjectProxy(fixture, 'method1', fixtureAdvices);
        expect(proxy).not.toBe(fixture);
        expect(proxy.method1 === fixture.method1).toBe(false);
        expect(proxy.method2 === fixture.method2).toBe(true);
        expect(proxy.method3 === fixture.method3).toBe(true);
        expect(proxy.callMethod3 === fixture.callMethod3).toBe(true);
    });

    it('should intercept the string-matched method', () => {
        let proxy = aop.createObjectProxy(fixture, 'method1', fixtureAdvices);
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method1');
        expect(proxy.count1).toBe(2);
    });

    it('should intercept the RegExp-matched method', () => {
        let proxy = aop.createObjectProxy(fixture, /method/, fixtureAdvices);
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method1');
        expect(proxy.count1).toBe(2);
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method2');
        expect(proxy.count2).toBe(1);
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method3');
        expect(proxy.count3).toBe(1);

        // 不影响返回值非函数的 get
        proxy = aop.createObjectProxy(proxy, 'propertyValue', fixtureAdvices);
        expect(proxy.propertyValue).toBe('propertyValue');

        // 返回值为 function 的 get 会动态创建函数代理
        proxy = aop.createObjectProxy(proxy, 'callMethod3', fixtureAdvices);
        expect(proxy.callMethod3 !== proxy.callMethod3).toBe(true);

    });

    it('should intercept the Function-matched method', () => {
        let matcher = property => ['callMethod3', 'foo'].indexOf(property) !== -1;
        let proxy = aop.createObjectProxy(fixture, matcher, fixtureAdvices);
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'foo');
        expect(proxy.fooCount).toBe(1);

        let aspect = fixtureAdvices.aspect;
        let originLog = {
            beforeCount: aspect.beforeLog.count,
            aroundCount: aspect.aroundLog.count,
            afterReturningCount: aspect.afterReturningLog.count,
            afterThrowingCount: aspect.afterThrowingLog.count,
            afterCount: aspect.afterLog.count
        };

        let result = proxy.callMethod3('callMethod3');
        expect(result).toBe(proxy.method3Result);
        expect(aspect.beforeLog.count).toBe(originLog.beforeCount + 1);
        expect(aspect.beforeLog.args.toString()).toBe('callMethod3');

        expect(aspect.aroundLog.count).toBe(originLog.aroundCount + 1);
        expect(aspect.aroundLog.joinPoint.target).toBe(proxy);
        expect(aspect.aroundLog.joinPoint.args.toString()).toBe('callMethod3');

        expect(aspect.afterReturningLog.count).toBe(originLog.afterReturningCount + 1);
        expect(aspect.afterReturningLog.return).toBe(result);

        expect(aspect.afterThrowingLog.count).toBe(originLog.afterThrowingCount);

        expect(aspect.afterLog.count).toBe(originLog.afterCount + 1);
    });

});

describe('#createClassProxy', () => {
    let fixtureAdvices = null;

    beforeEach(() => {
        fixtureAdvices = FixtureAspect.getAdvices();
    });

    it('should not affect the origin Class intercepted', () => {
        let Proxy = aop.createClassProxy(Fixture, 'method1', fixtureAdvices);
        let proxy = new Proxy();
        expect(Proxy).not.toBe(Fixture);
        expect(proxy instanceof Fixture).toBe(true);
        expect(Proxy.prototype.method1 === Fixture.prototype.method1).toBe(false);
        expect(Proxy.prototype.method2 === Fixture.prototype.method2).toBe(true);
        expect(Proxy.prototype.method3 === Fixture.prototype.method3).toBe(true);
        expect(Proxy.prototype.callMethod3 === Fixture.prototype.callMethod3).toBe(true);
    });

    it('should intercept the string-matched method', () => {
        let Proxy = aop.createClassProxy(Fixture, 'method1', fixtureAdvices);
        let proxy = new Proxy();
        let fixture = new Fixture();
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method1');
        expect(proxy.count1).toBe(2);
    });

    it('should intercept the RegExp-matched method', () => {
        let Proxy = aop.createClassProxy(Fixture, /method/, fixtureAdvices);
        let proxy = new Proxy();
        let fixture = new Fixture();

        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method1');
        expect(proxy.count1).toBe(2);
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method2');
        expect(proxy.count2).toBe(1);
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'method3');
        expect(proxy.count3).toBe(1);

        // 不影响返回值非函数的 get
        Proxy = aop.createClassProxy(Proxy, 'propertyValue', fixtureAdvices);
        proxy = new Proxy();
        expect(proxy.propertyValue).toBe('propertyValue');

        // 返回值为 function 的 get 会动态创建函数代理
        Proxy = aop.createClassProxy(Proxy, 'callMethod3', fixtureAdvices);
        proxy = new Proxy();
        expect(proxy.callMethod3 !== proxy.callMethod3).toBe(true);

    });

    it('should intercept the Function-matched method', () => {
        let matcher = property => ['callMethod3', 'foo'].indexOf(property) !== -1;
        let Proxy = aop.createClassProxy(Fixture, matcher, fixtureAdvices);
        let proxy = new Proxy();
        let fixture = new Fixture();
        testMethod(proxy, fixtureAdvices.aspect, fixture, 'foo');
        expect(proxy.fooCount).toBe(1);

        let aspect = fixtureAdvices.aspect;
        let originLog = {
            beforeCount: aspect.beforeLog.count,
            aroundCount: aspect.aroundLog.count,
            afterReturningCount: aspect.afterReturningLog.count,
            afterThrowingCount: aspect.afterThrowingLog.count,
            afterCount: aspect.afterLog.count
        };

        let result = proxy.callMethod3('callMethod3');
        expect(result).toBe(proxy.method3Result);
        expect(aspect.beforeLog.count).toBe(originLog.beforeCount + 1);
        expect(aspect.beforeLog.args.toString()).toBe('callMethod3');

        expect(aspect.aroundLog.count).toBe(originLog.aroundCount + 1);
        expect(aspect.aroundLog.joinPoint.target).toBe(proxy);
        expect(aspect.aroundLog.joinPoint.args.toString()).toBe('callMethod3');

        expect(aspect.afterReturningLog.count).toBe(originLog.afterReturningCount + 1);
        expect(aspect.afterReturningLog.return).toBe(result);

        expect(aspect.afterThrowingLog.count).toBe(originLog.afterThrowingCount);

        expect(aspect.afterLog.count).toBe(originLog.afterCount + 1);
    });
});
