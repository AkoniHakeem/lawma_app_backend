// import { Test, TestingModule } from '@nestjs/testing';
// import { UtilsBillingService } from './utils-billing.service';
// import { SubscriberProfileRoleEnum } from '../lib/enums';
// import { PropertySubscriptionUnit } from './entitties/PropertySubscriptionUnit.entity';
// import { Billing } from './entitties/billing.entity';
// import { BillingAccount } from './entitties/billingAccount.entity';
// import { EntitySubscriberProperty } from './entitties/entitySubscriberProperty.entity';
// import { PropertySubscription } from './entitties/propertySubscription.entity';

// describe('UtilsBillingService', () => {
//   let service: UtilsBillingService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UtilsBillingService],
//     }).compile();

//     service = module.get<UtilsBillingService>(UtilsBillingService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   it('should create a new property subscription', async () => {
//     // Mock input data
//     const createSubscriptionDto = {
//       streetId: '123',
//       propertyTypeId: '456',
//       oldCode: '789',
//       propertySubscriberProfileId: 'abc',
//       propertyName: 'Test Property',
//       streetNumber: '123',
//       isOwner: true,
//       propertyUnit: 1,
//     };
//     const authPayload = {
//       profile: {
//         entityProfileId: 'def',
//       },
//     };

//     // Mock database manager
//     const dbManager = {
//       findOne: jest.fn().mockResolvedValue(null),
//       create: jest.fn().mockReturnValue({ id: 'xyz' }),
//       save: jest.fn().mockResolvedValue({ id: 'xyz' }),
//       transaction: jest.fn().mockImplementation(async (callback) => {
//         await callback(dbManager);
//       }),
//     };
//     // const service = new UtilsBillingService(dbManager);
//     // Create instance of UtilsBillingService with mocked database manager

//     // Call createPropertySubscription function
//     await service.createPropertySubscription(
//       createSubscriptionDto,
//       authPayload,
//     );

//     // Verify that the necessary functions were called with the correct arguments
//     expect(dbManager.findOne).toHaveBeenCalledWith(PropertySubscription, {
//       where: {
//         oldCode: createSubscriptionDto.oldCode,
//       },
//     });
//     expect(dbManager.create).toHaveBeenCalledWith(EntitySubscriberProperty, {
//       propertyTypeId: createSubscriptionDto.propertyTypeId,
//       ownerEntitySubscriberProfileId:
//         createSubscriptionDto.propertySubscriberProfileId,
//     });
//     expect(dbManager.save).toHaveBeenCalledWith(
//       expect.objectContaining({
//         propertySubscriptionName: createSubscriptionDto.propertyName,
//         oldCode: createSubscriptionDto.oldCode,
//         streetNumber: createSubscriptionDto.streetNumber,
//         streetId: createSubscriptionDto.streetId,
//         entitySubscriberProfileId:
//           createSubscriptionDto.propertySubscriberProfileId,
//         subscriberProfileRole: SubscriberProfileRoleEnum.OWNER,
//         entityProfileId: authPayload.profile.entityProfileId,
//       }),
//     );
//     expect(dbManager.save).toHaveBeenCalledWith(
//       expect.objectContaining({
//         propertySubscriptionId: 'xyz',
//         entiySubscriberPropertyId: 'xyz',
//         propertyUnits: createSubscriptionDto.propertyUnit,
//       }),
//     );
//     expect(dbManager.save).toHaveBeenCalledWith(
//       expect.objectContaining({
//         propertySubscriptionId: 'xyz',
//       }),
//     );
//   });

//   it('should throw an error for existing old code', async () => {
//     // Mock input data
//     const createSubscriptionDto = {
//       streetId: '123',
//       propertyTypeId: '456',
//       oldCode: '789',
//       propertySubscriberProfileId: 'abc',
//       propertyName: 'Test Property',
//       streetNumber: '123',
//       isOwner: true,
//       propertyUnit: 1,
//     };
//     const authPayload = {
//       profile: {
//         entityProfileId: 'def',
//       },
//     };

//     // Mock database manager
//     const dbManager = {
//       findOne: jest.fn().mockResolvedValue({}),
//     };

//     // Create instance of UtilsBillingService with mocked database manager
//     // const service = new UtilsBillingService(dbManager);

//     // Call createPropertySubscription function and expect it to throw an error
//     await expect(
//       service.createPropertySubscription(createSubscriptionDto, authPayload),
//     ).rejects.toThrow('Old code supplied has been used.');

//     // Verify that the necessary functions were called with the correct arguments
//     expect(dbManager.findOne).toHaveBeenCalledWith(PropertySubscription, {
//       where: {
//         oldCode: createSubscriptionDto.oldCode,
//       },
//     });
//   });

//   it('should generate a billing', async () => {
//     // Mock input data
//     const propertySubscriptionId = '123';

//     // Mock database manager
//     const dbManager = {
//       findOne: jest.fn().mockResolvedValue({ id: propertySubscriptionId }),
//       create: jest.fn().mockReturnValue({}),
//       save: jest.fn().mockResolvedValue({}),
//       transaction: jest.fn().mockImplementation(async (callback) => {
//         await callback(dbManager);
//       }),
//       find: jest.fn().mockResolvedValue({
//         id: propertySubscriptionId,
//         propertyUnits: [
//           {
//             id: '123',
//             billing: {
//               id: '456',
//             },
//           },
//         ],
//       }),
//     };

//     // Create instance of UtilsBillingService with mocked database manager
//     // const service = new UtilsBillingService(dbManager);

