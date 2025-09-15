'use server';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Resend } from 'resend';
import VoucherEmail from '@/components/emails/VoucherEmail';
import type { Product } from '@/lib/types';
import { fetchWithTimezone } from '@/lib/utils';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);
const fromEmail = process.env.NEXT_PUBLIC_EMAIL;

async function getProductFromVoucher(voucherId: number): Promise<Product | null> {
  const { data: voucherData, error: voucherError } = await supabase
    .from('voucher')
    .select('product_id')
    .eq('id', voucherId)
    .single();

  if (voucherError || !voucherData) {
    console.error('Error fetching product_id from voucher:', voucherError?.message);
    return null;
  }

  const query = supabase
    .from('product')
    .select('*, voucher!inner(*)')
    .eq('id', voucherData.product_id)
    .single();
    
  const { data: productData, error: productError } = await fetchWithTimezone(query);

  if (productError || !productData) {
    console.error('Error fetching product details:', productError?.message);
    return null;
  }

  return productData as Product;
}


export async function POST(request: Request) {
  let body;
  try {
    body = await request.json();
  } catch (e: any) {
    console.error('API Error: Failed to parse request body.', e);
    return NextResponse.json({ error: 'Invalid request format.' }, { status: 400 });
  }

  const { voucher_id, user_email, business_id } = body;

  if (!voucher_id || !user_email || !business_id) {
    const missingParams = [
        !voucher_id && 'voucher_id',
        !user_email && 'user_email',
        !business_id && 'business_id'
    ].filter(Boolean).join(', ');
    const errorMessage = `Missing required parameters: ${missingParams}.`;
    console.error(errorMessage, { voucher_id, user_email, business_id });
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  try {
    const { data: rpcResponse, error: rpcError } = await supabase.rpc('voucher_claim', {
      p_voucher_id: voucher_id,
      p_user_email: user_email,
      p_business_id: business_id,
    });

    if (rpcError) {
      console.error('Supabase RPC error:', rpcError);
      return NextResponse.json({ error: "A database error occurred." }, { status: 500 });
    }

    const responseText = rpcResponse as string;

    if (responseText === 'Successfully claimed') {
      // Claim was successful, now send the email
      if (!fromEmail) {
        console.warn('Email sending skipped: NEXT_PUBLIC_EMAIL is not set.');
      } else {
        const product = await getProductFromVoucher(voucher_id);
        if (product && product.voucher) {
          try {
            await resend.emails.send({
              from: fromEmail,
              to: user_email,
              subject: `Your Voucher for ${product.name} has been claimed!`,
              react: VoucherEmail({
                productName: product.name,
                productImageUrl: product.image_url || '',
                voucherDescription: product.voucher.description || 'Enjoy your voucher!',
                claimedDate: new Date(),
              }),
            });
            console.log(`Voucher claim email sent to ${user_email}`);
          } catch (emailError) {
            console.error('Resend API error:', emailError);
            // Don't block the user response for an email error
          }
        } else {
          console.warn(`Could not find product details for voucher ID ${voucher_id}. Skipping email.`);
        }
      }
      return NextResponse.json({ message: 'Voucher claimed successfully!', status: 'success' });
    } else {
       // Handles 'Already claimed' and 'Promo fully claimed'
       return NextResponse.json({ error: responseText, status: 'error' }, { status: 409 });
    }

  } catch (e: any) {
    console.error('Full API claim-voucher route error:', e);
    return NextResponse.json(
      { error: "An unexpected internal server error occurred." },
      { status: 500 }
    );
  }
}
