import { IsString, Length, IsEmail, IsNotEmpty } from 'class-validator';
import { IsEqualTo } from '../decorator/check-password.decorator';

export class RegisterDto {
  @IsString({ message: 'Nama lengkap harus string' })
  @IsNotEmpty({ message: "Nama lengkap tidak boleh kosong" })
  namaLengkap: string;

  @IsString()
  @IsNotEmpty({ message: "Username tidak boleh kosong" })
  @Length(3, 30, { message: 'Username harus ada di antara 3 and 30 huruf' })
  username: string;

  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({ message: "Email tidak boleh kosong" })
  email: string;

  @IsString()
  @Length(6, undefined, { message: '    ' })
  password: string;

  @IsString()
  @IsEqualTo('password', { message: 'Konfirmasi Password harus sama dengan Password' })
  password_confirm: string;
}
