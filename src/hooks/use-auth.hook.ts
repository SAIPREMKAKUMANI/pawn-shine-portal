import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import {
  submitLogin,
  fetchWebAuthnRegisterOptions,
  submitWebAuthnRegisterVerify,
  fetchWebAuthnLoginOptions,
  submitWebAuthnLoginVerify,
} from "@/services/auth.service";
import {
  base64UrlToUint8Array,
  arrayBufferToBase64,
} from "@/utils/webauthn-helpers";
import { ApiError } from "@/lib/api-client";
import type { LoginRequest } from "@/types/api.types";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (request: LoginRequest) => submitLogin(request),
    onSuccess: (response, variables) => {
      if (response.token) {
        setAuth(response.token, variables.username);
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    },
    onError: (error: Error) => {
      const message =
        error instanceof ApiError
          ? error.message
          : "Login failed. Please try again.";
      toast.error(message);
    },
  });
}

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const navigate = useNavigate();

  return () => {
    clearAuth();
    navigate("/");
    toast.success("Logged out successfully");
  };
}

export function useWebAuthnRegister() {
  const setWebAuthnRegistered = useAuthStore(
    (state) => state.setWebAuthnRegistered,
  );

  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: LoginRequest) => {
      const loginResponse = await submitLogin({ username, password });
      if (!loginResponse.token) {
        throw new Error("Invalid credentials");
      }

      const options = await fetchWebAuthnRegisterOptions(
        username,
        loginResponse.token,
      );

      const credential = (await navigator.credentials.create({
        publicKey: {
          ...options,
          challenge: base64UrlToUint8Array(
            options.challenge as string,
          ),
          user: {
            ...(options.user as Record<string, unknown>),
            id: base64UrlToUint8Array(
              (options.user as Record<string, unknown>).id as string,
            ),
          },
        } as unknown as PublicKeyCredentialCreationOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Credential creation failed");
      }

      const attestation =
        credential.response as AuthenticatorAttestationResponse;

      await submitWebAuthnRegisterVerify(
        {
          id: credential.id,
          rawId: arrayBufferToBase64(credential.rawId),
          type: credential.type,
          response: {
            attestationObject: arrayBufferToBase64(
              attestation.attestationObject,
            ),
            clientDataJSON: arrayBufferToBase64(
              attestation.clientDataJSON,
            ),
          },
        },
        username,
        loginResponse.token,
      );

      return { credentialId: credential.id, username };
    },
    onSuccess: ({ credentialId, username }) => {
      setWebAuthnRegistered(credentialId, username);
      toast.success("Biometric registered successfully!");
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Biometric registration failed",
      );
    },
  });
}

export function useWebAuthnLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setWebAuthnRegistered = useAuthStore(
    (state) => state.setWebAuthnRegistered,
  );
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      const options = await fetchWebAuthnLoginOptions();

      const credential = (await navigator.credentials.get({
        publicKey: {
          ...options,
          challenge: base64UrlToUint8Array(
            options.challenge as string,
          ),
          allowCredentials: [],
        } as unknown as PublicKeyCredentialRequestOptions,
      })) as PublicKeyCredential;

      if (!credential) {
        throw new Error("Credential retrieval failed");
      }

      const assertion =
        credential.response as AuthenticatorAssertionResponse;

      const verifyResponse = await submitWebAuthnLoginVerify({
        id: credential.id,
        rawId: arrayBufferToBase64(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: arrayBufferToBase64(
            assertion.authenticatorData,
          ),
          clientDataJSON: arrayBufferToBase64(
            assertion.clientDataJSON,
          ),
          signature: arrayBufferToBase64(assertion.signature),
          userHandle: assertion.userHandle
            ? arrayBufferToBase64(assertion.userHandle)
            : null,
        },
      });

      return {
        token: verifyResponse.token!,
        username: verifyResponse.username ?? "user",
        credentialId: credential.id,
      };
    },
    onSuccess: ({ token, username, credentialId }) => {
      setAuth(token, username);
      setWebAuthnRegistered(credentialId, username);
      toast.success("Biometric login successful!");
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Biometric authentication failed",
      );
    },
  });
}
