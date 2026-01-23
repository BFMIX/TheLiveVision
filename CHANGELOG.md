# Changelog - Live Sports Vision

## [2026-01-22]

### Corrections
- Stabilisation des tableaux Events & Channels : colonnes verrouillees (header + body) pour eviter tout decalage selon le navigateur.
- Restauration du layout full-width : les tableaux restent alignes dans leur conteneur et ne se reduisent plus dans un coin.

### UX
- Espacement coherent entre icones et titres de colonnes.
- Mise en page plus lisible des cellules (date/heure et match/tournoi sur 2 lignes quand prevu).

## [2026-01-14] - Améliorations Professionnelles du Design

### 🎨 Design Professionnel du Player (Page STREAM)

#### Encadrement Moderne avec Effet de Cadre Animé
- **Nouveau design** : Player avec encadrement doré animé (effet shimmer)
- **Ombres multiples** : 3 couches d'ombres pour effet de profondeur
- **Pseudo-élément ::before** : Bordure dégradée animée avec effet brillant
- **Hover effect** : Élévation 3D avec glow doré
- **Border radius** : 20px pour coins plus arrondis

#### Transition Mode Cinéma Améliorée
- **Animation d'entrée** : Scale + rotation + blur pour effet dramatique
- **Durée** : 1s avec courbe cubic-bezier élastique (bounce effect)
- **Shimmer accéléré** : Animation de bordure plus rapide en mode cinéma
- **Taille** : 90vw (au lieu de 85vw) pour immersion maximale
- **Shadow** : Ombre portée géante + glow doré

### 📊 Headers de Tableaux Améliorés

