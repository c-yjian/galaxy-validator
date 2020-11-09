const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const { catchError } = require('./globalError')
const { UidValidator } = require('./validator/uid');
const { EmployeeValidator } = require('./validator/employee');

router.get('/', async(ctx, next)=>{
    console.count('root:');
    ctx.body = 'hello galaxy validator'
});

router.get('/user', async(ctx, next)=>{
    try {
        const galaxy = await new UidValidator().validate(ctx);
        console.log(galaxy.get('query.uid'));
        console.log(ctx.galaxy.get('pool.pageInfo'));
        ctx.body = ctx.galaxy.get('query.uid');
    } catch (error) {
        console.log(error)
        ctx.body =error;
    }
    // or
    // const validator = new UidValidator();
    // validator.validate(ctx).then(galaxy=>{
    //     console.log(galaxy.get('query.uid'));
    //     console.log(galaxy.get('pool.pageInfo'));
    //     console.log(ctx.galaxy.get('pool.pageInfo'));
    //     ctx.body = 'ok11'
    // }, err=>{
    //     console.log(err)
    // });
});

// employee?age=20&name='yangjian'
router.get('/employee', async(ctx, next)=>{
    try {
        const galaxy = await new EmployeeValidator().validate(ctx);
        const age = galaxy.get('query.age');
        const name = galaxy.get('query.name');
        console.log(JSON.stringify(ctx.galaxy.getAssembleParams()));
        ctx.body =`
        age: ${age}
        name: ${name}
        `;
    } catch (error) {
        console.log(error)
        ctx.body =error;
    }
});

app.use(catchError);
app.use(router.routes());
app.listen(3005);
