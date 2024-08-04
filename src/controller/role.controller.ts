import { plainToClass } from 'class-transformer';
import { Role } from '../entity/role.entity';
import myDataSource from "../config/db.config";
import { Request, Response } from "express";
import { UpdateRoleDTO } from '../validation/dto/update-role.dto';
import { validate } from 'class-validator';
import { formatValidationErrors } from '../utility/validation.utility';
import { isInteger } from '../utility/parameters.utility';

export const Roles = async (req: Request, res: Response) => {
    const repository = myDataSource.getRepository(Role);
    let roles = await repository.find();
    if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        roles = roles.filter(
            p => p.nama.toLowerCase().indexOf(search) >= 0
        );
    }
    res.send(roles);
};

export const CreateRole = async (req: Request, res: Response) => {
    const { nama, permissions } = req.body;
    const input = plainToClass(UpdateRoleDTO, req.body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const repository = myDataSource.getRepository(Role);

    const role = await repository.save({
        nama,
        permissions: permissions.map((id: any) => {
            return {
                id: id
            };
        })
    });

    res.status(201).send(role);
};

export const GetRole = async (req: Request, res: Response) => {
    const repository = myDataSource.getRepository(Role);
    const id = parseInt(req.params.id, 10);

    res.send(await repository.findOne({ where: { id }, relations: ['permissions'] }));
};

export const UpdateRole = async (req: Request, res: Response) => {
    const repository = myDataSource.getRepository(Role);

    const { name, permissions } = req.body;
    const input = plainToClass(UpdateRoleDTO, req.body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const role = await repository.save({
        id: parseInt(req.params.id),
        name,
        permissions: permissions.map((id: any) => {
            return {
                id: id
            };
        })
    });

    res.status(202).send(role);
};

export const DeleteRole = async (req: Request, res: Response) => {
    if (!isInteger(req.params.id)) {
        return res.status(400).send({ message: "Invalid Request" });
    }

    const repository = myDataSource.getRepository(Role);

    await repository.delete(req.params.id);

    res.status(204).send(null);
};