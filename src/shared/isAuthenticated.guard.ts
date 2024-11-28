import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthenticatedUserData, PlatformRequest } from 'src/lib/types';

export class IsAuthenticated implements CanActivate {
  constructor() {
    //
  }
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.checkUserAccess(context);
  }

  private checkUserAccess(context: ExecutionContext) {
    const userData = this.getContextData(
      context,
      'userData',
    ) as AuthenticatedUserData;
    const isAuthenticated = !!userData && !!userData.id;

    return isAuthenticated;
  }

  private getContextData(
    context: ExecutionContext,
    dataProp: 'userData' | 'apiData',
  ) {
    const req = context.switchToHttp().getRequest() as PlatformRequest;
    const authPayload = req.authPayload;
    const data = authPayload ? authPayload[dataProp] : undefined;
    return data;
  }
}
