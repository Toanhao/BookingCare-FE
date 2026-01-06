This project was bootstrapped with **Vite + React**.

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.
Open the local URL shown in the terminal (usually [http://localhost:3000](http://localhost:3000)) to view it in the browser.

The page will reload when you make edits.
You will also see any lint or runtime errors in the console.

### `npm run build`

Builds the app for production to the `dist` folder.
It bundles React in production mode and optimizes the build for best performance.

The build output is minified and ready to be deployed.

### `npm run preview`

Locally preview the production build.
This is useful to verify the build before deploying.

### `npm test` (optional)

If you have configured a test runner (e.g. Vitest or Jest), this command will run your tests.

> Note: Vite does not include a test runner by default.

## Project Structure (Typical)

```
├─ index.html
├─ package.json
├─ vite.config.js
├─ src
│  ├─ main.jsx
│  ├─ App.jsx
│  └─ assets
└─ public
```

## Differences from Create React App (CRA)

* ⚡ Faster dev server and builds thanks to native ES modules
* 📦 No Webpack configuration by default
* 🧩 Simpler and more flexible configuration via `vite.config.js`
* 🔥 Instant Hot Module Replacement (HMR)

## Environment Variables

Vite uses `import.meta.env` instead of `process.env`.

Variables must be prefixed with `VITE_`:

```
VITE_API_URL=https://api.example.com
```

Usage:

```
const apiUrl = import.meta.env.VITE_API_URL
```

## Learn More

* Vite Documentation: [https://vitejs.dev/](https://vitejs.dev/)
* React Documentation: [https://react.dev/](https://react.dev/)

## Deployment

After running `npm run build`, deploy the contents of the `dist` folder to your hosting provider (Nginx, Vercel, Netlify, etc.).

## Troubleshooting

* If the app works in dev but fails after build, check:

  * Base path configuration (`base` in `vite.config.js`)
  * Absolute vs relative asset paths
  * Environment variables prefixed with `VITE_`

---

This project has been migrated from **Create React App** to **Vite** for better performance and developer experience.
