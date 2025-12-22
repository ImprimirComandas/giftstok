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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP address
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const { 
      deviceId, 
      currentLevel, 
      targetLevel, 
      pointsNeeded, 
      currencyCode, 
      amountCalculated,
      userPoints 
    } = await req.json();

    console.log('Saving calculation:', { 
      deviceId, 
      currentLevel, 
      targetLevel, 
      pointsNeeded, 
      currencyCode, 
      amountCalculated,
      userPoints,
      ipAddress: clientIp 
    });

    // Insert calculation into database
    const { data, error } = await supabase
      .from('calculation_history')
      .insert({
        device_id: deviceId,
        ip_address: clientIp,
        current_level: currentLevel,
        target_level: targetLevel,
        points_needed: pointsNeeded,
        currency_code: currencyCode,
        amount_calculated: amountCalculated,
        user_points: userPoints,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving calculation:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Calculation saved successfully:', data);

    return new Response(
      JSON.stringify({ success: true, data }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in save-calculation function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
