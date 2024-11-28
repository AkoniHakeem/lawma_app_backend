import { Test, TestingModule } from '@nestjs/testing';
import { PaystackServiceService } from './paystack_service.service';

describe('PaystackServiceService', () => {
  let service: PaystackServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaystackServiceService],
    }).compile();

    service = module.get<PaystackServiceService>(PaystackServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
