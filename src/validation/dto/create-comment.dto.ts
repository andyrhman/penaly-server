import { IsNotEmpty, IsString } from "class-validator";

export class CreateCommentDto {
    @IsString({ message: "Request Tidak Valid" })
    @IsNotEmpty({message: "Komentar harus diisi"})
    komentar: string;
}