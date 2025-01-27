// ECDHUtils.js (por exemplo)
export async function generateECDHKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true, // se quiser exportar a privada para armazenar localmente
    ["deriveKey"]
  );
  return keyPair;
}

export async function exportPublicKey(publicKey) {
  // Exporta em formato JWK (para salvar no Firebase)
  const jwk = await window.crypto.subtle.exportKey("jwk", publicKey);
  return jwk;
}

export async function importPublicKey(jwk) {
  // Importa a chave pública do outro usuário (para derivar)
  const key = await window.crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
  return key;
}

export async function deriveSharedKey(privateKey, otherPublicKey) {
  // Gera a chave simétrica derivada (AES-256)
  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: otherPublicKey,
    },
    privateKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true, // se quiser exportar a chave
    ["encrypt", "decrypt"]
  );
  return derivedKey;
}
