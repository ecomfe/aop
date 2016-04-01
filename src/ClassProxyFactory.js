/**
 * @file ClassProxyFactory 类代理工厂
 * @author exodia(d_xinxin@163.com)
 */
import ObjectProxyFactory from './ObjectProxyFactory';

/**
 * 类代理工厂
 *
 * @class
 * @extends ObjectProxyFactory
 */
export default class ClassProxyFactory extends ObjectProxyFactory {

    /**
     * @override
     */
    setTarget(target) {
        if (typeof target !== 'function') {
            throw new TypeError('target must be a function');
        }
        super.setTarget(target);
    }

    /**
     * @override
     */
    inherit(target, descriptors) {
        let className = (target.name || '') + 'Proxy';
        let Proxy = {
            [className]: class extends target {
            }
        }[className];

        // static inherit
        Object.setPrototypeOf(Proxy, target);
        Object.defineProperties(Proxy.prototype, descriptors);
        
        return Proxy;
    }

    /**
     * @override
     */
    getPrototypeChainHead(Class) {
        return Class.prototype;
    }
}
