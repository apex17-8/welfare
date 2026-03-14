import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);

    // Get total members (all users in public.users excluding inactive)
    const totalMembersResult = await query(
      'SELECT COUNT(*) as count FROM public.users WHERE status != $1',
      ['rejected']
    );
    const totalMembers = totalMembersResult[0]?.count || 0;

    // Get active members
    const activeMembersResult = await query(
      'SELECT COUNT(*) as count FROM public.users WHERE status = $1',
      ['active']
    );
    const activeMembers = activeMembersResult[0]?.count || 0;

    // Get pending approvals
    const pendingResult = await query(
      'SELECT COUNT(*) as count FROM public.users WHERE status = $1',
      ['pending']
    );
    const pendingApprovals = pendingResult[0]?.count || 0;

    // Get total contributions this month
    const currentMonth = new Date();
    currentMonth.setDate(1);

    const contributionsResult = await query(
      'SELECT SUM(amount) as total FROM contributions WHERE created_at >= $1',
      [currentMonth]
    );
    const totalContributions = contributionsResult[0]?.total || 0;

    // Get total payments this month
    const paymentsResult = await query(
      'SELECT SUM(amount) as total FROM payments WHERE created_at >= $1 AND status = $2',
      [currentMonth, 'completed']
    );
    const totalPayments = paymentsResult[0]?.total || 0;

    return NextResponse.json(
      {
        stats: {
          totalMembers,
          activeMembers,
          pendingApprovals,
          totalContributions,
          totalPayments,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Stats error:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
