const { Rule, GalaxyValidator } = require('../../dist');

class AgeValidator extends GalaxyValidator{
    constructor(ctx) {
        super();
        // 业务层有特殊需求，可以将ctx传递进来
        this.ctx = ctx;
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

    validateAge = (vals)=>{
        return {
            key:'ageInfo',
            val:{
                age:20,
                name:'name'
            }
        }
    }
}

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
    validateName = (vals)=>{
        // console.log(JSON.stringify(vals));
    }
}

module.exports = {
    EmployeeValidator
}