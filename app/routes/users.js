const Router = require('koa-router');
const router = new Router({
    prefix: '/users',
});
const {
    create,
    delete: del,
    find,
    findById,
    update
} = require('../controllers/users');

router.post('/', create);
router.delete('/:id', del);
router.get('/', find);
router.get('/:id', findById);
router.put('/:id', update);

module.exports = router;
