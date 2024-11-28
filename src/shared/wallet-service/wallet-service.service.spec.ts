import { Test, TestingModule } from '@nestjs/testing';
import { WalletServiceService } from './wallet-service.service';

describe('WalletServiceService', () => {
  let service: WalletServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WalletServiceService],
    }).compile();

    service = module.get<WalletServiceService>(WalletServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
