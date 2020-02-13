const Comment = require('../models/comments');

class CommentsCtl {
    async create(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: true,
            },
            rootCommentId: {
                type: 'string',
                required: false,
            },
            replyTo: {
                type: 'string',
                required: false,
            },
        });
        const comment = await new Comment({
            ...ctx.request.body,
            commentator: ctx.state.user._id,
            questionId: ctx.params.questionId,
            answerId: ctx.params.answerId,
        }).save();
        ctx.body = comment;
    }
    async delete(ctx) {
        await Comment.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
    async find(ctx) {
        let { page = 1, perPage = 10 } = ctx.query;
        page = Math.max(page * 1, 1) - 1;
        perPage = Math.max(perPage * 1, 1);
        const { rootCommentId } = ctx.query;
        ctx.body = await Comment
            .find({
                content: new RegExp(ctx.query.q), 
                questionId: ctx.params.questionId,
                answerId: ctx.params.answerId,
                rootCommentId,
            })
            .limit(perPage)
            .skip(page * perPage).populate('commentator replyTo');
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).join(' ');
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate(populateStr);
        ctx.body = comment;
    }
    async update(ctx) {
        ctx.verifyParams({
            content: {
                type: 'string',
                required: false,
            }
        });
        const { content } = ctx.request.body;
        await ctx.state.comment.update({ content });
        ctx.body = ctx.state.comment;
    }
    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentator');
        if (!comment) {
            ctx.throw(404, '评论不存在');
        }
        if (ctx.params.questionId && comment.questionId.toString() !== ctx.params.questionId) {
            ctx.throw(404, '该问题下没有此评论');
        }
        if (ctx.params.answerId && comment.answerId.toString() !== ctx.params.answerId) {
            ctx.throw(404, '该答案下没有此评论');
        }
        ctx.state.comment = comment;
        await next();
    }
    async checkCommentator(ctx, next) {
        const { comment } = ctx.state;
        if (comment.commentator.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限');
        }
        await next();
    }
}

module.exports = new CommentsCtl();
