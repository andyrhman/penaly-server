import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class ReplyCommentDto {
    @IsString({ message: "Request Tidak Valid" })
    @IsNotEmpty({message: "Komentar harus diisi"})
    reply: string;

    @IsUUID('4', { message: 'Request tidak valid' })
    @IsNotEmpty({ message: "Komentar tidak boleh kosong" })
    komentar_id: string;
}