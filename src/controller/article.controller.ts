import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { Article } from "../entity/article.entity";
import { plainToClass } from "class-transformer";
import { CreateArticleDto } from "../validation/dto/create-article.dto";
import { isUUID, validate } from "class-validator";
import { formatValidationErrors } from "../utility/validation.utility";
import { UpdateArticleDto } from "../validation/dto/update-article.dto";
import slugify from "slugify";
import { ArticlePublish, Status } from "../entity/article-publish.entity";
import { Likes } from "../entity/article-like.entity";
import { UpdateArticleStatusDTO } from "../validation/dto/update-article-status.dto";
import { Komentar } from "../entity/komentar.entity";
import { BalasKomentar } from "../entity/balas-komentar.entity";

// * Get all articles
export const Articles = async (req: Request, res: Response) => {
    const articleRepository = myDataSource.getRepository(Article);
    const filter = req.query.filter as string;
    const search = req.query.search ? req.query.search.toString().toLowerCase() : null;

    let status: string | null = null;
    if (filter === "pending") {
        status = "Pending";
    } else if (filter === "publish") {
        status = "Diterbitkan";
    } else if (filter === "ditolak") {
        status = "Ditolak";
    }

    const queryBuilder = articleRepository
        .createQueryBuilder("article")
        .leftJoinAndSelect("article.status_publish", "status_publish")
        .orderBy("article.dibuat_pada", "DESC");

    if (status) {
        queryBuilder.where("status_publish.status = :status", { status });
    }

    if (search) {
        queryBuilder.andWhere(
            "(LOWER(article.title) LIKE :search OR LOWER(article.deskripsi_kecil) LIKE :search OR LOWER(article.deskripsi_panjang) LIKE :search)",
            { search: `%${search}%` }
        );
    }

    const articles = await queryBuilder.getMany();
    res.send(articles);
};

// * Get all articles New
export const ArticlesPublishNew = async (req: Request, res: Response) => {
    const articleRepository = myDataSource.getRepository(Article);

    const articles = await articleRepository
        .createQueryBuilder("article")
        .leftJoinAndSelect("article.status_publish", "status_publish")
        .where("status_publish.status = :status", { status: "Diterbitkan" })
        .orderBy("article.dibuat_pada", "DESC")
        .getMany();

    res.send(articles);
};

// * Get all by most likes
export const ArticlesMostLikes = async (req: Request, res: Response) => {
    const articleRepository = myDataSource.getRepository(Article);

    const articles = await articleRepository.find({ relations: ['likes', 'status_publish', 'user'] });

    const filteredArticles = articles
        .filter(article => article.status_publish.some(status => status.status === "Diterbitkan"))
        .map(article => {
            const validLikes = article.likes ? article.likes.filter(like => like.likes !== null).length : 0;

            return {
                ...article,
                likes: validLikes,
            };
        });

    res.send(filteredArticles);
};

// * Get all articles publish only
export const ArticlesPublish = async (req: Request, res: Response) => {
    const articleRepository = myDataSource.getRepository(Article);
    const komentarRepository = myDataSource.getRepository(Komentar);
    const balasKomentarRepository = myDataSource.getRepository(BalasKomentar);

    const articles = await articleRepository.find({
        relations: ['likes', 'status_publish', 'user', 'tag'],
        select: [
            'id', 'title', 'slug', 'deskripsi_kecil', 'estimasi_membaca', 'gambar',
            'dibuat_pada', 'penulis', 'tag', 'user'
        ],
        order: {
            dibuat_pada: 'DESC'
        }
    });

    const filteredArticles = await Promise.all(articles
        .filter(article => article.status_publish.some(status => status.status === "Diterbitkan"))
        .map(async article => {
            const validLikes = article.likes ? article.likes.filter(like => like.likes !== null).length : 0;

            // Count comments for the article
            const komentarCount = await komentarRepository.count({ where: { article_id: article.id } });

            // Count reply comments for the article
            const balasKomentarCount = await balasKomentarRepository.createQueryBuilder('balasKomentar')
                .innerJoin('balasKomentar.komentar', 'komentar')
                .where('komentar.article_id = :articleId', { articleId: article.id })
                .getCount();

            // Combine the counts into komentarTotal
            const komentarTotal = komentarCount + balasKomentarCount;

            return {
                id: article.id,
                title: article.title,
                slug: article.slug,
                deskripsi_kecil: article.deskripsi_kecil,
                estimasi_membaca: article.estimasi_membaca,
                gambar: article.gambar,
                dibuat_pada: article.dibuat_pada,
                penulis: article.penulis,
                tag: article.tag,
                user: article.user,
                status_publish: article.status_publish,
                likes: validLikes,
                komentarTotal
            };
        }));

    res.send(filteredArticles);
};

