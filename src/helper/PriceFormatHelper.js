const PriceFormatter = (price) => {
    if (!price) return "Rp0";

    const formattedPrice = new Intl.NumberFormat('id-ID').format(price);
    return `Rp${formattedPrice}`;
};

export default PriceFormatter;
