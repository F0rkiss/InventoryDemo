import CryptoJS from "crypto-js";

const secretKey = import.meta.env.VITE_REACT_APP_KEY || "default-secret-key";

// AES-GCM replacement using CryptoJS AES (works without HTTPS)
const encryptData = async (plainText) => {
  if (!plainText) return "";

  try {
    const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();
    return encodeURIComponent(encrypted); // Safe for URLs
  } catch (err) {
    console.error("Encryption failed:", err);
    return "";
  }
};

export default encryptData;
