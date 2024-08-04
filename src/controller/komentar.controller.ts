import myDataSource from "../config/db.config";
import { isUUID, validate } from "class-validator";
import { Request, Response } from "express";
import { Komentar } from "../entity/komentar.entity";
import { CreateCommentDto } from "../validation/dto/create-comment.dto";
import { plainToClass } from "class-transformer";
import { formatValidationErrors } from "../utility/validation.utility";
import { KomentarLikes } from "../entity/komentar-like.entity";
import { BalasKomentarLikes } from "../entity/balas-komentar-like.entity";
import { ReplyCommentDto } from "../validation/dto/reply-comment.dto";
import { BalasKomentar } from "../entity/balas-komentar.entity";

// * Get comment from an article
export const GetComment = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const komentarRepository = myDataSource.getRepository(Komentar);

    const komentar = await komentarRepository.find({
        where: { article_id: req.params.id },
        relations: ['user', 'balasKomentar', 'komentarLike', 'balasKomentar.komentarBalasLike', 'balasKomentar.user']
    });

    if (!komentar) {
        return res.status(404).send({ message: "Komentar tidak ditemukan" });
    }

    const komentarWithLikes = komentar.map(k => {
        const komentarLikeCount = k.komentarLike.reduce((acc, like) => acc + like.likes, 0);

        const balasKomentarWithLikeCount = k.balasKomentar.map(balas => {
            const komentarBalasLikeCount = balas.komentarBalasLike.reduce((acc, like) => acc + like.likes, 0);
            return {
                ...balas,
                komentarBalasLikeCount
            };
        });

        return {
            ...k,
            komentarLikeCount,
            balasKomentar: balasKomentarWithLikeCount
        };
    });

    res.send(komentarWithLikes);
};

// * Create comment from an article 
export const CreateComment = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(CreateCommentDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const komentarRepository = myDataSource.getRepository(Komentar);

    const komentar = await komentarRepository.save({
        ...body,
        user_id: req['user'].id,
        article_id: req.params.id
    });

    res.status(201).send(komentar);
};

// * Reply a comment from an article
export const ReplyComment = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(ReplyCommentDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const komentarReplyRepository = myDataSource.getRepository(BalasKomentar);

    const komentarRepository = myDataSource.getRepository(Komentar);

    const checkKomentar = await komentarRepository.findOneBy({ id: body.komentar_id });

    if (!checkKomentar) {
        return res.status(404).send({ message: "Terjadi kesalahan..." });
    }

    const komentar = await komentarReplyRepository.save({
        ...body,
        user_id: req['user'].id
    });

    res.status(201).send(komentar);
};

// * Like Comment (Parent)
export const LikeComment = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const komentarLikesRepository = myDataSource.getRepository(KomentarLikes);

    const article = await komentarLikesRepository.findOneBy({ komentar_id: req.params.id, user_id: req['user'].id });

    if (article) {
        return res.status(409).send({ message: "Anda sudah like komentar ini" });
    }

    await komentarLikesRepository.save({
        likes: +1,
        komentar_id: req.params.id,
        user_id: req['user'].id
    });

    res.status(202).send({ message: "Liked!" });
};

// * Dislike Comment (Parent)
export const DislikeComment = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const komentarLikesRepository = myDataSource.getRepository(KomentarLikes);

    await komentarLikesRepository.findOneBy({ komentar_id: req.params.id, user_id: req['user'].id });

    await komentarLikesRepository.delete({ komentar_id: req.params.id });

    res.status(202).send({ message: "Dislike!" });
};

// * Check comment like (Parent)
export const CheckCommentLike = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const komentarLikesRepository = myDataSource.getRepository(KomentarLikes);

    const komentar = await komentarLikesRepository.findOneBy({ komentar_id: req.params.id, user_id: req['user'].id });

    if (!komentar) {
        return res.send({ message: "False" });
    }

    res.status(200).send({ message: "True" });
};

