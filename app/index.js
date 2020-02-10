const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const routing = require('./routes');

const app = new Koa();

app.use(async (ctx, next) => {
    // 自定义的错误处理中间件
    // 不能捕获404错误
    try {
        await next();
    } catch (err) {
      ctx.status = err.status || err.statusCode || 500;
      ctx.body = {
          message: err.message
      };
    }
});
app.use(bodyParser());
routing(app);

app.listen(3000, () => {
    console.log('程序启动在3000端口了！');
});
