import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: '',
      user: null,
      status: 'idle',
      error: '',

      isAuthed: () => Boolean(get().token),

      login: async (payload) => {
        set({ status: 'loading', error: '' });
        try {
          const data = await api.auth.login(payload);
          set({ token: data.token, user: data.user, status: 'idle' });
          return data;
        } catch (err) {
          set({ status: 'idle', error: err?.message ?? 'Login failed' });
          throw err;
        }
      },

      signup: async (payload) => {
        set({ status: 'loading', error: '' });
        try {
          const data = await api.auth.signup(payload);
          set({ token: data.token, user: data.user, status: 'idle' });
          return data;
        } catch (err) {
          set({ status: 'idle', error: err?.message ?? 'Signup failed' });
          throw err;
        }
      },

      refreshProfile: async () => {
        const token = get().token;
        if (!token) return null;
        set({ status: 'loading', error: '' });
        try {
          const data = await api.profile.me(token);
          set({ user: data.user, status: 'idle' });
          return data.user;
        } catch (err) {
          set({ status: 'idle', error: err?.message ?? 'Failed to load profile' });
          if (err?.status === 401) set({ token: '', user: null });
          return null;
        }
      },

      logout: () => set({ token: '', user: null, error: '', status: 'idle' }),

      setSession: ({ token, user }) => set({ token: token ?? '', user: user ?? null, status: 'idle', error: '' }),
    }),
    {
      name: 'love-and-flour-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
