/**
 * @file FunctionProxy function 代理, 提供 function 拦截
 * @author exodia(d_xinxin@163.com)
 */

const TARGET = Symbol('target');
const ADVICE = Symbol('advice');
const NAME = Symbol('name');

/**
 * function 代理类, 提供 function 拦截
 *
 * @class
 */
export default class FunctionProxyFactory {
    static createProxy(target, advices = {}) {
        return (new this(target, advices)).createProxy();
    }

    /**
     * 创建一个函数代理
     *
     * @param {Function} target 被代理的函数
     * @param {Advices} [advices={}] 通知对象
     * @param {string} [name] 函数名
     */
    constructor(target, advices = {}, name = target.name) {
        this.setTarget(target);
        this.setName(name);
        this.setAdvices(advices);
    }

    /**
     * 设置要拦截的函数
     *
     * @param {Function} target
     */
    setTarget(target) {
        this[TARGET] = target;
    }

    /**
     * 设置拦截函数名称, 默认取 target.name, 提供给 joinPoint
     *
     * @param name
     */
    setName(name) {
        this[NAME] = name;
    }

    /**
     * 设置通知对象
     *
     * @param {Object} [advices={}] 通知对象
     * @param {Function} advices.before before advice
     * @param {Function} advices.around around advice
     * @param {Function} advices.afterReturning afterReturning advice
     * @param {Function} advices.afterThrowing afterThrowing advice
     * @param {Function} advices.after after advice
     */
    setAdvices(advices) {
        this[ADVICE] = advices;
    }

    /**
     * 获取通知对象
     *
     * @return {Object}
     */
    getAdvices() {
        return this[ADVICE];
    }

    // todo: 待打平函数包装层次
    /**
     * 创建一个代理对象
     *
     * @return {Object}
     */
    createProxy() {
        let advices = this.getAdvices();
        let proxyFunction = this[TARGET];

        if (typeof advices.before === 'function') {
            proxyFunction = before(proxyFunction, advices.before);
        }

        if (typeof advices.around === 'function') {
            proxyFunction = around(proxyFunction, advices.around, this[NAME]);
        }

        if (typeof advices.afterReturning === 'function') {
            proxyFunction = afterReturning(proxyFunction, advices.afterReturning);
        }

        if (typeof advices.afterThrowing === 'function') {
            proxyFunction = afterThrowing(proxyFunction, advices.afterThrowing);
        }

        if (typeof advices.after === 'function') {
            proxyFunction = after(proxyFunction, advices.after);
        }

        return proxyFunction;
    }
}

/**
 * 返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数执行前, 执行 beforeFunction,
 * beforeFunction 接收与 functionToAdvise 一致的参数, 除非抛异常, 否则不会中断函数的执行
 *
 * @param {Function} functionToAdvise 被拦截函数
 * @param {Function} beforeAdvice 被拦截函数执行前的执行函数
 * @return {Function} 组装了拦截功能后的函数
 *  */
function before(functionToAdvise, beforeAdvice) {
    return function beforeAdvisedFunction(...args) {
        // constructor interception
        if (this instanceof beforeAdvisedFunction) {
            let proxy = Object.create(functionToAdvise.prototype);
            beforeAdvice.apply(proxy, args);
            return applyConstructor(functionToAdvise, proxy, args);
        }

        beforeAdvice.apply(this, args);
        return functionToAdvise.apply(this, args);
    };
}

/**
 * 返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数正常返回后,
 * 执行 afterReturningFunction, afterReturningFunction 接收 functionToAdvise 执行后的返回结果作为唯一参数,
 * 不影响返回结果
 *
 * @param {Function} functionToAdvise 被拦截函数
 * @param {Function} afterReturningAdvice  被拦截函数正常返回后的执行函数
 * @return {Function} 组装了拦截功能后的函数
 */
function afterReturning(functionToAdvise, afterReturningAdvice) {
    return function afterReturningAdvisedFunction(...args) {
        // constructor interception
        if (this instanceof afterReturningAdvisedFunction) {
            let proxy = Object.create(functionToAdvise.prototype);
            proxy = applyConstructor(functionToAdvise, proxy, args);
            afterReturningAdvice.call(proxy, proxy);
            return proxy;
        }

        let result = functionToAdvise.apply(this, args);
        afterReturningAdvice.call(this, result);
        return result;
    };
}

/**
 * 返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数抛出异常时, 执行 afterThrowingFunction,
 * afterThrowingFunction 接收 functionToAdvise 抛出的异常对象作为唯一参数.
 * 通知不会吞噬原有异常, 会在afterThrowingFunction执行完毕后, 抛出原有异常.
 *
 * @param {Function} functionToAdvise 被拦截函数
 * @param {Function} afterThrowingAdvice 被拦截函数抛出异常后的执行函数
 * @return {Function} 组装了拦截功能后的函数
 */
function afterThrowing(functionToAdvise, afterThrowingAdvice) {
    return function afterThrowingAdvisedFunction(...args) {
        // constructor interception
        if (this instanceof afterThrowingAdvisedFunction) {
            let proxy = Object.create(functionToAdvise.prototype);
            try {
                return applyConstructor(functionToAdvise, proxy, args);
            }
            catch (e) {
                afterThrowingAdvice.call(proxy, e);
                throw e;
            }
        }

        try {
            return functionToAdvise.apply(this, args);
        }
        catch (e) {
            afterThrowingAdvice.call(this, e);
            throw e;
        }
    };
}

/**
 * 返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数正常返回或抛出异常时, 执行 afterFunction.
 * 通知不会吞噬原有异常, 会在 afterFunction 执行完毕后, 抛出原有异常.
 *
 * @param {Function} functionToAdvise 被拦截函数
 * @param {Function} afterAdvice 被拦截函数抛出异常或正常返回后的执行函数
 * @return {Function} 组装了拦截功能后的函数
 */
function after(functionToAdvise, afterAdvice) {
    return afterReturning(afterThrowing(functionToAdvise, afterAdvice), afterAdvice);
}

/**
 * 返回一个新的函数, 执行逻辑为, 执行 aroundAdvice, aroundAdvice 接收一个 ProceedingJoinPoint 对象作为参数,
 * 调用其 proceed/proceedApply 方法将执行 functionToAdvise.
 *
 * @param {Function} functionToAdvise 被拦截函数
 * @param {aroundAdvice} aroundAdvice 环绕通知函数
 * @param {string} [name] 函数名, 默认取 functionToAdvise.name
 * @return {Function} 组装了拦截功能后的函数
 */
function around(functionToAdvise, aroundAdvice, name = functionToAdvise.name) {
    return function aroundAdvisedFunction(...args) {
        let joinPoint = {
            target: this,
            args: args,
            method: name,
            proceed: null,
            proceedApply: null
        };

        // constructor interception
        if (this instanceof aroundAdvisedFunction) {
            let proxy = joinPoint.target = Object.create(functionToAdvise.prototype);
            joinPoint.proceed = applyConstructor.bind(null, functionToAdvise, proxy, args);
            joinPoint.proceedApply = (scope, ...args) => applyConstructor(functionToAdvise, proxy, args);
        }
        else {
            joinPoint.proceed = functionToAdvise.bind(this, ...args);
            joinPoint.proceedApply = (scope, ...args) => functionToAdvise.apply(scope, args);
        }

        return aroundAdvice.call(joinPoint.target, joinPoint);
    };
}

function applyConstructor(constructor, instance, args) {
    let result = constructor.apply(instance, args);
    return typeof result === 'object' || typeof result === 'function' ? result : instance;
}
