/**
 * Supabase Client Configuration
 * Phase J: Backend Integration
 * 
 * Set your credentials in .env:
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   VITE_SUPABASE_ANON_KEY=your-anon-key
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        '⚠️ Supabase credentials not configured. Running in DEMO MODE (mock data).\n' +
        'To connect to Supabase, create a .env file with:\n' +
        '  VITE_SUPABASE_URL=https://your-project.supabase.co\n' +
        '  VITE_SUPABASE_ANON_KEY=your-anon-key'
    );
}

/**
 * Supabase client instance
 * Returns null if credentials are not configured (demo mode)
 */
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    })
    : null;

/**
 * Check if Supabase is configured and connected
 */
export function isSupabaseConfigured() {
    return supabase !== null;
}

/**
 * Get connection status for display in UI
 */
export async function getConnectionStatus() {
    if (!supabase) {
        return { connected: false, mode: 'demo', message: 'Running in demo mode (mock data)' };
    }

    try {
        const { error } = await supabase.from('providers').select('count', { count: 'exact', head: true });
        if (error) throw error;
        return { connected: true, mode: 'live', message: 'Connected to Supabase' };
    } catch (err) {
        return { connected: false, mode: 'error', message: `Connection error: ${err.message}` };
    }
}

export default supabase;
