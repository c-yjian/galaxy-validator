// 验证规则校验错误时抛出的异常
class RuleException extends Error {
    constructor(message, errorCode, code) {
        super()
        this.message = message || 'Error in parameter validation rule'
        this.errorCode = errorCode || -500
        this.code = code || 500
    }
}

// 不需要将类型转换的，一般给自定义函数验证
class RuleResult {
    constructor(passed, message='error parameter') {
        this.passed = passed
        message && (this.message = message)
    }
}

// 通过验证之后，将类型转化为适合的类型
class RuleResultWithValue extends RuleResult {
    constructor(passed, message, convertValue) {
        super(passed, message)
        this.convertValue = convertValue
    }
}

export { RuleResult, RuleException, RuleResultWithValue }
