/**
 * Authentication Service
 * Phase J: Supabase Backend Integration
 * 
 * Dual-mode: Uses Supabase Auth when configured, falls back to mock auth.
 * Mock credentials: demo@rcmbilling.com / demo123
 */
import { supabase, isSupabaseConfigured } from './supabaseClient';

// =====================================================
// MOCK AUTH (Demo Mode)
// =====================================================
const MOCK_USERS = [
    {
        id: '1',
        email: 'demo@rcmbilling.com',
        password: 'demo123',
        name: 'Demo User',
        role: 'admin'
    },
    {
        id: '2',
        email: 'admin@rcmbilling.com',
        password: 'password123',
        name: 'Admin User',
        role: 'admin'
    },
    {
        id: '3',
        email: 'provider@rcmbilling.com',
        password: 'provider123',
        name: 'Dr. Sarah Johnson',
        role: 'provider'
    },
    {
        id: '4',
        email: 'biller@rcmbilling.com',
        password: 'biller123',
        name: 'Billing Staff',
        role: 'biller'
    },
    {
        id: '5',
        email: 'frontdesk@rcmbilling.com',
        password: 'frontdesk123',
        name: 'Front Desk Staff',
        role: 'front_desk'
    }
];

// =====================================================
// AUTH SERVICE
// =====================================================
export const authService = {
    /**
     * Login with email and password
     * Uses Supabase Auth when configured, mock auth otherwise
     */
    async login(email, password) {
        if (isSupabaseConfigured()) {
            // Live Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { user: null, error: error.message };
            }

            const user = {
                id: data.user.id,
                email: data.user.email,
                name: data.user.user_metadata?.name || data.user.email,
                role: data.user.user_metadata?.role || 'viewer'
            };

            localStorage.setItem('user', JSON.stringify(user));
            return { user, error: null };
        }

        // Mock Auth (Demo Mode)
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const mockUser = MOCK_USERS.find(
                    u => u.email === email && u.password === password
                );

                if (mockUser) {
                    const user = {
                        id: mockUser.id,
                        email: mockUser.email,
                        name: mockUser.name,
                        role: mockUser.role
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                    resolve({ user, error: null });
                } else {
                    reject({ user: null, error: 'Invalid email or password' });
                }
            }, 500);
        });
    },

    /**
     * Sign up a new user (Supabase only)
     */
    async signup(email, password, metadata = {}) {
        if (!isSupabaseConfigured()) {
            return { user: null, error: 'Sign up requires Supabase configuration' };
        }

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: metadata.name || email,
                    role: metadata.role || 'viewer'
                }
            }
        });

        if (error) return { user: null, error: error.message };

        return {
            user: {
                id: data.user.id,
                email: data.user.email,
                name: metadata.name || email,
                role: metadata.role || 'viewer'
            },
            error: null
        };
    },

    /**
     * Logout
     */
    async logout() {
        if (isSupabaseConfigured()) {
            await supabase.auth.signOut();
        }
        localStorage.removeItem('user');
    },

    /**
     * Get current user from session
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    /**
     * Get auth mode for display
     */
    getAuthMode() {
        return isSupabaseConfigured() ? 'supabase' : 'demo';
    },

    /**
     * Listen for auth state changes (Supabase only)
     */
    onAuthStateChange(callback) {
        if (!isSupabaseConfigured()) return () => { };

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                const user = {
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.name || session.user.email,
                    role: session.user.user_metadata?.role || 'viewer'
                };
                localStorage.setItem('user', JSON.stringify(user));
                callback(user);
            } else if (event === 'SIGNED_OUT') {
                localStorage.removeItem('user');
                callback(null);
            }
        });

        return () => subscription.unsubscribe();
    },

    /**
     * Reset password (Supabase only)
     */
    async resetPassword(email) {
        if (!isSupabaseConfigured()) {
            return { error: 'Password reset requires Supabase configuration' };
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email);
        return { error: error?.message || null };
    }
};

export default authService;
