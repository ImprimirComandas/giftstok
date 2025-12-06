import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const { deviceId, pricePerThousand, currencyCode } = await req.json();

    if (!deviceId || !pricePerThousand) {
      return new Response(
        JSON.stringify({ error: 'deviceId and pricePerThousand are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing coin price:', { deviceId, pricePerThousand, currencyCode, clientIP });

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();

    console.log('Checking for existing record between:', { startOfDay, endOfDay });

    // Check if this IP already registered a price today
    const { data: existing, error: fetchError } = await supabaseClient
      .from('coin_price_history')
      .select('*')
      .eq('ip_address', clientIP)
      .eq('currency_code', currencyCode || 'BRL')
      .gte('created_at', startOfDay)
      .lt('created_at', endOfDay)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking existing record:', fetchError);
    }

    let data;
    let error;

    if (existing) {
      // Update existing record for this IP today
      console.log('Updating existing record:', existing.id);
      
      const result = await supabaseClient
        .from('coin_price_history')
        .update({
          price_per_1000: pricePerThousand,
          device_id: deviceId,
        })
        .eq('id', existing.id)
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      console.log('Creating new record');
      
      const result = await supabaseClient
        .from('coin_price_history')
        .insert({
          device_id: deviceId,
          price_per_1000: pricePerThousand,
          currency_code: currencyCode || 'BRL',
          ip_address: clientIP,
        })
        .select()
        .single();
      
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Error saving coin price:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Coin price saved successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data,
        updated: !!existing
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
