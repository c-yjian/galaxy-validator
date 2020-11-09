import Rule from './Rule'

import { RuleResult } from '../util/object'

import { extractAttributesFromInstance } from '../util'

const _ = require('lodash')
const chalk = require('chalk')

const { log } = console

export default class GalaxyValidator {
    constructor() {
        // 存储原始数据
        this.rawData = {}
        // 存储通过验证，解析之后的数据
        this.parsedData = {}
        // 存储别名登记
        this.alias = {}
    }

    // 聚合请求参数
    _assembleAllParams(ctx) {
        return {
            body: ctx.request.body || {},
            query: ctx.request.query,
            path: ctx.params,
            header: ctx.request.header,
            pool: {}, // 用于存储用户自定义验证函数的返回值，一般多用于存储查询数据库的记录，避免再次查询
        }
    }

    _filterParams2Validate(key) {
        // 验证validate+大写字母的方法名
        if (/^validate([A-Z])\w+/g.test(key)) {
            return true
        }
        // 提取需要验证的字段
        if (this[key] instanceof Rule) {
            return true
        }
        return false
    }

    _mountHook(ctx, hook = 'galaxy') {
        if (!ctx[hook]) {
            ctx[hook] = this
        } else {
            log(
                chalk.red(
                    chalk.underline.bold(`ctx.${hook}已近被占，请换一个变量`),
                ),
            )
        }
    }

    async _validateRuleByKey(key, isValidateCustomFunc) {
        let validateResult
        if (isValidateCustomFunc) {
            // 自定义函数验证
            validateResult = await this._validateCustomFun(key)
        } else {
            // 属性验证, 数组，内有一组Rule
            const ruleInstance2Validate = this[key]
            // 别名替换取值
            const useKey = this.alias[key] || key
            const val2ValidateInfo = this.getValueInfo(useKey)
            validateResult = ruleInstance2Validate.validate(
                val2ValidateInfo.value,
            )
        }
        return validateResult
    }

    // 验证自定义函数
    async _validateCustomFun(key) {
        let result
        const customFun = this[key]
        try {
            const customFunReturn = await customFun(this.parsedData)
            // 如果自定义函数有返回值，并且有对应的name和val的属性，将其挂载在this.parsed上
            // 后续用户可以通过 ctx.galaxy.get('pool.name')的方式获取
            if (customFunReturn && customFunReturn.key && customFunReturn.val) {
                _.set(
                    this.parsedData,
                    ['pool', customFunReturn.key],
                    customFunReturn.val,
                )
            }
            result = new RuleResult(true)
        } catch (error) {
            result = new RuleResult(
                false,
                error.message || `自定义${customFun.name}方法验证失败`,
            )
        }
        return result
    }

    // 验证
    async validate(ctx, alias = {}, hook) {
        const errorList = []
        const params = this._assembleAllParams(ctx)
        this.alias = alias
        this.rawData = _.cloneDeep(params)
        this.parsedData = _.cloneDeep(params)
        const member2ValidateKeyList = extractAttributesFromInstance(this, {
            filter: this._filterParams2Validate.bind(this),
        })
        console.log(JSON.stringify(member2ValidateKeyList));
        for (const key of member2ValidateKeyList) {
            const isValidateCustomFunc = typeof this[key] === 'function'
            const result = await this._validateRuleByKey(
                key,
                isValidateCustomFunc,
            )
            if (!result.passed) {
                errorList.push({
                    type: isValidateCustomFunc ? 'function' : 'value',
                    filed: key,
                    message: result.message,
                })
            }
        }
        if (errorList.length) {
            return Promise.reject(errorList)
        }
        this._mountHook(ctx, hook)
        return Promise.resolve(this)
    }

    // 用户知道变量路径来从 parsed 中获取对应的值
    get(path, parsed = true) {
        if (parsed) {
            return _.get(this.parsedData, path, null)
        }
        return _.get(this.rawData, path, null)
    }

    /**
     * 用户不知道路径，只知道Key就可以根据key获取对应值的信息
     * 需要确保在请求体中的参数名唯一，否则只会返回第一个
    */
    getValueInfo(key) {
        let value = null
        let path = []
        const valueLocation = ['query', 'body', 'path', 'header']
        valueLocation.find((location) => {
            const _path = [location, key]
            const _val = _.get(this.rawData, _path)
            if (_val) {
                path = _path
                value = _val
                return true
            }
        })
        return {
            value,
            path,
        }
    }

    // 获取聚合之后的值，
    getAssembleParams(parsed=true){
        return parsed ? this.parsedData : this.rawData
    }

}
