-- Create edge function for fetching token prices from CoinGecko
CREATE OR REPLACE FUNCTION public.get_token_prices()
RETURNS TABLE (
  token_id text,
  symbol text,
  current_price numeric,
  price_change_24h numeric,
  price_change_percentage_24h numeric
) 
LANGUAGE plpgsql
AS $$
BEGIN
  -- This function will be replaced by an edge function
  -- but we need the table structure for type safety
  RETURN;
END;
$$;