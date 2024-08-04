import {Request, Response} from "express";
import {User} from "../entity/user.entity";

export const PermissionMiddleware = (access: string) => {
    return (req: Request, res: Response, next: Function) => {
        const user: User = req['user'];

        const permissions = user.role.permissions;

        if (req.method === 'GET') {
            if (!permissions.some(p => (p.nama === `view_${access}`) || (p.nama === `edit_${access}`))) {
                return res.status(403).send({
                    message: 'Akses Tidak Diizinkan'
                })
            }
        } else {
            if (!permissions.some(p => p.nama === `edit_${access}`)) {
                return res.status(403).send({
                    message: 'Akses Tidak Diizinkan'
                })
            }
        }

        next();
    }
}