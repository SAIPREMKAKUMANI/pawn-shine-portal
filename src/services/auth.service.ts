import apiClient from "@/lib/api-client";
import type { LoginRequest, LoginResponse } from "@/types/api.types";
import { TOKEN_STORAGE_KEY } from "@/types/constants";

export async function submitLogin(
  request: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/api/auth/login",
    request,
  );
  return response.data;
}

export async function fetchWebAuthnRegisterOptions(
  username: string,
  token: string,
): Promise<Record<string, unknown>> {
  const response = await apiClient.post(
    "/api/auth/webauthn/register/options",
    { username },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

export async function submitWebAuthnRegisterVerify(
  credential: Record<string, unknown>,
  username: string,
  token: string,
): Promise<{ status: string }> {
  const response = await apiClient.post(
    "/api/auth/webauthn/register/verify",
    { ...credential, username },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return response.data;
}

export async function fetchWebAuthnLoginOptions(): Promise<Record<string, unknown>> {
  const response = await apiClient.post(
    "/api/auth/webauthn/login/options",
    {},
    {
      headers: {
        Authorization: undefined,
      },
      transformRequest: [(data: unknown) => JSON.stringify(data)],
    },
  );
  return response.data;
}

export async function submitWebAuthnLoginVerify(
  credential: Record<string, unknown>,
): Promise<LoginResponse & { username?: string }> {
  // NOTE: Login verify does not require JWT — it returns one
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const response = await apiClient.post(
    "/api/auth/webauthn/login/verify",
    credential,
    {
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : { Authorization: undefined },
    },
  );
  return response.data;
}
