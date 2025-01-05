import { HttpException, Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, FindOperator, ILike, Raw } from 'typeorm';
import {
  CreateLgaDto,
  CreateLgaWardDto,
  CreatePropertyTypesDto,
  CreateStreetDto,
  CreateSubscriptionDto,
  CreateUserDto,
  GenerateBillingDto,
  GetBillingQuery,
  PostPaymentDto,
  SavePropertyUnitsDto,
  SavePropertyUnitsDetailsDto,
} from './dtos/dto';
import {
  ProfileTypes,
  SubscriberProfileRoleEnum,
  Wallet_Service_Credit_Source_Type,
  Wallet_Service_Transaction_Type,
} from '../lib/enums';
import {
  throwBadRequest,
  throwForbidden,
  throwServerError,
} from '../utils/helpers';
import { EntitySubscriberProfile } from './entitties/entitySubscriberProfile.entity';
import { EntityUserProfile } from './entitties/entityUserProfile.entity';
import {
  AuthTokenPayload,
  AuthenticatedUserData,
  DedicatedVirtualAccountUserData,
  PaystackCustomer,
  PaystackWebhookData,
  PaystackWebhookEventObject,
  PaystackWebhookEvents,
} from '../lib/types';
import { Street } from './entitties/street.entity';
import { PropertyType } from './entitties/propertyTypes.entity';
import { PropertySubscription } from './entitties/propertySubscription.entity';
import { EntitySubscriberProperty } from './entitties/entitySubscriberProperty.entity';
import { PropertySubscriptionUnit } from './entitties/PropertySubscriptionUnit.entity';
import { BillingAccount } from './entitties/billingAccount.entity';
import { Billing } from './entitties/billing.entity';
import { MonthNames, sucessHttpCodes } from '../lib/projectConstants';
import { bignumber } from 'mathjs';
import { LgaWard } from './entitties/lgaWard.entity';
import { Lga } from './entitties/lga.entity';
import { Payment } from './entitties/payments.entity';
import { RequestService } from '../shared/request/request.service';
import { ProfileCollection } from './entitties/profileCollection.entity';
import { PhoneCode } from './entitties/phoneCode.entity';
import { pick } from 'lodash';
import { isNumberString } from 'class-validator';
import ArrearsUpdate from './entitties/arrearsUpdates.entity';
import { PaystackServiceService } from '../shared/paystack_service/paystack_service.service';
import SubscriberVirtualAccountDetail from './entitties/subscriberVirtualAccount.entity';
import WalletReference from './entitties/walletReference.entity';
import { WalletServiceService } from '../shared/wallet-service/wallet-service.service';

@Injectable()
export class UtilsBillingService {
  constructor(
    private requestService: RequestService,
    public dbManager: EntityManager,
    public paystackService: PaystackServiceService,
    public walletService: WalletServiceService,
    private dataSource?: DataSource,
  ) {
    //
    if (!dbManager) {
      if (!dataSource) {
        throw new Error('No data source found');
      }
      this.dbManager = dataSource.manager;
      this.dataSource = dataSource;
    } else {
      this.dbManager = dbManager;
    }
  }

