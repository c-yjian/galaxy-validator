import { RuleResult, RuleException, RuleResultWithValue } from '../util/object'

import { dataType, isEmptyVal } from '../util'

const validator = require('validator')
const chalk = require('chalk')

const { log } = console
const validateRuleTxt = `
Enter array format for validation rules, like:
    [
        {required:Boolean, message:'show txt while it failed '},
        {type:'isInt', message:'show txt while it failed '},
    ]
`
const patchValiteType = ['isString', 'isObject', 'isArray']
const patchValiteTypeMap = {
    isString: 'String',
    isObject: 'Object',
    isArray: 'Array',
}

export default class Rule {
    constructor(ruleList, options) {
        // 待验证的规则
        this.ruleList = ruleList || []
        // 其他的参数配置
        this.options = options
        try {
            this._validateRuleList()
        } catch (error) {
            log(
                chalk.red(
                    'Validation rule error: ',
                    chalk.underline.bold(error.message),
                ),
            )
        }
    }

    // 校验登记的规则有无错误
    _validateRuleList() {
        const { ruleList } = this

        if (Array.isArray(ruleList)) {
            const ruleWithRequired = ruleList.filter((rule) =>
                Reflect.has(rule, 'required'),
            )
            if (ruleWithRequired.length > 1) {
                throw new RuleException(
                    'The required attribute rule is set multiple times',
                )
            }
            ruleList.forEach((rule) => {
                const { required } = rule
                if (
                    !Reflect.has(rule, 'required') &&
                    !Reflect.has(rule, 'type')
                ) {
                    throw new RuleException(
                        'Set the required attribute value or the type attribute value',
                    )
                }
                if (
                    Reflect.has(rule, 'required') &&
                    Reflect.has(rule, 'type')
                ) {
                    throw new RuleException(
                        'Write the Required field and the Type field separately',
                    )
                }
                if (
                    Reflect.has(rule, 'required') &&
                    !validator.isBoolean(`${required}`)
                ) {
                    throw new RuleException(
                        'The Required field should be a Boolean',
                    )
                }
            })
        } else {
            throw new RuleException(validateRuleTxt)
        }
    }

    // js语言中将传递过来的int转为了数字字符串
    // 通过验证之后再转回去，比如传入的id是int，通过验证之后
    // 将 '2'转为2存储在this.parsedData中
    _convertValue() {
        const { value } = this
        const ruleWithTypeList = this.ruleList.filter((rule) => rule.type)
        for (const rule of ruleWithTypeList) {
            const { type } = rule
            if (type === 'isInt') {
                return parseInt(value, 10)
            }
            if (type === 'isFloat') {
                return parseFloat(value, 10)
            }
            if (type === 'isBoolean') {
                return !!value
            }
        }
        return value
    }

    // 验证单个的规则
    _validateRuleItem(rule) {
        const { type, message, options } = rule
        let validateRes = false
        if (patchValiteType.includes(type)) {
            // 登记的类型和传入的类型一致，则通过验证
            if (dataType(this.value) === patchValiteTypeMap[type]) {
                validateRes = true
            }
        } else {
            // validator 去验证
            validateRes = validator[type](this.value, options)
        }
        return validateRes
            ? new RuleResult(true, '')
            : new RuleResult(false, message || 'parameter error')
    }

    validate(value) {
        // 规则配置中包含required的
        const ruleWithRequired =
            this.ruleList.find((rule) => Reflect.has(rule, 'required')) || {}
        // 规则配置中包含type的
        const ruleWithTypeList = this.ruleList.filter((rule) =>
            Reflect.has(rule, 'type'),
        )
        this.value = value
        // 空值拦截判断
        if (isEmptyVal(value)) {
            if (ruleWithRequired.required) {
                // 验证某一个字段不符合某一个规则就直接返回不再接着验证下面的规则
                return new RuleResultWithValue(
                    false,
                    ruleWithRequired.message || 'Fields are required parameters',
                )
            }
            // 空值非必需，就直接通过判断，如果有值则要满足其他条件
            return new RuleResultWithValue(true, '', null)
        }

        for (const rule of ruleWithTypeList) {
            const validateRes = this._validateRuleItem(rule)
            // 验证挂了， 验证某一个字段不符合某一个规则就直接返回不再接着验证下面的规则
            if (!validateRes.passed) {
                return new RuleResultWithValue(false, validateRes.message)
            }
        }
        // all passed
        const convertVal = this._convertValue();
        return new RuleResultWithValue(true, '', convertVal);
    }
}