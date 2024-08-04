import { IsString, Length, IsEmail, IsOptional, IsInt } from 'class-validator';

export class UpdateUserDTO {
  @IsString({ message: 'Nama Lengkap Harus String' })
  @IsOptional()
  namaLengkap?: string;

  @IsString()
  @IsOptional()
  foto?: string;

  @IsString()
  @IsOptional()
  @Length(3, 30, { message: 'Username harus ada di antara 3 and 30 huruf' })
  username?: string;

  @IsEmail({}, { message: 'Email tidak valid' })
  @IsOptional()
  email?: string;

  @IsOptional()
  role_id: number;
}