// * Get all articles pending only
export const ArticlesPending = async (req: Request, res: Response) => {
    const articleRepository = myDataSource.getRepository(Article);

    const articles = await articleRepository
        .createQueryBuilder("article")
        .leftJoinAndSelect("article.status_publish", "status_publish")
        .where("status_publish.status = :status", { status: "Pending" })
        .orderBy("article.dibuat_pada", "DESC")
        .getMany();

    res.send(articles);
};

// * Create Article
const generateUniqueSlug = async (title: string, articleRepository: any) => {
    let slug = slugify(title, {
        lower: true,
        strict: true,
        trim: true,
    });

    let uniqueSlug = slug;
    let count = 1;

    while (await articleRepository.findOne({ where: { slug: uniqueSlug } })) {
        uniqueSlug = `${slug}-${count}`;
        count++;
    }

    return uniqueSlug;
};

export const CreateArticle = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(CreateArticleDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const articleRepository = myDataSource.getRepository(Article);

    const articlePublishRepository = myDataSource.getRepository(ArticlePublish);

    const articleLikesRepository = myDataSource.getRepository(Likes);

    const uniqueSlug = await generateUniqueSlug(body.title, articleRepository);

    const article = await articleRepository.save({
        ...body,
        penulis: req['user'],
        slug: uniqueSlug,
    });

    await articlePublishRepository.save({
        user_id: req['user'],
        article_id: article.id,
        status: Status.diterbitkan
    });

    await articleLikesRepository.save({
        article_id: article.id
    });

    const responseArticle = {
        ...article,
        penulis: article.penulis.id,
    };

    res.status(201).send(responseArticle);
};

// * Update Article
export const UpdateArticle = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(UpdateArticleDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const articleRepository = myDataSource.getRepository(Article);

    await articleRepository.update(req.params.id, {
        ...body
    });

    res.status(202).send(await articleRepository.findOne({ where: { id: req.params.id } }));
};

// * Like Article
export const LikeArticle = async (req: Request, res: Response) => {

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const articleLikesRepository = myDataSource.getRepository(Likes);

    const article = await articleLikesRepository.findOneBy({ article_id: req.params.id, user_id: req['user'].id });

    if (article) {
        return res.status(409).send({ message: "Anda sudah like artikel ini" });
    }

    await articleLikesRepository.save({
        likes: +1,
        article_id: req.params.id,
        user_id: req['user'].id
    });

    res.status(202).send({ message: "Liked!" });
};

// * Dislike Article
export const DislikeArticle = async (req: Request, res: Response) => {

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const articleLikesRepository = myDataSource.getRepository(Likes);

    const article = await articleLikesRepository.findOneBy({ article_id: req.params.id, user_id: req['user'].id });

    await articleLikesRepository.delete(article.id);

    res.status(202).send({ message: "Dislike!" });
};

// * Check User Like Article
export const CheckUserLikeArticle = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const articleLikesRepository = myDataSource.getRepository(Likes);

    const article = await articleLikesRepository.findOneBy({ article_id: req.params.id, user_id: req['user'].id });

    if (!article) {
        return res.send({ message: "False" });
    }

    res.status(200).send({ message: "True" });
};

// * Get one Article
export const GetArticle = async (req: Request, res: Response) => {
    const articleRepository = myDataSource.getRepository(Article);
    const likesRepository = myDataSource.getRepository(Likes);

    const article = await articleRepository.findOne({
        where: { slug: req.params.slug },
        relations: ['user', 'tag', 'komentar', 'status_publish']
    });

    if (!article) {
        return res.status(404).send({ message: "Artikel tidak ditemukan" });
    }

    const likesCount = await likesRepository.count({
        where: {
            article_id: article.id,
            likes: 1
        }
    });

    const responseArticle = {
        ...article,
        user: article.user,
        tag: article.tag.nama,
        likes: likesCount
    };

    res.send(responseArticle);
};

// * Delete Article
export const DeleteArticle = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Tidak Diizinkan" });
    }
    const articleRepository = myDataSource.getRepository(Article);

    await articleRepository.delete(req.params.id);

    res.status(204).send(null);
};

