// src/pipes/action-validation.pipe.ts
import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  Inject,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePropertyNameDto } from './dto';
import { first, has, values } from 'lodash';
import { UpdatePropertySubscriptionAction } from '@/src/lib/enums';

@Injectable({ scope: Scope.REQUEST })
export class UpdatePropertySubscriptionValidationPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private readonly request: Request) {}

  async transform(value: any, _: ArgumentMetadata) {
    const action = this.request.params.action;

    let dtoClass: any;
    switch (action) {
      case UpdatePropertySubscriptionAction.UPDATE_PROPERTY_NAME:
        dtoClass = UpdatePropertyNameDto;
        break;
      default:
        throw new BadRequestException(`Invalid action: ${action}`);
    }

    const object = plainToInstance(dtoClass, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      // Format validation errors for better readability
      const formattedErrors = errors.reduce((prev, error) => {
        if (!has(prev, error.property)) {
          prev[error.property] = first(values(error.constraints || {}));
        }

        return prev;
      }, {} as Record<string, string>);

      throw new BadRequestException(
        {
          type: 'VALIDATION_ERROR',
          errors: formattedErrors,
          message: 'Invalid data',
        },
        'Bad Request',
      );
    }
    return object;
  }
}
