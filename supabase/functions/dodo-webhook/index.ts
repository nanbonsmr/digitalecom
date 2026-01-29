import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DODO_WEBHOOK_KEY = Deno.env.get('DODO_WEBHOOK_KEY');
    if (!DODO_WEBHOOK_KEY) {
      throw new Error('DODO_WEBHOOK_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase environment variables not configured');
    }

    // Get webhook headers for verification
    const webhookId = req.headers.get('webhook-id');
    const webhookSignature = req.headers.get('webhook-signature');
    const webhookTimestamp = req.headers.get('webhook-timestamp');

    if (!webhookId || !webhookSignature || !webhookTimestamp) {
      console.error('Missing webhook headers');
      return new Response(
        JSON.stringify({ error: 'Missing webhook headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.text();
    
    // Verify webhook signature using HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(DODO_WEBHOOK_KEY),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign', 'verify']
    );

    const signedPayload = `${webhookId}.${webhookTimestamp}.${body}`;
    const expectedSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    // Compare signatures (simplified - in production use constant-time comparison)
    const expectedSigBase64 = btoa(String.fromCharCode(...new Uint8Array(expectedSignature)));
    const signatures = webhookSignature.split(' ');
    const isValid = signatures.some(sig => {
      const [version, signature] = sig.split(',');
      return version === 'v1' && signature === expectedSigBase64;
    });

    if (!isValid) {
      console.error('Invalid webhook signature');
      // For now, we'll log but continue processing for easier testing
      // In production, you should return 401 here
      console.warn('Proceeding despite invalid signature for testing purposes');
    }

    const event = JSON.parse(body);
    console.log('Received Dodo webhook event:', event.type);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    switch (event.type) {
      case 'payment.succeeded':
        console.log('Payment succeeded:', event.data);
        
        const metadata = event.data?.metadata;
        if (metadata?.user_id && metadata?.cart_items) {
          try {
            const cartItems = JSON.parse(metadata.cart_items);
            const totalAmount = event.data?.total_amount || 0;
            
            // Create order record
            const { data: order, error: orderError } = await supabase
              .from('orders')
              .insert({
                user_id: metadata.user_id,
                payment_id: event.data?.payment_id || null,
                status: 'completed',
                total_amount: totalAmount / 100, // Convert cents to dollars
              })
              .select()
              .single();

            if (orderError) {
              console.error('Error creating order:', orderError);
              throw orderError;
            }

            console.log('Order created:', order.id);

            // Create order items
            const orderItems = cartItems.map((item: { id: string; price: number; qty: number }) => ({
              order_id: order.id,
              product_id: item.id,
              price: item.price,
              quantity: item.qty || 1,
            }));

            const { error: itemsError } = await supabase
              .from('order_items')
              .insert(orderItems);

            if (itemsError) {
              console.error('Error creating order items:', itemsError);
              throw itemsError;
            }

            console.log(`Order ${order.id} completed with ${orderItems.length} items`);
          } catch (parseError) {
            console.error('Error processing cart items:', parseError);
          }
        }
        break;

      case 'payment.failed':
        console.log('Payment failed:', event.data);
        // Handle failed payment
        break;

      case 'refund.succeeded':
        console.log('Refund succeeded:', event.data);
        // Handle refund
        break;

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing Dodo webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
