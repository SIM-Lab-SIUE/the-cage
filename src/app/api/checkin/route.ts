import { NextResponse } from 'next/server';
import { auth } from '../../../../auth';
import { PrismaClient } from '@prisma/client';
import { checkinAsset } from '@/lib/snipe-it';

const prisma = new PrismaClient();

/**
 * POST /api/checkin
 * 
 * Executes the checkin workflow:
 * 1. Validates the reservation exists and is checked out
 * 2. Calls Snipe-IT API to checkin the asset
 * 3. Updates the local reservation status to COMPLETED
 * 
 * Payload: { reservationId: string }
 */
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin access
    const isAdmin = session.user.email?.includes('admin');
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const { reservationId } = await req.json();

    if (!reservationId) {
      return NextResponse.json(
        { error: 'Missing required field: reservationId' },
        { status: 400 }
      );
    }

    // 1. Fetch the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { user: true, asset: true },
    });

    if (!reservation) {
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (reservation.status !== 'CHECKED_OUT') {
      return NextResponse.json(
        {
          error: 'Invalid reservation status',
          message: `Reservation must be CHECKED_OUT to return. Current status: ${reservation.status}`,
        },
        { status: 400 }
      );
    }

    // 2. Call Snipe-IT checkin
    try {
      const snipeResponse = await checkinAsset(reservation.snipeAssetId);

      if (!snipeResponse || snipeResponse.status === 'error') {
        throw new Error(
          `Snipe-IT checkin failed: ${snipeResponse?.messages?.join(' ') || 'Unknown error'}`
        );
      }
    } catch (snipeError) {
      console.error('Snipe-IT Checkin Error:', snipeError);
      return NextResponse.json(
        {
          error: 'Snipe-IT checkin failed',
          message: snipeError instanceof Error ? snipeError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // 3. Update reservation status to COMPLETED
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: { status: 'COMPLETED' },
    });

    return NextResponse.json({
      success: true,
      message: 'Equipment checked in successfully',
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Checkin API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
