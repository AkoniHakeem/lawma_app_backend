import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { IsEntityUserAdmin } from '../shared/isEntityUserAdmin.guard';
import { GetAuthPayload } from '../shared/getAuthenticatedUserPayload.decorator';
import { AuthTokenPayload, PaystackWebhookEventObject } from '../lib/types';
import {
  CreateLgaDto,
  CreateLgaWardDto,
  CreatePropertyTypesDto,
  CreateStreetDto,
  CreateSubscriptionDto,
  CreateUserDto,
  GetLgaQuery,
  GetLgaWardQuery,
  GetStreetQuery,
  GetPropertyTypeQuery,
  GetPhoneCodesQuery,
  GetSubscriptionQuery,
  GenerateBillingDto,
  GetPaymentsQuery,
  GetBillingQuery,
  PostPaymentDto,
  SavePropertyUnitsDetailsDto,
  UpdateAccontRecordDto,
  UpdatePropertyNameDto,
} from './dtos/dto';
import { UtilsBillingService } from './utils-billing.service';
import { IsAuthenticated } from '../shared/isAuthenticated.guard';
import { ProfileTypes } from '../lib/enums';
import { UpdatePropertySubscriptionValidationPipe } from './dtos/custom-pipes';

@Controller('utils-billing')
export class UtilsBillingController {
  constructor(private utilService: UtilsBillingService) {
    //
  }

  // create user
  // would create both entity user and subscriber user
  // differentiate with a flag
  @Post('user')
  @UseGuards(new IsEntityUserAdmin())
  async createUser(
    @Body() createUserDto: CreateUserDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.createUser(createUserDto, authPayload);
  }

  @Post('subscriber-user')
  @UseGuards(IsAuthenticated)
  async createSubscriberUser(
    @Body() createUserDto: CreateUserDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    // update the profileType
    createUserDto.profileType = ProfileTypes.ENTITY_SUBSCRIBER_PROFILE;
    await this.utilService.createUser(createUserDto, authPayload);
  }

  @Get('subscriber-user')
  @UseGuards(IsAuthenticated)
  async getSubscriberUser(@GetAuthPayload() authPayload: AuthTokenPayload) {
    //
    return await this.utilService.getEntityUserSubscriber(
      authPayload.profile.entityProfileId,
    );
  }

  @Post('subscription')
  @UseGuards(new IsEntityUserAdmin())
  async createSubscription(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    await this.utilService.createPropertySubscription(
      createSubscriptionDto,
      authPayload,
    );
  }

  @Get('subscription')
  @UseGuards(IsAuthenticated)
  async getSubscriptions(
    @Query() getSubscriptionQuery: GetSubscriptionQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    return await this.utilService.getSubscriptions(
      authPayload.profile.entityProfileId,
      {
        rowsPerPage: Number(getSubscriptionQuery.rowsPerPage || 10),
        page: Number(getSubscriptionQuery.page || 1),
        descending: JSON.parse(getSubscriptionQuery.descending || 'false'),
        filter: getSubscriptionQuery.filter,
        sortBy: getSubscriptionQuery.sortBy,
        streetId: getSubscriptionQuery.streetId,
      },
    );
  }

  @Get('subscription/details')
  @UseGuards(IsAuthenticated)
  async getSubscriptionDetails(
    @Query() query: Record<string, string>,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getSubscriptionDetails(
      authPayload.profile.entityProfileId,
      query.propertySubscriptionId,
    );
  }

  @Put('subscription/property-units')
  @UseGuards(IsAuthenticated)
  async savePropertyUnits(
    @GetAuthPayload() authPayload: AuthTokenPayload,
    @Body() propertyUnits: SavePropertyUnitsDetailsDto,
  ) {
    await this.utilService.savePropertyUnits(
      authPayload.profile.entityProfileId,
      propertyUnits,
    );

    return;
  }

  @Put('subscription/:action')
  @UseGuards(IsAuthenticated)
  async updateSubscriptionDetails(
    @Param('action') param: string,
    @Body(UpdatePropertySubscriptionValidationPipe)
    body: UpdatePropertyNameDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    await this.utilService.updatePropertySubscriptionName({
      name: body.propertySubscriptionName,
      propertySubscriptionId: body.propertySubscriptionId,
      entityProfileId: authPayload.profile.entityProfileId,
    });
  }

  @Post('billing')
  @UseGuards(IsAuthenticated)
  async generateBilling(
    @Body() generateBillingDto: GenerateBillingDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.generateBilling(
      generateBillingDto,
      authPayload.profile.entityProfileId,
    );
  }

  @Get('billing')
  @UseGuards(IsAuthenticated)
  async getBilling(
    @Query() getBillingQuery: GetBillingQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getBilling(
      getBillingQuery,
      authPayload.profile.entityProfileId,
    );
  }

  @Delete('billing')
  @UseGuards(IsAuthenticated)
  async deleteBilling(
    @Query('billingId') billingId: string,
    @GetAuthPayload() authTokenPayload: AuthTokenPayload,
  ) {
    await this.utilService.deleteBilling({
      billingId,
      entityProfileId: authTokenPayload.profile.entityProfileId,
    });
  }

