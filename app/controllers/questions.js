const Question = require('../models/questions');

class QuestionCtl {
    async create(ctx) {
        ctx.verifyParams({
            title: {
                type: 'string',
                required: true,
            },
            description: {
                type: 'string',
                required: false,
            },
            topics: {
                type: 'array',
                itemType: 'string',
                required: false,
            }
        });
        const question = await new Question({...ctx.request.body, questioner: ctx.state.user._id}).save();
        ctx.body = question;
    }
    async delete(ctx) {
        await Question.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
    async find(ctx) {
        let { page = 1, perPage = 10 } = ctx.query;
        page = Math.max(page * 1, 1) - 1;
        perPage = Math.max(perPage * 1, 1);
        const q = new RegExp(ctx.query.q);
        ctx.body = await Question
            .find({ $or: [
                {
                    title: q,
                },
                {
                    description: q,
                }
            ] })
            .limit(perPage)
            .skip(page * perPage);
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).join(' ');
        const question = await Question.findById(ctx.params.id).select(selectFields).populate(populateStr);
        ctx.body = question;
    }
    async update(ctx) {
        ctx.verifyParams({
            title: {
                type: 'string',
                required: false,
            },
            description: {
                type: 'string',
                required: false,
            },
            topics: {
                type: 'array',
                itemType: 'string',
                required: false,
            }
        });
        await ctx.state.question.update(ctx.request.body);
        ctx.body = ctx.state.question;
    }
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner');
        if (!question) {
            ctx.throw(404, '问题不存在');
        }
        ctx.state.question = question;
        await next();
    }
    async checkQuestioner(ctx, next) {
        const { question } = ctx.state;
        if (question.questioner.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
}

module.exports = new QuestionCtl();
