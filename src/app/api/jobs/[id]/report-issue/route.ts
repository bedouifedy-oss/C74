import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: jobId } = await params;
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'customer' && session.role !== 'worker' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const body = await request.json();
    const { issue_category, issue_type, description, evidence_photos, is_guarantee } = body;

    const mappedCategory = (() => {
      const raw = issue_category || issue_type;
      if (!raw) return null;
      const m: Record<string, string> = {
        same_issue: 'same_problem',
        new_issue: 'new_problem',
        quality: 'quality_issue',
        no_show: 'no_show',
        payment: 'payment_dispute',
        behavior: 'behavior',
      };
      return m[String(raw)] || String(raw);
    })();

    // Validate required fields
    if (!mappedCategory || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: issue_category, description' },
        { status: 400 }
      );
    }

    // Validate issue category
    const validCategories = [
      'same_problem', 'new_problem', 'quality_issue', 
      'no_show', 'payment_dispute', 'behavior'
    ];
    if (!validCategories.includes(mappedCategory)) {
      return NextResponse.json(
        { error: 'Invalid issue category' },
        { status: 400 }
      );
    }

    const { data: job, error: jobError } = await client
      .from('jobs')
      .select('id, status, customer_id, worker_id, completed_at')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    const isParticipant =
      session.role === 'admin' ||
      job.customer_id === session.user_id ||
      job.worker_id === session.user_id;

    if (!isParticipant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const issueType = ['same_problem', 'new_problem', 'quality_issue'].includes(mappedCategory) && is_guarantee
      ? 'GUARANTEE'
      : 'DISPUTE';

    const openedAt = new Date().toISOString();

    if (issueType === 'GUARANTEE') {
      if (job.status !== 'completed' || !job.completed_at) {
        return NextResponse.json({ error: 'Guarantee claims can only be filed for completed jobs' }, { status: 400 });
      }

      const completedAt = new Date(job.completed_at);
      const daysSinceCompletion = Math.floor((Date.now() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCompletion > 7) {
        return NextResponse.json({ error: 'Guarantee period has expired (7 days from completion)' }, { status: 400 });
      }

      const { data: created, error: createError } = await client
        .from('guarantee_cases')
        .insert({
          job_id: jobId,
          issue_category: mappedCategory,
          is_dispute: false,
          description,
          status: 'open',
          opened_at: openedAt,
          worker_notified_at: openedAt,
        })
        .select('id')
        .single();

      if (createError || !created) {
        console.error('Report issue error:', createError);
        return NextResponse.json({ error: 'Failed to report issue' }, { status: 500 });
      }

      if (Array.isArray(evidence_photos) && evidence_photos.length > 0) {
        await client.from('job_photos').insert(
          evidence_photos.map((url: string) => ({
            job_id: jobId,
            photo_type: 'dispute',
            file_url: url,
            caption: 'Issue evidence',
          }))
        );
      }

      return NextResponse.json({
        success: true,
        issue_id: created.id,
        issue_type: issueType,
        issue_category: mappedCategory,
        status: 'open',
        message: 'Issue reported successfully. Worker has been notified.',
        message_translations: {
          'ar-TN': 'تم الإبلاغ عن المشكلة. تم إشعار العامل.',
          'fr': 'Problème signalé. Le prestataire a été informé.',
          'en': 'Issue reported. Worker has been notified.'
        },
        next_steps: {
          'ar-TN': 'سيرد العامل خلال 48 ساعة. إذا رفض، سيراجع الإدارة.',
          'fr': 'Le prestataire répondra dans 48h. S\'il refuse, l\'admin examinera.',
          'en': 'Worker will respond within 48 hours. If refused, admin will review.'
        },
        created_at: openedAt
      });
    }

    const issueTypeDb: 'no_show' | 'quality' | 'payment' | 'behavior' | 'other' = (() => {
      if (mappedCategory === 'no_show') return 'no_show';
      if (mappedCategory === 'payment_dispute') return 'payment';
      if (mappedCategory === 'behavior') return 'behavior';
      if (['same_problem', 'new_problem', 'quality_issue'].includes(mappedCategory)) return 'quality';
      return 'other';
    })();

    const { data: dispute, error: disputeError } = await client
      .from('disputes')
      .insert({
        job_id: jobId,
        opened_by: session.user_id,
        issue_type: issueTypeDb,
        description,
        status: 'open',
        opened_at: openedAt,
      })
      .select('id')
      .single();

    if (disputeError || !dispute) {
      console.error('Report dispute error:', disputeError);
      return NextResponse.json({ error: 'Failed to report issue' }, { status: 500 });
    }

    if (Array.isArray(evidence_photos) && evidence_photos.length > 0) {
      await client.from('job_photos').insert(
        evidence_photos.map((url: string) => ({
          job_id: jobId,
          photo_type: 'dispute',
          file_url: url,
          caption: 'Issue evidence',
        }))
      );
    }

    return NextResponse.json({
      success: true,
      issue_id: dispute.id,
      issue_type: issueType,
      issue_category: mappedCategory,
      status: 'open',
      message: 'Issue reported successfully. Worker has been notified.',
      message_translations: {
        'ar-TN': 'تم الإبلاغ عن المشكلة. تم إشعار العامل.',
        'fr': 'Problème signalé. Le prestataire a été informé.',
        'en': 'Issue reported. Worker has been notified.'
      },
      next_steps: {
        'ar-TN': 'سيرد العامل خلال 48 ساعة. إذا رفض، سيراجع الإدارة.',
        'fr': 'Le prestataire répondra dans 48h. S\'il refuse, l\'admin examinera.',
        'en': 'Worker will respond within 48 hours. If refused, admin will review.'
      },
      created_at: openedAt
    });

  } catch (error) {
    console.error('Report issue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
