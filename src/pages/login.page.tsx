import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Fingerprint, Sparkles, Loader2 } from "lucide-react";
import { useLogin, useWebAuthnLogin, useWebAuthnRegister } from "@/hooks/use-auth.hook";
import { loginSchema, type LoginFormValues } from "@/validators/auth.schema";
import { isBiometricSupported } from "@/utils/webauthn-helpers";
import { useAuthStore } from "@/stores/auth.store";

function LoginForm() {
  const loginMutation = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  function handleSubmitLogin(values: LoginFormValues) {
    loginMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitLogin)} className="space-y-4">
        <FormField control={form.control} name="username" render={({ field }) => (
          <FormItem>
            <FormLabel>Username</FormLabel>
            <FormControl><Input placeholder="Enter username" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="password" render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl><Input type="password" placeholder="Enter password" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>
    </Form>
  );
}

function BiometricSetupDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const registerMutation = useWebAuthnRegister();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  function handleSubmitSetup(values: LoginFormValues) {
    registerMutation.mutate(values, {
      onSuccess: () => onOpenChange(false),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setup Biometric Login</DialogTitle>
          <DialogDescription>Enter credentials to enable biometric authentication</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmitSetup)} className="space-y-4">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl><Input placeholder="Enter username" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" placeholder="Enter password" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 gap-2" disabled={registerMutation.isPending}>
                {registerMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                <Fingerprint className="h-5 w-5" />
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function LoginPage() {
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const webAuthnLoginMutation = useWebAuthnLogin();
  const hasWebAuthnCredential = useAuthStore((state) => state.hasWebAuthnCredential);
  const biometricAvailable = isBiometricSupported();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-[var(--shadow-elevated)]">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-yellow-400 flex items-center justify-center shadow-[var(--shadow-gold)]">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Gold Pawn Broking</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm />
          {biometricAvailable && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
          )}
          {biometricAvailable && hasWebAuthnCredential && (
            <Button onClick={() => webAuthnLoginMutation.mutate()} className="w-full gap-2" variant="outline"
              disabled={webAuthnLoginMutation.isPending}>
              {webAuthnLoginMutation.isPending
                ? <Loader2 className="h-5 w-5 animate-spin" />
                : <Fingerprint className="h-5 w-5" />}
              Sign In with Biometrics
            </Button>
          )}
          {biometricAvailable && !hasWebAuthnCredential && (
            <Button onClick={() => setShowBiometricSetup(true)} variant="outline" className="w-full gap-2">
              <Fingerprint className="h-5 w-5" />
              Setup Biometric Login
            </Button>
          )}
        </CardContent>
      </Card>
      <BiometricSetupDialog open={showBiometricSetup} onOpenChange={setShowBiometricSetup} />
    </div>
  );
}
