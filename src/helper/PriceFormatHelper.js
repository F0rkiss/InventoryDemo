/**
 * Memformat angka menjadi string mata uang berdasarkan kode mata uang yang diberikan.
 * Secara default akan menggunakan format IDR (Rupiah) tanpa desimal jika kode tidak diberikan.
 * * @param {number | string} price - Angka yang akan diformat.
 * @param {string} [currencyCode='IDR'] - Kode mata uang ISO 4217 (misal: 'IDR', 'USD', 'JPY').
 * @returns {string} - String mata uang yang telah diformat.
 */
const PriceFormatter = (price, currencyCode = 'IDR') => {
    try {
        return formatWithCurrency(price, currencyCode || 'IDR');
    } catch {
        // Kode mata uang dari master data tidak valid (bukan ISO 4217): jangan crash halaman.
        return formatWithCurrency(price, 'IDR');
    }
};

const formatWithCurrency = (price, currencyCode) => {
    const numPrice = Number(price);

    // Menangani input null, undefined, NaN, atau 0
    let priceToFormat = 0;
    if (numPrice && !isNaN(numPrice)) {
        priceToFormat = numPrice;
    }

    // Gunakan locale 'id-ID' agar format angka (pemisah ribuan/desimal) konsisten
    // untuk audiens Indonesia (misal: 10.000,00 BUKAN 10,000.00)
    const locale = 'id-ID';

    let options = {
        style: 'currency',
        currency: currencyCode,
    };

    // --- PERUBAHAN LOGIKA ---
    // Replikasi perilaku lama: IDR tidak memiliki desimal.
    // Untuk mata uang lain: gunakan pengaturan desimal standarnya (biasanya 2).
    if (currencyCode === 'IDR') {
        options.minimumFractionDigits = 0;
        options.maximumFractionDigits = 0;
    }

    // Jika harga 0, kembalikan format 0 yang sesuai
    // (misal: "Rp0" untuk IDR, "US$0,00" untuk USD)
    if (priceToFormat === 0) {
         if (currencyCode === 'IDR') {
             // Mengembalikan "Rp0"
             return new Intl.NumberFormat(locale, options).format(0);
         }
         // Mengembalikan "US$0,00", "€0,00", dll.
         // Kita paksa 2 desimal untuk angka 0 pada mata uang non-IDR
         options.minimumFractionDigits = 2;
         return new Intl.NumberFormat(locale, options).format(0); 
    }
    
    // Format harga normal
    return new Intl.NumberFormat(locale, options).format(priceToFormat);
};

export default PriceFormatter;