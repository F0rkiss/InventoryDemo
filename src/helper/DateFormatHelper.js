function formatDate(dateString, withTime = true) {
  const date = new Date(dateString);

  // Options for formatting date part
  const options = { 
    day: '2-digit', 
    month: 'short', // e.g. May
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false,
    timeZone: 'UTC' // if you want to keep in UTC
  };

  // Format date and time parts separately for custom layout
  const day = date.toLocaleDateString('en-GB', { day: '2-digit', timeZone: 'UTC' });
  const month = date.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
  const year = date.toLocaleDateString('en-GB', { year: 'numeric', timeZone: 'UTC' });
  const time = date.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' });

  if (withTime) {
    const time = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' });
    return `${day} ${month} ${year}, ${time}`;
  }

  return `${day} ${month} ${year}`;

}

export default formatDate;