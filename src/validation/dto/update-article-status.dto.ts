import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { Status } from "../../entity/article-publish.entity";

export class UpdateArticleStatusDTO {
    @IsEnum(Status, { message: 'Status artikel tidak valid' })
    @IsNotEmpty({ message: "Status tidak boleh kosong" })
    status: Status;

    @IsUUID('4', { message: 'Request tidak valid' })
    @IsNotEmpty({ message: "User tidak boleh kosong" })
    user_id: string;
}