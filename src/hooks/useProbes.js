// ============================================================
// DRIFTFIELD: Probes Hook
// ============================================================
// Manages probe lifecycle: limit check → fire → store → track.
// Server-side enforcement via Supabase RPC functions.
// ============================================================

import { useState, useCallback } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { useAuth } from './useAuth';
import { trackEvent } from '../lib/analytics';

export function useProbes() {
  const { user, profile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Check if user can fire a probe (server-side authoritative check)
   */
  const checkLimit = useCallback(async () => {
    if (!user || !supabase) return { allowed: false, reason: 'not_authenticated' };

    const { data, error } = await supabase.rpc('check_probe_limit', {
      p_user_id: user.id,
    });

    if (error) {
      console.error('Probe limit check failed:', error);
      return { allowed: false, reason: 'error' };
    }

    return data;
  }, [user]);

  /**
   * Fire a probe and store results.
   * @param {object} probeData - Probe results from the entropy engine
   * @param {string} probeData.intention - User's intention text
   * @param {number} probeData.entropy_score - Shannon entropy
   * @param {number} probeData.chi_squared - Chi-squared statistic
   * @param {number} probeData.serial_correlation - Serial correlation
   * @param {number} probeData.monte_carlo_pi - Monte Carlo pi estimate
   * @param {number} probeData.runs_ratio - Runs test ratio
   * @param {number} probeData.byte_mean - Mean of entropy bytes
   * @param {string} probeData.anomaly_level - nominal|mild|moderate|strong|extreme
   * @param {number} probeData.compass_bearing - Direction in degrees
   * @param {string} probeData.compass_direction - Cardinal direction
   * @param {string} probeData.suggested_action - Generated action text
   * @param {string} probeData.action_category - Category of action
   * @returns {{ success: boolean, probe: object | null, error: string | null }}
   */
  const fireProbe = useCallback(async (probeData) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    setLoading(true);
    setError(null);

    try {
      // 1. Server-side limit check
      const limitCheck = await checkLimit();
      if (!limitCheck.allowed) {
        const msg = limitCheck.is_premium
          ? 'Probe limit reached (this should not happen for premium users)'
          : 'Daily probe limit reached. Upgrade to premium for unlimited probes.';
        setError(msg);
        return { success: false, error: msg, limitReached: true };
      }

      // 2. Insert probe record
      const { data: probe, error: insertError } = await supabase
        .from('probes')
        .insert({
          user_id: user.id,
          intention: probeData.intention,
          entropy_score: probeData.entropy_score,
          chi_squared: probeData.chi_squared,
          serial_correlation: probeData.serial_correlation,
          monte_carlo_pi: probeData.monte_carlo_pi,
          runs_ratio: probeData.runs_ratio,
          byte_mean: probeData.byte_mean,
          anomaly_level: probeData.anomaly_level,
          compass_bearing: probeData.compass_bearing,
          compass_direction: probeData.compass_direction,
          suggested_action: probeData.suggested_action,
          action_category: probeData.action_category,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Increment daily counter
      await supabase.rpc('increment_probe_count', { p_user_id: user.id });

      // 4. Update streak
      await supabase.rpc('update_streak', { p_user_id: user.id });

      // 5. Track analytics event
      trackEvent('probe_fired', {
        anomaly_level: probeData.anomaly_level,
        has_intention: !!probeData.intention,
        action_category: probeData.action_category,
      });

      // 6. Refresh profile to update local probe count
      await refreshProfile();

      return { success: true, probe };
    } catch (err) {
      console.error('Error firing probe:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user, checkLimit, refreshProfile]);

  /**
   * Get probe history
   * @param {number} limit - Max probes to fetch
   * @param {number} offset - Pagination offset
   */
  const getProbes = useCallback(async (limit = 50, offset = 0) => {
    if (!user) return { data: [], count: 0 };

    const { data, error, count } = await supabase
      .from('probes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching probes:', error);
      return { data: [], count: 0 };
    }

    return { data, count };
  }, [user]);

  /**
   * Mark a probe card as shared
   */
  const markShared = useCallback(async (probeId) => {
    if (!user) return;

    await supabase
      .from('probes')
      .update({ card_shared: true })
      .eq('id', probeId)
      .eq('user_id', user.id);

    trackEvent('probe_shared', { probe_id: probeId });
  }, [user]);

  return {
    fireProbe,
    getProbes,
    checkLimit,
    markShared,
    loading,
    error,
  };
}

export default useProbes;
