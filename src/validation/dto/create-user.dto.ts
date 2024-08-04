import { IsString, Length, IsEmail, IsNotEmpty, IsInt } from 'class-validator';

export class CreateUserDTO {
  @IsString({ message: 'Nama lengkap harus string' })
  @IsNotEmpty({message: "Nama lengkap tidak boleh kosong"})
  namaLengkap: string;

  @IsString()
  @IsNotEmpty({message: "Username tidak boleh kosong"})
  @Length(3, 30, { message: 'Username harus ada di antara 3 and 30 huruf' })
  username: string;

  @IsEmail({}, { message: 'Email tidak valid' })
  @IsNotEmpty({message: "Email tidak boleh kosong"})
  email: string;

  @IsNotEmpty({message: "Role tidak boleh kosong"})
  role_id: number;
}
