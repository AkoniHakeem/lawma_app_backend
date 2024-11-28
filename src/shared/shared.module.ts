import { Module } from '@nestjs/common';
import { SharedService } from './shared.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RequestService } from './request/request.service';
import { HelpersService } from './helpers/helpers.service';
import { ProfileService } from './profile/profile.service';
import { HttpModule } from '@nestjs/axios';
import { PaystackServiceService } from './paystack_service/paystack_service.service';
import { WalletServiceService } from './wallet-service/wallet-service.service';
@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      async useFactory(configService: ConfigService) {
        await ConfigModule.envVariablesLoaded;

        return {
          signOptions: {
            expiresIn: configService.get('app.JWT_EXPIRY', '8h'),
          },
          secret: configService.get('app.JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
    HttpModule,
  ],
  providers: [
    SharedService,
    JwtService,
    RequestService,
    HelpersService,
    ProfileService,
    PaystackServiceService,
    WalletServiceService,
  ],
  exports: [
    SharedService,
    JwtService,
    HelpersService,
    ProfileService,
    RequestService,
    PaystackServiceService,
    WalletServiceService,
  ],
})
export class SharedModule {}
