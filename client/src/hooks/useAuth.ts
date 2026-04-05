import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, token, isAuthenticated, login, logout: storeLogout } = useAuthStore();

  const loginWithEmail = useCallback(async (email: string): Promise<void> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const data = await response.json() as { user: typeof user; token: string };
    login(data.user!, data.token);
  }, [login]);

  const logout = useCallback(() => {
    storeLogout();
  }, [storeLogout]);

  return { user, token, isAuthenticated, loginWithEmail, logout };
}
