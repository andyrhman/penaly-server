import { AbstractService } from "./abstract.service";
import myDataSource from "../config/db.config";
import { Komentar } from "../entity/komentar.entity";
import { BalasKomentar } from "../entity/balas-komentar.entity";

export class CommentService extends AbstractService<Komentar> {
    constructor() {
        super(myDataSource.getRepository(Komentar));
    }

    async totalComments(): Promise<number> {
        const komentarRepository = myDataSource.getRepository(Komentar);
        const balasKomentarRepository = myDataSource.getRepository(BalasKomentar);

        const [komentarCount, balasKomentarCount] = await Promise.all([
            komentarRepository.count(),
            balasKomentarRepository.count()
        ]);

        return komentarCount + balasKomentarCount;
    }
}