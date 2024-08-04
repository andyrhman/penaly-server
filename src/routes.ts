import express, { Router } from "express";
import { AuthMiddleware } from "./middleware/auth.middleware";
import { PermissionMiddleware } from "./middleware/permission.middleware";
import { AuthenticatedUser, Login, Logout, Register, UpdateInfo, UpdatePassword } from "./controller/auth.controller";
import { CreateUser, DeleteUser, GetUser, UpdateUser, Users } from "./controller/user.controller";
import { CreateRole, DeleteRole, GetRole, Roles, UpdateRole } from "./controller/role.controller";
import { Permissions } from "./controller/permission.controller";
import { CreateTag, DeleteTag, GetTag, GetTagArticle, Tags, UpdateTag } from "./controller/tag.controller";
import { UploadArticleImage, UploadUserImage } from "./controller/upload.controller";
import { Articles, ArticlesMostLikes, ArticlesPending, ArticlesPublish, ArticlesPublishNew, ChangeArticleStatus, CheckUserLikeArticle, CreateArticle, CreateArticleUser, DeleteArticle, DeleteArticleUser, DislikeArticle, GetArticle, GetArticleCounts, GetUserOwnArticle, LikeArticle, UpdateArticle, UpdateArticleUser } from "./controller/article.controller";
import { AdminDeleteComment, AdminDeleteCommentReply, CheckCommentLike, CheckCommentLikeReply, CreateComment, DeleteComment, DeleteCommentReply, DislikeComment, DislikeReplyComment, GetComment, LikeComment, LikeReplyComment, ReplyComment } from "./controller/komentar.controller";
import { ArticleStat, Stats, UsersStat } from "./controller/statistic.controller";

export const routes = (router: Router) => {
    // * Authentication
    router.post('/api/register', Register);
    router.post('/api/login', Login);
    router.get('/api/user', AuthMiddleware, AuthenticatedUser);
    router.post('/api/logout', AuthMiddleware, Logout);
    router.put('/api/user/info', AuthMiddleware, UpdateInfo);
    router.put('/api/user/password', AuthMiddleware, UpdatePassword);

    // * User   
    router.get('/api/users', AuthMiddleware, PermissionMiddleware('users'), Users);
    router.post('/api/users', AuthMiddleware, PermissionMiddleware('users'), CreateUser);
    router.get('/api/users/:id', AuthMiddleware, PermissionMiddleware('users'), GetUser);
    router.put('/api/users/:id', AuthMiddleware, PermissionMiddleware('users'), UpdateUser);
    router.delete('/api/users/:id', AuthMiddleware, PermissionMiddleware('users'), DeleteUser);

    // * Peran dan Perizinan
    router.get('/api/permissions', AuthMiddleware, Permissions);
    router.get('/api/roles', AuthMiddleware, PermissionMiddleware('roles'), Roles);
    router.post('/api/roles', AuthMiddleware, PermissionMiddleware('roles'), CreateRole);
    router.get('/api/roles/:id', AuthMiddleware, PermissionMiddleware('roles'), GetRole);
    router.put('/api/roles/:id', AuthMiddleware, PermissionMiddleware('roles'), UpdateRole);
    router.delete('/api/roles/:id', AuthMiddleware, PermissionMiddleware('roles'), DeleteRole);

    // * Tag
    router.get('/api/tags', Tags);
    router.post('/api/tags', AuthMiddleware, PermissionMiddleware('categories'), CreateTag);
    router.get('/api/tags/:id', AuthMiddleware, PermissionMiddleware('categories'), GetTag);
    router.put('/api/tags/:id', AuthMiddleware, PermissionMiddleware('categories'), UpdateTag);
    router.delete('/api/tags/:id', AuthMiddleware, PermissionMiddleware('categories'), DeleteTag);

    // * Artikel
    router.get('/api/articles', AuthMiddleware, PermissionMiddleware('articles'), Articles);
    router.get('/api/articles/pending', AuthMiddleware, PermissionMiddleware('articles'), ArticlesPending);
    router.post('/api/articles', AuthMiddleware, PermissionMiddleware('articles'), CreateArticle);
    router.put('/api/articles/:id', AuthMiddleware, PermissionMiddleware('articles'), UpdateArticle);
    router.delete('/api/articles/:id', AuthMiddleware, PermissionMiddleware('articles'), DeleteArticle);
    router.put('/api/articles/status/:id', AuthMiddleware, PermissionMiddleware('articles'), ChangeArticleStatus);

    // * Artikel user managed
    router.get('/api/articles/published', ArticlesPublish);
    router.get('/api/articles/published/new', ArticlesPublishNew);
    router.get('/api/articles/mostlikes', ArticlesMostLikes);
    router.get('/api/articles/:slug', GetArticle);
    router.get('/api/artikelku', AuthMiddleware, GetUserOwnArticle);
    router.get('/api/artikelku/hitung', AuthMiddleware, GetArticleCounts);

    router.put('/api/articles/like/:id', AuthMiddleware, LikeArticle);
    router.put('/api/articles/dislike/:id', AuthMiddleware, DislikeArticle);
    router.get('/api/articles/like/:id', AuthMiddleware, CheckUserLikeArticle);     
    router.post('/api/articles/create', AuthMiddleware, CreateArticleUser);
    router.put('/api/articles/update/:id', AuthMiddleware, UpdateArticleUser);
    router.delete('/api/articles/delete/:id', AuthMiddleware, DeleteArticleUser);
    router.get('/api/article/tags/:nama', GetTagArticle);

    // * Komentar
    router.get('/api/comments/:id', GetComment);
    router.post('/api/comments/:id', AuthMiddleware, CreateComment);
    router.post('/api/balaskomentar', AuthMiddleware, ReplyComment);

    router.post('/api/comments/like/:id', AuthMiddleware, LikeComment);
    router.post('/api/comments/dislike/:id', AuthMiddleware, DislikeComment);
    router.get('/api/comments/like/:id', AuthMiddleware, CheckCommentLike);

    router.post('/api/komentar/like/balas', AuthMiddleware, LikeReplyComment);
    router.post('/api/komentar/dislike/balas', AuthMiddleware, DislikeReplyComment);
    router.get('/api/komentar/like/check', AuthMiddleware, CheckCommentLikeReply);

    router.delete('/api/admin/comments/:id/:user_id', AuthMiddleware, PermissionMiddleware('comments'), AdminDeleteComment);
    router.delete('/api/admin/hapuskomentar/balas', AuthMiddleware, PermissionMiddleware('comments'), AdminDeleteCommentReply);
    router.delete('/api/comments/:id', AuthMiddleware, DeleteComment);
    router.delete('/api/hapuskomentar/balas', AuthMiddleware, DeleteCommentReply);

    // * Statistic
    router.get("/api/admin/stats", AuthMiddleware, PermissionMiddleware('articles'), Stats);
    router.get("/api/admin/user-chart", AuthMiddleware, PermissionMiddleware('articles'), UsersStat);
    router.get("/api/admin/article-chart", AuthMiddleware, PermissionMiddleware('articles'), ArticleStat);

    // * Upload Images
    router.post('/api/upload/articles', AuthMiddleware, UploadArticleImage);
    router.use('/api/uploads/articles', express.static('./uploads/articles'));
    router.post('/api/upload/users', AuthMiddleware, UploadUserImage);
    router.use('/api/uploads/users', express.static('./uploads/users'));
    router.use('/api/uploads', express.static('./uploads'));

};