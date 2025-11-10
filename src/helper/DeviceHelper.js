export const isMobile = () => {
  const regex = /Mobi|Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  return regex.test(navigator.userAgent);
};

export const isMobileSafari = () => {
  const ua = navigator.userAgent;
  // Harus mengandung 'iPhone'/'iPad'/'iPod', 'AppleWebKit', 
  // dan TIDAK mengandung 'CriOS' (Chrome) atau 'FxiOS' (Firefox)
  return /iPad|iPhone|iPod/.test(ua) && 
         ua.includes('AppleWebKit') && 
         !ua.includes('CriOS') && 
         !ua.includes('FxiOS');
};