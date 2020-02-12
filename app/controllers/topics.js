const Topic = require('../models/topics');
const User = require('../models/users');

class TopicsCtl {
    async create(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true,
            },
            avatar_url: {
                type: 'string',
                required: false,
            },
            introduction: {
                type: 'string',
                required: false,
            }
        });
        const topic = await new Topic(ctx.request.body).save();
        ctx.body = topic;
    }
    async find(ctx) {
        let { page = 1, perPage = 10 } = ctx.query;
        page = Math.max(page * 1, 1) - 1;
        perPage = Math.max(perPage * 1, 1);
        ctx.body = await Topic
            .find({ name: new RegExp(ctx.query.q) })
            .limit(perPage)
            .skip(page * perPage);
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const topic = await Topic.findById(ctx.params.id).select(selectFields);
        ctx.body = topic;
    }
    async update(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: false,
            },
            avatar_url: {
                type: 'string',
                required: false,
            },
            introduction: {
                type: 'string',
                required: false,
            }
        });
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        ctx.body = topic;
    }
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id);
        if (!topic) {
            ctx.throw(404, '话题不存在');
        }
        await next();
    }
    async followTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id);
            await me.save();
        }
        ctx.status = 204;
    }
    async unFollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.followingTopics.splice(index, 1);
            await me.save();
        }
        ctx.status = 204;
    }
    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id)
            .select('+followingTopics')
            .populate('followingTopics');
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.followingTopics;
    }
    async listTopicsFollowers(ctx) {
        const users = await User.find({ followingTopics: ctx.params.id });
        ctx.body = users;
    }
}

module.exports = new TopicsCtl();
