const koaJwt = require('koa-jwt');

const Router = require('koa-router');
const router = new Router({
    prefix: '/users',
});
const {
    create,
    delete: del,
    find,
    findById,
    update,
    login,
    checkOwner,
} = require('../controllers/users');
const { secret } = require('../config');

const auth = koaJwt({ secret })

router.post('/', create);
router.delete('/:id', auth, checkOwner, del);
router.get('/', find);
router.get('/:id', findById);
router.patch('/:id', auth, checkOwner, update);
router.post('/login', login);

module.exports = router;
