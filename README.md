# WeightOgotchi

Track and visualize your weight with BMI classification. Progressive Web App — works offline, installable on mobile.

## Features

- **Log entries** — date, weight, note; stored in localStorage
- **BMI** — auto-calculated, color-coded by category (Underweight / Normal / Overweight / Obese); tap for category reference table
- **Chart** — tap "Last" weight to open a graph; normal BMI range shown as a green band
- **PWA** — service worker with stale-while-revalidate caching; auto-refreshes when online to get the latest deployed version
- **Tamagotchi-style UI** — simple, mobile-first

## Usage

Open `index.html` in a browser (or serve with any static server). Add entries, watch your progress.

## Deploy

Host the files on any static server (GitHub Pages, Netlify, etc.). The SW handles offline support and update detection.