  // update the property subscription name
  async updatePropertySubscriptionName({
    propertySubscriptionId,
    name,
    entityProfileId,
  }: {
    propertySubscriptionId: string;
    name: string;
    entityProfileId: string;
  }) {
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      { where: { id: propertySubscriptionId, entityProfileId } },
    );
    if (!propertySubscription) {
      throwBadRequest('Property subscription not found');
    }
    propertySubscription.propertySubscriptionName = name;
    await this.dbManager.save(propertySubscription);
  }

  async createUser(
    createUserDto: CreateUserDto,
    authPayload: AuthTokenPayload,
  ) {
    const { profileType } = createUserDto; //===========what are u destructruringhere?=======profileType = undefined=====gotten when filled in request=======
    if (
      ![
        ProfileTypes.ENTITY_SUBSCRIBER_PROFILE,
        ProfileTypes.ENTITY_USER_PROFILE,
      ].includes(profileType)
    ) {
      throwBadRequest('Invalid profile');
    }

    delete createUserDto.profileType;

    const entityProfileId = authPayload.profile.entityProfileId;
    const phoneCode = await this.getPhoneCodeOrThrow({
      phoneCodeId: createUserDto.phoneCodeId,
    });

    // create user in central user manager
    const authServerRequestPath = `/project/app/signup`;

    const defaultPassword = 'no-password';
    const phoneNumber = createUserDto.phone;
    const response = await this.requestService.requestApiService(
      authServerRequestPath,
      {
        body: {
          firstName: createUserDto.firstName,
          lastName: createUserDto.lastName,
          email: createUserDto.email,
          password: defaultPassword,
          ...(phoneNumber ? { phone: `${phoneNumber}` } : {}),
          ...(phoneNumber ? { phoneCode: `${phoneCode.name}` } : {}),
        },
        method: 'POST',
      },
    );

    if (response.status !== 201) {
      throw new HttpException('User creation failed', 500);
    }
    const userData:
      | undefined
      | (AuthenticatedUserData & {
          isVerified?: boolean;
          isNewUser?: boolean;
          userCreatedInApp?: boolean;
        }) = response.data;

    if (!userData) {
      throw new HttpException('User creation failed', 500);
    }

    if (!userData.isNewUser && !userData.userCreatedInApp) {  //isNewUser should be true
      throwForbidden('User already exist!');
    }

    let userProfile: EntityUserProfile | EntitySubscriberProfile;
    if (profileType === ProfileTypes.ENTITY_USER_PROFILE) {
      userProfile = this.dbManager.create(EntityUserProfile, {
        ...createUserDto,
        entityProfileId,
      });

      await this.dbManager.save(userProfile);
    } else if (profileType === ProfileTypes.ENTITY_SUBSCRIBER_PROFILE) {
      userProfile = this.dbManager.create(EntitySubscriberProfile, {
        ...createUserDto,
        createdByEntityProfileId: entityProfileId,
        createdByEntityUserProfileId: authPayload.profile.profileTypeId,
      });

      await this.dbManager.save(userProfile);
    }

    const profileCollection = this.dbManager.create(ProfileCollection, {
      profileType,
      userId: userData.id,
      isAdmin: false,
      profileTypeId: userProfile.id,
    });

    await this.dbManager.save(profileCollection);
  }

  async getEntityUserSubscriber(
    entityProfileId: string,
    {
      query,
      page,
      count = 10,
    }: { query?: string; page?: number; count?: number } = {},
  ) {
    let entitySubscriberProfiles: EntitySubscriberProfile[] = [];
    entitySubscriberProfiles = await this.dbManager.find(
      EntitySubscriberProfile,
      {
        where: {
          createdByEntityUserProfileId: entityProfileId,
        },
      },
    );

    return entitySubscriberProfiles;
  }

  async createPropertySubscription(
    createSubscriptionDto: CreateSubscriptionDto,
    authPayload: AuthTokenPayload,
  ) {
    // verify streetId, propertyTypeId, propertySubscriberProfileId, oldCode.
    await this.getStreetOrThrowError({
      streetId: createSubscriptionDto.streetId,
    });

    // verify propertyTypeId
    await this.getPropertyTypeOrThrowError({
      propertyTypeId: createSubscriptionDto.propertyTypeId,
    });

    // verify oldCode
    const existingOldCode = await this.dbManager.findOne(PropertySubscription, {
      where: {
        oldCode: createSubscriptionDto.oldCode,
      },
    });

    if (existingOldCode) {
      throwBadRequest('Old code supplied has been used.');
    }

    // verify propertySubscriberProfileId
    await this.validateEntitySubscriberProfileById(
      createSubscriptionDto.propertySubscriberProfileId,
    );

    const subscriberProfileRole = createSubscriptionDto.isOwner
      ? SubscriberProfileRoleEnum.OWNER
      : SubscriberProfileRoleEnum.CUSTODIAN;

    await this.dbManager.transaction(async (transactionManager) => {
      // create subscriber property
      let subscriberProperty = transactionManager.create(
        EntitySubscriberProperty,
        {
          propertyTypeId: createSubscriptionDto.propertyTypeId,
          ...(createSubscriptionDto.isOwner
            ? {
                ownerEntitySubscriberProfileId:
                  createSubscriptionDto.propertySubscriberProfileId,
              }
            : {}),
        },
      );

      subscriberProperty = await transactionManager.save(subscriberProperty);

      // create property subscription
      let propertySubscription = transactionManager.create(
        PropertySubscription,
        {
          propertySubscriptionName: createSubscriptionDto.propertyName,
          oldCode: createSubscriptionDto.oldCode,
          streetNumber: createSubscriptionDto.streetNumber,
          streetId: createSubscriptionDto.streetId,
          entitySubscriberProfileId:
            createSubscriptionDto.propertySubscriberProfileId,
          subscriberProfileRole: subscriberProfileRole,
          entityProfileId: authPayload.profile.entityProfileId,
        },
      );

      propertySubscription = await transactionManager.save(
        propertySubscription,
      );
      const propertySubscriptionId = propertySubscription.id;

      // create property unit
      const propertySubscriptionUnit = transactionManager.create(
        PropertySubscriptionUnit,
        {
          propertySubscriptionId,
          entiySubscriberPropertyId: subscriberProperty.id,
          propertyUnits: createSubscriptionDto.propertyUnit,
        },
      );

      await transactionManager.save(propertySubscriptionUnit);

      // create billling account
      const billingAccount = transactionManager.create(BillingAccount, {
        propertySubscriptionId,
      });

      await transactionManager.save(billingAccount);
    });
  }

  async getSubscriptions(
    entityProfileId: string,
    {
      rowsPerPage = 10,
      page = 1,
      streetId,
      descending,
      filter,
      sortBy,
    }: {
      rowsPerPage?: number;
      limit?: number;
      page?: number;
      streetId?: string;
      descending?: boolean;
      filter?: string;
      sortBy?: string;
    } = {},
  ) {
    //
    // let filterBy = filter ? JSON.parse(filter) : null;
    const [propertySubscriptions, rowsNumber] =
      await this.dbManager.findAndCount(PropertySubscription, {
        where: filter
          ? isNumberString(filter)
            ? [
                // {
                //   entityProfileId,
                //   // billingAccount: {
                //   //   totalBillings: Raw(
                //   //     ($alias) => `${$alias} >= "totalPayments" + ${filter}`,
                //   //   ),
                //   // },
                // },
                {
                  entityProfileId,
                  oldCode: filter,
                },
                {
                  entityProfileId,
                  id: filter,
                },
              ]
            : [
                {
                  entityProfileId,
                  street: { name: ILike(`%${filter}%`) },
                },
                {
                  entityProfileId,
                  propertySubscriptionName: ILike(`%${filter}%`),
                },
              ]
          : {
              entityProfileId,
              ...(streetId ? { streetId } : {}),
            },
        ...(!streetId
          ? { take: rowsPerPage, skip: (page - 1) * rowsPerPage }
          : {}),
        relations: {
          propertySubscriptionUnits: {
            entitySubscriberProperty: {
              propertyType: true,
            },
          },
          billingAccount: true,
          entitySubscriberProfile: {
            phoneCode: true,
          },
          street: true,
        },
        ...(sortBy ? { order: { [sortBy]: descending ? 'DESC' : 'ASC' } } : {}),
      });

    const mappedResponse = propertySubscriptions.map((sub) => {
      return {
        propertySubscriptionId: sub.id,
        propertySubscriptionName: sub.propertySubscriptionName,
        oldCode: sub.oldCode,
        streetNumber: sub.streetNumber,
        createdAt: sub.createdAt,
        streetId: sub.streetId,
        entitySubscriberProfileId: sub.entitySubscriberProfileId,
        propertySubscriptionUnits: sub.propertySubscriptionUnits?.map(
          (unit) => {
            return {
              entitySubscriberPropertyId: unit.entitySubscriberProperty?.id,
              createdAt: unit.entitySubscriberProperty?.createdAt,
              propertyType: {
                ...unit.entitySubscriberProperty?.propertyType,
                updatedAt: undefined,
                entityProfileId: undefined,
              },
            };
          },
        ),
        arrears: (() => {
          let arr =
            Number(sub.billingAccount.totalBillings || '0') -
            Number(sub.billingAccount.totalPayments || '0');
          arr = arr < 0 ? 0 : arr;
          return arr;
        })(),
        entitySubscriberProfile: {
          ...sub.entitySubscriberProfile,
          updatedAt: undefined,
          phone: sub.entitySubscriberProfile?.phone,
          phoneCode: sub.entitySubscriberProfile?.phoneCode?.name,
        },
        streetName: sub.street?.name,
      };
    });

    return {
      data: mappedResponse,
      pagination: { rowsNumber, rowsPerPage, page, sortBy, descending },
      filter,
    };
  }

  async createPropertyType(
    createPropertyTypesDto: CreatePropertyTypesDto,
    entityProfileId: string,
  ) {
    //
    let propertyType = await this.dbManager.findOne(PropertyType, {
      where: {
        id: createPropertyTypesDto.id,
      },
    });

    if (propertyType) {
      propertyType.name = createPropertyTypesDto.name;
      propertyType.unitPrice = createPropertyTypesDto.unitPrice;
    } else {
      propertyType = this.dbManager.create(PropertyType, {
        unitPrice: createPropertyTypesDto.unitPrice,
        name: createPropertyTypesDto.name,
        entityProfileId,
      });
    }

    await this.dbManager.save(propertyType);
  }

  async getPropertyTypes(
    entityProfileId: string,
    { name, unitPrice }: { name?: string; unitPrice?: string } = {},
  ) {
    //

    const propertyTypes =
      name || unitPrice
        ? await this.dbManager.find(PropertyType, {
            where: {
              entityProfileId,
              ...(name ? { name } : {}),
              ...(unitPrice ? { unitPrice } : {}),
            },
          })
        : await this.dbManager.find(PropertyType, {
            where: {
              entityProfileId,
            },
          });

    return propertyTypes;
  }

  async getBillingsByMonth(
    propertySubscriptionId: string,
    month: string,
    year: string,
    entityProfileId?: string,
  ) {
    //
    const billings = await this.dbManager.find(Billing, {
      where: {
        propertySubscriptionId,
        month,
        year,
        ...(entityProfileId ? { entityProfileId } : {}),
      },
      relations: {
        propertySubscription: {
          propertySubscriptionUnits: true,
          billingAccount: true,
          payments: true,
        },
      },
    });

    const mappedBilling = billings.map((bill) => {
      return {
        billing: {
          id: bill.id,
          amount: bill.amount,
          month: bill.month,
          year: bill.year,
        },
        arreas: bill.propertySubscription.billingAccount.totalBillings,
        propertySubscriptionUnits:
          bill.propertySubscription.propertySubscriptionUnits.map(
            (propertySubscriptionUnit) => {
              return {
                propertyType:
                  propertySubscriptionUnit.entitySubscriberProperty.propertyType
                    .name,
                unitPrice:
                  propertySubscriptionUnit.entitySubscriberProperty.propertyType
                    .unitPrice,
                unitCount: propertySubscriptionUnit.propertyUnits,
              };
            },
          ),
        lastPayment: {
          amount: bill.propertySubscription.payments.pop()?.amount,
          date: bill.propertySubscription.payments.pop()?.createdAt,
        },
      };
    });

    return mappedBilling;
  }

  async deleteBilling({
    entityProfileId,
    billingId,
  }: {
    entityProfileId: string;
    billingId: string;
  }) {
    const billingToDelete = await this.dbManager.findOne(Billing, {
      where: {
        id: billingId,
        propertySubscription: {
          entityProfileId,
        },
      },
    });

    if (billingToDelete) {
      await this.dbManager.delete(Billing, { id: billingId });
    }
  }

  async updateAccountRecord({
    entityProfileId,
    entityUserProfileId,
    billingArrears,
    propertySubscriptionId,
    reason,
    phone,
    phoneCodeId,
  }: {
    entityProfileId: string;
    entityUserProfileId: string;
    billingArrears: string;
    propertySubscriptionId: string;
    reason: string;
    phone?: string;
    phoneCodeId?: string;
  }) {
    if (phone && phoneCodeId) {
      const phoneCode = await this.dbManager.findOne(PhoneCode, {
        where: {
          id: phoneCodeId,
        },
      });

      if (!phoneCode) {
        throwBadRequest('Invalide phone code parameter sent');
        return;
      }

      // TODO: write implementation to change phone code.
      const subscriberProperty = await this.dbManager.findOne(
        PropertySubscription,
        {
          where: {
            id: propertySubscriptionId,
          },
          relations: {
            entitySubscriberProfile: true,
          },
        },
      );

      const entitySubscriberProfile =
        subscriberProperty.entitySubscriberProfile;

      entitySubscriberProfile.phone = phone;
      entitySubscriberProfile.phoneCodeId = phoneCode.id;

      await this.dbManager.transaction(async (transactionManager) => {
        await transactionManager.save(entitySubscriberProfile);

        // update the user profile in the central user manager
        // make request to user manager
        const serverResponse = await this.requestService.requestApiService(
          '/user',
          {
            method: 'PUT',
            body: {
              phone,
              phoneCodeId,
              email: entitySubscriberProfile.email,
            },
          },
        );

        if (sucessHttpCodes.includes(serverResponse.status)) {
          // create virtual account on fintech service (paystack)
          const userDataForDVA: PaystackCustomer = {
            first_name: entitySubscriberProfile.firstName,
            last_name: entitySubscriberProfile.lastName,
            email: entitySubscriberProfile.email,
            phone: `${phoneCode}${phone}`,
          };
          const customerActionResponse =
            await this.paystackService.createCustomer(userDataForDVA);

          const customerCode = customerActionResponse?.data.customer_code;

          if (!customerCode) {
            throwServerError(
              'Could not complete process',
              new Error('Paystack Customer creation failed.'),
            );
          }

          const dvaUserData: DedicatedVirtualAccountUserData = {
            customer: customerCode,
            preferred_bank: 'test-bank',
            country: 'NG',
          };
          try {
            const paystackServerResponse =
              await this.paystackService.createDedicatedVirtualAccount(
                dvaUserData,
              );

            Logger.log(paystackServerResponse);

            // create virtual account details for subscriber.
            await this.createSubscriberVirtualAccountDetail({
              dbManager: transactionManager,
              account_name: paystackServerResponse.data.account_name,
              account_number: paystackServerResponse.data.account_number,
              propertySubscriptionId,
            });
          } catch (error) {
            throwServerError();
          }

          // send sucess result
        } else if (serverResponse.status === 400) {
          // send client error
          throwBadRequest('One or more fields are invalid.');
        } else {
          throwServerError();
        }
      });
      return;
    }
    const associatedBillingAccount = await this.dbManager.findOne(
      BillingAccount,
      {
        where: {
          propertySubscription: {
            id: propertySubscriptionId,
            entityProfileId,
          },
        },
      },
    );

    if (!associatedBillingAccount) {
      throwBadRequest('Could not find the referenced billing Account');
      return;
    }

    let currentArrears = bignumber(associatedBillingAccount.totalBillings)
      .minus(associatedBillingAccount.totalPayments)
      .toNumber();
    currentArrears = currentArrears > 0 ? currentArrears : 0;

    const newArrears = bignumber(billingArrears).toNumber();

    /// update billing acount: if newArrears > currentArrears add difference to account's total billing
    const arrearsDifference = newArrears - currentArrears;
    if (arrearsDifference >= 0) {
      associatedBillingAccount.totalBillings = String(
        bignumber(associatedBillingAccount.totalBillings).add(
          arrearsDifference,
        ),
      );
    } else {
      associatedBillingAccount.totalPayments = String(
        bignumber(associatedBillingAccount.totalPayments).add(
          Math.abs(arrearsDifference),
        ),
      );
    }

    await this.dbManager.transaction(async (transactionManager) => {
      await transactionManager.save(associatedBillingAccount);

      // track arrears update
      const arrearsUpdate = transactionManager.create(ArrearsUpdate, {
        amountAfterUpdate: newArrears.toString(),
        amountBeforeUpdate: currentArrears.toString(),
        reasonToUpdate: reason,
        propertySubscriptionId: propertySubscriptionId,
        updatedByUserId: entityUserProfileId,
      });

      await transactionManager.save(arrearsUpdate);
    });
  }

  async createSubscriberVirtualAccountDetail({
    dbManager,
    account_name,
    account_number,
    propertySubscriptionId,
  }: {
    dbManager: EntityManager;
    account_number: string;
    account_name: string;
    propertySubscriptionId: string;
  }) {
    const newSubscriberVirtualAccount = dbManager.create(
      SubscriberVirtualAccountDetail,
      {
        account_name,
        account_number,
        propertySubscriptionId,
      },
    );

    await dbManager.save(newSubscriberVirtualAccount);
  }

  async generateBilling(
    generatePrintBIllingDto: GenerateBillingDto,
    entityProfileId: string,
  ) {
    // check if to generate for all properties
    if (generatePrintBIllingDto.forAllProperties) {
      throwBadRequest('This is currently not available.');
    } else if (generatePrintBIllingDto.forPropertiesOnStreet) {
      // TODO: handle this
      const properties = await this.dbManager.find(PropertySubscription, {
        where: {
          streetId: generatePrintBIllingDto.streetId,
          entityProfileId,
        },
      });

      await this.dbManager.transaction(async (transactionManager) => {
        await Promise.all(
          properties.map(async (prop) => {
            await this.generateMonthBilling(
              prop.id,
              generatePrintBIllingDto.month,
              {
                year: generatePrintBIllingDto.year,
                throwError: false,
                transactionManager,
              },
            );
          }),
        );
      });
    } else {
      //
      await this.generateMonthBilling(
        generatePrintBIllingDto.propertySuscriptionId,
        generatePrintBIllingDto.month,
        {
          year: generatePrintBIllingDto.year,
          transactionManager: this.dbManager,
        },
      );
    }
  }

  async getBilling(
    generatePrintBIllingDto: GetBillingQuery,
    entityProfileId: string,
  ) {
    //
    if (generatePrintBIllingDto.forAllProperties) {
      //
      throwBadRequest('This is currently not available.');
    } else if (
      generatePrintBIllingDto.forPropertiesOnStreet ||
      generatePrintBIllingDto.streetId
    ) {
      const properties = await this.dbManager.find(PropertySubscription, {
        where: {
          streetId: generatePrintBIllingDto.streetId,
          entityProfileId,
        },
      });

      const billings = await Promise.all(
        properties.map(async (prop) => {
          await this.getBillingsByMonth(
            prop.id,
            generatePrintBIllingDto.month,
            generatePrintBIllingDto.year,
          );
        }),
      );

      return billings;
    } else {
      const billings = await this.getBillingsByMonth(
        generatePrintBIllingDto.propertySuscriptionId,
        generatePrintBIllingDto.month,
        generatePrintBIllingDto.month,
        entityProfileId,
      );

      return billings;
    }
  }

  async generateMonthBilling(
    propertySubscriptionId: string,
    month: string,
    {
      year,
      throwError = true,
      transactionManager,
    }: {
      year?: string;
      throwError?: boolean;
      transactionManager: EntityManager;
    },
  ) {
    //

    const dbManager = transactionManager;
    const propertySubscription = await dbManager.findOne(PropertySubscription, {
      where: {
        id: propertySubscriptionId,
      },
    });
    if (!propertySubscription) {
      throwBadRequest('Property subscription not found.');
    }

    const billingAccount = await dbManager.findOne(BillingAccount, {
      where: {
        propertySubscriptionId,
      },
    });

    if (!billingAccount) {
      throwBadRequest('Billing account not found.');
    }

    const billingAlreadyGenerated = await dbManager.findOne(Billing, {
      where: {
        propertySubscriptionId: propertySubscription.id,
        month: month || this.getMonthName(),
        year: year || new Date().getFullYear().toString(),
      },
    });

    if (billingAlreadyGenerated) {
      if (!throwError) {
        return null;
      }
      throwBadRequest(
        `Billing already generated for ${propertySubscription.propertySubscriptionName}.`,
      );
      return;
    }

    const propertySubscriptionUnits = await dbManager.find(
      PropertySubscriptionUnit,
      {
        where: {
          propertySubscriptionId,
        },
        relations: {
          entitySubscriberProperty: {
            propertyType: true,
          },
        },
      },
    );

    const billingAmount = this.calculateBillingAmount(
      propertySubscriptionUnits,
    );

    const currentBilling = dbManager.create(Billing, {
      propertySubscriptionId: propertySubscription.id,
      month: month || this.getMonthName(),
      year: year || new Date().getFullYear().toString(),
      amount: billingAmount.toString(),
    });
    await dbManager.save(currentBilling);

    // update billing account
    // TODO: use bigNumber form math js
    billingAccount.totalBillings = bignumber(billingAccount.totalBillings)
      .add(currentBilling.amount)
      .toString();

    await dbManager.save(billingAccount);
  }

  calculateBillingAmount(propertyUnits: PropertySubscriptionUnit[]) {
    return propertyUnits.reduce((total, propertySubscriptionUnit) => {
      return (
        total +
        propertySubscriptionUnit.propertyUnits *
          (Number(
            propertySubscriptionUnit.entitySubscriberProperty.propertyType
              .unitPrice,
          ) || 0)
      );
    }, 0);
  }

  async getBillingAccountArrears(
    entityProfileId: string,
    {
      limit = 5,
      page = 1,
      month = this.getMonthName(),
      year = new Date().getFullYear().toString(),
    }: { limit?: number; page?: number; month?: string; year?: string } = {},
  ) {
    const streetsOwnedByEntity = await this.dbManager.find(Street, {
      where: {
        entityProfileId,
        ...(month
          ? {
              propertySubscriptions: {
                billings: {
                  month,
                  year,
                },
              },
            }
          : {}),
      },
      relations: {
        propertySubscriptions: {
          billingAccount: true,
          billings: true,
        },
      },
      take: limit,
      skip: (page - 1) * limit,
    });

    const mappedStreetsAndArrears = streetsOwnedByEntity.map((street) => {
      return {
        streetId: street.id,
        streetName: street.name,
        totalBilling: street.propertySubscriptions.reduce((total, sub) => {
          return total + Number(sub.billingAccount.totalBillings || 0);
        }, 0),
        arrears: street.propertySubscriptions.reduce((total, sub) => {
          const currentArrears =
            Number(sub.billingAccount.totalBillings || 0) -
            Number(sub.billingAccount.totalPayments || 0);

          total += currentArrears > 0 ? currentArrears : 0;
          return total;
        }, 0),
      };
    });

    return mappedStreetsAndArrears;
  }

  async getSubscriptionDetails(
    entityProfileId: string,
    propertySubscriptionId: string,
  ) {
    // get property subsription for the current profile and the provided subscription id
    if (!entityProfileId || !propertySubscriptionId) {
      throwBadRequest('Kindly, provide a valid property reference.');
    }
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: {
          id: propertySubscriptionId,
          entityProfileId,
        },
        relations: {
          payments: true,
          billingAccount: true,
          entitySubscriberProfile: {
            phoneCode: true,
          },
          propertySubscriptionUnits: {
            entitySubscriberProperty: {
              propertyType: true,
            },
          },
          street: true,
        },
      },
    );

    return propertySubscription;
  }

  async savePropertyUnits(
    entityProfileId: string,
    propertyUnitsDetails: SavePropertyUnitsDetailsDto,
  ) {
    // deduplicate record
    const propertyUnitsTypesDto =
      propertyUnitsDetails.propertySubscriptionUnits;
    // check if propertyType has no duplicate
    // identity and remove possible duplicates
    const uniquePropertyTypes: { [key: string]: SavePropertyUnitsDto } = {};
    propertyUnitsDetails.propertySubscriptionUnits =
      propertyUnitsTypesDto.filter((eachUnitTypeDto) => {
        if (eachUnitTypeDto.propertyType.trim() === '') {
          return false;
        }
        const isUnique = !uniquePropertyTypes[eachUnitTypeDto.propertyType];
        if (isUnique) {
          uniquePropertyTypes[eachUnitTypeDto.propertyType] = eachUnitTypeDto;
        }

        return isUnique;
      });

    //
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: {
          id: propertyUnitsDetails.propertySubscriptionId,
          entityProfileId,
        },
        relations: {
          propertySubscriptionUnits: {
            entitySubscriberProperty: {
              propertyType: true,
            },
          },
        },
      },
    );

    if (!propertySubscription) {
      throwBadRequest('Invalide Parameters received.');
    }

    const savedPropertyUnits = propertySubscription.propertySubscriptionUnits;

    const exitingPropertyUnitTypes: SavePropertyUnitsDto[] = [];

    const propertyUnitsToRemove: PropertySubscriptionUnit[] = [];
    const existingPropertyUnitsAndType = savedPropertyUnits.filter(
      (eachPropertyUnit) => {
        const existingUnitMatch =
          propertyUnitsDetails.propertySubscriptionUnits.findIndex(
            (eachSubcriptionUnit) =>
              eachSubcriptionUnit.propertyTypeId ===
              eachPropertyUnit.entitySubscriberProperty.propertyType.id,
          ) !== -1;

        if (!existingUnitMatch) {
          propertyUnitsToRemove.push(eachPropertyUnit);
        } else {
          const propertyUnitDto =
            propertyUnitsDetails.propertySubscriptionUnits.find(
              (eachDto) =>
                eachDto.propertyType.toLocaleLowerCase() ===
                eachPropertyUnit.entitySubscriberProperty.propertyType.name.toLocaleLowerCase(),
            );
          exitingPropertyUnitTypes.push(propertyUnitDto);
        }
        return existingUnitMatch;
      },
    );

    const newPropertyUnitsTypes =
      propertyUnitsDetails.propertySubscriptionUnits.filter(
        (eachUnitDto) =>
          exitingPropertyUnitTypes.findIndex(
            (eachUnitType) =>
              eachUnitType.propertyTypeId === eachUnitDto.propertyTypeId,
          ) === -1,
      );

    await this.dbManager.transaction(async (transactionManager) => {
      // remove associated property unit types that have been removed.
      for await (const eachPropertyUnitToRemove of propertyUnitsToRemove) {
        await this.dbManager.delete(PropertySubscriptionUnit, {
          entiySubscriberPropertyId:
            eachPropertyUnitToRemove.entiySubscriberPropertyId,
          propertySubscriptionId:
            eachPropertyUnitToRemove.propertySubscriptionId,
        });
        await this.dbManager.delete(EntitySubscriberProperty, {
          id: eachPropertyUnitToRemove.entitySubscriberProperty.id,
        });
      }

      // update the property unit for existing property unit type
      for await (const prorpertytype of exitingPropertyUnitTypes) {
        const propertyUnit = existingPropertyUnitsAndType.find(
          (eachUnit) =>
            eachUnit.entitySubscriberProperty.propertyType.name.toLocaleLowerCase() ===
            prorpertytype.propertyType.toLocaleLowerCase(),
        );

        if (propertyUnit) {
          propertyUnit.propertyUnits = Number(prorpertytype.propertyUnit);
          await this.dbManager.save(propertyUnit);
        }
      }

      for await (const propertyType of newPropertyUnitsTypes) {
        // add new property units
        // const newPropertyUnitType =
        //   propertyUnitsDetails.propertySubscriptionUnits.find(
        //     (eachUnitDto) =>
        //       eachUnitDto.propertyType === propertyType.propertyType,
        //   );

        // if (newPropertyUnitType) {
        //   newPropertyUnitsTypes.push(newPropertyUnitType);
        // }

        // create a new proeperty type
        let referencedPropertyType = await this.dbManager.findOne(
          PropertyType,
          {
            where: { id: propertyType.propertyTypeId },
          },
        );

        if (!referencedPropertyType) {
          referencedPropertyType = transactionManager.create(PropertyType, {
            name: propertyType.propertyType,
            unitPrice: propertyType.unitPrice,
            entityProfileId,
          });

          referencedPropertyType = await transactionManager.save(
            referencedPropertyType,
          );
        }

        // create entity subscriber property
        let entitySubscriberProperty = transactionManager.create(
          EntitySubscriberProperty,
          {
            ownerEntitySubscriberProfileId:
              propertySubscription.entitySubscriberProfileId,
            propertyTypeId: referencedPropertyType.id,
          },
        );

        entitySubscriberProperty = await transactionManager.save(
          entitySubscriberProperty,
        );

        // create the entity subscription property unit
        const propertySubscriptionUnit = transactionManager.create(
          PropertySubscriptionUnit,
          {
            propertySubscriptionId: propertySubscription.id,
            entiySubscriberPropertyId: entitySubscriberProperty.id,
            propertyUnits: Number(propertyType.propertyUnit),
          },
        );

        await transactionManager.save(propertySubscriptionUnit);
      }
    });
  }

  // async getPropertyTypes({ entityProfileId, queryTerm }:{entityProfileId: string, queryTerm: string}) {
  //   const propertyTypes = await this.dbManager.find(PropertyType, {
  //     where: {
  //       ...(queryTerm ? { name: ILike(`%${queryTerm}%`)} : {}),
  //       { entityProfileId}
  //     }
  //   })
  // }

  async getBillingDetailsOrDefaulters(
    entityProfileId: string,
    {
      streetId,
      billingMonth,
      billingYear = new Date().getFullYear(),
      propertySubscriptionId,
    }: {
      streetId: string;
      billingMonth?: string;
      billingYear?: number;
      propertySubscriptionId?: string;
    },
  ) {
    //
    const street = await this.getStreetOrThrowError({
      streetId,
      entityProfileId,
      throwError: true,
    });

    // TODO: validate billing month

    let billingDetails: {
      streetName: string;
      PropertySubscriptionId: string;
      propertyName: string;
      currentBilling: string;
      arrears: number;
      totalBilling?: string;
      currentBillingId?: string;
    }[] = [];
    if (!billingMonth) {
      const propertySubscriptions = await this.dbManager.find(
        PropertySubscription,
        {
          where: {
            streetId,
            billingAccount: {
              totalBillings: Raw(
                () => `"totalBillings" - "totalPayments" > '0' :: numeric`,
              ),
            },
          },
          relations: {
            billings: true,
            billingAccount: true,
          },
        },
      );

      billingDetails = propertySubscriptions.map((propertySubscription) => {
        let arrears = bignumber(
          propertySubscription.billingAccount.totalBillings,
        )
          .sub(propertySubscription.billingAccount.totalPayments)
          .toNumber();

        arrears = arrears >= 0 ? arrears : 0;
        return {
          streetName: street.name,
          PropertySubscriptionId: propertySubscription.id,
          propertyName: propertySubscription.propertySubscriptionName,
          currentBilling: propertySubscription.billings?.[0]?.amount || '0',
          currentBillingId: propertySubscription.billings?.[0]?.id || '0',
          arrears,
        };
      });
    } else {
      billingDetails = await this.dbManager
        .createQueryBuilder(PropertySubscription, 'propertySubscription')
        .select((qb) => {
          return qb
            .from(Street, 'street')
            .select('street.name', 'streetName')
            .where('street.id = :streetId', { streetId });
        }, 'streetName')
        .addSelect('propertySubscription.streetNumber', 'streetNumber')
        .addSelect('propertySubscription.id', 'propertySubscriptionId')
        .addSelect(
          'propertySubscription.propertySubscriptionName',
          'propertyName',
        )
        .addSelect(
          (qb) =>
            qb
              .from(BillingAccount, 'billingAccount')
              .select(
                `case when "billingAccount"."totalBillings" :: numeric - "billingAccount"."totalPayments" :: numeric - coalesce((
                    ${this.dbManager
                      .createQueryBuilder(Billing, 'billing')
                      .select('billing.amount', 'amount')
                      .where(`billing.month = :billingMonth`)
                      .andWhere(`billing.year = '${billingYear}'`, {
                        billingMonth,
                      })
                      .andWhere(
                        'billing.propertySubscriptionId = "propertySubscription"."id"',
                      )
                      .orderBy('billing.id', 'ASC')
                      .limit(1)
                      .getQuery()}
                  ) :: numeric, 0) > 0
                  then "billingAccount"."totalBillings" :: numeric - "billingAccount"."totalPayments" :: numeric - coalesce((
                    ${this.dbManager
                      .createQueryBuilder(Billing, 'billing')
                      .select('billing.amount', 'amount')
                      .where(`billing.month = :billingMonth`)
                      .andWhere(`billing.year = '${billingYear}'`, {
                        billingMonth,
                      })
                      .andWhere(
                        'billing.propertySubscriptionId = "propertySubscription"."id"',
                      )
                      .orderBy('billing.id', 'ASC')
                      .limit(1)
                      .getQuery()}
                  ) :: numeric, 0)
                  else 0
                  end
                  `,
                'arrears',
              )
              .where(
                `billingAccount.propertySubscriptionId = "propertySubscription"."id"`,
              ),
          'arrears',
        )
        .addSelect(
          (qb) =>
            qb
              .from(Billing, 'billing')
              .select('billing.amount', 'amount')
              .where(`billing.month = :billingMonth`)
              .andWhere(`billing.year = '${billingYear}'`, { billingMonth })
              .andWhere(
                'billing.propertySubscriptionId = "propertySubscription"."id"',
              )
              .orderBy('billing.id', 'ASC')
              .limit(1),
          'currentBilling',
        )
        .addSelect(
          (qb) =>
            qb
              .from(Billing, 'billing')
              .select('billing.id', 'id')
              .where(`billing.month = :billingMonth`)
              .andWhere(`billing.year = '${billingYear}'`, { billingMonth })
              .andWhere(
                'billing.propertySubscriptionId = "propertySubscription"."id"',
              )
              .orderBy('billing.id', 'ASC')
              .limit(1),
          'currentBillingId',
        )
        .addSelect(
          (qb) =>
            qb
              .from(BillingAccount, 'billingAccount')
              .select(
                `case when "billingAccount"."totalBillings" - "billingAccount"."totalPayments" < 0 
                    then 0
                    else "billingAccount"."totalBillings" - "billingAccount"."totalPayments"
                    end
                    `,
                'totalBilling',
              )
              .where(
                `billingAccount.propertySubscriptionId = "propertySubscription"."id"`,
              ),
          'totalBilling',
        )
        .addSelect((qb) => {
          return qb
            .from(PropertySubscriptionUnit, 'propertySubscriptionUnit')
            .select(
              `json_agg(json_build_object(
                'propertyUnits', "propertySubscriptionUnit"."propertyUnits",
                'propertyType', (select "subQuery"."propertyTypeName" from (${this.dbManager
                  .createQueryBuilder(
                    EntitySubscriberProperty,
                    'entitySubscriberProperty',
                  )
                  .select(
                    (qb) =>
                      qb
                        .from(PropertyType, 'propertyType')
                        .select('propertyType.name', 'propertyTypeName')
                        .where(
                          'propertyType.id = "entitySubscriberProperty"."propertyTypeId"',
                        ),
                    'propertyTypeName',
                  )
                  .where(
                    'entitySubscriberProperty.id = "propertySubscriptionUnit"."entiySubscriberPropertyId"',
                  )
                  .getSql()}) as "subQuery"),
              'propertyTypeUnitPrice', (select "subQuery"."unitPrice" from (${this.dbManager
                .createQueryBuilder(
                  EntitySubscriberProperty,
                  'entitySubscriberProperty',
                )
                .select(
                  (qb) =>
                    qb
                      .from(PropertyType, 'propertyType')
                      .select('propertyType.unitPrice', 'unitPrice')
                      .where(
                        'propertyType.id = "entitySubscriberProperty"."propertyTypeId"',
                      ),
                  'unitPrice',
                )
                .where(
                  'entitySubscriberProperty.id = "propertySubscriptionUnit"."entiySubscriberPropertyId"',
                )
                .getSql()}) as "subQuery")
              ))
              `,
              'propertyUnits',
            )
            .where(
              'propertySubscriptionUnit.propertySubscriptionId = "propertySubscription"."id"',
            );
        }, 'propertyUnits')
        .addSelect(
          (qb) =>
            qb
              .from(Payment, 'payment')
              .select('payment.amount')
              .where(
                'payment.propertySubscriptionId = "propertySubscription"."id"',
              )
              .orderBy('payment.createdAt', 'DESC')
              .limit(1),
          'lastPayment',
        )
        .where(
          `${'propertySubscription.streetId = :streetId'} ${
            !!propertySubscriptionId !== false
              ? 'and propertySubscription.id = :propertySubscriptionId'
              : ''
          }`,
          {
            streetId,
            billingMonth,
            ...(!!propertySubscriptionId !== false
              ? { propertySubscriptionId }
              : {}),
          },
        )
        .getRawMany();
    }

    return billingDetails
      .filter((billing) => !!billing.currentBillingId)
      .map((result) => {
        result['currentBilling'] = result['currentBilling'] || '0';
        return pick(result, [
          'streetName',
          'propertySubscriptionId',
          'propertyName',
          'arrears',
          'currentBilling',
          'currentBillingId',
          'totalBilling',
          'lastPayment',
          'propertyUnits',
          'streetNumber',
        ]);
      }) as unknown as {
      streetName: string;
      PropertySubscriptionId: string;
      propertyName: string;
      currentBilling: string;
      currentBillingId: string;
      arrears: number;
      totalBilling?: string;
    }[];
  }

  async getDashboardMetrics(entityProfileId: string, year: string) {
    // get number of streets
    // get number of subscribers
    // get number of properties

    const dashboardMetrics = {
      streetCount: 0,
      subscriberCount: 0,
      properitesCount: 0,
      totalBillings: 0,
      totalPayments: 0,
      billingAcrossMonths: [],
      paymentsAcrossMonths: [],
      year: year
    };

    try {
      dashboardMetrics.streetCount = await this.dbManager.count(Street, {
        where: {
          entityProfileId,
        },
      });
    } catch (err) {
      Logger.log('An error occured while calculating street count', err);
    }

    try {
      dashboardMetrics.subscriberCount = await this.dbManager.count(
        PropertySubscription,
        {
          where: {
            entityProfileId,
          },
        },
      );
    } catch (err) {
      Logger.log('An error occured while calculating subscriber count', err);
    }

    try {
      dashboardMetrics.properitesCount = await this.dbManager.count(
        PropertySubscriptionUnit,
        {
          where: {
            propertySubscription: {
              entityProfileId,
            },
          },
        },
      );
    } catch (err) {
      Logger.log('An error occured while calculating properites count', err);
    }

    // get total billings
    // get total payments
    const month = MonthNames[new Date().getMonth() + 1];
    try {
      const billingAcrossMonths = await this.dbManager.find(Billing, {
        where: {
          propertySubscription: {
            entityProfileId,
          },
          // year: new Date().getFullYear().toString(),   //ORIGINAL
          year: year || new Date().getFullYear().toString()git
        },
      });

      dashboardMetrics.totalBillings = billingAcrossMonths.reduce(
        (acc, curr) => {
          dashboardMetrics.billingAcrossMonths.push({
            month: curr.month,
            amount: curr.amount,
          });
          return bignumber(acc).add(curr.amount).toNumber();
        },
        0,
      );
    } catch (err) {
      Logger.log('An error occured while calculating total billings', err);
    }

    try {
      const paymentsAcrossMonths = await this.dbManager.find(Payment, {
        where: {
          propertySubscription: {
            entityProfileId,
          },
          createdAt: Raw(($alias) => `extract(month from ${$alias}) = :month`, {
            month: this.getMonthNumber(month),
          }),
        },
      });

      dashboardMetrics.totalPayments = paymentsAcrossMonths.reduce(
        (acc, curr) => {
          dashboardMetrics.paymentsAcrossMonths.push({
            month: this.getMonthName(new Date().getMonth() + 1),
            amount: curr.amount,
          });
          return bignumber(acc).add(curr.amount).toNumber();
        },
        0,
      );
    } catch (err) {
      Logger.log('An error occured while calculating total payments', err);
    }

    return dashboardMetrics;
  }

  async postPayment(postPaymentDto: PostPaymentDto, entityProfileId: string) {
    //
    const propertySubscription = await this.dbManager.findOne(
      PropertySubscription,
      {
        where: {
          id: postPaymentDto.propertySubscriptionId,
          entityProfileId,
        },
        relations: {
          billingAccount: true,
        },
      },
    );

    if (!propertySubscription) {
      throwBadRequest('Property subscription not found.');
    }

    const billingAccount = propertySubscription.billingAccount;
    const totalPayments = bignumber(billingAccount.totalPayments)
      .add(postPaymentDto.amount)
      .toNumber();

    billingAccount.totalPayments = String(totalPayments);

    await this.dbManager.transaction(async (transactionManager) => {
      const payment = transactionManager.create(Payment, {
        ...postPaymentDto,
      });

      await transactionManager.save(payment);
      await transactionManager.save(billingAccount);
    });
  }

  getMonthNumber(monthName: string) {
    const monthNumber = Object.values(MonthNames).indexOf(monthName) + 1;
    return monthNumber;
  }

  async getPayments({
    propertySubscriptionId,
    entityProfileId,
    year = new Date().getFullYear().toString(),
    month,
  }: {
    propertySubscriptionId: string;
    entityProfileId: string;
    year?: string;
    month?: string;
  }) {
    //

    let payments: Payment[] = [];
    if (month && year) {
      payments = await this.dbManager.find(Payment, {
        where: {
          ...(propertySubscriptionId ? { propertySubscriptionId } : {}),
          paymentDate: Raw(
            ($alias) => `extract(month from ${$alias}) = :month`,
            {
              month: this.getMonthNumber(month),
            },
          ),
          propertySubscription: {
            entityProfileId: entityProfileId,
          },
        },
        relations: {
          propertySubscription: true,
        },
      });
    } else {
      payments = await this.dbManager.find(Payment, {
        where: {
          propertySubscriptionId: propertySubscriptionId,
          propertySubscription: {
            entityProfileId: entityProfileId,
          },
          ...(year ? { year } : {}),
        },
        relations: {
          propertySubscription: true,
        },
      });
    }

    return payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      propertySubscriptionId: payment.propertySubscriptionId,
      payerName: payment.payerName,
      year: new Date(payment.paymentDate).getFullYear().toString(),
      month: MonthNames[new Date(payment.paymentDate).getMonth() + 1],
      propertySubscriptionName:
        payment.propertySubscription.propertySubscriptionName,
    }));
  }

  async createStreet(
    createStreetDto: CreateStreetDto,
    authPayload: AuthTokenPayload,
  ) {
    const entityProfileId = authPayload.profile.entityProfileId;
    const lgaWardId = createStreetDto.lgaWardId;

    // check if street with name already exists
    let street = await this.dbManager.findOne(Street, {
      where: {
        name: ILike(`%${createStreetDto.name}%`),
        lgaWardId,
        entityProfileId,
      },
    });

    if (!street) {
      // street does not exist, create new street

      // verify lgaWard and lga exist
      await this.getLgaWardOrThrowError({
        lgaWardId,
      });

      street = this.dbManager.create(Street, {
        name: createStreetDto.name,
        lgaWardId,
        entityProfileId,
      });

      await this.dbManager.save(street);
    }

    return street;
  }

  async createLgaWard(createLgaWardDto: CreateLgaWardDto) {
    await this.getLgaOrThrowError({ lgaId: createLgaWardDto.lgaId });
    const lgaId = createLgaWardDto.lgaId;

    // verify lgaWard does not already exist
    let lgaWard = await this.getLgaWardOrThrowError({
      name: ILike(`%${createLgaWardDto.name}%`),
      throwError: false,
    });

    if (!lgaWard) {
      lgaWard = this.dbManager.create(LgaWard, {
        name: createLgaWardDto.name,
        lgaId,
      });

      lgaWard = await this.dbManager.save(lgaWard);
    }
    return lgaWard;
  }

  async createLga(createLgaDto: CreateLgaDto) {
    // verify lga does not exist
    let lga = await this.getLgaOrThrowError({
      name: ILike(`%${createLgaDto.name}%`),
      throwError: false,
    });

    if (!lga) {
      lga = this.dbManager.create(Lga, {
        name: createLgaDto.name,
      });

      await this.dbManager.save(lga);
    }

    return lga;
  }

  async getLgas(query?: string) {
    const lgas = query
      ? await this.dbManager.find(Lga, {
          where: {
            name: ILike(`%${query}%`),
          },
        })
      : await this.dbManager.find(Lga);

    return lgas;
  }

  async getLgaWards({ query, lgaId }: { query?: string; lgaId?: string }) {
    const lgaWards =
      query || lgaId
        ? await this.dbManager.find(LgaWard, {
            where: {
              ...(query ? { name: ILike(`%${query}%`) } : {}),
              ...(lgaId ? { lgaId } : {}),
            },
          })
        : await this.dbManager.find(LgaWard);
    return lgaWards;
  }

  async getStreets(
    entityProfileId: string,
    { query, lgaWardId }: { query?: string; lgaWardId?: string },
  ) {
    const streets =
      query || lgaWardId
        ? await this.dbManager.find(Street, {
            where: {
              ...(query ? { name: ILike(`%${query}%`) } : {}),
              ...(lgaWardId ? { lgaWardId } : {}),
              entityProfileId,
            },
          })
        : await this.dbManager.find(Street, {
            where: {
              entityProfileId,
            },
          });
    return streets;
  }

  async getPhoneCode({
    query,
    phoneCodeId,
  }: { query?: string; phoneCodeId?: string } = {}) {
    if (phoneCodeId) {
      const phoneCode = await this.dbManager.findOne(PhoneCode, {
        where: { id: phoneCodeId },
      });

      return phoneCode;
    }

    const phoneCodes = query
      ? await this.dbManager.find(PhoneCode, {
          where: {
            name: ILike(`%${query}%`),
          },
        })
      : await this.dbManager.find(PhoneCode);

    return phoneCodes;
  }

  //
  async getPhoneCodeOrThrow({
    phoneCodeId,
    name,
    throwError = true,
  }: { phoneCodeId?: string; name?: string; throwError?: boolean } = {}) {
    const phoneCode = await this.dbManager.findOne(PhoneCode, {
      where: {
        ...(phoneCodeId ? { id: phoneCodeId } : { name: ILike(`%${name}%`) }),
      },
    });

    throwError = !phoneCode && throwError;
    if (throwError) {
      throwBadRequest('Phone code not found.');
    }
    return phoneCode;
  }

  async getLgaWardOrThrowError({
    name,
    lgaWardId,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    lgaWardId?: string;
    throwError?: boolean;
  }) {
    const lgaWard = await this.dbManager.findOne(LgaWard, {
      where: {
        ...(name ? { name } : { id: lgaWardId }),
      },
    });

    throwError = !lgaWard && throwError;
    if (throwError) {
      throwBadRequest('Lga ward not found.');
    }

    return lgaWard;
  }

  async getLgaOrThrowError({
    name,
    lgaId,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    lgaId?: string;
    throwError?: boolean;
  }) {
    const lga = await this.dbManager.findOne(Lga, {
      where: {
        ...(name ? { name } : { id: lgaId }),
      },
    });

    throwError = !lga && throwError;
    if (throwError) {
      throwBadRequest('Lga not found.');
    }

    return lga;
  }

  getMonthName(month?: number) {
    if (!month) {
      month = new Date().getMonth() + 1;
    }

    return MonthNames[month];
  }

  async validateEntitySubscriberProfileById(
    propertySubscriberProfileId: string,
  ) {
    const propertySubscriberProfile = await this.dbManager.findOne(
      EntitySubscriberProfile,
      {
        where: {
          id: propertySubscriberProfileId,
        },
      },
    );

    if (!propertySubscriberProfile) {
      throwBadRequest('Reference to subscriber is invalid.');
    }

    return !!propertySubscriberProfile;
  }

  async getPropertyTypeOrThrowError({
    name,
    propertyTypeId,
    unitPrice,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    propertyTypeId?: string;
    unitPrice?: string;
    throwError?: boolean;
  }) {
    const propertyType = await this.dbManager.findOne(PropertyType, {
      where: {
        ...(name ? { name, unitPrice } : { id: propertyTypeId }),
      },
    });

    throwError = !propertyType && throwError;
    if (throwError) {
      throwBadRequest('Reference to property type is invalid.');
    }

    return propertyType;
  }

  async getStreetOrThrowError({
    name,
    streetId,
    entityProfileId,
    throwError = true,
  }: {
    name?: string | FindOperator<string>;
    streetId?: string;
    entityProfileId?: string;
    throwError?: boolean;
  }) {
    const street = await this.dbManager.findOne(Street, {
      where: {
        ...(name ? { name } : { id: streetId }),
        ...(entityProfileId ? { entityProfileId } : {}),
      },
    });

    throwError = !street && throwError;
    if (throwError) {
      throwBadRequest('Reference to street is invalid.');
    }

    return street;
  }

  async createNewPayment({
    dbManager,
    comments,
    propertySubscriptionId,
    amount,
    payerName,
    paymentDate,
  }: {
    amount: string;
    payerName: string;
    paymentDate: Date;
    propertySubscriptionId: string;
    dbManager: EntityManager;
    comments?: string;
  }) {
    let newPayment = dbManager.create(Payment, {
      amount,
      payerName,
      comments,
      propertySubscriptionId,
      paymentDate,
    });

    newPayment = await this.dbManager.save(newPayment);
    return newPayment;
  }

  // webhook handles
  async handleWebhookEvent({
    eventData,
    webhookSignature,
  }: {
    eventData: PaystackWebhookEventObject;
    webhookSignature: string;
  }) {
    // validate webhook event data
    const isValid = await this.paystackService.validatePaystackWebhookEvent(
      webhookSignature,
      eventData,
    );
    if (!isValid) {
      return;
    }

    // check transaction is status is success
    const transactionIsSuccessful = eventData.data.status === 'success';
    if (!transactionIsSuccessful) {
      return;
    }

    const eventHandlers: {
      [key in PaystackWebhookEvents]?: (
        eventData: Record<string, unknown>,
        ...rest: any
      ) => Promise<void>;
    } = {
      'charge.success': this.chargeSuccess,
    };

    const event = eventData?.event;

    const handler = eventHandlers[eventData.event];
    await handler?.(eventData.data);
  }

  private async chargeSuccess(data: PaystackWebhookData) {
    // find receiving_bank_account_number in the authorization object
    // process virtual account payment
    const isVirtualBankAccountPayment =
      this.paystackService.checkIsVirtualBankAccoountPayment(data);
    if (isVirtualBankAccountPayment) {
      // fetch payers record
      const payingSubscriberAccountDetail = await this.dbManager.findOne(
        SubscriberVirtualAccountDetail,
        {
          where: {
            account_number: data.authorization.receiver_bank_account_number,
            bank: data.authorization.receiver_bank,
          },
          relations: {
            propertySubscription: true,
          },
        },
      );

      await this.createNewPayment({
        dbManager: this.dbManager,
        comments: 'Bank Transfer Automation',
        amount: String(data.amount),
        paymentDate: new Date(),
        propertySubscriptionId:
          payingSubscriberAccountDetail.propertySubscriptionId,
        payerName:
          payingSubscriberAccountDetail.propertySubscription
            ?.propertySubscriptionName ||
          payingSubscriberAccountDetail.account_name,
      });

      // add payment to operators wallet
      const adminUser = await this.dbManager.findOne(ProfileCollection, {
        where: {
          profileType: ProfileTypes.ENTITY_USER_PROFILE,
          isAdmin: true,
        },
      });

      const adminUserId = adminUser.userId;
      // check operator has wallet else create new wallet
      let operatorsWalletRef = await this.dbManager.findOne(WalletReference, {
        where: {
          authenticatedUserId: adminUserId,
          isCompanyWallet: true,
        },
      });

      // credit operator's wallet
      const walletRef = operatorsWalletRef?.publicReference;
      if (!walletRef) {
        // create new wallet
        operatorsWalletRef = await this.walletService.createWallet({
          user_id: adminUserId,
          dbManager: this.dbManager,
        });
      }

      // credit wallet
      await this.walletService.creditWallet({
        public_id: operatorsWalletRef.publicReference,
        user_id: operatorsWalletRef.authenticatedUserId,
        amount: String(data.amount),
        credit_source_data: JSON.stringify({ PAYSTACK: data }),
      });

      // register sms for operator
      // register sms for subscriber user
    } else {
      // TODO: handle case
    }
  }
}
