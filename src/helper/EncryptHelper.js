import CryptoJS from "crypto-js";

// Hanya untuk menyamarkan ID di URL, bukan pengamanan: nilai VITE_* terlihat di bundle.
const secretKey = import.meta.env.VITE_REACT_APP_KEY || "";

// Encrypting function
export const encrypting = (id) => {
    const encrypted = CryptoJS.AES.encrypt(id.toString(), secretKey).toString();
    return encodeURIComponent(encrypted); // Safe for URL usage
};

// Decrypting function
export const DecryptID = (encryptedId) => {
    const decoded = decodeURIComponent(encryptedId);
    const decrypted = CryptoJS.AES.decrypt(decoded, secretKey);
    return decrypted.toString(CryptoJS.enc.Utf8);
};
