// navigation.js
// Fonction pour naviguer entre les pages
window.navigateTo = function(pageId) {
  document.querySelectorAll('.page').forEach(page => page.classList.add('hidden'));
  document.getElementById(pageId).classList.remove('hidden');
  // Mettre à jour les liens de navigation actifs
  document.querySelectorAll('.tab').forEach(link => link.classList.remove('active'));
  document.querySelector(`#nav-${pageId.split('-')[1]}`).classList.add('active');
};

// Initialisation : définir la page active au chargement
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('page-stream'); // Page par défaut
});
