import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class WalletEvents {
  @OnEvent('wallet.credit')
  async creditWallet(eventData) {}
}
