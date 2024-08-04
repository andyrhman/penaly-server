import myDataSource from "../config/db.config";
import { User } from "../entity/user.entity";
import { AbstractService } from "./abstract.service";

export class UserService extends AbstractService<User> {
    constructor() {
        super(myDataSource.getRepository(User));
    }

    async chart(time: string): Promise<any[]> {
        let groupByClause: string;

        switch (time) {
            case 'day':
                groupByClause = "TO_CHAR(u.dibuat_pada, 'YYYY-MM-DD')";
                break;
            case 'week':
                groupByClause = "TO_CHAR(u.dibuat_pada, 'IYYY-IW')";
                break;
            case 'month':
                groupByClause = "TO_CHAR(u.dibuat_pada, 'YYYY-MM')";
                break;
            default:
                groupByClause = "TO_CHAR(u.dibuat_pada, 'YYYY-MM-DD')";
                break;
        }

        const query = `
        SELECT
        ${groupByClause} as date,
        COUNT(u.id) as count
        FROM pengguna u
        GROUP BY ${groupByClause}
        ORDER BY ${groupByClause} ASC;
        `;

        const result = await this.repository.query(query);
        return result;
    }
}