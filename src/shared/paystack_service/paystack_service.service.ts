import { Injectable } from '@nestjs/common';
import { RequestService } from '../request/request.service';
import { ConfigService } from '@nestjs/config';
import {
  DedicatedVirtualAccountUserData,
  PaystackCustomer,
  PaystackWebhookData,
} from '@/src/lib/types';
import { PAYSTACK_SECRET_ENV } from '@/src/lib/projectConstants';
import { createHmac } from 'crypto';

@Injectable()
export class PaystackServiceService {
  constructor(
    private readonly requestService: RequestService,
    private configService: ConfigService,
  ) {
    this.requestService.baseURL = 'https://api.paystack.co';
    this.paystack_secret = this.configService.getOrThrow(PAYSTACK_SECRET_ENV);
  }

  paystack_secret: string;

  /**
   * Gets basic request headers. Whether or not additonal headers are passed in,
   * an header object that includes authorization and content-type are returned
   * @param additionalHeaders Additional headers to pass in.
   * You may also override the authorization and content-type headers.
   * @returns Header object with at least the authorization and content-type.
   */
  private getHeaders(additionalHeaders?: Record<string, unknown>) {
    return {
      Authorization: `Bearer ${this.paystack_secret}`,
      'Content-Type': 'application/json',
      ...(additionalHeaders ? additionalHeaders : {}),
    };
  }

  async validatePaystackWebhookEvent(
    webhookSignature: string,
    eventData: Record<string, unknown>,
  ) {
    const paystack_secret = this.configService.get(PAYSTACK_SECRET_ENV);
    const hash = createHmac('sha512', paystack_secret)
      .update(JSON.stringify(eventData))
      .digest('hex');
    const isValid = hash === webhookSignature;
    return isValid;
  }

  async checkIsVirtualBankAccoountPayment(data: PaystackWebhookData) {
    const receivingBank = data.authorization.receiver_bank;
    const receivingBankAccount =
      data.authorization.receiver_bank_account_number;
    const isVirtualBankAccountPayment =
      !!receivingBank && !!receivingBankAccount;
    return isVirtualBankAccountPayment;
  }

  async createDedicatedVirtualAccount(
    dvaUserData: DedicatedVirtualAccountUserData,
  ) {
    const api_path = '/dedicated_account/assign';
    return (await this.requestService
      .setup(api_path, this.getHeaders())
      .send('POST', dvaUserData)) as {
      data: { account_name: string; account_number: string } & Record<
        string,
        unknown
      >;
    } & Record<string, unknown>;
  }

  async createCustomer(userData: PaystackCustomer) {
    const api_path = '/customers';
    return (await this.requestService
      .setup(api_path, this.getHeaders())
      .send('POST', userData)) as {
      data: { customer_code: string } & Record<string, unknown>;
    } & Record<string, unknown>;
  }
}
