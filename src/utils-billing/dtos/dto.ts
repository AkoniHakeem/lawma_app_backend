import { ProfileTypes } from '@/src/lib/enums';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  // @Max(50)
  firstName: string;

  @IsNotEmpty()
  @IsString()
  // @Max(50)
  lastName: string;

  @IsOptional()
  @IsString()
  // @Max(50)
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  phoneCodeId: string;

  @IsOptional()
  @IsEnum(ProfileTypes)
  profileType: ProfileTypes;
}

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  // @Max(50)
  propertyName: string;

  @IsNotEmpty()
  @IsNumber()
  propertyUnit: number;

  @IsNotEmpty()
  @IsNumberString()
  streetId: string;

  @IsNotEmpty()
  @IsString()
  streetNumber: string;

  @IsNotEmpty()
  @IsNumberString()
  propertyTypeId: string;

  @IsOptional()
  @IsString()
  oldCode: string;

  @IsNotEmpty()
  @IsNumberString()
  propertySubscriberProfileId: string;

  @IsOptional()
  @IsBoolean()
  isOwner: boolean;
}

export class CreateStreetDto {
  @IsNotEmpty()
  @IsString()
  // @Max(50)
  name: string;

  // @IsNotEmpty()
  // @IsNumberString()
  // lgaId: string;

  @IsNotEmpty()
  @IsNumberString()
  lgaWardId: string;
}

export class CreateLgaDto {
  @IsNotEmpty()
  @IsString()
  // @Max(50)
  name: string;
}

export class CreateLgaWardDto {
  @IsNotEmpty()
  @IsString()
  // @Max(50)
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  lgaId: string;
}

export class CreatePropertyTypesDto {
  @IsNotEmpty()
  @IsString()
  // @Max(50)
  name: string;

  @IsNotEmpty()
  @IsNumberString()
  unitPrice: string;
}

export class PostPaymentDto {
  @IsNotEmpty()
  @IsNumberString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  payerName: string;

  @IsOptional()
  @IsString()
  comments: string;

  @IsNotEmpty()
  @IsNumberString()
  propertySubscriptionId: string;
}

export class GetLgaQuery {
  @IsOptional()
  @IsString()
  name: string;
}

export class GetLgaWardQuery {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumberString()
  lgaId: string;
}

export class GetStreetQuery {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumberString()
  lgaWardId: string;
}

export class GetPropertyTypeQuery {
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  @IsNumberString()
  unitPrice: string;
}

export class GetPhoneCodesQuery {
  @IsOptional()
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  query: string;
}

export class GetSubscriptionQuery {
  @IsOptional()
  @IsNumber()
  // @IsPositive()
  limit: number;

  @IsOptional()
  @IsNumber()
  // @IsPositive()
  page: number;
}
