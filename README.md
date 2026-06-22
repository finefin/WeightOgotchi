# WeightOgotchi

A weight-tracking PWA with a snarky virtual pet that keeps you accountable.

## Features

- **Pet view** — animated pet reacts to your progress and activities with unique images and speech-bubble comments
- **Activity tracking** — tap the pet to log sports, candy, alcohol, smoking, or sleep via a radial menu; each activity has its own image and tailored message
- **Weight logging** — log daily weight; auto-calculates BMI, ideal weight, and pace toward your target
- **Progress tracker** — visual 10-step progress bar from first weight to goal
- **Chart** — weight trend graph with normal BMI range highlighted
- **History** — scrollable timeline of all entries with activity emojis
- **Export / Import** — backup or transfer your data as JSON
- **Dark theme** — mobile-first UI with a dark color scheme
- **PWA** — installable, works offline, auto-updates via service worker
- **Fullscreen** — floating button at top-right for immersive mode
- **Developer mode** — tap the pet 10 times to unlock testing controls

## Usage

Serve the directory with any static server:

```
npx serve .
```

Or open `index.html` directly (some features may require a server).

1. Complete the profile questionnaire (gender, height, target weight, target date)
2. Tap the pet to log activities
3. Tap the scale icon in the radial menu to log your weight
4. Switch between Pet and History views via the bottom nav
5. Tap the fullscreen button at top-right to hide browser chrome

## Developer Mode

Tap the pet 10 times within 10 seconds to unlock the dev panel. Provides buttons to:

| Button | Action |
|---|---|
| 25% / 50% / 75% | Jump to that progress milestone |
| Goal! | Set weight to target weight |
| Overdue | Push target date to yesterday |
| ➕ Weight | Add a random weight entry |
| ➕ Activity | Log a random activity |
| 🧹 Clear | Reset all data |
| 🚪 Exit | Hide dev panel |

Dev mode resets on page reload.

## Custom Pet Images

Placeholder SVGs are in `img/actions/*.svg`. Replace any file with your own image (same path, same filename) and the pet will use it for that activity. The default pet image is `img/pet.svg`.

Each action definition in `src/dialogs.js` has an `image` field pointing to its SVG. Update the path if you add new actions.

## File Structure

```
├── index.html          — shell with script tags
├── app.js              — routing, nav, fullscreen toggle, render()
├── style.css           — all styles
├── sw.js               — service worker (cache v5)
├── manifest.json       — PWA manifest
├── icons/              — app icons
├── img/
│   ├── pet.svg         — default pet placeholder
│   └── actions/        — one SVG per activity
└── src/
    ├── dom.js          — $, $$, el() DOM helpers
    ├── state.js        — state object, save(), calc helpers
    ├── bmi.js          — BMI calculation & categories
    ├── messages.js     — speech bubble messages
    ├── chart.js        — weight trend chart (canvas)
    ├── dialogs.js      — all dialogs + action definitions
    ├── io.js           — export / import JSON
    └── views.js        — petView, historyView, dev mode
```

## Tech Stack

Vanilla JS, CSS, HTML — no bundler, no framework, no dependencies.
