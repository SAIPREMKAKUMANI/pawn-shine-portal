import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fingerprint, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const { login, loginWithBiometric, registerBiometric, hasBiometricCredential } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if WebAuthn is available
    setIsBiometricAvailable(
      window.PublicKeyCredential !== undefined &&
      navigator.credentials !== undefined
    );
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
  };

  const handleBiometricLogin = async () => {
    const success = await loginWithBiometric();
    if (success) {
      toast.success('Biometric login successful!');
      navigate('/dashboard');
    } else {
      toast.error('Biometric authentication failed');
    }
  };

  const handleBiometricRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) {
      toast.error('Please enter a username first');
      return;
    }
    
    const success = await registerBiometric(username);
    if (success) {
      toast.success('Biometric registered successfully!');
      setIsRegistering(false);
      setUsername('');
    } else {
      toast.error('Failed to register biometric');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elevated)]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-gold)]">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Gold Pawn Broking</CardTitle>
          <CardDescription>
            {isRegistering ? 'Register your biometric credential' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isRegistering ? (
            <>
              {/* Username/Password Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
              </form>

              {/* Divider */}
              {isBiometricAvailable && (
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
              )}

              {/* Biometric Login Button */}
              {isBiometricAvailable && hasBiometricCredential && (
                <Button 
                  onClick={handleBiometricLogin} 
                  className="w-full gap-2"
                  variant="outline"
                >
                  <Fingerprint className="h-5 w-5" />
                  Sign In with Biometrics
                </Button>
              )}

              {/* Register Biometric Option */}
              {isBiometricAvailable && !hasBiometricCredential && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Enable biometric login for faster access
                  </p>
                  <Button 
                    onClick={() => setIsRegistering(true)} 
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <Fingerprint className="h-5 w-5" />
                    Setup Biometric Login
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Biometric Registration Form */
            <form onSubmit={handleBiometricRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-username">Username</Label>
                <Input
                  id="reg-username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                You'll be prompted to use your device's biometric sensor (fingerprint, face ID, etc.)
              </p>
              <Button type="submit" className="w-full gap-2">
                <Fingerprint className="h-5 w-5" />
                Register Biometric
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  setIsRegistering(false);
                  setUsername('');
                }}
              >
                Cancel
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
