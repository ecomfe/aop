/**
 * @file main.js aop 入口
 * @author exodia(d_xinxin@163.com)
 */

import FunctionProxyFactory from './FunctionProxyFactory';
import ObjectProxyFactory from './ObjectProxyFactory';
import ClassProxyFactory from './ClassProxyFactory';


/**
 * 创建一个组装了通知行为的函数代理
 *
 * @param {Function} target 被拦截的函数
 * @param {Advices} advices 通知对象
 * @return {Function}
 */
export let createFunctionProxy = function (target, advices) {
    return FunctionProxyFactory.createProxy(target, advices);
};

/**
 * 创建一个组装了通知行为的对象代理
 *
 * @param {Object} target 被拦截的对象
 * @param {string | FunctionMatcher | RegExp} matcher 匹配器
 * @param {Advices} advices 通知对象
 * @return {Object}
 */
export let createObjectProxy = function (target, matcher, advices) {
    return ObjectProxyFactory.createProxy(target, [{matcher, advices}]);
};

/**
 * 创建一个组装了通知行为的类代理
 *
 * @param {Function} Class 被拦截的类
 * @param {string | FunctionMatcher | RegExp} matcher 匹配器
 * @param {Advices} advices 通知对象
 * @return {Function}
 */
export let createClassProxy = function (Class, matcher, advices) {
    return ClassProxyFactory.createProxy(Class, [{matcher, advices}]);
};

export let before = createAdviceAPI('before');

export let afterReturning = createAdviceAPI('afterReturning');

export let afterThrowing = createAdviceAPI('afterThrowing');

export let after = createAdviceAPI('after');

export let around = createAdviceAPI('around');

function createAdviceAPI(adviceType) {
    return function (toAdvise, matcher, adviceFunction) {
        switch (arguments.length) {
            case 2:
                return createFunctionProxy(toAdvise, {[adviceType]: matcher});
            case 3:
                return createObjectProxy(toAdvise, matcher, {[adviceType]: adviceFunction});
        }
    };
}
