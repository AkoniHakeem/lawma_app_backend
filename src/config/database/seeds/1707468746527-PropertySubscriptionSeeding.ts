import { MigrationInterface, QueryRunner } from 'typeorm';
import GRSDebtorListJSON from '../../../lib/GRSExcel.json';
import { PropertySubscription } from '../../../utils-billing/entitties/propertySubscription.entity';
import { ProfileTypes, SubscriberProfileRoleEnum } from '../../../lib/enums';
import { EntityProfile } from '../../../utils-billing/entitties/entityProfile.entity';
import { EntityUserProfile } from '../../../utils-billing/entitties/entityUserProfile.entity';
import { ProfileCollection } from '../../../utils-billing/entitties/profileCollection.entity';
import axios from 'axios';
import { isNumber, pick } from 'lodash';
import { AuthenticatedUserData } from '../../../lib/types';
import { Lga } from '../../../utils-billing/entitties/lga.entity';
import { LgaWard } from '../../../utils-billing/entitties/lgaWard.entity';
import { Street } from '../../../utils-billing/entitties/street.entity';
import { EntitySubscriberProfile } from '../../../utils-billing/entitties/entitySubscriberProfile.entity';
import { PropertyType } from '../../../utils-billing/entitties/propertyTypes.entity';
import { EntitySubscriberProperty } from '../../../utils-billing/entitties/entitySubscriberProperty.entity';
import { PropertySubscriptionUnit } from '../../../utils-billing/entitties/PropertySubscriptionUnit.entity';
import { BillingAccount } from '../../../utils-billing/entitties/billingAccount.entity';
import { isNumberString } from 'class-validator';

