# 📖 Between The Panels

**Between The Panels** is a personal anime journal and archive inspired by manga panel layouts.

It allows users to track the anime they’ve watched, rate them, write personal notes, and automatically fetch cover images and metadata from a public API.

This project was built as part of my journey into full-stack web development.

---

## 📸 Screenshots

![Homepage](/screenshots/home.png)

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Setup](#-database-setup)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the App](#-running-the-app)
- [Backfill Script](#-backfill-script)
- [Adding Entries](#-adding-entries)
- [Design Concept](#-design-concept)
- [Future Improvements](#-future-improvements)
- [Author](#-author)

## 📘 About the Project

This website works as my personal anime diary.

Instead of using public list platforms, I wanted to build my own system where:

- I control the data
- I write my own reviews
- I design the interface
- I manage the database

The visual style is inspired by manga panels and paper textures to create a “reading” experience while scrolling.

---

## ✨ Features

- 📚 Personal anime collection
- ⭐ Ratings (out of 10)
- 📝 Personal notes
- 🖼️ Automatic cover images
- 🔗 MyAnimeList links
- 📅 Date added
- 📊 Episode count
- 🏷️ Custom English titles
- 🔍 Sorting (title, rating, date)
- 🎨 Manga-inspired UI
- 📱 Responsive layout

---

## 🛠️ Tech Stack

### Frontend

- HTML5
- CSS3
- EJS Templates

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### API

- Jikan (MyAnimeList API)

### Other Tools

- Axios
- dotenv
- nodemon

---

## 📂 Project Structure

Between-The-Panels/
│
├── public/
│ ├── assets/
│ └── styles/
│
├── views/
│ └── index.ejs
│
├── scripts/
│ └── backfill.js
│
├── index.js
├── .env
├── .gitignore
└── README.md

---

## 🗄️ Database Setup

Create the database table:

Database:

- PostgreSQL
- pgAdmin (database management)

```sql
CREATE TABLE anime_entries (
  id SERIAL PRIMARY KEY,

  title TEXT,
  custom_name TEXT,

  rating INTEGER,
  note TEXT,

  cover_url TEXT,
  mal_id INTEGER,
  mal_url TEXT,

  episodes INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/zivasann/between-the-panels.git
cd between-the-panels
```

Install dependencies:

```bash
npm install
```

## 🔐 Environment Variables

Create .env in the root folder:

PGUSER=postgres
PGHOST=localhost
PGDATABASE=your_database
PGPASSWORD=your_password
PGPORT=5432
PORT=3000

Do not upload this file to GitHub.

## ▶️ Running the App

Start the server:

```bash
nodemon index.js
```

or

```bash
node index.js
```

Open in browser:

http://localhost:3000

## 🔄 Backfill Script

To fetch missing API data:

```bash
node scripts/backfill.js
```

This updates:

Cover images

MyAnimeList links

Episode count

Titles

## 📝 Adding Entries

Add via database:

INSERT INTO anime_entries (title, rating, note)
VALUES ('Naruto', 8, 'A nostalgic shōnen classic...');

Then run backfill.

## 🎨 Design Concept

Inspired by:

Manga panels

Paper textures

Ink frames

Reading-style scrolling

Designed to feel like browsing a manga journal.

## 🚀 Future Improvements

Authentication

Comments

Search

Tags

Statistics

Dark mode

Mobile UX

## 👩‍💻 Author

Created by Diana Hydzik

Aspiring Full-Stack Developer
