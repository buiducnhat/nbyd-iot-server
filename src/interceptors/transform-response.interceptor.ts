import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable, map } from 'rxjs';

import { RestResponseCode } from '@shared/constants/rest-response-code.constant';
import { TransformResponse } from '@shared/response';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, TransformResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<TransformResponse<T>> {
    return next.handle().pipe(
      map((res) => {
        if (res instanceof TransformResponse) {
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
