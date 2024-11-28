import { ProfileTypes } from '@/src/lib/enums';
import { ProfileCollection } from '@/src/utils-billing/entitties/profileCollection.entity';
import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class ProfileService {
  constructor(private dbSource: DataSource) {
    //
    this.dbManager = this.dbSource.manager;
  }

  private dbManager: EntityManager;

  async createProfile(
    profileData: {
      userId: string;
      profileTypeId: string;
      profileType: ProfileTypes;
      isAdmin?: boolean;
    },
    options?: { transactionManager?: EntityManager },
  ) {
    profileData.isAdmin = profileData.isAdmin || false;
    const dbManager = options.transactionManager || this.dbManager;
    let profile = dbManager.create(
      ProfileCollection,
      profileData,
    ) as ProfileCollection;

    profile = await dbManager.save(profile);
    return profile;
  }

  async getProfileSummary(
    userId: string,
    options?: {
      profileType: ProfileTypes;
      profileTypeId: string;
    },
  ): Promise<ProfileCollection | undefined> {
    const profileSummaries = await this.dbManager.find(ProfileCollection, {
      where: {
        userId,
      },
    });

    let profileSumary: ProfileCollection = undefined;
    if (profileSummaries.length > 0) {
      profileSumary =
        profileSummaries.find((profile) => {
          options?.profileType && options?.profileTypeId
            ? profile.profileType === options.profileType &&
              profile.profileTypeId === options.profileTypeId
            : profile.isAdmin === true;
        }) ||
        // if none is found return the first
        profileSummaries[0];
    }

    return profileSumary;
  }
}
