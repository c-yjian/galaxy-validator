const Koa = require('koa');
const Router = require('koa-router');
const app = new Koa();
const router = new Router();
const { catchError } = require('./globalError')
const { UidValidator } = require('./validator/uid');

router.get('/', async(ctx, next)=>{
    console.count('root:');
    ctx.body = 'hello galaxy validator'
});

router.get('/user', async(ctx, next)=>{
    try {
        const galaxy = await new UidValidator().validate(ctx);
        console.log(galaxy.get('query.uid'));
        console.log(ctx.galaxy.get('pool.pageInfo'));
    } catch (error) {
        console.log(error)
    }
    ctx.body = ctx.galaxy.get('query.uid');
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

app.use(catchError);
app.use(router.routes());
app.listen(3005);
