# LexiCloud

Une application web interactive et autonome permettant de transformer instantanément des textes bruts en nuages de mots visuels.

Ce projet est une démonstration technique d'une architecture **100% Client-Side** : tout le traitement (nettoyage, analyse, visualisation graphique) s'effectue directement dans le navigateur de l'utilisateur, garantissant rapidité et confidentialité des données.

## Fonctionnalités Clés

- **Import Flexible :** Support du copier-coller et de l'import de fichiers `.txt`.
- **Traitement Algorithmique :**
  - Nettoyage avancé du texte (Regex).
  - Filtrage performant des "mots vides" (Stop-words) via des structures `Set`.
  - Normalisation et calcul de fréquences.
- **Visualisation Interactive :**
  - Génération dynamique sur Canvas HTML5.
  - **Click-to-Context :** Cliquer sur un mot du nuage le surligne instantanément dans le texte original.
  - Statistiques en temps réel (nombre de mots, mots uniques, top mot).
- **Export :** Téléchargement du nuage de mots au format PNG.

## Stack Technique

- **Langages :** HTML5, CSS3, JavaScript.
- **Librairies :** [wordcloud2.js](https://github.com/timdream/wordcloud2.js) (Rendu graphique).
- **Architecture :** Frontend-only (Aucun backend / Serveur).

## Installation & Utilisation

Il suffit de cloner le projet et d'ouvrir le fichier `index.html` dans votre navigateur.
