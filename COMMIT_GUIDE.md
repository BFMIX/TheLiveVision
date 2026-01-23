# Guide des Commits - Live Sports Vision

## 📋 Format des Messages de Commit

### Structure Recommandée

```
[Type]: Titre court et descriptif (max 50 caractères)

## 📝 Description Détaillée
- Point principal 1
- Point principal 2
- Point principal 3

## 🐛 Bug Résolu (si applicable)
- Description du problème
- Solution appliquée
- Impact sur l'application

## ✅ Tests Effectués
- Test 1
- Test 2
- Test 3

## 📦 Fichiers Modifiés
- fichier1.js
- fichier2.css
```

### Types de Commit

| Type | Description | Exemple |
|------|-------------|---------|
| `Fix` | Correction de bug | `Fix: Correction des liens API non fonctionnels` |
| `Feature` | Nouvelle fonctionnalité | `Feature: Ajout du mode cinéma pour le player` |
| `Refactor` | Refactoring du code | `Refactor: Optimisation du code de gestion des événements` |
| `Style` | Changements de style/mise en page | `Style: Amélioration des proportions des tableaux` |
| `Docs` | Documentation | `Docs: Ajout du guide des commits` |
| `Test` | Ajout ou modification de tests | `Test: Ajout des tests pour les liens API` |

---

## 🚀 Comment Faire un Commit avec Résumé Détaillé

### Méthode 1 : Via la plateforme Emergent (Automatique)

La plateforme Emergent fait des commits automatiques après chaque modification. Ces commits sont déjà enregistrés dans l'historique git.

Pour voir l'historique :
```bash
git log --oneline -10
```

### Méthode 2 : Commit Manuel avec Message Détaillé

Si vous voulez faire un commit manuel avec un message personnalisé :

```bash
# 1. Ajouter tous les fichiers modifiés
git add -A

# 2. Faire un commit avec message détaillé (ouvre un éditeur)
git commit

# 3. Dans l'éditeur qui s'ouvre, remplir le template :
[Fix]: Correction des liens API et mise en page

## 📝 Description Détaillée
- Correction du mapping des champs name/link de l'API
- Restauration des proportions des colonnes des tableaux
- Suppression des max-width limitant la largeur du player

## 🐛 Bug Résolu
- L'API inverse les champs name et link
- Les liens générés étaient incorrects
- Solution: utiliser ch.name au lieu de ch.link

## ✅ Tests Effectués
- Test de la fonctionnalité PLAY
- Vérification des proportions des colonnes
- Test sur viewport 1920x1080

## 📦 Fichiers Modifiés
- js/channelsmanager.js
- js/sportsEventManager.js
- css/style.css
```

### Méthode 3 : Commit en Une Ligne (Rapide)

Pour un commit rapide avec message court :
```bash
git commit -m "Fix: Correction des liens API" -m "Les liens utilisent maintenant ch.name au lieu de ch.link pour résoudre le problème d'inversion de l'API"
```

---

## 📊 Exemple de Commit Complet

### Commit Réel pour cette Session

```
Fix: Résolution des bugs de mise en page et correction des liens API

## 🔧 Corrections de Mise en Page

### Page STREAM
- Supprimé max-width: 800px sur .stream-section, .stream-input-box et #live-stream
- Player et input box prennent maintenant toute la largeur (1920px)
- Restauré la mise en page conforme au site de référence

### Page ALL SPORTS EVENT
- Ajusté les proportions des colonnes du tableau:
  * DATE & TIME: 15% (au lieu de 12%)
  * SPORT: 10% (au lieu de 8%)
  * MATCH & TOURNAMENT: 45% (au lieu de 60%)
  * STREAM LINK: 30% (au lieu de 20%)
- Meilleur équilibre entre les colonnes avec plus d'espace pour les boutons PLAY

### Page ALL CHANNELS
- Supprimé max-width: 1400px sur .channel-filter-box
- Tableau et filter box parfaitement alignés (0px de différence)
- Ajusté les proportions des colonnes:
  * CHANNEL NAME: 20%
  * CHANNEL LINK: 55% (au lieu de 60%)
  * STREAM LINK: 25% (au lieu de 20%)

## 🐛 Bug Critique Résolu - Liens API

### Problème
L'API beta.adstrim.ru inverse les champs 'name' et 'link', causant des URLs incorrectes.
- ❌ Avant: https://topembed.pw/channel/skysportsnews (ne fonctionnait pas)
- ✅ Après: https://topembed.pw/channel/SkySportsNews[UK] (fonctionnel)

### Fichiers Modifiés
- js/channelsmanager.js (ligne 47): Utilise ch.name au lieu de ch.link
- js/sportsEventManager.js (ligne 47): Utilise ch.name au lieu de ch.link

## ✅ Tests Effectués
- ✓ Player chargé correctement avec URL valide
- ✓ Format de lien avec crochets [UK] présent
- ✓ Fonctionnalité PLAY testée et validée
- ✓ Alignement des tableaux vérifié
- ✓ Proportions des colonnes mesurées

## 📦 Fichiers Modifiés
- css/style.css
- js/channelsmanager.js
- js/sportsEventManager.js
```

---

## 🔍 Vérifier l'Historique des Commits

### Voir les derniers commits
```bash
git log --oneline -10
```

### Voir un commit spécifique avec tous les détails
```bash
git show <commit-hash>
```

### Voir les changements d'un commit
```bash
git diff <commit-hash>^ <commit-hash>
```

---

## 📚 Ressources

- **CHANGELOG.md** : Historique complet de tous les changements importants
- **Git Hooks** : Hook `prepare-commit-msg` installé pour faciliter les commits détaillés
- **Convention** : Messages en français pour cohérence avec le projet

---

## 💡 Conseils

1. **Commit fréquemment** : Petits commits réguliers plutôt qu'un gros commit
2. **Messages clairs** : Titre descriptif + détails dans le corps du message
3. **Tests mentionnés** : Toujours indiquer les tests effectués
4. **Impact documenté** : Expliquer l'impact des changements
5. **CHANGELOG à jour** : Mettre à jour CHANGELOG.md pour les changements majeurs

---

## 🔗 Push vers GitHub

Une fois vos commits prêts, pour les pousser vers GitHub :

```bash
# Pousser vers la branche main
git push origin main

# Forcer le push si nécessaire (attention, à utiliser avec précaution)
git push origin main --force
```

**Note** : Sur la plateforme Emergent, utilisez la fonctionnalité "Save to GitHub" dans l'interface pour synchroniser automatiquement vos commits avec votre dépôt GitHub.
