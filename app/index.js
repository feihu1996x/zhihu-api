const path = require('path');
const Koa = require('koa');
const error = require('koa-json-error');
const koaBody = require('koa-body');
const parameter = require('koa-parameter');
const koaStatic = require('koa-static');
const mongoose = require('mongoose');

const { connectionStr } = require('./config');
const routing = require('./routes');

const app = new Koa();

mongoose.connect(connectionStr, { useUnifiedTopology: true }, () => {
    console.log('MongoDB连接成功了！');
});
mongoose.connection.on('error', console.error);

app.use(koaStatic(path.join(__dirname, 'public')));
app.use(error({
    postFormat: (e, { stack, ...rest }) => {
        return 'production' === process.env.NODE_ENV ? rest : { stack, ...rest }
    }
}));
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true,
    }
}));
app.use(parameter(app))
routing(app);

app.listen(3000, () => {
    console.log('程序启动在3000端口了！');
});