export class PropertySubscriptionSeeding1707468746527
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      //
      const dbManager = queryRunner.manager;
      function getStreetNumber(streetData: any) {
        const streetNumber = String(streetData || '')
          ?.trim()
          ?.split(/\s{1,}/)?.[0]
          ?.trim();
        return streetNumber || '';
      }

      function getStreetName(streetData: string) {
        const streetDataArray = String(streetData || '')
          ?.trim()
          ?.split(/\s{1,}/);
        streetDataArray.shift();
        const streetName = streetDataArray.join().trim();

        return streetName || '';
      }

      async function requestAuth(body: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        initiateVerificationRequest: boolean;
      }) {
        const authToken = process.env.AUTH_SERVER_API_ACCESS_TOKEN;

        const baseURL = process.env.AUTH_SERVER_URL;
        const path = '/project/app/signup';
        const Authorization = `Bearer ${authToken}`;

        const response = await axios.post(path, body, {
          headers: { Authorization },
          baseURL,
        });

        return pick(response, ['data', 'headers', 'request', 'status']);
      }

      async function getAddSubscriber(accountName: any, propertyCode: string) {
        accountName =
          (String(accountName || '')?.trim() || '')?.replace(/\s{1,}/g, '_') ||
          '';
        accountName = (String(accountName || '')?.trim() || '')?.replace(
          /[\W\s]{1,}/g,
          '',
        );
        propertyCode = (propertyCode?.trim() || '')?.replace(/[\W\s]{1,}/g, '');
        const serverResponse = await requestAuth({
          firstName: accountName || '',
          lastName: propertyCode,
          email: `${propertyCode}_${accountName}@grs.com`,
          password: 'no-password',
          initiateVerificationRequest: false,
        });

        if ([200, 201].includes(serverResponse.status)) {
          return {
            ...serverResponse.data,
          } as AuthenticatedUserData;
        }
      }

      function getPropertyType(propertyTypeUnitData: string) {
        const propertyTypesArr = propertyTypeUnitData.split('/');

        const propertyTypes = propertyTypesArr.reduce((prev, curr) => {
          const propertyUnitsTypeArray = curr.split(/\s{1,}/);

          prev[propertyUnitsTypeArray[1] || 'typename'] =
            propertyUnitsTypeArray[0] || '1';

          return prev;
        }, {});

        return propertyTypes;
      }

      const authServerResponse = await requestAuth({
        firstName: 'Olanyinka',
        lastName: 'Yusuf',
        email: 'goldenrisingsunltd@hotmail.com',
        password: 'no-password',
        initiateVerificationRequest: false,
      });

      let userData:
        | undefined
        | (AuthenticatedUserData & { isVerified: boolean });
      if ([200, 201].includes(authServerResponse.status)) {
        userData = authServerResponse.data as AuthenticatedUserData & {
          isVerified: boolean;
        };

        let grsEntity = new EntityProfile();
        grsEntity.name = 'Golden Rising Sun Ventures l.t.d. (GRS)';

        grsEntity =
          (await dbManager.findOne(EntityProfile, {
            where: { name: grsEntity.name },
          })) || (await dbManager.save(grsEntity));

        let grsUserProfile = new EntityUserProfile();
        grsUserProfile.firstName = 'Olayinka';
        grsUserProfile.lastName = 'Yusuf';
        grsUserProfile.email = 'goldenrisingsunltd@hotmail.com';
        grsUserProfile.entityProfileId = grsEntity.id;

        grsUserProfile =
          (await dbManager.findOne(EntityUserProfile, {
            where: { email: grsUserProfile.email },
          })) || (await dbManager.save(grsUserProfile));

        const profileSummary = new ProfileCollection();
        profileSummary.profileType = ProfileTypes.ENTITY_USER_PROFILE;
        profileSummary.profileTypeId = grsUserProfile.id;
        profileSummary.userId = userData.id;
        profileSummary.isAdmin = true;

        (await dbManager.findOne(ProfileCollection, {
          where: {
            profileTypeId: profileSummary.profileTypeId,
            profileType: ProfileTypes.ENTITY_USER_PROFILE,
          },
        })) || (await dbManager.save(profileSummary));

        let lga = new Lga();
        lga.name = 'Alimosho Local Government Area';
        lga.abbreviation = 'ALIMOSHO';

        lga =
          (await dbManager.findOne(Lga, { where: { name: lga.name } })) ||
          (await dbManager.save(lga));

        let lgaWard = new LgaWard();
        lgaWard.name = 'WARD B';
        lgaWard.lgaId = lga.id;

        lgaWard =
          (await dbManager.findOne(LgaWard, {
            where: { name: lgaWard.name },
          })) || (await dbManager.save(lgaWard));

        for await (const debtor of GRSDebtorListJSON) {
          console.log(debtor['Code']);
          debtor['Code'] = String(debtor['Code']);
          //
          let street = new Street();
          street.name = getStreetName(debtor['Property Number/Street']);
          street.lgaWardId = lgaWard.id;
          street.entityProfileId = grsEntity.id;

          street =
            (await dbManager.findOne(Street, {
              where: { name: street.name },
            })) || (await dbManager.save(street));

          const userProfile = await getAddSubscriber(
            debtor['Acount Name'],
            debtor.Code,
          );

          let entitySubscriberProfile = new EntitySubscriberProfile();
          entitySubscriberProfile.firstName = userProfile.firstName;
          entitySubscriberProfile.lastName = userProfile.lastName;
          entitySubscriberProfile.email = userProfile.email;
          entitySubscriberProfile.createdByEntityUserProfileId = grsEntity.id;

          entitySubscriberProfile =
            (await dbManager.findOne(EntitySubscriberProfile, {
              where: { email: entitySubscriberProfile.email },
            })) || (await dbManager.save(entitySubscriberProfile));

          let propertySubscription = new PropertySubscription();
          propertySubscription.propertySubscriptionName =
            `${debtor.Code} ${debtor['Acount Name']}`.trim() || 'GRS Prop';
          propertySubscription.oldCode =
            debtor.Code?.trim() || Date.now().toString();
          propertySubscription.subscriberProfileRole =
            SubscriberProfileRoleEnum.OWNER;
          propertySubscription.streetNumber =
            getStreetNumber(debtor['Property Number/Street'])?.trim() || '1';
          propertySubscription.streetId = street.id;
          propertySubscription.entityProfileId = grsEntity.id;
          propertySubscription.entitySubscriberProfileId =
            entitySubscriberProfile.id;

          propertySubscription =
            (await dbManager.findOne(PropertySubscription, {
              where: {
                propertySubscriptionName:
                  propertySubscription.propertySubscriptionName,
              },
            })) || (await dbManager.save(propertySubscription));

          // create property types and units
          const propertyTypeUnitData = getPropertyType(
            debtor['Property Units'] || '1 typename',
          );

          for (const [key, value] of Object.entries(propertyTypeUnitData)) {
            // create property type
            let propertyType = new PropertyType();
            propertyType.name = key;
            propertyType.unitPrice = '2000';
            propertyType.entityProfileId = grsEntity.id;

            propertyType =
              (await dbManager.findOne(PropertyType, {
                where: { name: propertyType.name },
              })) || (await dbManager.save(propertyType));

            // create entity subscriber property
            let entitySubscriberProperty = new EntitySubscriberProperty();
            entitySubscriberProperty.propertyTypeId = propertyType.id;
            entitySubscriberProperty.ownerEntitySubscriberProfileId =
              entitySubscriberProfile.id;
            // Save the entity subscriber property to the database
            entitySubscriberProperty = await dbManager.save(
              entitySubscriberProperty,
            );

            // create property subcription units
            const propertysubscriptionUnit = new PropertySubscriptionUnit();
            propertysubscriptionUnit.propertySubscriptionId =
              propertySubscription.id;
            propertysubscriptionUnit.entiySubscriberPropertyId =
              entitySubscriberProperty.id;
            propertysubscriptionUnit.propertyUnits =
              isNumberString(value) || isNumber(value) ? Number(value || 1) : 1;
            propertysubscriptionUnit.propertyUnits;

            await dbManager.save(propertysubscriptionUnit);
          }

          // create billing account
          const billingAccount =
            (await dbManager.findOne(BillingAccount, {
              where: { propertySubscriptionId: propertySubscription.id },
            })) || new BillingAccount();
          // set properties of the billing account
          billingAccount.propertySubscriptionId = propertySubscription.id;
          billingAccount.totalBillings =
            String(debtor['TotalBill'] || '')?.trim() || '0';
          billingAccount.totalPayments =
            String(debtor['Total Payment'] || '')?.trim() || '0';

          // Save the billing account to the database
          await dbManager.save(billingAccount);

          // delay for 500 milliseconds
          // await delay(500);
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query('select 1');
  }
}
