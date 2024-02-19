import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  ApiPropertyOptional,
  getSchemaPath,
} from '@nestjs/swagger';

import { RestResponseCode } from '@shared/constants/rest-response-code.constant';

export class RestResponse<T> {
  @ApiPropertyOptional({ type: 'string' })
  public message: string | null;

  @ApiProperty({ type: 'number' })
  public code: number;

  @ApiPropertyOptional({
    type: [String],
  })
  public params: string[] | null;

  @ApiPropertyOptional({
    type: Object,
  })
  public data: T | null;

  public static ok<T>(
    data: T | null,
    message: string | null = 'Ok',
    params: string[] | null = null,
  ): RestResponse<T> {
    const res = new RestResponse<T>();
    res.message = message;
    res.code = RestResponseCode.OK;
    res.params = params;
    res.data = data;

    return res;
  }

  public static internalServerError(message: string): RestResponse<null> {
    const res = new RestResponse<null>();
    res.message = message;
    res.code = RestResponseCode.INTERNAL_SERVER_ERROR;
    res.params = null;
    res.data = null;

    return res;
  }
}

export const ApiResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(RestResponse, model),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        allOf: [
          { $ref: getSchemaPath(RestResponse) },
          {
            properties: {
              data: { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
};

export const ApiArrayResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(RestResponse, model),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        allOf: [
          { $ref: getSchemaPath(RestResponse) },
          {
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(model) } },
            },
          },
        ],
      },
    }),
  );
};

export const ApiPaginatedResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(RestResponse, model),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        allOf: [
          { $ref: getSchemaPath(RestResponse) },
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  total: {
                    type: 'number',
                  },
                  items: {
                    type: 'array',
                    items: { $ref: getSchemaPath(model) },
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};

export const ApiUpdatedResponse = () => {
  return applyDecorators(
    ApiExtraModels(RestResponse),
    ApiOkResponse({
      description: 'Ok',
      schema: {
        allOf: [
          { $ref: getSchemaPath(RestResponse) },
          {
            properties: {
              data: {
                type: 'object',
                properties: {
                  count: {
                    type: 'number',
                  },
                },
              },
            },
          },
        ],
      },
    }),
  );
};
