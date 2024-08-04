import { Request, Response } from "express";
import myDataSource from "../config/db.config";
import { User } from "../entity/user.entity";
import { plainToClass } from "class-transformer";
import { CreateUserDTO } from "../validation/dto/create-user.dto";
import { isUUID, validate } from "class-validator";
import { formatValidationErrors } from "../utility/validation.utility";
import * as argon2 from "argon2";
import { Role } from "../entity/role.entity";
import { UpdateUserDTO } from "../validation/dto/update-user.dto";

export const Users = async (req: Request, res: Response) => {
    const userRepository = myDataSource.getRepository(User);
    let users = await userRepository.find({ order: { dibuat_pada: "DESC" }, relations: ['role'] });
    if (req.query.search) {
        const search = req.query.search.toString().toLowerCase();
        users = users.filter(
            p => p.namaLengkap.toLowerCase().indexOf(search) >= 0 ||
                p.username.toLowerCase().indexOf(search) >= 0
        );
    }
    res.send(users);
};

export const CreateUser = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(CreateUserDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const userService = myDataSource.getRepository(User);
    const emailExists = await userService.findOne({ where: { email: body.email.toLowerCase() } });
    const usernameExists = await userService.findOne({ where: { username: body.username.toLowerCase() } });
    if (emailExists || usernameExists) {
        return res.status(409).send({
            message: 'Email atau Username sudah terdaftar'
        });
    }

    const roleService = myDataSource.getRepository(Role);
    const checkRole = await roleService.findOne({ where: { id: body.role_id } });
    if (!checkRole) {
        return res.status(409).send({
            message: 'Role tidak ditemukan'
        });
    }

    const hashedPassword = await argon2.hash('123456');

    const user = await userService.save({
        namaLengkap: body.namaLengkap,
        username: body.username.toLowerCase(),
        email: body.email.toLowerCase(),
        password: hashedPassword,
        role: {
            id: body.role_id
        }
    });
    delete user.password;
    res.status(201).send(user);
};

export const UpdateUser = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(UpdateUserDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Request tidak valid" });
    }
    const userService = myDataSource.getRepository(User);
    const roleService = myDataSource.getRepository(Role);

    const existingUser = await userService.findOne({ where: { id: req.params.id } });

    if (req.body.namaLengkap) {
        existingUser.namaLengkap = req.body.namaLengkap;
    }

    if (req.body.foto) {
        existingUser.foto = req.body.foto;
    }

    if (req.body.email && req.body.email !== existingUser.email) {
        const existingUserByEmail = await userService.findOne({ where: { email: req.body.email } });
        if (existingUserByEmail) {
            return res.status(409).send({ message: "Email sudah terdaftar" });
        }
        existingUser.email = req.body.email;
    }

    if (req.body.username && req.body.username !== existingUser.username) {
        const existingUserByUsername = await userService.findOne({ where: { username: req.body.username } });
        if (existingUserByUsername) {
            return res.status(409).send({ message: "Username sudah terdaftar" });
        }
        existingUser.username = req.body.username;
    }

    if (req.body.role_id) {
        const role = await roleService.findOne({ where: { id: req.body.role_id } });
        if (!role) {
            return res.status(404).send({ message: 'Role tidak ditemukan' });
        }
        existingUser.role_id = req.body.role_id;
    }

    await userService.update(req.params.id, existingUser);

    const data = await userService.findOne({ where: { id: req.params.id }, relations: ['role'] });

    res.status(202).send(data);
};

export const GetUser = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Tidak Diizinkan" });
    }
    const userService = myDataSource.getRepository(User);

    const user = await userService.findOne({ where: { id: req.params.id }, relations: ['role'] });

    res.send(user);
};

export const DeleteUser = async (req: Request, res: Response) => {
    if (!isUUID(req.params.id)) {
        return res.status(400).send({ message: "Tidak Diizinkan" });
    }
    const userService = myDataSource.getRepository(User);

    await userService.delete(req.params.id);

    res.status(204).send(null);
};
