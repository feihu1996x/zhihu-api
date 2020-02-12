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
    listFollowings,
    listFollowers,
    checkUserExist,
    follow,
    unFollow,
} = require('../controllers/users');
const { secret } = require('../config');

const auth = koaJwt({ secret })

router.post('/', create);
router.delete('/:id', auth, checkOwner, del);
router.get('/', find);
router.get('/:id', findById);
router.patch('/:id', auth, checkOwner, update);
router.post('/login', login);
router.get('/:id/followings', listFollowings);
router.get('/:id/followers', listFollowers);
router.put('/following/:id', auth, checkUserExist, follow);
router.delete('/following/:id', auth, checkUserExist, unFollow);

module.exports = router;
