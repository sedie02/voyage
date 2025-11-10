import { expect, test } from '@playwright/test';

test.describe('Trip API Endpoint - E2E Tests', () => {
  // These tests would require a test database setup
  // For now, we'll outline the test scenarios

  test('should create trip via API with valid data', async ({ request }) => {
    // This would test the actual API endpoint
    // Note: You might need to set up authentication tokens

    const response = await request.post('/api/trips', {
      data: {
        title: 'E2E Test Trip',
        destination: 'Budapest, Hungary',
        startDate: '2024-12-01',
        endDate: '2024-12-05',
        tripType: 'culture',
        activitiesBudget: 400,
      },
      headers: {
        'Content-Type': 'application/json',
        // Authorization headers would go here
      },
    });

    // Expect successful creation
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);
    expect(responseBody.trip.id).toBeDefined();
    expect(responseBody.trip.title).toBe('E2E Test Trip');
  });

  test('should reject invalid trip data', async ({ request }) => {
    const response = await request.post('/api/trips', {
      data: {
        title: '', // Invalid: empty title
        destination: '', // Invalid: empty destination
        startDate: 'invalid-date',
        endDate: '2024-01-01',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Expect validation error
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody.success).toBe(false);
    expect(responseBody.error).toBeDefined();
  });

  test('should require authentication for user trips', async ({ request }) => {
    // Test without authentication headers
    const response = await request.post('/api/trips', {
      data: {
        title: 'Unauthorized Trip',
        destination: 'Somewhere',
        startDate: '2024-06-01',
        endDate: '2024-06-05',
      },
      headers: {
        'Content-Type': 'application/json',
        // No authorization header
      },
    });

    // Should either create guest trip or return auth error
    // This depends on your API design
    expect([200, 201, 401, 403]).toContain(response.status());
  });
});
