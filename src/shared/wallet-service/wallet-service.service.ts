import { Injectable } from '@nestjs/common';
import { RequestService } from '../request/request.service';
import { sucessHttpCodes } from '@/src/lib/projectConstants';
import WalletReference from '@/src/utils-billing/entitties/walletReference.entity';
import { Currency } from '@/src/utils-billing/entitties/currency.entity';
import { EntityManager } from 'typeorm';
import {
  Wallet_Service_Credit_Source_Type,
  Wallet_Service_Transaction_Type,
} from '@/src/lib/enums';

@Injectable()
export class WalletServiceService {
  constructor(private readonly requestService: RequestService) {}

  async createWallet({
    user_id,
    dbManager,
  }: {
    user_id: string;
    dbManager: EntityManager;
  }) {
    const serverResponse = await this.requestService.requestApiService(
      '/wallet',
      {
        body: {
          user_id,
        },
        method: 'POST',
      },
    );

    if (sucessHttpCodes.includes(serverResponse.status)) {
      const newWallet = serverResponse.data as {
        name: string;
        public_id: string;
        status: 'active' | 'inactive';
        currency: string;
        balance: string;
      };

      return await this.createWalletReference({
        dbManager,
        authenticatedUserId: user_id,
        currency: newWallet.currency,
        publicReference: newWallet.public_id,
      });
    }
  }

  async createWalletReference({
    dbManager,
    authenticatedUserId,
    publicReference,
    currency,
  }: {
    dbManager: EntityManager;
    authenticatedUserId: string;
    publicReference: string;
    currency: string;
  }) {
    const walletCurrency = await dbManager.findOne(Currency, {
      where: {
        name: currency,
      },
    });

    let newWalletReference = dbManager.create(WalletReference, {
      publicReference,
      authenticatedUserId,
      isCompanyWallet: true,
      currencyId: walletCurrency.id,
    });

    newWalletReference = await dbManager.save(newWalletReference);
    return newWalletReference;
  }

  async creditWallet({
    public_id,
    user_id,
    amount,
    credit_source_data,
  }: {
    public_id: string;
    user_id: string;
    amount: string;
    credit_source_data: string;
  }) {
    const serverResponse = await this.requestService.requestApiService(
      '/wallet',
      {
        body: {
          public_id,
          user_id,
          amount,
          credit_source_data,
          credit_source_type: Wallet_Service_Credit_Source_Type.BANK,
          type: Wallet_Service_Transaction_Type.CREDIT,
        },
        method: 'PUT',
      },
    );

    // todo: handle possible errors
  }
}
