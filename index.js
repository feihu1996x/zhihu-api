const Koa = require('koa');
const Router = require('koa-router');

const app = new Koa();
const router = new Router();
const usersRouter = new Router({
    prefix: '/users',
});

const auth = async (ctx, next) => {
    if ('/users' !== ctx.url) {
        ctx.throw(401);
    }
    await next();
}

router.get('/', (ctx) => {
    ctx.body = '这是主页';
});
usersRouter.get('/', auth, (ctx) => {
    ctx.body = '这是用户列表';
});
usersRouter.get('/:id', auth, (ctx) => {
    ctx.body = `这是用户 ${ctx.params.id}`;
});
usersRouter.post('/', auth, (ctx) => {
    ctx.body = '创建用户';
});

app.use(router.routes());
app.use(usersRouter.routes());

app.listen(3000);
