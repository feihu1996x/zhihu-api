const db = [
    {
        name: '李雷',
    },
    {
        name: '韩梅梅',
    },
];

class UsersCtl {
    create(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true,
            },
            age: {
                type: 'number',
                required: false,
            }
        });
        db.push(ctx.request.body);
        ctx.body = ctx.request.body;
    }
    delete(ctx) {
        if (db.length <= ctx.params.id) {
            ctx.throw(412);
        }
        db.splice(ctx.params.id * 1, 1);
        ctx.status = 204;
    }
    find(ctx) {
        a.b;
        ctx.body = db;
    }
    findById(ctx) {
        if (db.length <= ctx.params.id) {
            ctx.throw(412);
        }
        ctx.body = db[ctx.params.id * 1];
    }
    update(ctx) {
        if (db.length <= ctx.params.id) {
            ctx.throw(412);
        }
        ctx.verifyParams({
            name: {
                type: 'string',
                required: false,
            },
            age: {
                type: 'number',
                required: false,
            }
        });
        db[ctx.params.id * 1] = ctx.request.body;
        ctx.body = ctx.request.body;
    }
}

module.exports = new UsersCtl();
