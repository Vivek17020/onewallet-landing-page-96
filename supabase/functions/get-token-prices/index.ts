import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenPriceRequest {
  tokens: Array<{
    id: string;
    symbol: string;
    contractAddress?: string;
  }>;
}

interface CoinGeckoResponse {
  [key: string]: {
    usd: number;
    usd_24h_change: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokens }: TokenPriceRequest = await req.json();
    
    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tokens provided' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Create a mapping of token IDs for CoinGecko API
    const tokenIds = tokens.map(token => {
      // Map common tokens to their CoinGecko IDs
      const coinGeckoMapping: { [key: string]: string } = {
        'ETH': 'ethereum',
        'WETH': 'weth',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'DAI': 'dai',
        'WBTC': 'wrapped-bitcoin',
        'UNI': 'uniswap',
        'LINK': 'chainlink',
        'AAVE': 'aave',
        'COMP': 'compound-governance-token',
        'SUSHI': 'sushi',
        'CRV': 'curve-dao-token',
        'BAL': 'balancer',
        'YFI': 'yearn-finance',
        'SNX': 'havven',
        'MKR': 'maker',
        'MATIC': 'matic-network',
      };
      
      return coinGeckoMapping[token.symbol.toUpperCase()] || token.id.toLowerCase();
    }).join(',');

    console.log('Fetching prices for tokens:', tokenIds);

    // Fetch prices from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('CoinGecko API error:', response.status, response.statusText);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch token prices' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const priceData: CoinGeckoResponse = await response.json();
    console.log('CoinGecko response:', priceData);

    // Transform the response to match our expected format
    const transformedData = tokens.map(token => {
      const coinGeckoMapping: { [key: string]: string } = {
        'ETH': 'ethereum',
        'WETH': 'weth',
        'USDC': 'usd-coin',
        'USDT': 'tether',
        'DAI': 'dai',
        'WBTC': 'wrapped-bitcoin',
        'UNI': 'uniswap',
        'LINK': 'chainlink',
        'AAVE': 'aave',
        'COMP': 'compound-governance-token',
        'SUSHI': 'sushi',
        'CRV': 'curve-dao-token',
        'BAL': 'balancer',
        'YFI': 'yearn-finance',
        'SNX': 'havven',
        'MKR': 'maker',
        'MATIC': 'matic-network',
      };
      
      const coinGeckoId = coinGeckoMapping[token.symbol.toUpperCase()] || token.id.toLowerCase();
      const price = priceData[coinGeckoId];
      
      return {
        token_id: token.id,
        symbol: token.symbol,
        current_price: price?.usd || 0,
        price_change_24h: 0, // CoinGecko doesn't provide absolute change, only percentage
        price_change_percentage_24h: price?.usd_24h_change || 0,
      };
    });

    return new Response(
      JSON.stringify({ prices: transformedData }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-token-prices function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});