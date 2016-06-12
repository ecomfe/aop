Unnamed AOP
===

一个 js 版的 aop 库, 能够无入侵的增加和改变函数或方法的行为.

## 基本概念

### [面向切面编程](http://en.wikipedia.org/wiki/Aspect-oriented_programming)

### 通知(Advice)

在函数/方法执行的特定时机执行指定的逻辑. 主要有以下几个类型的通知:

1. before: 在函数/方法执行前调用指定逻辑
2. after: 在函数/方法执行后调用指定逻辑, 无论函数/方法是否执行成功
3. afterReturning: 在函数/方法执行成功后调用指定逻辑
4. afterThrowing: 在方法抛出异常后调用指定逻辑
5. around: 在函数/方法调用之前和调用之后执行自定义的指定逻辑

### 切点(PointCut/Matcher)

切点（连接点筛选）功能, 为 string, RegExp, Function 三个类型之一, 指定符合匹配条件的方法才应用特定的通知逻辑

### 切面(Aspect/Advisor)

切面是通知和切点的结合, 通知和切点共同定义了切面的全部内容 - 是什么, 在何时和何处完成功能.

```javascript
Advisor = {
    // 切点/匹配器, 为字符串,正则,函数三种, 见 PointCut/Matcher
    matcher: Matcher,

    // 通知对象, 拥有 before, afterReturning, afterThrowing, after, around 中一个或多个方法
    advices: {
       before(...args) { /* ... */},
       after() { /* ... */ },
       afterReturning(returnValue) { /* ... */ },
       afterThrowing() { /* ... */ },
       around(joinPoint) { /* ... */ }
    }
}
```

## 安装

node

```shell
npm install uaop
```
Browser global

```html
<script src="path/uaop/dist/bundle.js"></script>
```

模块环境

```javascript
import * as aop from 'uaop'; // es6
// var aop = require('uaop'); // AMD/CMD
// window.uaop // global
```

## 快速使用

```javascript
import * as aop from 'uaop'; // es6

function doSomething() {
    console.log('doSomething');
}

function beforeAdvice {
    console.log('before doSomething');
}

// 函数拦截
let proxyFunc = aop.before(doSomething, beforeAdvice);

proxyFunc();

// 对象拦截
let obj = {doSomething};
let proxyObj = aop.before(obj, 'doSomething', beforeAdvice);
proxyObj.doSomething();


// 类拦截
class Do {
  doSomething() {
      console.log('doSomething');
  }
}

let ProxyClass = aop.before(Do, 'doSomething', beforeAdvice);
let instance = new ProxyClass();
instance.doSomething();

```

## API

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

    console.log('functionToAdvise normal exec');
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
    // proceed/proceddApply 可以多次调用, 会多次执行原函数, proceedApply 可以改变 this 和参数信息
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

### ProceedingJoinPoint

```javascript
joinPoint = {
    // 函数被调用时的上下文
    target: Object,

    // 传给外层函数的参数
    args: Array,

    // 原方法名或函数名
    method: string,

    // 被调用时, 会调用被拦截的原函数, 并传入原始参数
    proceed: Function,

    // 被调用时, 会调用被拦截的原函数, 首个参数为被拦截函数要执行时的上下文, 第二个参数为要传递给被拦截函数的参数数组
    proceedApply: Function
}
```

#### createFunctionProxy(functionToAdvise, advices)

创建一个组装了多个通知行为的函数代理, advices 为拥有 before, afterReturning, afterThrowing, after, around 中一个或多个方法的对象.

### Object Method API

提供针对对象方法的拦截。

每个拦截接口都接收三个参数：被拦截对象，方法匹配规则 matcher，通知执行函数。

matcher 可为 string, RegExp, Function 的任意一种，为 Function 时，接收被拦截对象和当前方法名作为参数，执行结果返回 true 时，匹配成功，会对该方法执行拦截。

每个拦截接口都会返回一个原对象的代理对象，代理对象会针对符合匹配规则的方法封装，根据通知类型，在方法执行的不同阶段，执行相关的通知逻辑。

**注：原对象不受任何影响**

#### before(objectToAdvise, matcher, beforeFunction)

返回一个新的代理对象, 在 matcher 匹配的方法执行前，会执行 beforeFunction，beforeFunction 接收匹配方法执行时的参数

**除非抛异常, 否则不会中断匹配方法的执行**

```javascript
var toAdvise = {
    method: function () {
         console.log('method exec');
    }
};

var advisedObject = aop.before(toAdvise, 'method', function (arg) {
      console.log('before method exec');
      console.log(arg);
});

// log:
// before method exec
// a
// method exec
advisedObject.method('a');

// log:
// method exec
toAdvise.method('a');
```

#### afterReturning(objectToAdvise, matcher, afterReturningFunction)

