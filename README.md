# a best validator in Node js project

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

![image](./src/img/err-1.png)

```
constructor(){
        super();
        this.uid = new Rule([
            {required:false, message:"uId is required value"},
            {required:false, message:"uId is required value"},
        ]);
    }
```

![image](./src/img/err-2.png)

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
![image](./src/img/err-3.png)


## demo online
https://codesandbox.io/s/galaxy-validator-7ml16?file=/src/index.js























