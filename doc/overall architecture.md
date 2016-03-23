## 支持的特性

1. function 拦截
2. object method 拦截
3. Class method 拦截
4. ioc component method 拦截

## 总体架构
![aop 总体架构](./img/aop-architecture.png)

## 模块功能

### JoinPoint

连接点描述

### Advice

通知功能:

- BeforeAdvice: 前向
- AfterReturningAdvice 返回
- AfterThrowingAdvice 异常
- AroundAdvice 环绕

### PointCut

切点（连接点筛选）功能

- StringPointCut 字符串过滤匹配
- RegexPointCut 正则过滤匹配
- FunctionPointCut 函数过滤匹配

### Aspect

切面功能：PointCut 和 Advice 的高阶整合

### IoC Bridge

IoC 桥接支持

### Function API

提供针对函数执行拦截的API

#### before(functionToAdvise, beforeFunction)

返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数执行前, 执行 beforeFunction, beforeFunction 接收与 functionToAdvise 一致的参数

**除非抛异常, 否则不会中断函数的执行**

```javascript
var functionToAdvise = function () {
    console.log('functionToAdvise exec');
};
var advisedFunction = aop.before(functionToAdvise, function () {
    console.log('arguments length:', argument.length);
});

// log:
// arguments length: 3
// functionToAdvise exec
advisedFunction(1, 2, 3);
```

#### afterReturning(functionToAdvise, afterReturningFunction)

返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数正常返回后, 执行 afterReturningFunction,
afterReturningFunction 接收 functionToAdvise 执行后的返回结果作为唯一参数, 不影响返回结果.

```javascript
var functionToAdvise = function () {
    console.log('functionToAdvise exec');
    return 'functionToAdvise';
};
var advisedFunction = aop.afterReturning(functionToAdvise, function (returnValue) {
    console.log('return value: ', returnValue);
});

// log:
// functionToAdvise exec
// return value: functionToAdvise
advisedFunction();
```

#### afterThrowing(functionToAdvise, afterThrowingFunction)

返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数抛出异常时, 执行 afterThrowingFunction,
afterThrowingFunction 接收 functionToAdvise 抛出的异常对象作为唯一参数.

**通知不会吞噬原有异常, 会在 afterThrowingFunction 执行完毕后, 抛出原有异常**

```javascript
var functionToAdvise = function (throwError) {
    console.log('functionToAdvise exec');
    if(throwError) {
        throw new Error('functionToAdvise error');
    }
};
var advisedFunction = aop.afterThrowing(functionToAdvise, function (e) {
    console.log('execption: ', e.message);
});

// log:
// functionToAdvise exec
advisedFunction();

// log:
// functionToAdvise exec
// execption: functionToAdvise error
advisedFunction(true);
```

#### after(functionToAdvise, afterFunction)

返回一个新的函数, 执行逻辑为, 在 functionToAdvise 函数正常返回或抛出异常时, 执行 afterFunction

**通知不会吞噬原有异常, 会在 afterFunction 执行完毕后, 抛出原有异常**

```javascript
var functionToAdvise = function (throwError) {
    if(throwError) {
        console.log('functionToAdvise exception');
        throw new Error('error');
    }
    else {
        console.log('functionToAdvise normal exec');
        return 'normal return';
    }
};
var advisedFunction = aop.after(functionToAdvise, function () {
    console.log('after functionToAdvise');
});

// log:
// functionToAdvise normal exec
// after functionToAdvise
advisedFunction();

// log:
// functionToAdvise exception
// after functionToAdvise
advisedFunction(true);
```

#### around(functionToAdvise, aroundFunction)

返回一个新的函数, 执行逻辑为, 执行 aroundFunction, aroundFunction 接收一个 ProceedingJoinPoint 对象作为参数,
调用其 proceed/proceedApply 方法将执行 functionToAdvise.

```javascript
var functionToAdvise = function () {
    console.log('functionToAdvise exec arguments: ', [].slice.call(arguments, 0));
    return 'functionToAdvise return value';
};
var advisedFunction = aop.around(functionToAdvise, function (joinPoint) {
    console.log('before functionToAdvise exec');
    // proceed/proceddApply 可以多次调用, 会多次执行原函数, proceedApply 可以改变上下文和参数信息
    var result = joinPoint.proceed();
    result = joinPoint.proceedApply(null, [1, 2]);
    console.log('functionToAdvise exec result: ', result);
    console.log('after functionToAdvise exec');
});

// log:
// before functionToAdvise exec
// functionToAdvise exec arguments: 1,2,3
// functionToAdvise exec arguments: 1,2
// functionToAdvise exec result: functionToAdvise return value
// after functionToAdvise exec
advisedFunction(1, 2, 3);
```

#### ProceedingJoinPoint

```javascript
joinPoint = {
    // 函数被调用时的上下文
    target: <any type>,

    // 传给外层函数的参数
    args: Array,

    // 原方法名
    method: string,

    // 被调用时, 会调用被拦截的原函数, 并传入原始参数
    proceed: Function,

    // 被调用时, 会调用被拦截的原函数, 首个参数为被拦截函数要执行时的上下文, 第二个参数为要传递给被拦截函数的参数数组
    proceedApply: Function
}
```


### Object Method API

组合 Aspect，提供针对对象方法拦截的 API

#### ObjectProxy

对象拦截代理

### Class Method API

组合 Aspect，提供针对Class方法拦截的 API

#### ClassProxy

类拦截代理

### IoC Component API

基于IoC Bridge， 提供与 IoC 整合的配置语法




