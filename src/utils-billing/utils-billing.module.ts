import { Module } from '@nestjs/common';
import { UtilsBillingController } from './utils-billing.controller';
import { UtilsBillingService } from './utils-billing.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [UtilsBillingController],
  providers: [UtilsBillingService],
})
export class UtilsBillingModule {}
