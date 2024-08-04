import myDataSource from "../config/db.config";
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import * as argon2 from 'argon2';
import { User } from '../entity/user.entity';
import { sign } from 'jsonwebtoken';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto } from '../validation/dto/register.dto';
import { formatValidationErrors } from '../utility/validation.utility';
import { UpdateInfoDTO } from '../validation/dto/update-info.dto';
import { Pengikut } from "../entity/pengikut.entity";

export const Register = async (req: Request, res: Response) => {
    const body = req.body;
    const input = plainToClass(RegisterDto, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const userService = new AuthService();
    const repositoryPengikut = myDataSource.getRepository(Pengikut);

    const emailExists = await userService.findByEmail(body.email.toLowerCase());
    const usernameExists = await userService.findByUsername(body.username.toLowerCase());
    if (emailExists || usernameExists) {
        return res.status(409).send({
            message: 'Email atau Username sudah terdaftar'
        });
    }
    const hashPassword = await argon2.hash(body.password);
    const user = await userService.create({
        namaLengkap: body.namaLengkap,
        username: body.username.toLowerCase(),
        email: body.email.toLowerCase(),
        password: hashPassword,
        role_id: 3
    });

    delete user.password;

    res.send(user);
};

export const Login = async (req: Request, res: Response) => {
    const body = req.body;

    const repository = myDataSource.getRepository(User);
    let user: User;

    // Check whether to find the user by email or username based on input.
    if (body.email) {
        user = await repository.findOne({
            where: { email: body.email },
            select: ["id", "password"],
        });
    } else if (body.username) {
        user = await repository.findOne({
            where: { username: body.username },
            select: ["id", "password"],
        });
    }

    if (!user) {
        return res.status(400).send({
            message: "Username atau Email tidak valid"
        });
    }

    if (!body.password) {
        return res.status(400).send({
            message: "Password tidak valid"
        });
    }
 
    if (!(await argon2.verify(user.password, body.password))) {
        return res.status(400).send({ message: "Password tidak valid" });
    }

    const rememberMe = body.rememberMe; // Assuming rememberMe is sent as a boolean in the body
    const maxAge = rememberMe ? 365 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 1 year or 1 day

    const token = sign(
        { id: user.id },
        process.env.JWT_SECRET_ACCESS,
        { expiresIn: '1d' }
    );

    res.cookie('user_session', token, {
        httpOnly: true,
        maxAge: maxAge, // Set the maxAge based on rememberMe
        sameSite: 'strict',
        // secure: process.env.NODE_ENV === 'production' // Set secure if in production
        // domain: 'yourdomain.com', // If cookie was set with specific domain
    });

    return res.send({
        message: "Berhasil Masuk!"
    });
};

export const AuthenticatedUser = async (req: Request, res: Response) => {
    if (!req["user"]) {
        // Handle the case where user is not set
        return res.status(401).send({ message: "Unauthenticated" });
    }
    const { password, ...user } = req["user"];

    res.send(user);
};

export const Logout = async (req: Request, res: Response) => {
    res.cookie('user_session', '', {
        sameSite: 'strict',
        maxAge: 0,
        // secure: process.env.NODE_ENV === 'production' // Set secure if in production
        // domain: 'yourdomain.com', // If cookie was set with specific domain
    });
    res.send({
        message: "Success"
    });
};

export const UpdateInfo = async (req: Request, res: Response) => {
    const user = req["user"];

    const body = req.body;
    const input = plainToClass(UpdateInfoDTO, body);
    const validationErrors = await validate(input);

    if (validationErrors.length > 0) {
        return res.status(400).json(formatValidationErrors(validationErrors));
    }

    const userService = myDataSource.getRepository(User);

    const existingUser = await userService.findOne({ where: { id: user.id } });

    if (req.body.namaLengkap) {
        existingUser.namaLengkap = req.body.namaLengkap;
    }

    if (req.body.foto) {
        existingUser.foto = req.body.foto;
    }

    if (req.body.bio) {
        existingUser.bio = req.body.bio;
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

    await userService.update(user.id, existingUser);

    const { password, ...data } = await userService.findOne({ where: { id: user.id } });
    res.send(data);
};

export const UpdatePassword = async (req: Request, res: Response) => {
    const user = req["user"];

    if (req.body.password !== req.body.password_confirm) {
        return res.status(400).send({
            message: "Password tidak sama"
        });
    } else if (!req.body.password || !req.body.password_confirm) {
        return res.status(400).send({
            message: "Password tidak sama"
        });
    }

    const repository = myDataSource.getRepository(User);

    await repository.update(user.id, {
        password: await argon2.hash(req.body.password)
    });

    const { password, ...data } = await repository.findOne({ where: { id: user.id } });

    res.send(data);
};
