import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('RPO-SaaS API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let tenantId: string;
  let customerId: string;
  let jobId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Authentication', () => {
    it('POST /api/auth/register - should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
          tenantSlug: 'test-company',
          tenantName: 'Test Company',
          role: 'ADMIN',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('test@example.com');

      authToken = response.body.accessToken;
      tenantId = response.body.user.tenantId;
    });

    it('POST /api/auth/login - should login with credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('GET /api/auth/me - should get current user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe('test@example.com');
    });
  });

  describe('Customers', () => {
    it('POST /api/customers - should create a customer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Customer Inc.',
          description: 'A test customer company',
        })
        .expect(201);

      expect(response.body.name).toBe('Test Customer Inc.');
      customerId = response.body.id;
    });

    it('GET /api/customers - should get all customers', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/customers/:id - should get a customer by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(customerId);
    });
  });

  describe('Jobs', () => {
    it('POST /api/jobs - should create a job', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Software Engineer',
          customerId,
          description: 'Looking for a talented engineer',
          location: 'Tokyo',
          salary: '5M - 8M JPY',
          employmentType: 'Full-time',
          requirements: '3+ years experience',
        })
        .expect(201);

      expect(response.body.title).toBe('Software Engineer');
      expect(response.body.status).toBe('DRAFT');
      jobId = response.body.id;
    });

    it('GET /api/jobs - should get all jobs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('GET /api/jobs/:id - should get a job by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/jobs/${jobId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(jobId);
    });
  });

  describe('Generation', () => {
    it('POST /api/generation/text - should generate text', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/generation/text')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobId,
          prompt: 'Generate a job description',
        })
        .expect(201);

      expect(response.body).toHaveProperty('versionId');
      expect(response.body).toHaveProperty('content');
    });

    it('POST /api/generation/image - should generate image', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/generation/image')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobId,
          prompt: 'Generate a job image',
        })
        .expect(201);

      expect(response.body).toHaveProperty('versionId');
      expect(response.body).toHaveProperty('imageUrl');
    });
  });

  describe('Approvals', () => {
    let approvalId: string;

    it('POST /api/jobs/:id/submit-for-approval - should submit job for approval', async () => {
      const response = await request(app.getHttpServer())
        .post(`/api/jobs/${jobId}/submit-for-approval`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('PENDING');
      approvalId = response.body.id;
    });

    it('GET /api/approvals - should get all approvals', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/approvals')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('POST /api/approvals/:id/approve - should approve', async () => {
      await request(app.getHttpServer())
        .post(`/api/approvals/${approvalId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          comment: 'Looks good!',
        })
        .expect(201);
    });
  });
});
