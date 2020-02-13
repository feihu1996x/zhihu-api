const Answer = require('../models/answers');

class AnswersCtl {
    async create(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: true,
            }
        });
        const answer = await new Answer({
            ...ctx.request.body,
            answerer: ctx.state.user._id,
            questionId: ctx.params.questionId,
        }).save();
        ctx.body = answer;
    }
    async delete(ctx) {
        await Answer.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
    async find(ctx) {
        let { page = 1, perPage = 10 } = ctx.query;
        page = Math.max(page * 1, 1) - 1;
        perPage = Math.max(perPage * 1, 1);
        ctx.body = await Answer
            .find({ content: new RegExp(ctx.query.q), questionId: ctx.params.questionId })
            .limit(perPage)
            .skip(page * perPage);
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).join(' ');
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate(populateStr);
        ctx.body = answer;
    }
    async update(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: false,
            }
        });
        await ctx.state.answer.update(ctx.request.body);
        ctx.body = ctx.state.answer;
    }
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer');
        if (!answer) {
            ctx.throw(404, '答案不存在');
        }
        if (ctx.params.questionId && answer.questionId.toString() !== ctx.params.questionId) {
            ctx.throw(404, '该问题下没有此答案');
        }
        ctx.state.answer = answer;
        await next();
    }
    async checkAnswerer(ctx, next) {
        const { answer } = ctx.state;
        if (answer.answerer.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
}

module.exports = new AnswersCtl();
