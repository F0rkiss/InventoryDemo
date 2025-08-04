function formatDate(dateString, withTime) {
  const date = new Date(dateString);

  const day = date.toLocaleDateString('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' });
  const month = date.toLocaleDateString('id-ID', { month: 'short', timeZone: 'Asia/Jakarta' });
  const year = date.toLocaleDateString('id-ID', { year: 'numeric', timeZone: 'Asia/Jakarta' });

  if (withTime) {
    // Gunakan 'en-US' agar AM/PM muncul
    const rawTime = date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true, 
      timeZone: 'Asia/Jakarta' 
    });

    // Ubah pemisah dari : ke .
    const formattedTime = rawTime.replace(':', '.');

    return `${day} ${month} ${year}, ${formattedTime}`;
  }

  return `${day} ${month} ${year}`;
}

export default formatDate;
