import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateTagDto {
    @IsString({ message: "Request Tidak Valid" })
    @IsNotEmpty({message: "Nama tag harus diisi"})
    nama: string;
}