// * Like Reply Comment (Child)
export const LikeReplyComment = async (req: Request, res: Response) => {
    if (!isUUID(req.body.komentar_id) || !req.body.komentar_id) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const komentarReplyRepository = myDataSource.getRepository(BalasKomentarLikes);

    const article = await komentarReplyRepository.findOneBy({ komentar_id: req.body.komentar_id, user_id: req['user'].id });

    if (article) {
        return res.status(409).send({ message: "Anda sudah like komentar ini" });
    }

    await komentarReplyRepository.save({
        likes: +1,
        komentar_id: req.body.komentar_id,
        user_id: req['user'].id
    });

    res.status(202).send({ message: "Liked!" });
};

// * Dislike Reply Comment (Child)
export const DislikeReplyComment = async (req: Request, res: Response) => {
    if (!isUUID(req.body.komentar_id) || !req.body.komentar_id) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const komentarReplyRepository = myDataSource.getRepository(BalasKomentarLikes);

    const komentar = await komentarReplyRepository.findOneBy({ komentar_id: req.body.komentar_id, user_id: req['user'].id });

    await komentarReplyRepository.delete(komentar.id);

    res.status(202).send({ message: "Disliked!" });
};

// * Check comment like (Parent)
export const CheckCommentLikeReply = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }

    const komentarReplyRepository = myDataSource.getRepository(BalasKomentarLikes);

    const komentar = await komentarReplyRepository.findOneBy({ komentar_id: req.body.komentar_id, user_id: req['user'].id });

    if (!komentar) {
        return res.send({ message: "False" });
    }

    res.status(200).send({ message: "True" });
};

// * Admin Delete Comment
export const AdminDeleteComment = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id) || !isUUID(req.params.user_id)) {
        return res.status(400).send({ message: "Tidak Diizinkan" });
    }
    const komentarRepository = myDataSource.getRepository(Komentar);

    const checkKomentar = await komentarRepository.findOneBy({ id: req.params.id, user_id: req.params.user_id });

    await komentarRepository.delete(checkKomentar.id);

    res.status(204).send(null);
};

// * Admin Delete Comment Reply
export const AdminDeleteCommentReply = async (req: Request, res: Response) => {
    if (!isUUID(req.body.komentar_id) || !req.body.komentar_id) {
        return res.status(400).send({ message: "Request tidak valid" });
    }
    const komentarReplyRepository = myDataSource.getRepository(BalasKomentar);

    const checkUser = await komentarReplyRepository.findOneBy({ id: req.body.komentar_id, user_id: req.body.user_id });

    if (!checkUser) {
        return res.status(403).send({ message: "Tidak Diizinkan" });
    }

    await komentarReplyRepository.delete(req.body.komentar_id);

    res.status(204).send(null);
};

// * Delete Comment
export const DeleteComment = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Tidak Diizinkan" });
    }
    const komentarRepository = myDataSource.getRepository(Komentar);

    const checkKomentar = await komentarRepository.findOneBy({ article_id: req.params.id, user_id: req['user'].id });

    if (!checkKomentar) {
        return res.status(403).send({ message: "Tidak Diizinkan" });
    }

    await komentarRepository.delete(checkKomentar.id);

    res.status(204).send(null);
};

// * Delete Comment Reply
export const DeleteCommentReply = async (req: Request, res: Response) => {
    if (!isUUID(req.body.komentar_id) || !req.body.komentar_id) {
        return res.status(400).send({ message: "Request tidak valid" });
    }
    const komentarReplyRepository = myDataSource.getRepository(BalasKomentar);

    const checkUser = await komentarReplyRepository.findOneBy({ id: req.body.komentar_id, user_id: req['user'].id });

    if (!checkUser) {
        return res.status(403).send({ message: "Tidak Diizinkan" });
    }

    await komentarReplyRepository.delete(req.body.komentar_id);

    res.status(204).send(null);
};