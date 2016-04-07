/**
 * @file 元数据定义
 * @author exodia(d_xinxin@163.com)
 */

/**
 *  around advice 执行时的连接点
 *
 * @typedef {Object} ProceedingJoinPoint
 * @property {Object} target advice 包装函数执行时的 this
 * @property {Array} args 包装函数执行时传入的参数
 * @property {Function} proceed 执行函数, 调用时会执行被拦截函数, 并传入原始的 this 和参数
 * @property {proceedApply} proceedApply 执行函数, 调用时会执行被拦截函数, 并传入原始的 this 和参数
 */

/**
 * 执行函数, 调用时会执行被拦截函数, 并根据传入的参数改变原始函数的 this 和接收参数
 *
 * @function
 * @name proceedApply
 * @param {Object|null|undefined} thisArg 被拦截函数执行时的 this 指向
 * @param {Array} [args] 被拦截函数执行时接收的参数
 * @return {*} 返回原函数的执行结果
 */

/**
 * 环绕通知函数, 调用组装被拦截后的函数时, 会被执行
 *
 * @function
 * @name aroundAdvice
 * @param {ProceedingJoinPoint} proceedingJoinPoint 执行时的连接点
 */

/**
 *   执行时的连接点
 *
 * @typedef {Object} Advisor 通知者
 * @property {string | FunctionMatcher | RegExp} matcher 匹配器(切点), 匹配器为函数时, 会传入当前校验的属性名称和拦截对象作为参数
 * @property {Advices} advices 通知对象
 */

/**
 * 函数匹配器
 *
 * @function
 * @name FunctionMatcher
 * @param {string} property 当前正在校验的属性名称
 * @param {Object} target 当前拦截的对象
 * @return {boolean} 为 true 时表示匹配成功
 */

/**
 * 通知对象
 * 
 * @typedef {Object} Advices
 * 
 * @property {Object} advices 
 * @property {Function} [advices.before] before advice
 * @property {Function} [advices.around] around advice
 * @property {Function} [advices.afterReturning] afterReturning advice
 * @property {Function} [advices.afterThrowing] afterThrowing advice
 * @property {Function} [advices.after] after advice
 */
