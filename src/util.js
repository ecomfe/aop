/**
 * @file util 工具模块
 * @author exodia(d_xinxin@163.com)
 */

/**
 * 获取对象属性自己或者继承下来的描述符
 *
 * @param {Object} obj 要获取的对象
 * @param {string} property 要获取的属性名
 * @return {Object | undefined}
 */
export function getDescriptor(obj, property) {
    for (; obj; obj = Object.getPrototypeOf(obj)) {
        let descriptor = Object.getOwnPropertyDescriptor(obj, property);
        if (descriptor) {
            return descriptor;
        }
    }
}

/**
 * 获取符合匹配规则的对象属性自己或继承下来的描述符
 *
 * @param {Object} obj 要获取的对象
 * @param {string | RegExp | Function} matcher 匹配规则
 * @return {Object} 符合匹配规则的属性名与对应描述符键值对集合
 */
export function getMatchedMethodDescriptors(obj, matcher) {
    let result = Object.create(null);
    if (isString(matcher)) {
        let descriptor = getDescriptor(obj, matcher);
        if (descriptor && (typeof descriptor.value === 'function' || descriptor.hasOwnProperty('get'))) {
            result[matcher] = descriptor;
        }
        return result;
    }

    let filter = isRegExp(matcher) ? value => matcher.test(value) : matcher;
    for (; obj; obj = Object.getPrototypeOf(obj)) {
        let properties = Object.getOwnPropertyNames(obj);
        for (let property of properties) {
            if (!result[property] && filter(property, obj)) {
                let descriptor = Object.getOwnPropertyDescriptor(obj, property);
                if (descriptor && (typeof descriptor.value === 'function' || descriptor.hasOwnProperty('get'))) {
                    result[property] = descriptor;
                }
            }
        }
    }

    return result;
}

let toString = Object.prototype.toString;
const STRING = toString.call('');
const REGEXP = toString.call(/ /);

function isString(value) {
    return toString.call(value) === STRING;
}

function isRegExp(value) {
    return toString.call(value) === REGEXP;
}
