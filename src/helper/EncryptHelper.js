import CryptoJS from "crypto-js";

const secretKey = `${import.meta.env.VITE_REACT_APP_KEY}`;

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
