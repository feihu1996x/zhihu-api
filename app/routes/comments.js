const koaJwt = require('koa-jwt');
const Router = require('koa-router');

const router = new Router({
    prefix: '/questions/:questionId/answers/:answerId/comments',
});

const {
    create,
    delete: del,
    findById,
    find,
    update,
    checkCommentExist,
    checkCommentator,
} = require('../controllers/comments');
const { secret } = require('../config');

const auth = koaJwt({ secret });

router.post('/', auth, create);
router.delete('/:id', auth, checkCommentExist, checkCommentator, del);
router.get('/', find);
router.get('/:id', checkCommentExist, findById);
router.patch('/:id', auth, checkCommentExist, checkCommentator, update);

module.exports = router;
