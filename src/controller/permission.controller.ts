import { Permission } from '../entity/permission.entity';
import { Request, Response } from "express";
import myDataSource from "../config/db.config";

export const Permissions = async (req: Request, res: Response) => {
    const repository = myDataSource.getRepository(Permission);
    res.send(await repository.find());
}