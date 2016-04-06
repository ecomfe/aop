# Spring AOP

##  连接点 JoinPoint

- 仅函数

## 织入方式

- 编译期
- 类加载期
- 运行期，代理对象方式拦截（主要织入方式）

## 配置方式

- XML 配置化语法

```java
<aop:config>
    <aop:aspect id="myAspect" ref="aBean">
        <aop:pointcut id="businessService" expression="execution(* com.xyz.myapp.*)"/>
        <aop:before pointcut-ref="businessService" method="monitor"/>
    </aop:aspect>
</aop:config>
```

- AdpectJ Style 注解

## 通知 Advice 类型

- before：

- after returning：可通过 returining 配置执行结果作为 advice 参数

- after throwing：可通过 throwing 配置方法执行抛出的异常对象作为 advice 参数

- after(finally)：

- around：第一个参数必须为 `ProceedingJoinPoint`

### Advice 参数支持

- 支持首个参数为 `JoinPoint` 类型，主要是通过反射确定advice 是否需要 JoinPoint
- 支持 args/arg-names 配置具体参数类型和名称

### Advice 优先级支持

支持对各个 advice 自定义顺序

## 切面 Aspect

一系列 advice 和 pointcut 的组合

## 切点 pointcut

- 内联定义
- 命名定义，可多处复用
- AspectJ 切点表达式语言支持

## Advisor

仅包含一个 advice 和 pointcut 的 aspect

## 引入

类似 js 的 mixin 功能