返回一个新的代理对象, 在 matcher 匹配的方法正常执行后, 执行 afterReturningFunction,
afterReturningFunction 接收匹配方法执行后的返回结果作为唯一参数, 不影响返回结果.

```javascript
var toAdvise = {
    method: function () {
         console.log('method exec');
         return 'toAdivse method result';
    }
};

var advisedObject = aop.afterReturning(toAdvise, 'method', function (returnValue) {
    console.log('return value: ', returnValue);
});

// log:
// method exec
// return value: toAdivse method result
advisedObject.method();
```

#### afterThrowing(objectToAdvise, matcher, afterThrowingFunction)

返回一个新的代理对象, 在 matcher 匹配的方法抛出异常后, 执行 afterThrowingFunction,
afterThrowingFunction 接收匹配方法抛出的异常对象作为唯一参数.

**通知不会吞噬原有异常, 会在 afterThrowingFunction 执行完毕后, 抛出原有异常**

```javascript
var toAdvise = {
    method: function (throwError) {
         console.log('method exec');
         if(throwError) {
            throw new Error('method error');
          }
    }
};

var advisedObject = aop.afterThrowing(toAdvise, 'method', function (e) {
    console.log('execption: ', e.message);
});

// log:
// method exec
advisedObject.method();

// log:
// method exec
// execption: method error
advisedObject.method(true);
```

#### after(objectToAdvise, matcher, afterFunction)

返回一个新的代理对象, 在 matcher 匹配的方法正常返回或抛出异常后, 执行 afterFunction。

**通知不会吞噬原有异常, 会在 afterFunction 执行完毕后, 抛出原有异常**

```javascript
var toAdvise = {
    method: function (throwError) {
        if(throwError) {
           console.log('method exception');
           throw new Error('error');
        }

        console.log('method exec');
    }
};

var advisedObject = aop.after(toAdvise, 'method', function () {
    console.log('after method exec');
});

// log:
// method exec
// after method exec
advisedObject.method();

// log:
// method exception
// after method exec
advisedObject.method(true);
```

#### around(objectToAdvise, matcher, aroundFunction)

返回一个新的代理对象, 在 matcher 匹配的方法执行时, 执行 aroundFunction, aroundFunction 接收一个 ProceedingJoinPoint 对象作为参数,
调用其 proceed/proceedApply 方法将执行原方法.

```javascript
var toAdvise = {
    method: function () {
        console.log('method exec arguments: ', [].slice.call(arguments, 0));
        return 'method return value';
    }
};

var advisedObject = aop.around(toAdvise, 'method', function (joinPoint) {
    console.log('before method exec');
    // proceed/proceedApply 可以多次调用, 会多次执行原方法, proceedApply 可以改变 this 和参数信息
    var result = joinPoint.proceed();
    result = joinPoint.proceedApply(null, [1, 2]);
    console.log('method exec result: ', result);
    console.log('after method exec');
});

// log:
// before method exec
// method exec arguments: 1,2,3
// method exec arguments: 1,2
// method exec result: method return value
// after method exec
advisedObject.method(1, 2, 3);
```

#### createObjectProxy(objectToAdvise, matcher, advices)

创建一个组装了通知行为的对象代理, 会重写符合匹配规则的方法, 织入通知逻辑.

advice 拥有 before, afterReturning, afterThrowing, after, around 中一个或多个方法的对象.

### ProceedingJoinPoint

同Function API 下的 ProceedingJoinPoint

### Matcher

matcher 可以为以下三种类型:

- string 匹配拦截对象中属性名与 matcher 相等的方法。
- RegExp 匹配拦截对象中属性名符合 matcher 规则的方法。
- Function 匹配拦截对象中属性名符合 matcher 执行结果的方法， matcher 接收拦截对象和当前属性名称作为参数，返回 true 则表示匹配成功。

```javascript
var toAdvise = {
    method: function () {},
    foo: function () {},
    foo1: function () {},
    foo2: function () {},
    init: function () {}
};
// 将拦截 toAdvise.method
var advisedObject = aop.before(toAdvise, 'method', function () {});

// 将拦截 toAdvise.foo, toAdvise.foo1, toAdvise.foo2
var advisedObject = aop.before(toAdvise, /^foo/, function () {});

var fnMatcher = function (obj, name) {
    return name !== 'init';
};
// 将拦截 toAdvise.foo, toAdvise.foo1, toAdvise.foo2, toAdvise.method
var advisedObject = aop.before(toAdvise, fnMatcher, function () {});
```

### Class Method API

提供针对Class方法拦截的 API

#### createClassProxy(Class, matcher, advices)

创建一个组装了通知行为的类代理, 会重写符合匹配规则的方法, 织入通知逻辑.

advice 拥有 before, afterReturning, afterThrowing, after, around 中一个或多个方法的对象.
