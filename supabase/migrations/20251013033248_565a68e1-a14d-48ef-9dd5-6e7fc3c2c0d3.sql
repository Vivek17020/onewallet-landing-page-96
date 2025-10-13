-- Add role column to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- Add additional useful columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Now create the helper function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- Function to update likes count
CREATE OR REPLACE FUNCTION public.update_article_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles 
    SET likes_count = GREATEST(0, likes_count - 1) 
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update shares count
CREATE OR REPLACE FUNCTION public.update_article_shares_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles 
    SET shares_count = shares_count + 1 
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles 
    SET shares_count = GREATEST(0, shares_count - 1) 
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to update comments count
CREATE OR REPLACE FUNCTION public.update_article_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.articles 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.article_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.articles 
    SET comments_count = GREATEST(0, comments_count - 1) 
    WHERE id = OLD.article_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to get article engagement stats
CREATE OR REPLACE FUNCTION public.get_article_engagement(article_uuid UUID)
RETURNS TABLE(
  likes_count BIGINT,
  shares_count BIGINT,
  comments_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.article_likes WHERE article_id = article_uuid),
    (SELECT COUNT(*) FROM public.article_shares WHERE article_id = article_uuid),
    (SELECT COUNT(*) FROM public.comments WHERE article_id = article_uuid AND is_approved = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for likes count
DROP TRIGGER IF EXISTS update_article_likes_count_trigger ON public.article_likes;
CREATE TRIGGER update_article_likes_count_trigger
  AFTER INSERT OR DELETE ON public.article_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_article_likes_count();

-- Trigger for shares count
DROP TRIGGER IF EXISTS update_article_shares_count_trigger ON public.article_shares;
CREATE TRIGGER update_article_shares_count_trigger
  AFTER INSERT OR DELETE ON public.article_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_article_shares_count();

-- Trigger for comments count
DROP TRIGGER IF EXISTS update_article_comments_count_trigger ON public.comments;
CREATE TRIGGER update_article_comments_count_trigger
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_article_comments_count();

-- Trigger for updated_at on comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on articles
DROP TRIGGER IF EXISTS update_articles_updated_at ON public.articles;
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on affiliate_products
DROP TRIGGER IF EXISTS update_affiliate_products_updated_at ON public.affiliate_products;
CREATE TRIGGER update_affiliate_products_updated_at
  BEFORE UPDATE ON public.affiliate_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS POLICIES - CATEGORIES
CREATE POLICY "Anyone can view categories" 
ON public.categories FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage categories" 
ON public.categories FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - ARTICLES
CREATE POLICY "Anyone can view published articles" 
ON public.articles FOR SELECT 
USING (published = true OR auth.uid() = author_id OR get_current_user_role() = 'admin');

CREATE POLICY "Admins and authors can insert articles" 
ON public.articles FOR INSERT 
WITH CHECK (auth.uid() = author_id OR get_current_user_role() = 'admin');

CREATE POLICY "Admins and authors can update their articles" 
ON public.articles FOR UPDATE 
USING (auth.uid() = author_id OR get_current_user_role() = 'admin');

CREATE POLICY "Admins can delete articles" 
ON public.articles FOR DELETE 
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - ARTICLE LIKES
CREATE POLICY "Anyone can view article likes" 
ON public.article_likes FOR SELECT 
USING (true);

CREATE POLICY "Anyone can like articles" 
ON public.article_likes FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can unlike their own likes" 
ON public.article_likes FOR DELETE 
USING (auth.uid() = user_id OR ip_address IS NOT NULL);

-- RLS POLICIES - ARTICLE SHARES
CREATE POLICY "Anyone can view article shares" 
ON public.article_shares FOR SELECT 
USING (true);

CREATE POLICY "Anyone can share articles" 
ON public.article_shares FOR INSERT 
WITH CHECK (true);

-- RLS POLICIES - COMMENTS
CREATE POLICY "Anyone can view approved comments" 
ON public.comments FOR SELECT 
USING (is_approved = true OR auth.uid() = user_id OR get_current_user_role() = 'admin');

CREATE POLICY "Anyone can insert comments" 
ON public.comments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own comments" 
ON public.comments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments" 
ON public.comments FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - USER READING HISTORY
CREATE POLICY "Users can view their own reading history" 
ON public.user_reading_history FOR SELECT 
USING (auth.uid() = user_id OR ip_address IS NOT NULL);

CREATE POLICY "Anyone can insert reading history" 
ON public.user_reading_history FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own reading history" 
ON public.user_reading_history FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS POLICIES - USER PREFERENCES
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences FOR SELECT 
USING (auth.uid() = user_id OR ip_address IS NOT NULL);

CREATE POLICY "Anyone can insert preferences" 
ON public.user_preferences FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS POLICIES - DAILY TRENDING SCORES
CREATE POLICY "Anyone can view trending scores" 
ON public.daily_trending_scores FOR SELECT 
USING (true);

CREATE POLICY "System can insert trending scores" 
ON public.daily_trending_scores FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update trending scores" 
ON public.daily_trending_scores FOR UPDATE 
USING (true);

-- RLS POLICIES - NEWSLETTER SUBSCRIBERS
CREATE POLICY "Anyone can subscribe to newsletter" 
ON public.newsletter_subscribers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage newsletter subscribers" 
ON public.newsletter_subscribers FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - NEWSLETTER PREFERENCES
CREATE POLICY "Users can manage their own newsletter preferences" 
ON public.newsletter_preferences FOR ALL 
USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Anyone can insert newsletter preferences" 
ON public.newsletter_preferences FOR INSERT 
WITH CHECK (true);

-- RLS POLICIES - PUSH SUBSCRIPTIONS
CREATE POLICY "Users can manage their own push subscriptions" 
ON public.push_subscriptions FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all push subscriptions" 
ON public.push_subscriptions FOR SELECT 
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - VAPID CONFIG
CREATE POLICY "Only admins can manage VAPID keys" 
ON public.vapid_config FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - SUBSCRIBERS
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers FOR SELECT
USING (user_id = auth.uid() OR email = auth.email());

CREATE POLICY "System can update subscriptions" 
ON public.subscribers FOR UPDATE
USING (true);

CREATE POLICY "System can insert subscriptions" 
ON public.subscribers FOR INSERT
WITH CHECK (true);

-- RLS POLICIES - MONETIZATION ANALYTICS
CREATE POLICY "Admins can view all analytics" 
ON public.monetization_analytics FOR SELECT
USING (get_current_user_role() = 'admin');

CREATE POLICY "System can insert analytics events" 
ON public.monetization_analytics FOR INSERT
WITH CHECK (true);

-- RLS POLICIES - AFFILIATE PRODUCTS
CREATE POLICY "Anyone can view active affiliate products" 
ON public.affiliate_products FOR SELECT
USING (is_active = true OR get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage affiliate products" 
ON public.affiliate_products FOR ALL
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - USER ANALYTICS
CREATE POLICY "System can insert analytics events" 
ON public.user_analytics FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all user analytics" 
ON public.user_analytics FOR SELECT 
USING (get_current_user_role() = 'admin');

-- RLS POLICIES - SECURITY AUDIT LOG
CREATE POLICY "System can insert security audit logs" 
ON public.security_audit_log FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view security audit logs" 
ON public.security_audit_log FOR SELECT 
USING (get_current_user_role() = 'admin');