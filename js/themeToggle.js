// themeToggle.js
class ThemeToggle extends HTMLElement {
    constructor() {
      super();
      // Détecter la préférence de l'utilisateur pour le mode sombre
      this.query = window.matchMedia("(prefers-color-scheme: dark)");
      // Ajouter un écouteur pour les changements de préférence système
      this.query.addEventListener("change", () => this.toggle());
      // Sélectionner le bouton
      this.button = this.querySelector("button");
      // Ajouter un écouteur pour le clic sur le bouton
      this.button.addEventListener("click", () => this.toggle(true));
      // Initialiser le thème
      this.toggle();
    }
  
    toggle(override) {
      // Déterminer si le mode sombre doit être activé
      const isDark = override ? !this.isDark() : this.isDark();
      // Appliquer le thème en modifiant l'attribut data-theme
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
      // Sauvegarder le choix dans localStorage
      localStorage.setItem("theme", isDark ? "dark" : "light");
      // Mettre à jour l'aria-label pour l'accessibilité
      this.button.setAttribute("aria-label", isDark ? "Dark" : "Light");
    }
  
    isDark() {
      // Vérifier d'abord si un thème est sauvegardé dans localStorage
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme) {
        return savedTheme === "dark";
      }
      // DEFAULT TO DARK MODE for new visitors
      return true;
    }
  }
  
  // Définir le composant personnalisé
  customElements.define("theme-toggle", ThemeToggle);
