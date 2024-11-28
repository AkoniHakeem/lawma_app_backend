import { EntityUserProfile } from '../../utils-billing/entitties/entityUserProfile.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class HelpersService {
  constructor(private dbSource: DataSource) {
    //
    this.dbManager = this.dbSource.manager;
  }

  private dbManager: EntityManager;

  async getEntityUserProfileByEmailOrId({
    email,
    entityUserProfileId,
  }: {
    email?: string;
    entityUserProfileId?: string;
  }): Promise<EntityUserProfile> {
    const entityUserProfile = await this.dbManager.findOne(EntityUserProfile, {
      where: {
        ...(email ? { email } : { id: entityUserProfileId }),
      },
    });

    return entityUserProfile;
  }
}
