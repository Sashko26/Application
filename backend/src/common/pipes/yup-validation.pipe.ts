import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ObjectSchema } from 'yup';

@Injectable()
export class YupValidationPipe implements PipeTransform {
  constructor(private schema: ObjectSchema<any>) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    try {
      // abortEarly: false дозволяє зібрати всі помилки валідації одразу, а не зупинятися на першій
      await this.schema.validate(value, { abortEarly: false });
      return value;
    } catch (err) {
      throw new BadRequestException({
        message: 'Помилка валідації даних',
        errors: err.errors,
      });
    }
  }
}