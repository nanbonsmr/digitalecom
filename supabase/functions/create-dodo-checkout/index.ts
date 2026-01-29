import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CartItem {
  product_id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    is_free: boolean;
  };
}

interface CheckoutRequest {
  items: CartItem[];
  customer_email: string;
  customer_name: string;
  return_url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const DODO_API_KEY = Deno.env.get('DODO_PAYMENTS_API_KEY');
    if (!DODO_API_KEY) {
      throw new Error('DODO_PAYMENTS_API_KEY is not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claims?.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { items, customer_email, customer_name, return_url }: CheckoutRequest = await req.json();

    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No items in cart' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total and prepare line items for Dodo
    const lineItems = items
      .filter(item => !item.product.is_free)
      .map(item => ({
        name: item.product.title,
        quantity: item.quantity,
        amount: Math.round(item.product.price * 100), // Convert to cents
      }));

    const total = lineItems.reduce((sum, item) => sum + (item.amount * item.quantity), 0);

    if (total === 0) {
      // All items are free, no payment needed
      return new Response(
        JSON.stringify({ 
          success: true, 
          free_checkout: true,
          message: 'All items are free. No payment required.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Dodo Payments checkout session (use test.dodopayments.com for test mode, live.dodopayments.com for production)
    const dodoResponse = await fetch('https://test.dodopayments.com/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billing: {
          city: "N/A",
          country: "US",
          state: "N/A",
          street: "N/A",
          zipcode: "00000"
        },
        customer: {
          email: customer_email,
          name: customer_name,
        },
        payment_link: true,
        // Use total_amount for ad-hoc payments without pre-registered products
        total_amount: total,
        return_url: return_url,
        metadata: {
          user_id: claims.user.id,
          cart_items: JSON.stringify(items.map(i => ({ 
            id: i.product_id, 
            title: i.product.title,
            price: i.product.price,
            qty: i.quantity 
          }))),
        },
      }),
    });

    if (!dodoResponse.ok) {
      const errorText = await dodoResponse.text();
      console.error('Dodo API error:', errorText);
      throw new Error(`Dodo API error: ${dodoResponse.status} - ${errorText}`);
    }

    const dodoData = await dodoResponse.json();
    console.log('Dodo checkout session created:', dodoData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        checkout_url: dodoData.payment_link,
        payment_id: dodoData.payment_id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error creating Dodo checkout:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
