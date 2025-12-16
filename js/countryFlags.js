// countryFlags.js
// Country flags utility

const countryFlags = {
  'Afghanistan': '🇦🇫',
  'Albania': '🇦🇱',
  'Algeria': '🇩🇿',
  'Argentina': '🇦🇷',
  'Australia': '🇦🇺',
  'Austria': '🇦🇹',
  'Belgium': '🇧🇪',
  'Brazil': '🇧🇷',
  'Brasil': '🇧🇷',
  'Bulgaria': '🇧🇬',
  'Canada': '🇨🇦',
  'Chile': '🇨🇱',
  'China': '🇨🇳',
  'Colombia': '🇨🇴',
  'Croatia': '🇭🇷',
  'Czech Republic': '🇨🇿',
  'Denmark': '🇩🇰',
  'Ecuador': '🇪🇨',
  'Egypt': '🇪🇬',
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Finland': '🇫🇮',
  'France': '🇫🇷',
  'Germany': '🇩🇪',
  'Greece': '🇬🇷',
  'India': '🇮🇳',
  'Indonesia': '🇮🇩',
  'Iran': '🇮🇷',
  'Iraq': '🇮🇶',
  'Ireland': '🇮🇪',
  'Israel': '🇮🇱',
  'Italy': '🇮🇹',
  'Japan': '🇯🇵',
  'Jordan': '🇯🇴',
  'Kenya': '🇰🇪',
  'Korea': '🇰🇷',
  'Kuwait': '🇰🇼',
  'Lebanon': '🇱🇧',
  'Libya': '🇱🇾',
  'Malaysia': '🇲🇾',
  'Mexico': '🇲🇽',
  'Morocco': '🇲🇦',
  'Netherlands': '🇳🇱',
  'New Zealand': '🇳🇿',
  'NewZealand': '🇳🇿',
  'Nigeria': '🇳🇬',
  'Norway': '🇳🇴',
  'Pakistan': '🇵🇰',
  'Palestine': '🇵🇸',
  'Peru': '🇵🇪',
  'Philippines': '🇵🇭',
  'Poland': '🇵🇱',
  'Portugal': '🇵🇹',
  'Qatar': '🇶🇦',
  'Romania': '🇷🇴',
  'Russia': '🇷🇺',
  'Saudi Arabia': '🇸🇦',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Senegal': '🇸🇳',
  'Serbia': '🇷🇸',
  'Singapore': '🇸🇬',
  'South Africa': '🇿🇦',
  'SouthAfrica': '🇿🇦',
  'Spain': '🇪🇸',
  'Sweden': '🇸🇪',
  'Switzerland': '🇨🇭',
  'Syria': '🇸🇾',
  'Thailand': '🇹🇭',
  'Tunisia': '🇹🇳',
  'Turkey': '🇹🇷',
  'UAE': '🇦🇪',
  'Ukraine': '🇺🇦',
  'United Arab Emirates': '🇦🇪',
  'United Kingdom': '🇬🇧',
  'UK': '🇬🇧',
  'GB': '🇬🇧',
  'Great Britain': '🇬🇧',
  'United States': '🇺🇸',
  'USA': '🇺🇸',
  'US': '🇺🇸',
  'Uruguay': '🇺🇾',
  'Venezuela': '🇻🇪',
  'Vietnam': '🇻🇳',
  'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Yemen': '🇾🇪'
};

function getCountryFlag(countryName) {
  if (!countryName) return '🌍';
  
  // Clean up the country name
  const cleanName = countryName.trim();
  
  // Try exact match
  if (countryFlags[cleanName]) {
    return countryFlags[cleanName];
  }
  
  // Try case-insensitive match
  const match = Object.keys(countryFlags).find(
    key => key.toLowerCase() === cleanName.toLowerCase()
  );
  
  if (match) {
    return countryFlags[match];
  }
  
  // Try partial match (contains)
  const partialMatch = Object.keys(countryFlags).find(
    key => cleanName.toLowerCase().includes(key.toLowerCase()) || 
           key.toLowerCase().includes(cleanName.toLowerCase())
  );
  
  return partialMatch ? countryFlags[partialMatch] : '🌍';
}

// Export for use in other scripts
window.getCountryFlag = getCountryFlag;
