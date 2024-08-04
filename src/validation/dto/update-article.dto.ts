import { IsOptional, IsString, IsUUID } from "class-validator";

export class UpdateArticleDto {
    @IsString({ message: 'Nama Artikel harus string' })
    @IsOptional()
    title?: string;

    @IsString({ message: 'Deskripsi harus string' })
    @IsOptional()
    deskripsi_kecil?: string;

    @IsString({ message: 'Konten harus string' })
    @IsOptional()
    deskripsi_panjang?: string;

    @IsString({ message: 'Estimasi baca harus string' })
    @IsOptional()
    estimasi_membaca?: string;

    @IsString({ message: 'Gambar harus string' })
    @IsOptional()
    gambar?: string;

    @IsUUID('4', { message: 'Request tidak valid' })
    @IsOptional()
    tag_id?: string;
}