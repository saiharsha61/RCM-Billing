// Mock Authentication Service
// TODO: Replace with real Supabase authentication later

const MOCK_USER = {
    email: 'demo@rcmbilling.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'admin'
};

export const authService = {
    // Mock login
    async login(email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === MOCK_USER.email && password === MOCK_USER.password) {
                    const user = {
                        id: '1',
                        email: MOCK_USER.email,
                        name: MOCK_USER.name,
                        role: MOCK_USER.role
                    };
                    localStorage.setItem('user', JSON.stringify(user));
                    resolve({ user, error: null });
                } else {
                    reject({ user: null, error: 'Invalid email or password' });
                }
            }, 800); // Simulate network delay
        });
    },

    // Mock logout
    async logout() {
        return new Promise((resolve) => {
            setTimeout(() => {
                localStorage.removeItem('user');
                resolve();
            }, 300);
        });
    },

    // Get current user
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return this.getCurrentUser() !== null;
    }
};

// When ready to use Supabase, replace with:
/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

export const authService = {
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data?.user, error };
  },

  async logout() {
    await supabase.auth.signOut();
  },

  getCurrentUser() {
    return supabase.auth.getUser();
  },

  isAuthenticated() {
    return supabase.auth.getSession();
  }
};
*/
