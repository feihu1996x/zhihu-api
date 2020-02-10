const Koa = require('koa');
const error = require('koa-json-error');
const bodyParser = require('koa-bodyparser');
const routing = require('./routes');

const app = new Koa();

app.use(error({
    postFormat: (e, { stack, ...rest }) => {
        return 'production' === process.env.NODE_ENV ? rest : { stack, ...rest }
    }
}));
app.use(bodyParser());
routing(app);

app.listen(3000, () => {
    console.log('程序启动在3000端口了！');
});
