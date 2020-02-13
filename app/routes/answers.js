const koaJwt = require('koa-jwt');
const Router = require('koa-router');

const router = new Router({
    prefix: '/questions/:questionId/answers',
});

const {
    create,
    delete: del,
    findById,
    find,
    update,
    checkAnswerExist,
    checkAnswerer,
} = require('../controllers/answers');
const { secret } = require('../config');

const auth = koaJwt({ secret });

router.post('/', auth, create);
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del);
router.get('/', find);
router.get('/:id', checkAnswerExist, findById);
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update);

module.exports = router;
