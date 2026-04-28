export function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const base64 = base64Url
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(
      base64Url.length + ((4 - (base64Url.length % 4)) % 4),
      "=",
    );
  return Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  return btoa(
    String.fromCharCode(...new Uint8Array(buffer)),
  );
}

export function isBiometricSupported(): boolean {
  return (
    window.PublicKeyCredential !== undefined &&
    navigator.credentials !== undefined
  );
}
