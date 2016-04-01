/**
 * @file ObjectProxyFactory 对象代理工厂
 * @author exodia(d_xinxin@163.com)
 */
import FunctionProxyFactory from './FunctionProxyFactory';
import {getMatchedMethodDescriptors} from './util';

const TARGET = Symbol('target');
const ADVISORS = Symbol('advisors');
const CACHED_PROXY = Symbol('cachedProxy');
/**
 * 对象代理工厂
 *
 * @class
 */
export default class ObjectProxyFactory {
    /**
     * 根据传入的对象和 advisors 数组创建一个代理
     * 
     * @static
     * @param {Object} target 被代理的对象
     * @param {Advisor[]} advisors 通知者数组
     * @return {Object}
     */
    static createProxy(target, advisors) {
        return (new this(target, advisors)).createProxy();
    }

    /**
     * 根据传入的对象和 advisors 数组创建一个代理工厂实例
     * 
     * @constructor
     * @param {Object} target 拦截对象
     * @param {Advisor[]} advisors 通知者数组
     */
    constructor(target, advisors = []) {
        this.setTarget(target);
        this[ADVISORS] = advisors;
        this[CACHED_PROXY] = null;
    }

    /**
     * 设置要拦截的对象
     * 
     * @param {Object} target
     */
    setTarget(target) {
        this[TARGET] = target;
        this[CACHED_PROXY] = null;
    }

    /**
     * 获取当前代理工厂的advisors
     * 
     * @return {Advisor[]}
     */
    getAdvisors() {
        return this[ADVISORS].slice(0);
    }

    /**
     * 在指定位置增加 advisor, 若不指定位置则追加到末尾
     * 
     * @param {number} [index] advisor 要插入的索引位置
     * @param {Advisor} advisor 要插入的 advisor
     */
    addAdvisor(index, advisor) {
        if (typeof index === 'object') {
            this[ADVISORS].push(advisor);
            return;
        }

        this[ADVISORS].splice(index, 0, advisor);
        this[CACHED_PROXY] = null;
    }

    /**
     * 移除指定位置或者匹配的 advisor,
     * 
     * @param {number | Advisor} index 索引位置或要移除的 advisor
     * @return {boolean} 移除成功返回 true
     */
    removeAdvisor(index) {
        if (typeof index === 'object') {
            index = this[ADVISORS].indexOf(index);
        }

        let result = index < 0 ? false : !!this[ADVISORS].splice(index, 1).length;
        if (result) {
            this[CACHED_PROXY] = null;
        }

        return result;
    }
    
    // todo: 优化(打平)继承层次
    /**
     * 创建一个代理对象
     * 
     * @return {Object}
     */
    createProxy() {
        if (this[CACHED_PROXY]) {
            return Object.create(this[CACHED_PROXY]);
        }
        
        let proxy = this[TARGET];
        if (!this[ADVISORS].length) {
            proxy = Object.create(proxy);
        }
        else {
            for (let advisor of this[ADVISORS]) {
                proxy = createProxyObject(proxy, advisor);
            }
        }

        this[CACHED_PROXY] = proxy;

        return this[CACHED_PROXY];
    }
}

function createProxyObject(obj, {matcher, advices}) {
    let matchedDescriptors = getMatchedMethodDescriptors(obj, matcher);
    let descriptors = Object.create(null);
    for (let key in matchedDescriptors) {
        descriptors[key] = createAdvisedProperty(matchedDescriptors[key], advices, key);
    }

    return Object.create(obj, descriptors);
}

function createAdvisedProperty(descriptor, advices, name) {
    let get = descriptor.get;
    // get情况动态生成函数代理
    if (get) {
        descriptor.get = function () {
            let value = get.call(this);
            return typeof value === 'function' ? FunctionProxyFactory.createProxy(value, advices, name) : value;
        };
    }
    else {
        descriptor.value = FunctionProxyFactory.createProxy(descriptor.value, advices);
    }

    return descriptor;
}
