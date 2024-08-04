import { IsString, Length, IsEmail, IsOptional } from 'class-validator';

export class UpdateInfoDTO {
  @IsString({ message: 'Nama Lengkap harus string' })
  @IsOptional()
  namaLengkap?: string;

  @IsString()
  @IsOptional()
  @Length(3, 30, { message: 'Username harus ada di antara 3 and 30 huruf' })
  username?: string;

  @IsEmail({}, { message: 'Email tidak valid' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  foto?: string;

  @IsString()
  @IsOptional()
  bio?: string;
}
