
'use server';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import VoucherEmail from '@/components/emails/VoucherEmail';
import type { Product } from '@/lib/types';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
const fromEmail = process.env.NEXT_PUBLIC_EMAIL;

async function getProductFromVoucher(voucherId: number): Promise<Product | null> {
  const { data: voucherData, error: voucherError } = await supabase
    .from('voucher')
    .select('product_id, start_date')
    .eq('id', voucherId)
    .single();

  if (voucherError || !voucherData) {
    console.error('Error fetching product_id from voucher:', voucherError?.message);
    return null;
  }

  const { data: productData, error: productError } = await supabase
    .from('product')
    .select('*')
    .eq('id', voucherData.product_id)
    .single();

  if (productError || !productData) {
    console.error('Error fetching product details:', productError?.message);
    return null;
  }

  // Combine product data with voucher start date for use in claim logic
  return { ...productData, voucher: { start_date: voucherData.start_date } } as Product;
}


// This function will run in the background without blocking the main response
async function processClaim(voucher_id: number, user_email: string, business_id: number, email_id: string, start_date: string) {
    try {
        const { error: rpcError } = await supabase.rpc('claim_voucher', {
            p_voucher_id: voucher_id,
            p_user_email: user_email,
            p_business_id: business_id,
            p_email_id: email_id,
            p_start_date: start_date,
        });

        if (rpcError) {
            console.error('Error in claim_voucher RPC call:', rpcError.message);
            // Optional: Add more robust error handling, like sending a notification
        } else {
            console.log(`Successfully inserted claim for email_id: ${email_id}`);
        }
    } catch (e: any) {
        console.error('Exception during background claim processing:', e.message);
    }
}


export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e: any) {
    console.error('API Error: Failed to parse request body.', e);
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }

  const { voucher_id, user_email, business_id ,timezone} = body;

  if (!voucher_id || !user_email || !business_id) {
    const missingParams = [!voucher_id && 'voucher_id', !user_email && 'user_email', !business_id && 'business_id']
      .filter(Boolean)
      .join(', ');
    const errorMessage = `Missing required parameters: ${missingParams}.`;
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  try {
    // 1. Fetch all product details once and reuse them
    const productDetails = await getProductFromVoucher(voucher_id);
    if (!productDetails || !productDetails.voucher?.start_date) {
        return NextResponse.json({ error: 'Voucher or product details not found.' }, { status: 404 });
    }

    // 2. Check if the user is eligible to claim
    const { data: checkData, error: checkError } = await supabase.rpc('check_claims', {
        p_voucher_id: voucher_id,
        p_user_email: user_email,
        p_business_id: business_id,
        p_voucher_start_date: productDetails.voucher.start_date,
    });

    if (checkError) {
        console.error('Supabase check_claims RPC error:', checkError);
        return NextResponse.json({ error: 'A database error occurred while checking eligibility.' }, { status: 500 });
    }

    const checkStatus = checkData as string;

    if (checkStatus !== 'Eligible to claim') {
        return NextResponse.json({ error: checkStatus, status: 'error' }, { status: 409 });
    }

    // 3. If eligible, send the email
    if (!fromEmail) {
      console.warn('Email sending skipped: NEXT_PUBLIC_EMAIL is not set.');
      return NextResponse.json({ error: 'Email server is not configured.' }, { status: 500 });
    }

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: fromEmail,
      to: user_email,
      subject: `Your Voucher for ${productDetails.name} is on its way!`,
      react: VoucherEmail({
        productName: productDetails.name,
        productImageUrl: productDetails.image_url || '',
        voucherDescription: productDetails.description || 'Enjoy your voucher!',
        claimedDate: now Date().toLocaleString("en-US", { timeZone: timezone }),
      }),
    });

    if (resendError) {
        console.error('Resend API error:', resendError);
        return NextResponse.json({ error: 'Failed to send voucher email.' }, { status: 500 });
    }

    const emailId = resendData.id;

    // 4. Trigger the background processing of the claim and respond to the user immediately
    processClaim(voucher_id, user_email, business_id, emailId, productDetails.voucher.start_date);
    
    // 5. Respond to the client with the email_id for subscription
    return NextResponse.json({ 
        message: 'Processing your voucher claim.', 
        status: 'processing',
        emailId: emailId 
    });

  } catch (e: any) {
    console.error('Full API claim-voucher route error:', e);
    return NextResponse.json({ error: 'An unexpected internal server error occurred.' }, { status: 500 });
  }
}
