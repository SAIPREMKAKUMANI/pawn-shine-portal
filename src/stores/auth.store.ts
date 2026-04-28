import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  CREDENTIAL_ID_KEY,
  WEBAUTHN_USERNAME_KEY,
} from "@/types/constants";

interface AuthState {
  token: string | null;
  username: string | null;
  isAuthenticated: boolean;
  hasWebAuthnCredential: boolean;
  setAuth: (token: string, username: string) => void;
  clearAuth: () => void;
  setWebAuthnRegistered: (credentialId: string, username: string) => void;
  checkWebAuthnStatus: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: localStorage.getItem(TOKEN_STORAGE_KEY),
      username: (() => {
        const saved = localStorage.getItem(USER_STORAGE_KEY);
        return saved ? JSON.parse(saved).username : null;
      })(),
      isAuthenticated: !!localStorage.getItem(TOKEN_STORAGE_KEY),
      hasWebAuthnCredential: !!localStorage.getItem(CREDENTIAL_ID_KEY),

      setAuth: (token: string, username: string) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify({ username }),
        );
        set({ token, username, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        set({
          token: null,
          username: null,
          isAuthenticated: false,
        });
      },

      setWebAuthnRegistered: (
        credentialId: string,
        username: string,
      ) => {
        localStorage.setItem(CREDENTIAL_ID_KEY, credentialId);
        localStorage.setItem(WEBAUTHN_USERNAME_KEY, username);
        set({ hasWebAuthnCredential: true });
      },

      checkWebAuthnStatus: () => {
        set({
          hasWebAuthnCredential: !!localStorage.getItem(CREDENTIAL_ID_KEY),
        });
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        token: state.token,
        username: state.username,
        isAuthenticated: state.isAuthenticated,
        hasWebAuthnCredential: state.hasWebAuthnCredential,
      }),
    },
  ),
);
