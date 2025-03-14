import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateGameDto {
    @IsString()
    @IsNotEmpty()
    uid_white: string;

    @IsString()
    @IsNotEmpty()
    uid_black: string;

    @IsNumber()
    @IsOptional()
    max_time: number = 10;
}
