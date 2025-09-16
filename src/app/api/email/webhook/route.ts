'use server';

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createHmac } from 'crypto';

const signingSecret = process.env.RESEND_WEBHOOK_SECRET;

export async function POST(request: Request) {
  try {
      // Get raw body (important for signature verification)
          const rawBody = await request.text();
              const signature = request.headers.get('resend-signature');

                  if (!signingSecret || !signature) {
                        console.warn('Missing signing secret or signature header');
                              return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
                                  }

                                      // Compute HMAC SHA256 using signing secret
                                          const hmac = createHmac('sha256', signingSecret)
                                                .update(rawBody)
                                                      .digest('hex');

                                                          if (hmac !== signature) {
                                                                console.warn('Invalid webhook signature');
                                                                      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
                                                                          }

                                                                              // Parse JSON payload AFTER verification
                                                                                  const payload = JSON.parse(rawBody);
                                                                                      const { type, data } = payload;

                                                                                          if (type?.startsWith('email.')) {
                                                                                                const emailId = data?.email_id;
                                                                                                      const status = type.split('.')[1]; // e.g., sent, delivered, bounced

                                                                                                            if (!emailId || !status) {
                                                                                                                    console.warn('Webhook payload missing email_id or status', payload);
                                                                                                                            return NextResponse.json({ error: 'Incomplete payload' }, { status: 400 });
                                                                                                                                  }

                                                                                                                                        // Call RPC in Supabase
                                                                                                                                              const { error: rpcError } = await supabase.rpc('verify_claims', {
                                                                                                                                                      p_email_id: emailId,
                                                                                                                                                              p_status: status,
                                                                                                                                                                    });

                                                                                                                                                                          if (rpcError) {
                                                                                                                                                                                  console.error(`Error calling verify_claims for email_id ${emailId}:`, rpcError);
                                                                                                                                                                                          // Still return 200 so Resend doesn’t retry endlessly
                                                                                                                                                                                                } else {
                                                                                                                                                                                                        console.log(`Webhook processed: email_id=${emailId}, status=${status}`);
                                                                                                                                                                                                              }
                                                                                                                                                                                                                  }

                                                                                                                                                                                                                      return NextResponse.json({ message: 'Webhook received' }, { status: 200 });
                                                                                                                                                                                                                        } catch (e: any) {
                                                                                                                                                                                                                            console.error('Error processing webhook:', e.message);
                                                                                                                                                                                                                                return NextResponse.json({ error: 'Failed to process webhook' }, { status: 500 });
                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                  }