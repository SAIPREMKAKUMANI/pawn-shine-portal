import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithBiometric: () => Promise<boolean>;
  registerBiometric: (username: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  hasBiometricCredential: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [hasBiometricCredential, setHasBiometricCredential] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('pawn_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    
    // Check if biometric credential exists
    const credentialId = localStorage.getItem('webauthn_credential_id');
    setHasBiometricCredential(!!credentialId);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Call your JWT backend API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = { username };
        setUser(userData);
        localStorage.setItem('pawn_user', JSON.stringify(userData));
        localStorage.setItem('jwt_token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const registerBiometric = async (username: string) => {
    try {
      // Request registration options from backend
      const optionsResponse = await fetch('/api/auth/webauthn/register/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!optionsResponse.ok) return false;

      const options = await optionsResponse.json();

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          user: {
            ...options.user,
            id: Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0)),
          },
        },
      }) as PublicKeyCredential;

      if (!credential) return false;

      // Send credential to backend for verification
      const response = credential.response as AuthenticatorAttestationResponse;
      const verifyResponse = await fetch('/api/auth/webauthn/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          id: credential.id,
          rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
          type: credential.type,
          response: {
            attestationObject: btoa(String.fromCharCode(...new Uint8Array(response.attestationObject))),
            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
          },
        }),
      });

      if (verifyResponse.ok) {
        localStorage.setItem('webauthn_credential_id', credential.id);
        localStorage.setItem('webauthn_username', username);
        setHasBiometricCredential(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric registration error:', error);
      return false;
    }
  };

  const loginWithBiometric = async () => {
    try {
      const credentialId = localStorage.getItem('webauthn_credential_id');
      const username = localStorage.getItem('webauthn_username');
      
      if (!credentialId || !username) return false;

      // Request authentication options from backend
      const optionsResponse = await fetch('/api/auth/webauthn/login/options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!optionsResponse.ok) return false;

      const options = await optionsResponse.json();

      // Get credential
      const credential = await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0)),
          allowCredentials: options.allowCredentials.map((cred: any) => ({
            ...cred,
            id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
          })),
        },
      }) as PublicKeyCredential;

      if (!credential) return false;

      // Send credential to backend for verification
      const response = credential.response as AuthenticatorAssertionResponse;
      const verifyResponse = await fetch('/api/auth/webauthn/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          id: credential.id,
          rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
          type: credential.type,
          response: {
            authenticatorData: btoa(String.fromCharCode(...new Uint8Array(response.authenticatorData))),
            clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
            signature: btoa(String.fromCharCode(...new Uint8Array(response.signature))),
            userHandle: response.userHandle ? btoa(String.fromCharCode(...new Uint8Array(response.userHandle))) : null,
          },
        }),
      });

      if (verifyResponse.ok) {
        const data = await verifyResponse.json();
        const userData = { username };
        setUser(userData);
        localStorage.setItem('pawn_user', JSON.stringify(userData));
        localStorage.setItem('jwt_token', data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Biometric login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pawn_user');
    localStorage.removeItem('jwt_token');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      loginWithBiometric,
      registerBiometric,
      logout, 
      isAuthenticated: !!user,
      hasBiometricCredential 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
