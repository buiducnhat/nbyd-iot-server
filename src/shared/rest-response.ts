import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';

import { RestResponseCode } from '@shared/constants/rest-response-code.constant';

export class RestResponse<T> {
  @ApiProperty()
  public message: string | null;

  @ApiProperty()
  public code: number;

  @ApiProperty({
    type: [String],
  })
  public params: string[] | null;

  @ApiProperty({
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

export const ApiRestResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(RestResponse),
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

export const ApiPaginatedRestResponse = <TModel extends Type<any>>(
  model: TModel,
) => {
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
