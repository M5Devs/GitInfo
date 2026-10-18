<div align="center">

# ⚖️ GitInfo 🚀

**Inspect any GitHub repository size, health metrics, and language breakdowns before you clone!**

[![Live Demo](https://img.shields.io/badge/Live_Demo-gitinfo.pages.dev-2563EB?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://gitinfo.pages.dev)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/M5Devs/GitInfo?style=for-the-badge&logo=github&color=gold)](https://github.com/M5Devs/GitInfo/stargazers)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[**🌐 Explore Live App**](https://gitinfo.pages.dev) • [**Report Bug**](https://github.com/M5Devs/GitInfo/issues) • [**Request Feature**](https://github.com/M5Devs/GitInfo/issues)

</div>

---

GitInfo is a modern, lightweight, and responsive web application designed to inspect and display detailed metrics for any public GitHub repository, with a primary focus on calculating and formatting repository size.

## ✨ Features

- **Dynamic Size Calculation:** Displays repository weight dynamically in KB, MB, or GB with high precision and an interactive gauge bar.
- **Instant Search & Regex Parsing:** Parses standard GitHub URLs (`https://github.com/owner/repo`) or plain `owner/repo` formats with instant validation.
- **Language Breakdown:** Color-coded proportional visualization of repository languages and percentages.
- **GitHub PAT Support:** Optional Personal Access Token field saved to `localStorage` to bypass the 60 requests/hour unauthenticated rate limit.
- **Hero Repository Dashboard:** Displays key stats (Stars ⭐, Forks 🍴, Open Issues ⚠️, Watchers 👀), license type, default branch, description, homepage, and relative time of last push.
- **Dark-Mode-First Aesthetic:** Clean, modern developer-focused UI inspired by Vercel and GitHub styling.
- **Cloudflare Pages Ready:** Builds clean static output to `dist/`.

## 🛠️ Tech Stack

- **Framework & Build:** Vite + Vanilla TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest
- **Deployment Target:** Cloudflare Pages (`dist/`)

## 📜 License

This project is licensed under the Apache 2.0 License. See `LICENSE` for details.
