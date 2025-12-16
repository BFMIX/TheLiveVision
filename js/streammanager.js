// streamManager.js
// Gestion du chargement des streams avec auto-play

document.addEventListener("DOMContentLoaded", () => {
  const streamUrlInput = document.getElementById("stream-url");
  const liveStreamIframe = document.getElementById("live-stream");
  const loadStreamButton = document.getElementById("load-stream");

  // Fonction pour vérifier si une URL est valide
  function isValidUrl(url) {
    // Vérifie si l'URL commence par http:// ou https://
    const urlPattern = /^(https?:\/\/)/i;
    return urlPattern.test(url);
  }

  // Fonction pour charger le stream dans l'iframe
  function loadStream(url) {
    try {
      liveStreamIframe.src = url;
      // Save last watched stream to localStorage
      localStorage.setItem('lastStream', url);
      console.log(`Stream chargé avec succès : ${url}`);
    } catch (error) {
      console.error("Erreur lors du chargement du stream :", error);
      alert(
        "Erreur lors du chargement du stream. Veuillez vérifier l’URL et réessayer."
      );
    }
  }

  // Fonction pour obtenir le pays de l'utilisateur
  async function getUserCountry() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return data.country_name || 'Unknown';
    } catch (error) {
      console.error('Could not detect user country:', error);
      return 'Unknown';
    }
  }

  // Fonction pour charger un canal aléatoire du pays de l'utilisateur
  async function loadRandomChannelFromCountry() {
    try {
      const userCountry = await getUserCountry();
      console.log('User country detected:', userCountry);
      
      // Load channels from CSV
      const response = await fetch('files/allchannels.csv');
      if (!response.ok) return;
      
      const csvText = await response.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      // Skip header and parse channels
      const channels = lines.slice(1).map(line => {
        const [name, url, country] = line.split(';');
        return { name, url, country };
      }).filter(ch => ch.url && ch.url.startsWith('http'));
      
      // Filter by user country or fallback to all channels
      let countryChannels = channels.filter(ch => 
        ch.country && ch.country.toLowerCase().includes(userCountry.toLowerCase())
      );
      
      if (countryChannels.length === 0) {
        countryChannels = channels; // Use all if no country match
      }
      
      // Pick random channel
      if (countryChannels.length > 0) {
        const randomChannel = countryChannels[Math.floor(Math.random() * countryChannels.length)];
        // Don't show URL in input, just load it
        loadStream(randomChannel.url);
        console.log('Auto-loaded random channel:', randomChannel.name);
      }
    } catch (error) {
      console.error('Error auto-loading channel:', error);
    }
  }

  // Auto-play logic on page load
  const lastStream = localStorage.getItem('lastStream');
  
  if (lastStream && isValidUrl(lastStream)) {
    // Returning visitor - load last watched stream (but don't show in input)
    loadStream(lastStream);
    console.log('Returning visitor - loaded last stream');
  } else {
    // New visitor - load random channel from their country
    loadRandomChannelFromCountry();
    console.log('New visitor - loading random channel');
  }

  // Gestionnaire d'événement pour le bouton "PLAY"
  loadStreamButton.addEventListener("click", () => {
    const url = streamUrlInput.value.trim();

    // Vérifier si l'URL est vide
    if (!url) {
      alert("Veuillez entrer une URL de stream valide.");
      return;
    }

    // Vérifier si l'URL est valide (commence par http:// ou https://)
    if (!isValidUrl(url)) {
      alert("L’URL doit commencer par http:// ou https://.");
      return;
    }

    // Charger le stream dans l'iframe
    loadStream(url);
  });

  // Gestionnaire pour la touche "Enter" dans le champ de saisie
  streamUrlInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      loadStreamButton.click();
    }
  });
});
