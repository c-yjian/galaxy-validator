const { Rule, GalaxyValidator } = require('../../dist');

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