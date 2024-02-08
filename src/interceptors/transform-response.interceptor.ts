import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

import { RestResponseCode } from '@shared/constants/rest-response-code.constant';
import { RestResponse } from '@shared/rest-response';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, RestResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<RestResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        if (res instanceof RestResponse) {
          return res;
        } else {
          return {
            message: null,
            code: RestResponseCode.OK,
            params: null,
            data: res || null,
          };
        }
      }),
    );
  }
}
