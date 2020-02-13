const koaJwt = require('koa-jwt');
const Router = require('koa-router');

const router = new Router({
    prefix: '/questions',
});

const {
    create,
    delete: del,
    findById,
    find,
    update,
    checkQuestionExist,
    checkQuestioner,
} = require('../controllers/questions');
const { secret } = require('../config');

const auth = koaJwt({ secret });

router.post('/', auth, create);
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del);
router.get('/', find);
router.get('/:id', checkQuestionExist, findById);
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update);

module.exports = router;
