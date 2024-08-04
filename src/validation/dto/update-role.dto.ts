// ? https://www.phind.com/search?cache=aww4upilaldpb6wgjnpww7lu
import { ArrayMinSize, ArrayNotEmpty, IsInt, IsNotEmpty, IsString } from "class-validator";

export class UpdateRoleDTO{
    @IsNotEmpty({message: "Nama harus diisi"})
    @IsString({message: "Nama harus string"})
    nama?: string;

    @ArrayNotEmpty({ message: 'Permission harus diisi' })
    @ArrayMinSize(1, { message: 'Permission harus minimal punya 1 item' })
    @IsInt({each: true, message: 'Permission harus huruf'})
    permissions?: string[]
}