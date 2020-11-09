const validate = require('validator');

const res = validate.isLength('["name"]', {min:2, max:10});

console.log(res)