// * Get User Own Article
export const GetUserOwnArticle = async (req: Request, res: Response) => {
    const articleRepository = myDataSource.getRepository(Article);
    const komentarRepository = myDataSource.getRepository(Komentar);
    const balasKomentarRepository = myDataSource.getRepository(BalasKomentar);

    const filter = req.query.filter as string;
    const search = req.query.search ? req.query.search.toString().toLowerCase() : null;

    let status: string | null = null;
    if (filter === "pending") {
        status = "Pending";
    } else if (filter === "publish") {
        status = "Diterbitkan";
    } else if (filter === "ditolak") {
        status = "Ditolak";
    }

    const queryBuilder = articleRepository
        .createQueryBuilder("article")
        .leftJoinAndSelect("article.likes", "likes")
        .leftJoinAndSelect("article.status_publish", "status_publish")
        .leftJoinAndSelect("article.user", "user")
        .leftJoinAndSelect("article.tag", "tag")
        .where("article.penulis = :penulisId", { penulisId: req['user'].id })
        .orderBy("article.dibuat_pada", "DESC");

    if (status) {
        queryBuilder.andWhere("status_publish.status = :status", { status });
    }

    if (search) {
        queryBuilder.andWhere(
            "(LOWER(article.title) LIKE :search OR LOWER(article.deskripsi_kecil) LIKE :search OR LOWER(article.deskripsi_panjang) LIKE :search)",
            { search: `%${search}%` }
        );
    }

    const articles = await queryBuilder.getMany();

    const result = await Promise.all(articles.map(async article => {
        const validLikes = article.likes ? article.likes.filter(like => like.likes !== null).length : 0;

        // Count comments for the article
        const komentarCount = await komentarRepository.count({ where: { article_id: article.id } });

        // Count reply comments for the article
        const balasKomentarCount = await balasKomentarRepository.createQueryBuilder('balasKomentar')
            .innerJoin('balasKomentar.komentar', 'komentar')
            .where('komentar.article_id = :articleId', { articleId: article.id })
            .getCount();

        // Combine the counts into komentarTotal
        const komentarTotal = komentarCount + balasKomentarCount;

        return {
            id: article.id,
            title: article.title,
            slug: article.slug,
            deskripsi_kecil: article.deskripsi_kecil,
            estimasi_membaca: article.estimasi_membaca,
            gambar: article.gambar,
            dibuat_pada: article.dibuat_pada,
            penulis: article.penulis,
            tag: article.tag,
            user: article.user,
            status_publish: article.status_publish,
            likes: validLikes,
            komentarTotal
        };
    }));

    res.send(result);
};

export const GetArticleCounts = async (req: Request, res: Response) => {
    const articlePublishRepository = myDataSource.getRepository(ArticlePublish);

    const countsQuery = articlePublishRepository
        .createQueryBuilder("articlePublish")
        .select("articlePublish.status", "status")
        .addSelect("COUNT(articlePublish.article_id)", "count")
        .innerJoin("articlePublish.article", "article")
        .where("article.penulis = :penulis", { penulis: req['user'].id })
        .groupBy("articlePublish.status");

    const counts = await countsQuery.getRawMany();

    const countMap = {
        all: 0,
        publish: 0,
        pending: 0,
        ditolak: 0
    };

    counts.forEach(count => {
        if (count.status === "Diterbitkan") {
            countMap.publish = parseInt(count.count, 10);
        } else if (count.status === "Pending") {
            countMap.pending = parseInt(count.count, 10);
        } else if (count.status === "Ditolak") {
            countMap.ditolak = parseInt(count.count, 10);
        }
        countMap.all += parseInt(count.count, 10);
    });

    res.send(countMap);
};

// * Create Article For User
export const CreateArticleUser = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(CreateArticleDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const articleRepository = myDataSource.getRepository(Article);

    const articlePublishRepository = myDataSource.getRepository(ArticlePublish);

    const articleLikesRepository = myDataSource.getRepository(Likes);

    const uniqueSlug = await generateUniqueSlug(body.title, articleRepository);

    const article = await articleRepository.save({
        ...body,
        penulis: req['user'],
        slug: uniqueSlug,
    });

    await articlePublishRepository.save({
        user_id: req['user'],
        article_id: article.id
    });

    await articleLikesRepository.save({
        article_id: article.id
    });

    const responseArticle = {
        ...article,
        penulis: article.penulis.id,
    };

    res.status(201).send(responseArticle);
};

// * Update Article For User
export const UpdateArticleUser = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(UpdateArticleDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const articleRepository = myDataSource.getRepository(Article);

    const userArticle = await articleRepository.findOne({ where: { id: req.params.id, penulis: req['user'].id } });

    if (!userArticle) {
        return res.status(403).send({ message: "Akses Tidak Diizinkan" });
    }

    await articleRepository.update(req.params.id, {
        ...body
    });

    res.status(202).send();
};

// * Delete Article
export const DeleteArticleUser = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const articleRepository = myDataSource.getRepository(Article);

    const userArticle = await articleRepository.findOne({ where: { id: req.params.id, penulis: req['user'].id } });

    if (!userArticle) {
        return res.status(403).send({ message: "Akses Tidak Diizinkan" });
    }

    await articleRepository.delete(req.params.id);

    res.status(202).send();
};

// * Admin validate the article publish status
export const ChangeArticleStatus = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(UpdateArticleStatusDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const articlePublishRepository = myDataSource.getRepository(ArticlePublish);

    const userArticle = await articlePublishRepository.findOne({ where: { article_id: req.params.id, user_id: body.user_id } });

    if (!userArticle) {
        return res.status(404).send({ message: "Artikel Tidak Ditemukan" });
    }

    userArticle.status = body.status;

    await articlePublishRepository.save(userArticle);

    res.status(202).send(userArticle);
};
