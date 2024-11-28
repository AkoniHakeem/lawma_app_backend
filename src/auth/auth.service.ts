import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { EntityProfileSignUpDto, SignInDto } from './dto/dto';
import { EntityUserProfile } from '../utils-billing/entitties/entityUserProfile.entity';
import { HelpersService } from '../shared/helpers/helpers.service';
import {
  throwBadRequest,
  throwForbidden,
  throwUnathorized,
} from '../utils/helpers';
import { RequestService } from '../shared/request/request.service';
import {
  AuthTokenPayload,
  AuthenticatedUserData,
  ProfileSummary,
} from '../lib/types';
import { EntityProfile } from '../utils-billing/entitties/entityProfile.entity';
import { omit } from 'lodash';
import { SharedService } from '../shared/shared.service';
import { ProfileService } from '../shared/profile/profile.service';
import { ProfileTypes } from '../lib/enums';

@Injectable()
export class AuthService {
  constructor(
    private dbSource: DataSource,
    private helperService: HelpersService,
    private requestService: RequestService,
    private sharedService: SharedService,
    private profileService: ProfileService,
  ) {
    //
    this.dbManager = this.dbSource.manager;
  }

  private dbManager: EntityManager;

  async authenticateUserOnAuthServer(
    action: 'signin' | 'signup',
    {
      signupDto,
      signinDto,
    }: { signupDto?: EntityProfileSignUpDto; signinDto?: SignInDto },
  ) {
    const authServerRequestBody: {
      firstName: string;
      middleName: string;
      lastName: string;
      email: string;
      password: string;
      initiateVerificationRequest: boolean;
    } = {
      ...signupDto,
      initiateVerificationRequest: false,
    };

    const authServerRequestPath = `/project/app/${action}`;

    const response = await this.requestService.requestApiService(
      authServerRequestPath,
      {
        body: action === 'signup' ? authServerRequestBody : { ...signinDto },
        method: 'POST',
      },
    );

    let userData: undefined | (AuthenticatedUserData & { isVerified: boolean });
    if ([200, 201].includes(response.status)) {
      userData = response.data as AuthenticatedUserData & {
        isVerified: boolean;
      };
    } else {
      const actionError = {
        signup: throwForbidden('User data is invalid'),
        signin: throwUnathorized('Invalid credentials.'),
      };

      return actionError[action];
    }

    return userData;
  }

  async signup(signupDto: EntityProfileSignUpDto) {
    // do necessary checks
    // check that the email does not already exist.
    const existingEntityUserProfile =
      await this.helperService.getEntityUserProfileByEmailOrId({
        email: signupDto.email,
      });

    if (existingEntityUserProfile) {
      throwForbidden('Email is already registered.');
    }

    const userData = await this.authenticateUserOnAuthServer('signup', {
      signupDto,
    });

    const entityProfileDto = signupDto.entityProfile;

    let authTokenPayload: { token: string };
    await this.dbManager.transaction(async (transactionManager) => {
      if (entityProfileDto) {
        let entityProfile = transactionManager.create(
          EntityProfile,
          entityProfileDto,
        ) as EntityProfile;

        entityProfile = await transactionManager.save(entityProfile);

        // remove stale fields
        delete signupDto.entityProfile;
        delete signupDto.password;

        let entityUserProfile = transactionManager.create(EntityUserProfile, {
          ...signupDto,
          entityProfileId: entityProfile.id,
        });

        entityUserProfile = await transactionManager.save(entityUserProfile);
        const existingProfileSummary = this.profileService.getProfileSummary(
          userData.id,
        );

        const profile = await this.profileService.createProfile(
          {
            userId: String(userData.id),
            profileType: ProfileTypes.ENTITY_USER_PROFILE,
            profileTypeId: entityUserProfile.id,
            isAdmin: !existingProfileSummary,
          },
          { transactionManager },
        );

        authTokenPayload = await this.generateAuthToken(
          userData,
          profile,
          entityProfile.id,
        );
      }

      // TODO: implement else branch
    });

    return authTokenPayload;
  }

  async signin(signinDto: SignInDto) {
    //
    const userData = await this.authenticateUserOnAuthServer('signin', {
      signinDto,
    });

    const profileSummary = await this.profileService.getProfileSummary(
      userData.id,
    );

    let entityProfileId: string = undefined;
    if (profileSummary.profileType === ProfileTypes.ENTITY_USER_PROFILE) {
      const entityUserProfile =
        await this.helperService.getEntityUserProfileByEmailOrId({
          entityUserProfileId: profileSummary.profileTypeId,
        });

      entityProfileId = entityUserProfile.entityProfileId;
    }
    const authTokenPayload = this.generateAuthToken(
      userData,
      profileSummary,
      entityProfileId,
    );

    return authTokenPayload;
  }

  async generateAuthToken(
    userData: AuthenticatedUserData & { isVerified: boolean },
    profile: ProfileSummary,
    entityProfileId?: string,
  ) {
    const authPayload: AuthTokenPayload = {
      userData: omit(userData, ['isVerified']),
      profile: {
        id: profile.id,
        profileType: profile.profileType,
        profileTypeId: profile.profileTypeId,
        ...(entityProfileId ? { entityProfileId: entityProfileId } : {}),
      },
    };

    const token = this.sharedService.signPayload(authPayload);
    return {
      token,
    };
  }
}
