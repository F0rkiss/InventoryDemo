function getCurrentDate(withTime) {
  const now = new Date();

  const dayName = now.toLocaleDateString('id-ID', { weekday: 'long', timeZone: 'Asia/Jakarta' });
  const day = now.toLocaleDateString('id-ID', { day: 'numeric', timeZone: 'Asia/Jakarta' });
  const month = now.toLocaleDateString('id-ID', { month: 'long', timeZone: 'Asia/Jakarta' });
  const year = now.toLocaleDateString('id-ID', { year: 'numeric', timeZone: 'Asia/Jakarta' });

  const fullDate = `${dayName}, ${day} ${month} ${year}`;
  // if (withTime) {
  //   const rawTime = now.toLocaleTimeString('id-ID', {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //     hour12: false,
  //     timeZone: 'Asia/Jakarta',
  //   });

  //   const formattedTime = rawTime.replace(':', '.');

  //   return `${fullDate} ${formattedTime}`;
  // }

  return `${fullDate}`;
}

export default getCurrentDate;