  @Put('billing/account')
  @UseGuards(IsAuthenticated)
  async updateAccountRecord(
    @Body() updateAccountRecordDto: UpdateAccontRecordDto,
    @GetAuthPayload() authTokenPayload: AuthTokenPayload,
  ) {
    await this.utilService.updateAccountRecord({
      billingArrears: updateAccountRecordDto.arrears,
      propertySubscriptionId: updateAccountRecordDto.propertySubscriptionId,
      entityProfileId: authTokenPayload.profile.entityProfileId,
      entityUserProfileId: authTokenPayload.profile.id,
      reason: updateAccountRecordDto.reason,
    });
  }

  @Get('billing/account/arrears')
  @UseGuards(IsAuthenticated)
  async getBillingAccountArrears(
    @Query() query: { page: number; limit: number },
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getBillingAccountArrears(
      authPayload.profile.entityProfileId,
      query,
    );
  }

  @Get('billing/account/street/:streetId/defaulter')
  @UseGuards(IsAuthenticated)
  async getBillingPaymentDefaulters(
    @Param('streetId') streetId: string,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getBillingDetailsOrDefaulters(
      authPayload.profile.entityProfileId,
      { streetId },
    );
  }

  @Get('billing/account/street/:streetId/detail')
  @UseGuards(IsAuthenticated)
  async getBillingDetails(
    @Param('streetId') streetId: string,
    @Query()
    {
      billingMonth,
      propertySubscriptionId,
    }: { billingMonth: string; propertySubscriptionId: string },
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getBillingDetailsOrDefaulters(
      authPayload.profile.entityProfileId,
      { streetId, billingMonth, propertySubscriptionId },
    );
  }

  @Post('payment')
  @UseGuards(IsAuthenticated)
  async postPayment(
    @Body() postPaymentDto: PostPaymentDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.postPayment(
      postPaymentDto,
      authPayload.profile.entityProfileId,
    );
  }

  @Get('payment')
  @UseGuards(IsAuthenticated)
  async getPayments(
    @Query()
    query: GetPaymentsQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return this.utilService.getPayments({
      ...query,
      entityProfileId: authPayload.profile.entityProfileId,
    });
  }

  @Post('lga')
  @UseGuards(IsAuthenticated)
  async createLga(@Body() createLgaDto: CreateLgaDto) {
    //
    await this.utilService.createLga(createLgaDto);
  }

  @Get('lga')
  @UseGuards(IsAuthenticated)
  async getLga(@Query() query: GetLgaQuery) {
    //
    return await this.utilService.getLgas(query.name);
  }

  @Post('lga-ward')
  @UseGuards(IsAuthenticated)
  async createLgaWard(@Body() createLgaWardDto: CreateLgaWardDto) {
    await this.utilService.createLgaWard(createLgaWardDto);
  }

  @Get('lga-ward')
  @UseGuards(IsAuthenticated)
  async getLgaWard(@Query() query: GetLgaWardQuery) {
    return await this.utilService.getLgaWards({ ...query });
  }

  @Post('street')
  @UseGuards(IsAuthenticated)
  async createStreet(
    @Body() createStreetDto: CreateStreetDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.createStreet(createStreetDto, authPayload);
  }

  @Get('street')
  @UseGuards(IsAuthenticated)
  async getStreet(
    @Query() query: GetStreetQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getStreets(
      authPayload.profile.entityProfileId,
      {
        ...query,
      },
    );
  }

  @Post('property-type')
  @UseGuards(IsAuthenticated)
  async createPropertyType(
    @Body() createPropertyTypeDto: CreatePropertyTypesDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    //
    await this.utilService.createPropertyType(
      createPropertyTypeDto,
      authPayload.profile.entityProfileId,
    );
  }

  @Get('property-type')
  @UseGuards(IsAuthenticated)
  async getPropertyTypes(
    @Query() query: GetPropertyTypeQuery,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    return await this.utilService.getPropertyTypes(
      authPayload.profile.entityProfileId,
      { ...query },
    );
  }

  @Get('phone-code')
  @UseGuards(IsAuthenticated)
  async getPhoneCodes(@Query() query: GetPhoneCodesQuery) {
    return await this.utilService.getPhoneCode(query);
  }

  @Get('/dashboard/metrics')
  @UseGuards(IsAuthenticated)
  async getDashboardMetrics(@GetAuthPayload() authPayload: AuthTokenPayload) {
    return await this.utilService.getDashboardMetrics(
      authPayload.profile.entityProfileId,
    );
  }

  @Get('operator/metrics')
  async getMetrics(@GetAuthPayload() authPayload: AuthTokenPayload['profile']) {
    return await this.utilService.getOperatorMetrics(
      authPayload.entityProfileId,
    );
  }

  // webhooks
  @Post('paystack')
  async handlePaystackWebhookEvents(
    @Body() eventData: PaystackWebhookEventObject,
    @Headers('x-paystack-signature') webhookSignature: string,
  ) {
    await this.utilService.handleWebhookEvent({
      eventData: eventData,
      webhookSignature,
    });
  }
}