//     // Call generateBilling function
//     await service.generateMonthBilling(propertySubscriptionId);

//     // Verify that the necessary functions were called with the correct arguments
//     expect(dbManager.findOne).toHaveBeenCalledWith(PropertySubscription, {
//       where: {
//         id: propertySubscriptionId,
//       },
//     });
//     expect(dbManager.findOne).toHaveBeenCalledWith(BillingAccount, {
//       where: {
//         propertySubscriptionId,
//       },
//     });
//     expect(dbManager.findOne).toHaveBeenCalledWith(Billing, {
//       where: {
//         propertySubscriptionId,
//         month: expect.any(String),
//         year: expect.any(String),
//       },
//     });
//     expect(dbManager.find).toHaveBeenCalledWith(PropertySubscriptionUnit, {
//       where: {
//         propertySubscriptionId,
//       },
//       relations: {
//         entitySubscriberProperty: {
//           propertyType: true,
//         },
//       },
//     });
//     expect(dbManager.create).toHaveBeenCalledWith(Billing, {
//       propertySubscriptionId,
//       month: expect.any(String),
//       year: expect.any(String),
//       amount: expect.any(String),
//     });
//     expect(dbManager.save).toHaveBeenCalledWith(
//       expect.objectContaining({
//         propertySubscriptionId,
//         month: expect.any(String),
//         year: expect.any(String),
//         amount: expect.any(String),
//       }),
//     );
//     expect(dbManager.save).toHaveBeenCalledWith(
//       expect.objectContaining({
//         totalBillings: expect.any(String),
//       }),
//     );
//   });

//   it('should throw an error for already generated billing', async () => {
//     // Mock input data
//     const propertySubscriptionId = '123';

//     // Mock database manager
//     const dbManager = {
//       findOne: jest.fn().mockResolvedValue({ id: propertySubscriptionId }),
//     };

//     // Create instance of UtilsBillingService with mocked database manager
//     // const service = new UtilsBillingService(dbManager);

//     // Call generateBilling function and expect it to throw an error
//     await expect(
//       service.generateMonthBilling(propertySubscriptionId),
//     ).rejects.toThrow('Billing already generated.');

//     // Verify that the necessary functions were called with the correct arguments
//     expect(dbManager.findOne).toHaveBeenCalledWith(PropertySubscription, {
//       where: {
//         id: propertySubscriptionId,
//       },
//     });
//     expect(dbManager.findOne).toHaveBeenCalledWith(BillingAccount, {
//       where: {
//         propertySubscriptionId,
//       },
//     });
//     expect(dbManager.findOne).toHaveBeenCalledWith(Billing, {
//       where: {
//         propertySubscriptionId,
//         month: expect.any(String),
//         year: expect.any(String),
//       },
//     });
//   });
// });


// import { Test, TestingModule } from '@nestjs/testing';
// import { UtilsBillingService } from './utils-billing.service';
// import { PropertySubscription } from './entitties/propertySubscription.entity';
// import { Billing } from './entitties/billing.entity';
// import { SubscriberProfileRoleEnum } from '../lib/enums';
// import { In } from 'typeorm';

// describe('UtilsBillingService', () => {
//   let service: UtilsBillingService;
//   let dbManager: any; // Mocked dbManager

//   beforeEach(async () => {
//     // Create a testing module and mock the dbManager
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UtilsBillingService,
//         {
//           provide: 'DbManager',
//           useValue: {
//             count: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     // Get the service and the mocked dbManager
//     service = module.get<UtilsBillingService>(UtilsBillingService);
//     dbManager = module.get('DbManager');
//   });

//   it('should count only ENTITY_SUBSCRIBER_PROFILE subscribers and all billings', async () => {
//     // Mock the count method of dbManager
//     dbManager.count.mockResolvedValueOnce(1200)  // Mock subscriber count
//       .mockResolvedValueOnce(3500);  // Mock billing count

//     // Call the method to test
//     const result = await service.getSubscriberAndBillingCounts();

//     // Assertions for the return values
//     expect(result).toEqual({
//       subscriberCount: 1200,
//       billingCount: 3500,
//     });

//     // Ensure dbManager.count was called with the correct arguments
//     expect(dbManager.count).toHaveBeenCalledWith(PropertySubscription, {
//       where: {
//         subscriberProfileRole: In([SubscriberProfileRoleEnum.OWNER, SubscriberProfileRoleEnum.CUSTODIAN]),
//       },
//     });
//     expect(dbManager.count).toHaveBeenCalledWith(Billing);
//     expect(dbManager.count).toHaveBeenCalledTimes(2); // Ensures count was called twice
//   });

//   // Additional test case: for error handling or edge cases
//   it('should handle errors gracefully when fetching counts', async () => {
//     // Mock the count method to throw an error
//     dbManager.count.mockRejectedValueOnce(new Error('Database error'));

//     // Call the method and check for error handling (assuming the method returns 0 in case of errors)
//     const result = await service.getSubscriberAndBillingCounts();

//     // Assertions to check that errors do not crash the method and default values are returned
//     expect(result).toEqual({
//       subscriberCount: 0,
//       billingCount: 0,
//     });

//     // Ensure dbManager.count was called and caught the error
//     expect(dbManager.count).toHaveBeenCalledWith(PropertySubscription, {
//       where: {
//         subscriberProfileRole: In([SubscriberProfileRoleEnum.OWNER, SubscriberProfileRoleEnum.CUSTODIAN]),
//       },
//     });
//   });
// });
