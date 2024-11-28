import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class EntityProfileDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}

export class EntityProfileSignUpDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @Type(() => EntityProfileDto)
  @ValidateNested()
  entityProfile: EntityProfileDto;
}

export class SignInDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // TODO: Implement password policy
  @IsNotEmpty()
  @IsString()
  password: string;
}
