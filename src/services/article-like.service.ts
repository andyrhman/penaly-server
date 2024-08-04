import { AbstractService } from "./abstract.service";
import myDataSource from "../config/db.config";
import { Likes } from "../entity/article-like.entity";

export class ArticleLikeService extends AbstractService<Likes> {
    constructor() {
        super(myDataSource.getRepository(Likes));
    }

    async totalLikes(): Promise<number> {
        const likesRepository = myDataSource.getRepository(Likes);
        const likesCount = await likesRepository.count({
            where: {
                likes: 1
            }
        });
        return likesCount;
    }
}