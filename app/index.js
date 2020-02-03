const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const routing = require('./routes');

const app = new Koa();

app.use(bodyParser());
routing(app);

app.listen(3000, () => {
    console.log('程序启动在3000端口了！');
});
