
// global exception handler
const catchError = async(ctx, next)=>{
    try {
        await next();
    } catch (error) {
        ctx.body = {
            data:error.message,
            state:error.errorCode || -999,   // 业务错误代码
        }
        ctx.status = error.code || 500;    // http 响应码
    }
}

module.exports = {
    catchError
}