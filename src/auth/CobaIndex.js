// Utility function to encrypt data
const encryptData = async (plainText) => {
  const enc = new TextEncoder();
  const secretKey = `${import.meta.env.VITE_REACT_APP_KEY}`; 

  // Pad the key to 128-bit (16 bytes) or 256-bit (32 bytes)
  const keyBytes = new Uint8Array(16); // 128-bit key
  const keySource = enc.encode(secretKey);
  keyBytes.set(keySource.slice(0, 16)); // Use the first 16 bytes

  // Import key from byte array
  const key = await window.crypto.subtle.importKey("raw", keyBytes, "AES-GCM", true, ["encrypt"]);

  // Generate IV (Initialization Vector)
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 12 bytes IV

  // Encrypt data
  const encryptedDataBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    enc.encode(plainText)
  );

  // Combine IV and encrypted data into a single Base64-encoded string
  const ivBase64 = btoa(String.fromCharCode(...new Uint8Array(iv)));
  const encryptedBase64 = btoa(String.fromCharCode(...new Uint8Array(encryptedDataBuffer)));

  const result = `${ivBase64}:${encryptedBase64}`;
  
  return result; // Return encrypted data
};

export default encryptData;
