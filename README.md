# GitInfo 🚀

GitInfo is a modern, lightweight, and responsive web application designed to inspect and display detailed metrics for any public GitHub repository, with a primary focus on calculating and formatting repository size.

## Features

- **Dynamic Size Calculation:** Displays repository weight dynamically in KB, MB, or GB with high precision and an interactive gauge bar.
- **Instant Search & Regex Parsing:** Parses standard GitHub URLs (`https://github.com/owner/repo`) or plain `owner/repo` formats with instant validation.
- **Language Breakdown:** Color-coded proportional visualization of repository languages and percentages.
- **GitHub PAT Support:** Optional Personal Access Token field saved to `localStorage` to bypass the 60 requests/hour unauthenticated rate limit.
- **Hero Repository Dashboard:** Displays key stats (Stars ⭐, Forks 🍴, Open Issues ⚠️, Watchers 👀), license type, default branch, description, homepage, and relative time of last push.
- **Dark-Mode-First Aesthetic:** Clean, modern developer-focused UI inspired by Vercel and GitHub styling.
- **Cloudflare Pages Ready:** Builds clean static output to `dist/`.

## Tech Stack

- **Framework & Build:** Vite + Vanilla TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest
- **Deployment Target:** Cloudflare Pages (`dist/`)

## License

This project is licensed under the Apache 2.0 License. See `LICENSE` for details.
