import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { Tag } from "../entity/tag.entity";
import { plainToClass } from "class-transformer";
import { CreateTagDto } from "../validation/dto/create-tag.dto";
import { isUUID, validate } from "class-validator";
import { formatValidationErrors } from "../utility/validation.utility";
import { UpdateTagDto } from "../validation/dto/update-tag.dto copy";

// * Get all tags
export const Tags = async (req: Request, res: Response) => {
    const tagRepository = myDataSource.getRepository(Tag);
    let tags = await tagRepository.find();
    if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        tags = tags.filter(
            p => p.nama.toLowerCase().indexOf(search) >= 0
        );
    }
    res.send(tags);
};

// * Create Tag
export const CreateTag = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(CreateTagDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const repository = myDataSource.getRepository(Tag);

    const checkTag = await repository.findOne({ where: { nama: body.nama } });
    if (checkTag) {
        return res.status(409).send({
            message: 'Tag dengan nama ini sudah ada'
        });
    }

    const tag = await repository.save(body);
    res.status(201).send(tag);
};

// * Update Tag
export const UpdateTag = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(UpdateTagDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }
    const repository = myDataSource.getRepository(Tag);

    const checkTag = await repository.findOne({ where: { id: req.params.id } });

    if (req.body.nama && req.body.nama !== checkTag.nama) {
        const checkNamaTag = await repository.findOne({ where: { nama: req.body.nama } });
        if (checkNamaTag) {
            return res.status(409).send({ message: "Tag dengan nama ini sudah ada" });
        }
        checkTag.nama = req.body.nama;
    }

    await repository.update(req.params.id, checkTag);

    const data = await repository.findOne({ where: { id: req.params.id } });

    res.status(202).send(data);
};

// * Get Tag
export const GetTag = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Tidak Diizinkan" });
    }
    const tagService = myDataSource.getRepository(Tag);

    const tag = await tagService.findOne({ where: { id: req.params.id } });

    res.send(tag);
};

// * Get tag with article
export const GetTagArticle = async (req: Request, res: Response) => {
    const tagService = myDataSource.getRepository(Tag);

    const tag = await tagService.findOne({ where: { nama: req.params.nama }, relations: ['article'] });

    if (!tag) {
        return res.status(404).send({ message: "Tag tidak ditemukan" });
    }

    res.send(tag);
};

// * Hapus Tag
export const DeleteTag = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Tidak Diizinkan" });
    }
    const tagService = myDataSource.getRepository(Tag);

    await tagService.delete(req.params.id);

    res.status(204).send(null);
}; 