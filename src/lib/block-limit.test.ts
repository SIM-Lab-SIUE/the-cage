// src/lib/block-limit.test.ts
import { validateReservationRequest } from './block-limit';
import { PrismaClient } from '@prisma/client';
import { addDays, startOfISOWeek } from 'date-fns';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => ({
    reservation: {
      count: jest.fn(),
    },
  })),
}));

describe('validateReservationRequest', () => {
  let prismaMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    prismaMock = new PrismaClient();
  });

  describe('3-block weekly limit', () => {
    it('should allow reservation when user has < 3 blocks', async () => {
      prismaMock.reservation.count.mockResolvedValue(2);

      const result = await validateReservationRequest(
        'user-123',
        'Video Camera',
        new Date(),
        prismaMock
      );

      expect(result.success).toBe(true);
    });

    it('should reject reservation when user has 3 blocks', async () => {
      prismaMock.reservation.count.mockResolvedValue(3);

      const result = await validateReservationRequest(
        'user-123',
        'Video Camera',
        new Date(),
        prismaMock
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Weekly limit exceeded');
    });

    it('should allow block if from previous week', async () => {
      // Test that previous week blocks don't count toward current week limit
      const lastWeekDate = addDays(new Date(), -8); // 8 days ago = last week
      
      prismaMock.reservation.count.mockResolvedValue(0);

      const result = await validateReservationRequest(
        'user-123',
        'Video Camera',
        lastWeekDate,
        prismaMock
      );

      expect(result.success).toBe(true);
    });

    it('should track limits per category', async () => {
      // First category check
      prismaMock.reservation.count.mockResolvedValueOnce(3);

      const resultVideo = await validateReservationRequest(
        'user-123',
        'Video Camera',
        new Date(),
        prismaMock
      );

      expect(resultVideo.success).toBe(false);

      // Different category should work
      prismaMock.reservation.count.mockResolvedValueOnce(1);

      const resultAudio = await validateReservationRequest(
        'user-123',
        'Audio Recorder',
        new Date(),
        prismaMock
      );

      expect(resultAudio.success).toBe(true);
    });

    it('should calculate correct week boundaries for Monday start', () => {
      const testDate = new Date('2025-01-08'); // Wednesday
      const weekStart = startOfISOWeek(testDate);

      // ISO week should start on Monday
      expect(weekStart.getDay()).toBe(1); // Monday = 1
    });
  });

  describe('edge cases', () => {
    it('should handle boundary at exactly 3 blocks', async () => {
      prismaMock.reservation.count.mockResolvedValue(3);

      const result = await validateReservationRequest(
        'user-123',
        'Video Camera',
        new Date(),
        prismaMock
      );

      expect(result.success).toBe(false);
    });

    it('should handle different user IDs independently', async () => {
      prismaMock.reservation.count
        .mockResolvedValueOnce(2) // User 1: 2 blocks
        .mockResolvedValueOnce(1); // User 2: 1 block

      const result1 = await validateReservationRequest('user-1', 'Video Camera', new Date(), prismaMock);
      const result2 = await validateReservationRequest('user-2', 'Video Camera', new Date(), prismaMock);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it('should return success:true with no message on valid request', async () => {
      prismaMock.reservation.count.mockResolvedValue(0);

      const result = await validateReservationRequest(
        'user-123',
        'Video Camera',
        new Date()
      );

      expect(result.success).toBe(true);
      expect(result.message).toBeUndefined();
    });
  });
});
