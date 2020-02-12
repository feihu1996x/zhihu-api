const koaJwt = require('koa-jwt');
const Router = require('koa-router');

const router = new Router({
    prefix: '/topics',
});

const {
    create,
    find,
    findById,
    update,
    listTopicsFollowers,
    checkTopicExist,
} = require('../controllers/topics');
const { secret } = require('../config');

const auth = koaJwt({ secret });

router.post('/', auth, create);
router.get('/', find);
router.get('/:id', checkTopicExist, findById);
router.patch('/:id', auth, checkTopicExist, update);
router.get('/:id/followers', checkTopicExist, listTopicsFollowers);

module.exports = router;
