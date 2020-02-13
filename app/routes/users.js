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
    listQuestions,
    listLikingAnswers,
    likeAnswer,
    unlikeAnswer,
    listDisLikingAnswers,
    dislikeAnswer,
    unDislikeAnswer,
    listCollectingAnswers,
    collectAnswers,
    unCollectAnswers,
} = require('../controllers/users');
const { checkAnswerExist } = require('../controllers/answers');
const {
    listFollowingTopics,
    followTopic,
    unFollowTopic,
    checkTopicExist,
} = require('../controllers/topics');
const { secret } = require('../config');

const auth = koaJwt({ secret });

router.post('/', create);
router.delete('/:id', auth, checkUserExist, checkOwner, del);
router.get('/', find);
router.get('/:id', checkUserExist, findById);
router.patch('/:id', auth, checkUserExist, checkOwner, update);
router.post('/login', login);
router.get('/:id/followings', checkUserExist, listFollowings);
router.get('/:id/followers', checkUserExist, listFollowers);
router.put('/following/:id', auth, checkUserExist, follow);
router.delete('/following/:id', auth, checkUserExist, unFollow);
router.get('/:id/followingtopics', listFollowingTopics);
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic);
router.delete('/followingTopics/:id', auth, checkTopicExist, unFollowTopic);
router.get('/:id/questions', checkUserExist, listQuestions);
router.get('/:id/likingAnswers', listLikingAnswers);
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, unDislikeAnswer);
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer);
router.get('/:id/dislikingAnswers', listDisLikingAnswers);
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer);
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, unDislikeAnswer);
router.get('/:id/collectingAnswers', listCollectingAnswers);
router.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswers);
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, unCollectAnswers);

module.exports = router;
