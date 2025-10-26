# Realtime Doc

Application de documentation collaborative en temps réel construite avec SvelteKit, Tiptap et Supabase.

## Prérequis

Ce projet utilise **pnpm** comme gestionnaire de paquets.

Si vous ne l'avez pas installé :
```sh
npm install -g pnpm
```

## Installation

Installez les dépendances avec pnpm :
```sh
pnpm install
```

## Développement

Lancez le serveur de développement :
```sh
pnpm dev
```

## Technologies

- **Svelte 4** 
- **Tiptap** 
- **Supabase**

## Note

Ce projet est développé en **JavaScript** plutôt qu'en TypeScript. J'ai rencontré des difficultés de compatibilité entre TypeScript et Svelte 4, j'ai donc opté pour JavaScript pour simplifier le développement.

## Améliorations possibles

- Ajouter l'authentification
- Intégrer Yjs pour une meilleure gestion collaborative
- Ajouter la persistance des curseurs utilisateurs
- Améliorer la gestion des conflits d'édition
- Implémenter l'historique des versions
- Ajouter des permissions par document (lecture/écriture)
