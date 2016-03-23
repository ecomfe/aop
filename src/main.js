/**
 * @file main.js aop 入口
 * @author exodia(d_xinxin@163.com)
 */
import * as functionAdvice from './functionAdvice';


export let before = createAdviceAPI('before');
export let afterReturning = createAdviceAPI('afterReturning');
export let afterThrowing = createAdviceAPI('afterThrowing');
export let after = createAdviceAPI('after');
export let around = createAdviceAPI('around');


function createAdviceAPI(adviceType) {
    return function (toAdvise, matcher, advice) {
        if (typeof toAdvise === 'function') {
            return functionAdvice[adviceType](toAdvise, matcher);
        }
    };
}
