import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);

    // Get monthly contribution trend
    const monthlyContributions = await query(`
      SELECT 
        DATE_TRUNC('month', created_at)::date as month,
        COUNT(*) as count,
        SUM(amount) as total
      FROM public.contributions
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month DESC
    `);

    // Get payment success rate
    const paymentStats = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM public.payments
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY status
    `);

    // Get member distribution by status
    const memberDistribution = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM public.users
      GROUP BY status
    `);

    // Get top contributors
    const topContributors = await query(`
      SELECT 
        u.id,
        u.name as full_name,
        COUNT(c.id) as contribution_count,
        SUM(c.amount) as total_amount
      FROM public.users u
      LEFT JOIN public.contributions c ON u.id = c.user_id
      GROUP BY u.id, u.name
      ORDER BY total_amount DESC NULLS LAST
      LIMIT 10
    `);

    // Get recent payments
    const recentPayments = await query(`
      SELECT 
        p.id,
        p.amount,
        p.status,
        u.name as full_name,
        p.created_at
      FROM public.payments p
      JOIN public.users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 20
    `);

    return NextResponse.json(
      {
        monthlyContributions,
        paymentStats,
        memberDistribution,
        topContributors,
        recentPayments,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Reports error:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to get reports' }, { status: 500 });
  }
}
