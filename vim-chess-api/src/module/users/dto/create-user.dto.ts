import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { ERROR } from 'src/common/constants/error.constants';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    @Matches(/^[A-Za-z\s-]+$/, {
        message: 'username incorrect',
    })
    username: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    @Matches(/^[A-Za-z\s-]+$/, {
        message: 'firstname incorrect',
    })
    firstame: string;


    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(20)
    @Matches(/^[A-Za-z\s-]+$/, {
        message: 'lastname incorrect',
    })
    lastname: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, ERROR.PasswordStrengthError)
    @MaxLength(255, ERROR.PasswordStrengthError)
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?/§:&-])[A-Za-z\d@$!%*?/§:&-]{8,}$/,
        ERROR.PasswordStrengthError,
    )
    password: string;

    @IsString()
    @IsNotEmpty()
    country: string;
}
