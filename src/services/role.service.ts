import { AbstractService } from "./abstract.service";
import { Role } from "../entity/role.entity";
import myDataSource from "../config/db.config";

export class RoleService extends AbstractService<Role> {
    constructor() {
        super(myDataSource.getRepository(Role));
    }
}