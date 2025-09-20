import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';

export interface UserSettings {
  id?: string;
  user_id?: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  transaction_alerts: boolean;
  price_alerts: boolean;
  default_currency: string;
  theme: string;
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: UserSettings = {
  notifications_enabled: true,
  email_notifications: true,
  transaction_alerts: true,
  price_alerts: false,
  default_currency: 'USD',
  theme: 'system',
};

export const useUserSettings = () => {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user settings when user changes
  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setSettings(defaultSettings);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          throw error;
        }

        if (data) {
          setSettings(data);
        } else {
          // Create default settings for new user
          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert({
              user_id: user.id,
              ...defaultSettings,
            })
            .select()
            .single();

          if (insertError) throw insertError;
          
          if (newSettings) {
            setSettings(newSettings);
          }
        }
      } catch (error: any) {
        console.error('Error loading settings:', error);
        toast({
          title: 'Failed to load settings',
          description: 'Using default settings. Please try again.',
          variant: 'destructive',
        });
        setSettings(defaultSettings);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [user, toast]);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) {
      toast({
        title: 'Please sign in',
        description: 'You need to sign in to save settings.',
        variant: 'destructive',
      });
      return false;
    }

    setIsSaving(true);
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings,
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setSettings(data);
        toast({
          title: 'Settings saved',
          description: 'Your preferences have been updated.',
        });
        return true;
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Failed to save settings',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
    
    return false;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSettings(defaultSettings);
      
      toast({
        title: 'Signed out successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    user,
    settings,
    isLoading,
    isSaving,
    updateSettings,
    signOut,
    isAuthenticated: !!user,
  };
};