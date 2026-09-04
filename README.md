# Cozy Puz

Cozy Puz is an offline picture-reassembly puzzle game for Windows. It is built
with React, TypeScript, Vite, and Electron, and is configured to produce a
Windows installer suitable for publishing through Steam.

Every puzzle generates a new illustrated scene locally from a fresh seed. The
artwork is procedural SVG, so the game does not depend on a finite artwork
catalog or an internet connection.

The game includes Relaxed, five-minute, and Daily modes; persistent local
saves; undo/redo; gentle hints; category filters; optional soft sound
feedback; a low-volume ambient sound bed; weather and time-of-day controls;
soft scene transitions; custom accent themes; and comfort settings for timer
visibility, larger text, high contrast, and an evening palette. A save can
also be exported from Comfort settings for backup or transfer.

## Development

Install dependencies and start the web development server:

```sh
npm install
npm run dev
```

Run the desktop shell against the latest production web build:

```sh
npm run build
npm start
```

## Windows release

Build the Steam-uploadable Windows installer with:

```sh
npm run dist:win
```

The installer is written to `release/`, and the Steam-ready unpacked build is
written to `release/win-unpacked/`. Upload the contents of that unpacked
directory to a SteamPipe depot, and configure the launch executable in
Steamworks as `Cozy Puz.exe`.

Steamworks still requires the publisher's App ID, depot configuration, store
assets, pricing, and game review before the game can be sold. The game state is
stored in Electron's local application data, which can be included in a
Steam Cloud configuration once the publisher's Steam App ID and depot paths
are available.
