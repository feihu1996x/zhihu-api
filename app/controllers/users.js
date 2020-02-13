const jsonWebToken = require('jsonwebtoken');

const User = require('../models/users');
const Question = require('../models/questions');
const Answer = require('../models/answers');
const { secret } = require('../config');

class UsersCtl {
    async create(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true,
            },
            password: {
                type: 'string',
                required: true,
            }
        });
        const { name } = ctx.request.body;
        const repeatedUser = await User.findOne({ name });
        if (repeatedUser) {
            ctx.throw(409, '用户名已经存在');
        }
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }
    async delete(ctx) {
        await User.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
    async find(ctx) {
        let { page = 1, perPage = 10 } = ctx.query;
        page = Math.max(page * 1, 1) - 1;
        perPage = Math.max(perPage * 1, 1);
        ctx.body = await User
            .find({ name: new RegExp(ctx.query.q) })
            .limit(perPage)
            .skip(page * perPage);
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if ('employments' === f) {
                return 'employments.company employments.job';
            }
            if ('educations' === f) {
                return 'educations.school education.major';
            }
            return f;
        }).join(' ');
        const user = await User
            .findById(ctx.params.id)
            .select(selectFields)
            .populate(populateStr);
        ctx.body = user;
    }
    async checkOwner(ctx, next) {
        if (ctx.state.user._id !== ctx.params.id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
    async update(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: false,
            },
            password: {
                type: 'string',
                required: false,
            },
            avatar_url: {
                type: 'string',
                required: false,
            },
            gender: {
                type: 'string',
                required: false,
            },
            headline: {
                type: 'string',
                required: false,
            },
            locations: {
                type: 'array',
                itemType: 'string',
                required: false,
            },
            business: {
                type: 'string',
                required: false,
            },
            employments: {
                type: 'array',
                itemType: 'object',
                required: false,
            },
            educations: {
                type: 'array',
                itemType: 'object',
                required: false,
            }
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        ctx.body = user;
    }
    async login(ctx) {
        ctx.verifyParams({
            name: {
                type: 'string',
                required: true,
            },
            password: {
                type: 'string',
                required: true,
            }
        });
        const user = await User.findOne(ctx.request.body);
        if (!user) {
            ctx.throw(401, '用户名或密码不正确');
        }
        const { _id, name } = user;
        const token = jsonWebToken.sign({ _id, name }, secret, { expiresIn: '1d' });
        ctx.body = { token };
    }
    async listFollowings(ctx) {
        const user = await User.findById(ctx.params.id)
            .select('+following')
            .populate('following');
        ctx.body = user.following;
    }
    async listFollowers(ctx) {
        const users = await User.find({ following: ctx.params.id });
        ctx.body = users;
    }
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id);
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        await next();
    }
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id);
            await me.save();
        }
        ctx.status = 204;
    }
    async unFollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.following.splice(index, 1);
            await me.save();
        }
        ctx.status = 204;
    }
    async listQuestions(ctx) {
        const questions = await Question.find({
            questioner: ctx.params.id,
        });
        ctx.body = questions;
    }
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.likingAnswers;
    }
    async likeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id);
            await me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, {
                $inc: {
                    voteCount: 1,
                }
            });
        }
        await next(); 
    }
    async unlikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers');
        const index = me.likingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.likingAnswers.splice(index, 1);
            await me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, {
                $inc: {
                    voteCount: -1,
                }
            });
        }
        ctx.status = 204;
    }
    async listDisLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.dislikingAnswers;
    }
    async dislikeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id);
            await me.save();
        }
        await next();
    }
    async unDislikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers');
        const index = me.dislikingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.dislikingAnswers.splice(index, 1);
            await me.save();
        }
        ctx.status = 204;
    }
    async listCollectingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers');
        if (!user) {
            ctx.throw(404, '用户不存在');
        }
        ctx.body = user.collectingAnswers;
    }
    async collectAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
        if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.collectingAnswers.push(ctx.params.id);
            await me.save();
        }
        ctx.status = 204;
    }
    async unCollectAnswers(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers');
        const index = me.collectingAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) {
            me.collectingAnswers.splice(index, 1);
            await me.save();
        }
        ctx.status = 204;
    }
}

module.exports = new UsersCtl();
