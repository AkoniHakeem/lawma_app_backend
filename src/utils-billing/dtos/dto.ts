import { ProfileTypes } from '@/src/lib/enums';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsBooleanString,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
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
  @IsOptional()
  @IsNumberString()
  id: string;

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

  @IsNotEmpty()
  @IsDateString()
  paymentDate: string;
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
  @IsNumberString()
  rowsPerPage: string;

  @IsOptional()
  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  sortBy: string;

  @IsOptional()
  @IsBooleanString()
  descending: string;

  @IsOptional()
  @IsNumberString()
  page: number;

  @IsOptional()
  @IsString()
  filter?: string;

  @IsOptional()
  @IsNumberString()
  streetId: string;
}

export class GenerateBillingDto {
  @IsOptional()
  @IsString()
  streetId: string;

  @IsOptional()
  @IsString()
  propertySuscriptionId: string;

  @IsOptional()
  @IsString()
  year: string;

  @IsOptional()
  @IsString()
  month: string;

  @IsOptional()
  @IsBoolean()
  forAllProperties: boolean;

  @IsOptional()
  @IsBoolean()
  forPropertiesOnStreet: boolean;
}

export class GetBillingQuery {
  @IsOptional()
  @IsString()
  streetId: string;

  @IsNotEmpty()
  @IsString()
  propertySuscriptionId: string;

  @IsOptional()
  @IsString()
  year: string;

  @IsOptional()
  @IsString()
  month: string;

  @IsOptional()
  @IsBoolean()
  forAllProperties: boolean;

  @IsOptional()
  @IsBoolean()
  forPropertiesOnStreet: boolean;
}

export class GetPaymentsQuery {
  @IsOptional()
  @IsString()
  month: string;

  @IsOptional()
  @IsString()
  year: string;

  @IsOptional()
  @IsString()
  propertySubscriptionId: string;
}

export class GetBillingAccountArrear {
  @IsOptional()
  @IsNumber()
  page: number;

  @IsOptional()
  @IsNumber()
  limit: number;
}

export class SavePropertyUnitsDetailsDto {
  @IsNotEmpty()
  @IsNumberString()
  propertySubscriptionId: string;

  @Type(() => SavePropertyUnitsDto)
  // @ValidateNested()
  propertySubscriptionUnits: SavePropertyUnitsDto[];
}

export class SavePropertyUnitsDto {
  @IsOptional()
  @IsNumberString()
  propertyTypeId: string;

  @IsNotEmpty()
  @IsString()
  propertyType: string;

  @IsNotEmpty()
  @IsNumber()
  propertyUnit: string;

  @IsNotEmpty()
  @IsNumberString()
  unitPrice: string;
}

export class UpdateAccontRecordDto {
  @IsNotEmpty()
  @IsNumberString()
  arrears: string;

  @IsNotEmpty()
  @IsNumberString()
  propertySubscriptionId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}

export class UpdatePropertyNameDto {
  @IsNotEmpty()
  @IsString()
  propertySubscriptionId: string;

  @IsNotEmpty()
  @IsString()
  propertySubscriptionName: string;
}
