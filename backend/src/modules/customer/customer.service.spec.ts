import { Test, TestingModule } from '@nestjs/testing';
import { CustomerService } from './customer.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prisma: PrismaService;

  const mockPrismaService = {
    customer: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated customers', async () => {
      const mockCustomers = [
        { id: '1', name: 'Customer 1', tenantId: 'tenant1', createdAt: new Date(), updatedAt: new Date() },
        { id: '2', name: 'Customer 2', tenantId: 'tenant1', createdAt: new Date(), updatedAt: new Date() },
      ];

      mockPrismaService.customer.findMany.mockResolvedValue(mockCustomers);
      mockPrismaService.customer.count.mockResolvedValue(2);

      const result = await service.findAll('tenant1', 1, 20);

      expect(result.data).toEqual(mockCustomers);
      expect(result.meta.total).toBe(2);
      expect(prisma.customer.findMany).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    it('should create a customer', async () => {
      const createDto = { name: 'New Customer', description: 'Test description' };
      const mockCustomer = { id: '1', ...createDto, tenantId: 'tenant1', createdAt: new Date(), updatedAt: new Date() };

      mockPrismaService.customer.create.mockResolvedValue(mockCustomer);

      const result = await service.create('tenant1', createDto);

      expect(result).toEqual(mockCustomer);
      expect(prisma.customer.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          tenantId: 'tenant1',
        },
      });
    });
  });
});
