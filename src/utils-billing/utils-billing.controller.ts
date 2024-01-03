import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsEntityUserAdmin } from '../shared/isEntityUserAdmin.guard';
import { GetAuthPayload } from '../shared/getAuthenticatedUserPayload.decorator';
import { AuthTokenPayload } from '../lib/types';
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
  GeneratePrintBillingDto,
} from './dtos/dto';
import { UtilsBillingService } from './utils-billing.service';
import { IsAuthenticated } from '../shared/isAuthenticated.guard';
import { query } from 'express';
import { ProfileTypes } from '../lib/enums';

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
      getSubscriptionQuery,
    );
  }

  @Post('billing')
  @UseGuards(IsAuthenticated)
  async generatePrintBilling(
    @Body() generatePrintBillingDto: GeneratePrintBillingDto,
    @GetAuthPayload() authPayload: AuthTokenPayload,
  ) {
    await this.utilService.generatePrintBilling(
      generatePrintBillingDto,
      authPayload.profile.entityProfileId,
    );
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
}
