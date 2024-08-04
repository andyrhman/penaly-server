import myDataSource from "../config/db.config";
import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { ArticleService } from "../services/article.service";
import { CommentService } from "../services/comment.service";
import { ArticleLikeService } from "../services/article-like.service";

// * Get and count the total statistic
export const Stats = async (req: Request, res: Response) => {
    const userService = new UserService();
    const articleService = new ArticleService();
    const commentService = new CommentService();
    const articleLikeService = new ArticleLikeService();

    const user_total = await userService.total({});
    const article_total = await articleService.total({});
    const comment_total = await commentService.totalComments();
    const articleLike_total = await articleLikeService.totalLikes();

    res.send({
        user_total: user_total.total,   
        article_total: article_total.total,
        comment_total: comment_total,
        articleLike_total: articleLike_total
    });
};

// * User Chart
export const UsersStat = async (req: Request, res: Response) => {
    const userService = new UserService();
    const time = req.query.time as string || 'day';
    res.send(await userService.chart(time));
};

// * Article Chart
export const ArticleStat = async (req: Request, res: Response) => {
    const articleService = new ArticleService();
    const time = req.query.time as string || 'day';
    res.send(await articleService.chartPublishedArticles(time));
};