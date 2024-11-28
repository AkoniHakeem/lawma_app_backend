import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlatformRequest } from '../lib/types';

export class IsEntityUserAdmin implements CanActivate {
  constructor() {
    //
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return this.checkEntityUserAdmin(context);
  }

  private checkEntityUserAdmin(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest() as PlatformRequest;
    const authPayload = req.authPayload;
    if (!authPayload) {
      return false;
    }
    const userIsEntityAdmin = authPayload.profile?.entityProfileId;
    return !!userIsEntityAdmin && !!authPayload.userData?.id;
  }
}
