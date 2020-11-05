const extractAttributesFromInstance = (instance, options) => {
    const { specifiedType, prefix, filter } = options

    const _shouldKeep = (value) => {
        if (filter) {
            return filter(value)
        }
        if (prefix) {
            return value.startsWith(prefix)
        }
        if (specifiedType) {
            return instance[value] instanceof specifiedType
        }
        return false
    }

    // 遍历该对象上的所有属性过滤符合条件的属性
    const _recursionInstanceAttr = (instance2) => {
        // 基线条件（跳出递归）
        if (instance2.__proto__ === null) return []
        let keys = Reflect.ownKeys(instance2)
        keys = keys.filter((key) => _shouldKeep(key))
        return [...keys, ..._recursionInstanceAttr(instance2.__proto__)]
    }

    return _recursionInstanceAttr(instance)
}

// 传入的值是否是'空'
const isEmptyVal = (val) => val === null || val === undefined || val === ''

// judge data type
const dataType = (data) => {
    const val = Object.prototype.toString.call(data)
    switch (val) {
        case '[object String]':
            return 'String'
        case '[object Number]':
            return 'Number'
        case '[object Boolean]':
            return 'Boolean'
        case '[object Symbol]':
            return 'Symbol'
        case '[object Undefined]':
            return 'Undefined'
        case '[object Null]':
            return 'Null'
        case '[object Function]':
            return 'Function'
        case '[object Date]':
            return 'Date'
        case '[object Array]':
            return 'Array'
        case '[object RegExp]':
            return 'RegExp'
        case '[object Error]':
            return 'Error'
        case '[object HTMLDocument]':
            return 'HTMLDocument'
        case '[object Object]':
            return 'Object'
        default:
            return 'any'
    }
}

export { dataType, isEmptyVal, extractAttributesFromInstance }