#### Tous les Tableaux (ALL SPORTS EVENT & ALL CHANNELS)
- **Taille de police** : 16px (au lieu de 13px) - **+23%**
- **Font weight** : 800 (ultra-bold)
- **Background** : Gradient doré (var(--color-primary) → #d4af37)
- **Couleur texte** : Texte sombre sur fond doré (meilleur contraste)
- **Letter spacing** : 1.2px (au lieu de 1px)
- **Text align** : Centré
- **Box shadow** : Ombre dorée pour effet de relief

### 🎯 Centrage de Tous les Éléments des Tableaux

#### Cellules de Tableau
- **text-align: center** sur tous les `td` des tableaux
- **vertical-align: middle** pour alignement vertical
- Tous les contenus (texte, icônes, boutons) sont maintenant centrés

### 📱 Bouton PLAY Responsive (Page ALL CHANNELS)

#### Desktop (≥769px)
- **Width** : 160px
- **Height** : 50px
- **Font size** : 16px
- **Padding** : 14px 36px

#### Mobile (≤768px)
- **Width** : 100px (au lieu de 160px)
- **Height** : 40px (au lieu de 50px)
- **Font size** : 13px (au lieu de 16px)
- **Padding** : 10px 20px (au lieu de 14px 36px)

**Résultat** : Le bouton s'adapte automatiquement à la taille de l'écran

---

## [2026-01-14] - Corrections Majeures de Mise en Page et Bug des Liens

### 🔧 Corrections de Mise en Page

#### Page STREAM
- **Supprimé** `max-width: 800px` sur `.stream-section`, `.stream-input-box` et `#live-stream`
- **Résultat** : Player et input box prennent maintenant toute la largeur (1920px au lieu de 800px)
- **Impact** : Mise en page conforme au site de référence thelivevision.netlify.app

#### Page ALL SPORTS EVENT
- **Ajusté** les proportions des colonnes du tableau :
  - DATE & TIME : 15% (↑ de 12%)
  - SPORT : 10% (↑ de 8%)
  - MATCH & TOURNAMENT : 45% (↓ de 60%)
  - STREAM LINK : 30% (↑ de 20%)
- **Résultat** : Meilleur équilibre avec plus d'espace pour les boutons PLAY multiples et moins d'espace vide

#### Page ALL CHANNELS
- **Supprimé** `max-width: 1400px` sur `.channel-filter-box`
- **Résultat** : Tableau et filter box parfaitement alignés (0px de différence)
- **Ajusté** les proportions des colonnes :
  - CHANNEL NAME : 20%
  - CHANNEL LINK : 55% (↓ de 60%)
  - STREAM LINK : 25% (↑ de 20%)

### 🐛 Bug Critique Résolu - Liens API Non Fonctionnels

#### Problème Identifié
L'API `beta.adstrim.ru` inverse les champs `name` et `link` dans ses réponses, causant la génération d'URLs incorrectes pour les streams.

#### Solution Appliquée
- **Fichier** : `js/channelsmanager.js` (ligne 47)
  - **Avant** : `url: https://topembed.pw/channel/${ch.link || ch.name}`
  - **Après** : `url: https://topembed.pw/channel/${ch.name}`
  
- **Fichier** : `js/sportsEventManager.js` (ligne 47)
  - **Avant** : `return https://topembed.pw/channel/${ch.link || ch.name}`
  - **Après** : `return https://topembed.pw/channel/${ch.name}`

#### Résultat
- ❌ **Avant** : `https://topembed.pw/channel/skysportsnews` (lien invalide)
- ✅ **Après** : `https://topembed.pw/channel/SkySportsNews[UK]` (lien fonctionnel)

### ✅ Tests Effectués

#### Tests Automatisés
- ✓ Player chargé correctement avec URL valide
- ✓ Format de lien avec crochets `[UK]` présent
- ✓ Fonctionnalité PLAY testée et validée
- ✓ Alignement des tableaux vérifié sur viewport 1920x1080
- ✓ Proportions des colonnes mesurées et confirmées

#### Métriques Finales
| Page | Élément | Largeur | Proportion |
|------|---------|---------|------------|
| **STREAM** | Section & Input Box | 1920px | 100% viewport |
| **ALL SPORTS EVENT** | DATE & TIME | 285px | 15.5% |
| **ALL SPORTS EVENT** | SPORT | 198px | 10.8% |
| **ALL SPORTS EVENT** | MATCH & TOURNAMENT | 810px | 44.0% |
| **ALL SPORTS EVENT** | STREAM LINK | 547px | 29.7% |
| **ALL CHANNELS** | CHANNEL NAME | 377px | 20.5% |
| **ALL CHANNELS** | CHANNEL LINK | 997px | 54.2% |
| **ALL CHANNELS** | STREAM LINK | 466px | 25.3% |

### 📦 Fichiers Modifiés
- `css/style.css` - Corrections des largeurs et proportions
- `js/channelsmanager.js` - Correction du mapping des liens API
- `js/sportsEventManager.js` - Correction du mapping des liens API

### 🔄 Migration Technique
Cette session continue le travail de migration vers la nouvelle API `beta.adstrim.ru` initiée dans les sessions précédentes. Les bugs de mise en page sont apparus suite à cette migration et ont été résolus en s'alignant sur le site de référence.

---

## [2026-01-14] - Corrections Initiales des Bugs CSS

### 🐛 Bug Critique - Erreur de Syntaxe CSS
- **Problème** : Accolade fermante orpheline à la ligne 1482 de `style.css`
- **Impact** : Styles mobiles appliqués globalement sur desktop
- **Solution** : Suppression de l'accolade en double et réorganisation du media query

### ✅ Corrections Appliquées
1. Table "ALL CHANNELS" maintenant en pleine largeur (95.8% du viewport)
2. Boutons COPY avec style neutre et hauteur correcte (40px)
3. Colonnes "ALL SPORTS EVENTS" équilibrées
4. Page "STREAM" correctement centrée
5. Espacement de 20px entre input et bouton
6. Ombres des boutons noires en mode clair (au lieu d'orange)

### 📦 Fichiers Modifiés
- `css/style.css` - Correction syntaxe et styles

---

## Notes de Maintenance

### Structure du Projet
- **Type** : Application statique (HTML/CSS/JS vanilla)
- **API** : `https://beta.adstrim.ru/api/` (channels & events)
- **Serveur de développement** : `python3 -m http.server 3000`

### Prochaines Améliorations Suggérées
- Ajouter des tests automatisés pour les proportions des colonnes
- Implémenter un système de cache pour les appels API
- Améliorer la gestion d'erreur lors du chargement des streams
