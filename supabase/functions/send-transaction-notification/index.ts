// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  user_id: string;
  transaction_hash: string;
  transaction_type: string;
  amount: string;
  token_symbol: string;
  chain: string;
  from_address?: string;
  to_address?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      user_id, 
      transaction_hash, 
      transaction_type, 
      amount, 
      token_symbol, 
      chain,
      from_address,
      to_address 
    }: NotificationRequest = await req.json()

    // Check if user has notifications enabled
    const { data: settings } = await supabaseClient
      .from('user_settings')
      .select('email_notifications, transaction_alerts')
      .eq('user_id', user_id)
      .single()

    if (!settings?.email_notifications || !settings?.transaction_alerts) {
      return new Response(
        JSON.stringify({ message: 'User has notifications disabled' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Check if we've already sent this notification
    const { data: existingNotification } = await supabaseClient
      .from('transaction_notifications')
      .select('id')
      .eq('user_id', user_id)
      .eq('transaction_hash', transaction_hash)
      .eq('notification_type', 'email')
      .single()

    if (existingNotification) {
      return new Response(
        JSON.stringify({ message: 'Notification already sent' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get user profile for email
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('email, display_name')
      .eq('user_id', user_id)
      .single()

    if (!profile?.email) {
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Format the transaction details for email
    const displayName = profile.display_name || 'OneWallet User'
    const truncatedHash = `${transaction_hash.slice(0, 6)}...${transaction_hash.slice(-4)}`
    const transactionUrl = getExplorerUrl(chain, transaction_hash)
    
    let subject = `Transaction ${transaction_type} on ${chain}`
    let emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Transaction Notification</h2>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #333;">Transaction Details</h3>
          <p><strong>Type:</strong> ${transaction_type.charAt(0).toUpperCase() + transaction_type.slice(1)}</p>
          <p><strong>Amount:</strong> ${amount} ${token_symbol}</p>
          <p><strong>Chain:</strong> ${chain}</p>
          <p><strong>Hash:</strong> ${truncatedHash}</p>
          ${from_address ? `<p><strong>From:</strong> ${from_address.slice(0, 6)}...${from_address.slice(-4)}</p>` : ''}
          ${to_address ? `<p><strong>To:</strong> ${to_address.slice(0, 6)}...${to_address.slice(-4)}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${transactionUrl}" 
             style="background: #007bff; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            View on Explorer
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #666; font-size: 14px;">
          This is a demo notification from OneWallet. 
          In a production environment, this would be sent via a real email service.
        </p>
        
        <p style="color: #666; font-size: 12px;">
          You can manage your notification preferences in your OneWallet settings.
        </p>
      </div>
    `

    // In a real app, you would send the email using a service like Resend, SendGrid, etc.
    // For demo purposes, we'll just log it and mark as sent
    console.log('DEMO EMAIL NOTIFICATION:')
    console.log(`To: ${profile.email}`)
    console.log(`Subject: ${subject}`)
    console.log(`Body: ${emailBody}`)

    // Record that we sent the notification
    await supabaseClient
      .from('transaction_notifications')
      .insert({
        user_id,
        transaction_hash,
        notification_type: 'email'
      })

    return new Response(
      JSON.stringify({ 
        message: 'Demo notification sent successfully',
        details: {
          to: profile.email,
          subject,
          transaction_hash: truncatedHash
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function getExplorerUrl(chain: string, hash: string): string {
  const explorers: Record<string, string> = {
    'Ethereum': 'https://etherscan.io/tx/',
    'Polygon': 'https://polygonscan.com/tx/',
    'Arbitrum': 'https://arbiscan.io/tx/',
    'Base': 'https://basescan.org/tx/',
  }
  
  const baseUrl = explorers[chain] || 'https://etherscan.io/tx/'
  return `${baseUrl}${hash}`
}