import express from "express";
import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

/* =======================
   DATABASE
======================= */

const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432),
});

await db.connect();
console.log("Connected to PostgreSQL");

/* =======================
   MIDDLEWARE
======================= */

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

/* =======================
   HELPERS
======================= */

function buildOrderBy(sort) {
  switch (sort) {
    case "title":
      return "custom_name ASC";
    case "newest":
      return "created_at DESC";
    case "best":
    default:
      return "rating DESC NULLS LAST, created_at DESC";
  }
}

async function fetchCoverFromJikan(title) {
  const { data } = await axios.get("https://api.jikan.moe/v4/anime", {
    params: { q: title, limit: 1 },
    timeout: 10000,
  });

  const first = data?.data?.[0];
  if (!first) return null;

  return {
    malId: first.mal_id ?? null,
    malUrl: first.url ?? null, // ✅ correct field name
    imageUrl:
      first.images?.jpg?.image_url ?? first.images?.webp?.image_url ?? null,
    canonicalTitle: first.title ?? title,
    episodes: first.episodes ?? null,
  };
}

/* =======================
   ROUTES
======================= */

// HOME / LIST
app.get("/", async (req, res) => {
  const sort = req.query.sort || "best";
  const orderBy = buildOrderBy(sort);

  const result = await db.query(`
    SELECT
      id,
      title,
      custom_name,
      rating,
      note,
      cover_url,
      mal_id,
      mal_url,
      created_at,
      episodes
    FROM anime_entries
    ORDER BY ${orderBy};
  `);

  res.render("index", {
    entries: result.rows,
    sort,
  });
});

// ADD ANIME
app.post("/anime", async (req, res) => {
  const title = (req.body.title || "").trim();
  const custom_name = (req.body.custom_name || "").trim();
  const ratingRaw = (req.body.rating || "").trim();
  const note = (req.body.note || "").trim();

  console.log("POST /anime body:", req.body); // ✅ proves form is reaching route

  if (!title) return res.redirect("/");

  const rating = ratingRaw ? Number(ratingRaw) : null;

  let api = null;
  try {
    api = await fetchCoverFromJikan(title);
    console.log("Jikan result:", api); // ✅ shows cover/link values
  } catch (e) {
    console.error("Jikan error:", e?.response?.status, e?.message);
  }

  await db.query(
    `INSERT INTO anime_entries (title, custom_name, rating, note, cover_url, mal_id, mal_url, episodes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      api?.canonicalTitle ?? title,
      Number.isFinite(rating) ? rating : null,
      note || null,
      api?.coverUrl ?? null, // ✅ matches helper name
      api?.malId ?? null,
      api?.malUrl ?? null,
      api?.episodes ?? null,
    ]
  );

  res.redirect("/");
});

// DELETE
app.post("/anime/:id/delete", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isFinite(id)) return res.redirect("/");

  await db.query("DELETE FROM anime_entries WHERE id = $1", [id]);

  res.redirect("/");
});

/* =======================
   SERVER
======================= */

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
