import { PrismaClient, Reservation } from '@prisma/client';
import { getAvailableBlocks, validateReservationRequest } from '../lib/reservation-logic';
import { mockDeep, mockReset } from 'jest-mock-extended';

// Remove unused Prisma client instance
// const prisma = new PrismaClient();

// Replace the Prisma client mock setup with jest-mock-extended
const mockedPrisma = mockDeep<PrismaClient>();

beforeEach(() => {
  mockReset(mockedPrisma);
});

jest.mock('@prisma/client');

describe('Reservation Logic', () => {
  describe('getAvailableBlocks', () => {
    it('should return Block A and B for a Monday', () => {
      const date = new Date('2025-12-08T12:00:00'); // Monday
      const blocks = getAvailableBlocks(date);
      expect(blocks).toEqual(['A', 'B']);
    });

    it('should return no blocks for a Saturday (C starts on Friday)', () => {
      const date = new Date('2025-12-13T12:00:00'); // Saturday
      const blocks = getAvailableBlocks(date);
      expect(blocks).toEqual([]);
    });

    it('should return no blocks for a Sunday', () => {
      const date = new Date('2025-12-14T12:00:00'); // Sunday
      const blocks = getAvailableBlocks(date);
      expect(blocks).toEqual([]);
    });
  });

  describe('validateReservationRequest', () => {
    it('should return error if block is unavailable', async () => {
      const user = { id: '1', weekQuotaUsed: 0, enrolledCourses: ['CS101'] };
      const asset = { id: 1, requiredCourses: ['CS101'] };
      const block = 'A';
      const date = new Date('2025-12-08');

      mockedPrisma.reservation.findFirst.mockResolvedValueOnce({ id: 1 } as unknown as Reservation);

      const result = await validateReservationRequest(mockedPrisma, user, asset, block, date);
      expect(result).toBe('Block Unavailable');
    });

    it('should return error if user exceeds weekly quota', async () => {
      const user = { id: '1', weekQuotaUsed: 3, enrolledCourses: ['CS101'] };
      const asset = { id: 1, requiredCourses: ['CS101'] };
      const block = 'A';
      const date = new Date('2025-12-08');

      mockedPrisma.reservation.findFirst.mockResolvedValueOnce(null);

      const result = await validateReservationRequest(mockedPrisma, user, asset, block, date);
      expect(result).toBe('Weekly Limit Exceeded');
    });

    it('should return error if user lacks course permissions', async () => {
      const user = { id: '1', weekQuotaUsed: 0, enrolledCourses: ['CS102'] };
      const asset = { id: 1, requiredCourses: ['CS101'] };
      const block = 'A';
      const date = new Date('2025-12-08');

      mockedPrisma.reservation.findFirst.mockResolvedValueOnce(null);

      const result = await validateReservationRequest(mockedPrisma, user, asset, block, date);
      expect(result).toBe('Course Restriction');
    });

    it('should return null if validation passes', async () => {
      const user = { id: '1', weekQuotaUsed: 0, enrolledCourses: ['CS101'] };
      const asset = { id: 1, requiredCourses: ['CS101'] };
      const block = 'A';
      const date = new Date('2025-12-08');

      mockedPrisma.reservation.findFirst.mockResolvedValueOnce(null);

      const result = await validateReservationRequest(mockedPrisma, user, asset, block, date);
      expect(result).toBeNull();
    });
  });
});