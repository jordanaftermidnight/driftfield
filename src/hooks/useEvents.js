// ============================================================
// DRIFTFIELD: Events Hook (Synchronicity Log)
// ============================================================
// CRUD for synchronicity events with premium history gating.
// Free users: 7-day history. Premium: full history + export.
// ============================================================

import { useState, useCallback } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { trackEvent } from '../lib/analytics';

export function useEvents() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Log a new synchronicity event
   */
  const logEvent = useCallback(async (eventData) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          user_id: user.id,
          title: eventData.title,
          description: eventData.description,
          category: eventData.category || 'other',
          intensity: eventData.intensity || 3,
          polarity: eventData.polarity || 'neutral',
          linked_probe_id: eventData.linkedProbeId || null,
          tags: eventData.tags || [],
          latitude: eventData.latitude,
          longitude: eventData.longitude,
          event_date: eventData.eventDate || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update total events count
      await supabase
        .from('profiles')
        .update({ total_events_logged: (profile?.total_events_logged || 0) + 1 })
        .eq('id', user.id);

      trackEvent('event_logged', { category: eventData.category });
      await refreshProfile();

      return { success: true, event: data };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, profile, refreshProfile]);

  /**
   * Get events with premium gating (server-side enforced)
   */
  const getEvents = useCallback(async (limit = 100) => {
    if (!user) return { data: [], count: 0 };

    const { data, error } = await supabase.rpc('get_events_gated', {
      p_user_id: user.id,
      p_limit: limit,
    });

    if (error) {
      console.error('Error fetching events:', error);
      return { data: [], count: 0 };
    }

    return { data: data || [], count: data?.length || 0 };
  }, [user]);

  /**
   * Update an existing event
   */
  const updateEvent = useCallback(async (eventId, updates) => {
    if (!user) return { success: false };

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, event: data };
  }, [user]);

  /**
   * Delete an event
   */
  const deleteEvent = useCallback(async (eventId) => {
    if (!user) return { success: false };

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', user.id);

    return { success: !error, error: error?.message };
  }, [user]);

  /**
   * Export all events as JSON (premium only - enforced via UI gating)
   */
  const exportEvents = useCallback(async () => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: false });

    if (error) return null;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `driftfield-events-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    return data;
  }, [user]);

  return {
    logEvent,
    getEvents,
    updateEvent,
    deleteEvent,
    exportEvents,
    loading,
  };
}

export default useEvents;
