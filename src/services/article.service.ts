import { AbstractService } from "./abstract.service";
import { Article } from "../entity/article.entity";
import myDataSource from "../config/db.config";

export class ArticleService extends AbstractService<Article> {
    constructor() {
        super(myDataSource.getRepository(Article));
    }

    async chartPublishedArticles(time: string): Promise<any[]> {
        let groupByClause: string;

        switch (time) {
            case 'day':
                groupByClause = "TO_CHAR(a.dibuat_pada, 'YYYY-MM-DD')";
                break;
            case 'week':
                groupByClause = "TO_CHAR(a.dibuat_pada, 'IYYY-IW')"; // ISO Year-Week
                break;
            case 'month':
                groupByClause = "TO_CHAR(a.dibuat_pada, 'YYYY-MM')";
                break;
            default:
                groupByClause = "TO_CHAR(a.dibuat_pada, 'YYYY-MM-DD')";
                break;
        }

        const query = `
        SELECT
        ${groupByClause} as date,
        COUNT(a.id) as count
        FROM artikel a
        INNER JOIN publish_article_status aps ON a.id = aps.article_id
        WHERE aps.status = 'Diterbitkan'
        GROUP BY ${groupByClause}
        ORDER BY ${groupByClause} ASC;
        `;

        const result = await this.repository.query(query);
        return result;
    }
}