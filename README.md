# a best validator in Node js project

[Chinese document(中文文档)](https://blog.csdn.net/weixin_38080573/article/details/109530652)

## galaxy-validator
Small and beautiful, a compact parameter validator.You can use it to validate params in your project,
Also the validation rule itself will also be validated,If the validation rule is wrong, an error message is printed on the console,but your service won't die.
it's return a promise, So you can use all the features of a promise.
it can be use in koa、express...nodejs project。

## Install
```
npm install galaxy-validator
```

## usage

your validator/uId.js
```
const { Rule, GalaxyValidator } = require('GalaxyValidator');
class uIdValidator extends GalaxyValidator{
   
    constructor(){
        super();
        // the uid will be validate by follow rule
        // As a developer you don't have to worry about where the value of the uId is, 
        // the validator will get the uId'value from the request query, request body, request path, request header
        this.uId = new Rule([
            {required:true, message:'uId is required'},
            {type:'isInt', message:'please input number'},
            {type:'isLength', message:'a minimum of 5 words and a maximum of 10 words', options:{min:5,max:10}},
        ]);
    }
    
    // The function with the header 'validate' will be automatically validated
    async validateUid(vals){
        // assume uId is in the body of the request
        const uId = vals.body.uId;
        // Asynchronously determine if the user exists in the database
        const userRecord = await juddgeUserInDb(uId);
        if(!userRecord){
            throw new Error('the uId is not exit in database')
        }
        // If the validation is successful and the function has a return value, 
        // the validator mounts this value in the galaxy.pool object
        // You can then retrieve the value by ctx.galaxy.get('pool.user')
        // Or you can return no value, depending on the developer
        // The purpose of this is to make it easy for us to store some information when we verify it asynchronously, 
        // so that we don't have to retrieve the same information asynchronously later
        return {
            key:'userInfo',
            val:userRecord
        }
    }

    // Asynchronously determine if the user exists in the database
    async juddgeUserInDb(uId){
        return await db.findUser({
            uId,
        })
    }
}

module.exports = {
    uIdValidator
}
```

your api.js

```
const uIdValidator = require('./validator/uId.js);
// user?age=20&name='yangjian'
router.get('/user', async(ctx, next)=>{
    // galaxy is a function provide by GalaxyValidator
    try {
         const galaxy = await new UidValidator().validate(ctx);
         console.log(galaxy.get('query.uid'));
         // userInfo is mounted in the validateUid function (the return value)
         console.log(galaxy.get('pool.userInfo'))
         // or get galaxy from ctx
         console.log(ctx.galaxy.get('query.uid'));
         console.log(ctx.galaxy.get('pool.userInfo'))
         // get all params from request head body path query
         const assembleParams = ctx.galaxy.getAssembleParams();
         // If you're not sure about the path of the variable you just know the key, use the getValueInfo
         const name = ctx.galaxy.getValueInfo('name');
    } catch (error) {
         console.log(error)
    }
    // or
    const uIdValidator = new UidValidator();
    uIdValidator.validate(ctx).then(galaxy=>{
        console.log(galaxy.get('query.uid'));
    }, err=>{
        console.log(err)
    });
})
```

Inherit the GalaxyValidator and then use the new Rule to instantiate the rules that need to be validated.
The normal validation is based on the VALIDATE NPM package.
Some validation of custom businesses (synchronous or asynchronous) requires registration of custom validation functions.
These custom validation rules functions need to be named with the start of 'validate'

## rule List
Galaxy Validator is based on validator validation rules. The Type field in the validation Rule is what you need to validate in the Validator.
At the same time, the validation of three basic('isString'、'isObject'、'isArray') data types and required is also extended

### api
| params   |  type    |    value                            | description    |
|----------|----------|-------------------------------------|------------|
| required | boolean   |    true/false                      | Whether this field is a required field |
| message  | string   |    'error parameter'                | Error message prompted when validation fails |
| type     | string   |    Refer to the Validator validation type + ['isString', 'isObject', 'isArray'] three data types| Verify the category |
| options  | string   |    Refer to validator for options | The configuration passed to the Validator |

[package validate](https://www.npmjs.com/package/validator)

## validate the value

### sussess
If the current value (uId) passes the check, the value will be converted reasonably, And the validator returns a 'galaxy' hook.
You can use this hook to get a reasonable value.
For example, uId is automatically converted to string in Node, but it is actually an int. If it passes the validation, it will be automatically converted to int, and the value of its int can be obtained through the hook ctx.galaxy like this:
```
 const galaxy = await new UidValidator().validate(ctx);
 galaxy.get ('body.uId');
 //or
 ctx.galaxy.get ('body.uId') // get 123 not '123'
```

ctx.galaxy is a hook provided by the validator. You can also switch to other keywords, like this:

```
router.get('/info', async(ctx, next)=>{
    await new accountValidator().validate(ctx, '', yourKey);
})
```

If the validation is successful and the function has a return value, the validator mounts this value in the galaxy.pool object
You can then retrieve the value by ctx.galaxy.get('pool.user').Or you can return no value, depending on the developer
The purpose of this is to make it easy for us to store some information when we verify it asynchronously, so that we don't have to retrieve the same information asynchronously later.

### fail
If the current value does not pass validation, you will get the details of the error, as shown below
```
[
  { type: 'value', filed: 'uid', message: '请输入数字' },
  { type: 'function', filed: 'validateUid', message: 'ERROR...' }
]
```

| params  |  type    |    value                            | explain    |
|---------|----------|-------------------------------------|------------|
| type    | string   |    value/function                   | Wrong type   Error of registration rule/Custom function check error |
| filed   | string   |    the parameter/function name      | Verify the wrong parameters |
| message | string   |    Error message description        | Error message description |
| path    | string   |    like: "query.age"                | If it is a field, the error parameter location is exposed, and the custom function verification error is null |

## validate the rule
The validator also validates the rule itself and prints the error in the console if the validation rule goes wrong

for example:

```
constructor(){
        super();
        this.uid = new Rule([
            {required:123},
        ]);
    }
```

The console will print out that the Required field should be a Boolean, like this

![image](https://img-blog.csdnimg.cn/20201106144206116.png#pic_center)

```
constructor(){
        super();
        this.uid = new Rule([
            {required:false, message:"uId is required value"},
            {required:false, message:"uId is required value"},
        ]);
    }
```

![image](https://img-blog.csdnimg.cn/20201106144232344.png#pic_center)

## alias
Sometimes the variable you want to verify maps to another name, alias substitution can solve this problem. like this

```
router.get('/:pid/info', async(ctx, next)=>{
    const map = {id:'pid'}
    await new accountValidator().validate(ctx, map);
})

// validate
this.id = [
        new Rule([
            {type:'isInt', message:'init type'}
        ]),
    ]
```

## Inherit validator
There is a basic validator for validate age.This is probably going to be checked in a lot of places.
We can wrap it as a base class for other classes to inherit from

```
// validate age, in this case a required field, as a positive integer within the [18,120] range
class AgeValidator extends GalaxyValidator{
    constructor() {
        super()
        this.age = new Rule([
            {
                required:true,
                message:'age is a required field',
            },{
                type:'isInt', 
                message:'The age should be between 18 and 120 positive integers',
                options:{
                    min: 18,
                    max:120
                }
            }
        ])
    }

    // For asynchronous verification, you just need to add 'Async'
    validateAge = (vals)=>{
        const age = vals.query.age;
        if('Verification failed'){
            throw new Error('error message...')
        }
        // Validate passed and mount ageInfo in the data pool provided by Galaxy for easy retrieval elsewhere
        return {
            key:'ageInfo',
            val:{
                age:20,
                id:'121'
            }
        }
    }
}
```
```

// Here we inherit the AgeValidator
// Indicates that the EmployeeValidator requires age compliance, and that the name field is additionally validated on top of that
class EmployeeValidator extends AgeValidator{
    constructor(){
        super()
        this.name = new Rule([
            {
                required:true,
                message:'Name is a required field',
            },{
                type:'isLength', 
                message:'At least 2 characters and a maximum of 10 characters', 
                options:{min:2,max:10}
            },
        ]);
    }

    // It is recommended to use the build arrow function to solve the 'this' pointing problem
    validateName = (vals)=>{
        const ageInfo = vals.pool.ageInfo;
        // or
        const  ageInfo1 = this.get('pool.ageInfo');
        // do some validate， If the validation fails, you only need to throw an error
    }
}
module.exports = {
    EmployeeValidator
}
```

your api.js
```
// employee?age=20&name='yangjian'
router.get('/employee', async(ctx, next)=>{
    try {
        const galaxy = await new EmployeeValidator().validate(ctx);
        const age = galaxy.get('query.age');
        const name = galaxy.get('query.name');
        ctx.body =`
        age: ${age}
        name: ${name}
        `;
    } catch (error) {
        console.log(error)
        ctx.body =error;
    }
});
```

if your requestis  server.../employee?age=-128&name='yangjian'
you will get the error message
![image](https://img-blog.csdnimg.cn/20201106144308625.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl8zODA4MDU3Mw==,size_16,color_FFFFFF,t_70#pic_center)


## summary

In all, the galaxy validate exposes the following API to the developer
1. class GalaxyValidator:  This is inherited by the business-layer validator, which use the Rule in its constructor to register general validations, which are automatically retrieved by the self-validating function that precedes the 'validate'
2. class Rule: Use Rule to register general validation in the GalaxyValidator constructor
3. ctx.galaxy: The validator exposes the hook object on which some methods can be used
    1. ctx.galaxy.get:  When you know the path of the variable, you can get the exact value by use this function. e.g: galaxy.get('query.name')、galaxy.get('path.name')、galaxy.get('header.name')、galaxy.get('body.name')、galaxy.get('pool.name').Gets the value of the name from the request parameter, path, request header, request body, and the data pool provided by Galaxy, respectively
    2. ctx.galaxy.getValueInfo When the position of the parameter is uncertain (often encapsulating some method), only the key is known to use the method.
        e.g: galaxy.getValueInfo('name');Variables are queried from the request header, the request body, the request path, and the request parameters. And returns the value of the variable and the specific path
    3. ctx.galaxy.getAssembleParams: Assemble the request header, request body, request path, request parameters, and all values in the Galaxy datapool 

### galaxy api
| function name                |  params                                      |   return value  | description    |
|------------------------------|----------------------------------------------|-------------------------------------|------------|
| ctx.galaxy.get               | (path, boolean)                              | The value of the variable | you know the path of the parameter in the request, Boolean defaults true to a reasonable value and false to the original value |
| ctx.galaxy.getValueInfo      | key | {value:The value of the variable,path:The path of the variable in the request} | This method can be used if the parameter path is uncertain (mostly for encapsulation of tool libraries)|
| ctx.galaxy.getAssembleParams | null | {header,body, path, query, pool}      | assemble the request header, request body, request path, request parameters, and all values in the Galaxy datapool  |


## demo online
https://codesandbox.io/s/galaxy-validator-7ml16?file=/src/index.js























