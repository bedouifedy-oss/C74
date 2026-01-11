import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseReady } from '@/lib/supabase';
import { getAuthSessionFromRequest } from '@/lib/auth-session';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: feeId } = await params;
    const session = getAuthSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'worker' && session.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!isSupabaseReady) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const client = createServerSupabaseClient();
    if (!client) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { data: fee, error: feeError } = await client
      .from('fees')
      .select('*')
      .eq('id', feeId)
      .single();

    if (feeError || !fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
    }

    if (session.role !== 'admin' && fee.worker_id !== session.user_id) {
      return NextResponse.json({ error: 'Forbidden - Fee does not belong to this worker' }, { status: 403 });
    }

    if (!['unpaid', 'overdue'].includes(String(fee.status))) {
      return NextResponse.json({ error: 'Fee is not eligible for payment submission' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type');
    let paymentMethod, paymentReference, paymentNotes, paymentProof;

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      paymentMethod = formData.get('payment_method') as string;
      paymentReference = formData.get('payment_reference') as string;
      paymentNotes = formData.get('payment_notes') as string;
      paymentProof = formData.get('payment_proof') as File;
    } else {
      // Handle JSON request (for demo without file upload)
      const body = await request.json();
      paymentMethod = body.payment_method;
      paymentReference = body.payment_reference;
      paymentNotes = body.payment_notes;
      paymentProof = null;
    }

    // Validate required fields
    if (!paymentMethod || !paymentReference) {
      return NextResponse.json(
        { error: 'Missing required fields: payment_method, payment_reference' },
        { status: 400 }
      );
    }

    // Validate payment method
    const validMethods = ['d17', 'flouci', 'wire', 'mandat', 'swared'];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: 'Invalid payment method' },
        { status: 400 }
      );
    }

    // Handle file upload (in production, save to cloud storage)
    let paymentProofUrl = null;
    if (paymentProof) {
      // For demo, just simulate file upload
      const buffer = await paymentProof.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      paymentProofUrl = `data:${paymentProof.type};base64,${base64}`;
      
      console.log('Payment proof uploaded:', {
        name: paymentProof.name,
        size: paymentProof.size,
        type: paymentProof.type
      });
    }

    const now = new Date().toISOString();
    const { data: updatedFee, error: updateError } = await client
      .from('fees')
      .update({
        status: 'pending_verification',
        payment_method: paymentMethod,
        payment_reference: paymentReference,
        payment_proof_url: paymentProofUrl,
        payment_notes: paymentNotes,
        paid_at: now,
      })
      .eq('id', feeId)
      .select('*')
      .single();

    if (updateError || !updatedFee) {
      console.error('Submit payment error:', updateError);
      return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 });
    }

    // TODO: Send notification to admin for verification
    console.log('Notifying admin for payment verification:', feeId);

    return NextResponse.json({
      success: true,
      message: 'Payment proof submitted successfully',
      message_translations: {
        'ar-TN': 'تم إرسال إثبات الدفع بنجاح',
        'fr': 'Preuve de paiement soumise avec succès',
        'en': 'Payment proof submitted successfully'
      },
      fee: {
        id: feeId,
        status: 'pending_verification',
        payment_proof_url: paymentProofUrl,
        payment_reference: paymentReference,
        submitted_at: updatedFee.paid_at
      }
    });

  } catch (error) {
    console.error('Submit payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
