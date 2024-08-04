import { IsOptional, IsString } from "class-validator";

export class UpdateTagDto {
    @IsString({ message: "Request Tidak Valid" })
    @IsOptional()
    nama?: string;
}