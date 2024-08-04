import { Request, Response } from "express";
import { extname } from "path";
import multer from "multer";

export const UploadArticleImage = async (req: Request, res: Response) => {

    const storage = multer.diskStorage({
        destination: './uploads/articles',
        filename(_, file, callback) {
            const randomName = Math.random().toString(20).slice(2, 12);
            return callback(null, `${randomName}${extname(file.originalname)}`);
        }
    });

    const upload = multer({ storage }).single('image');

    upload(req, res, (err: any) => {
        if (err) {
            return res.status(400).send(err);
        }

        res.send({
            url: `http://localhost:8000/api/uploads/articles/${req.file.filename}`
        });
    });
};

export const UploadUserImage = async (req: Request, res: Response) => {

    const storage = multer.diskStorage({
        destination: './uploads/users',
        filename(_, file, callback) {
            const randomName = Math.random().toString(20).slice(2, 12);
            return callback(null, `${randomName}${extname(file.originalname)}`);
        }
    });

    const upload = multer({ storage }).single('image');

    upload(req, res, (err: any) => {
        if (err) {
            return res.status(400).send(err);
        }

        res.send({
            url: `http://localhost:8000/api/uploads/users/${req.file.filename}`
        });
    });
};

export const DefaultProfile = async (req: Request, res: Response) => {

    const storage = multer.diskStorage({
        destination: './uploads',
        filename(_, file, callback) {
            const randomName = Math.random().toString(20).slice(2, 12);
            return callback(null, `${randomName}${extname(file.originalname)}`);
        }
    });

    const upload = multer({ storage }).single('image');

    upload(req, res, (err: any) => {
        if (err) {
            return res.status(400).send(err);
        }

        res.send({
            url: `http://localhost:8000/api/uploads/${req.file.filename}`
        });
    });
};