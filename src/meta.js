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
 */

/**
 * 环绕通知函数, 调用组装被拦截后的函数时, 会被执行
 *
 * @function
 * @name aroundAdvice
 * @param {ProceedingJoinPoint} proceedingJoinPoint 执行时的连接点
 */
