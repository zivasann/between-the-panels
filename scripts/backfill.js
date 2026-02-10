import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const db = new pg.Client({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: Number(process.env.PGPORT || 5432),
});

async function fetchFromJikan(title) {
  const { data } = await axios.get("https://api.jikan.moe/v4/anime", {
    params: { q: title, limit: 1 },
    timeout: 10000,
  });

  const first = data?.data?.[0];
  if (!first) return null;

  return {
    canonicalTitle: first.title ?? title,
    malId: first.mal_id ?? null,
    malUrl: first.url ?? null, // ✅ correct field name
    coverUrl:
      first.images?.jpg?.image_url ?? first.images?.webp?.image_url ?? null,
    episodes: first.episodes ?? null,
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  await db.connect();

  // 1) Find entries missing cover or link
  const { rows } = await db.query(`
    SELECT id, title
    FROM anime_entries
    WHERE cover_url IS NULL OR mal_url IS NULL OR episodes IS NULL
    ORDER BY id ASC
  `);

  console.log(`Found ${rows.length} entries to update.`);

  // 2) For each one, call the API and update row
  for (const row of rows) {
    console.log(`\n[${row.id}] Searching: ${row.title}`);

    let api;
    try {
      api = await fetchFromJikan(row.title);
    } catch (err) {
      console.log(`  ❌ API error: ${err.message}`);
      continue;
    }

    if (!api) {
      console.log("  ⚠️ No match found.");
      continue;
    }

    console.log("  ✅ Found:", {
      title: api.canonicalTitle,
      malId: api.malId,
      hasCover: Boolean(api.coverUrl),
      hasLink: Boolean(api.malUrl),
    });

    await db.query(
      `
      UPDATE anime_entries
      SET
        title = $2,
        cover_url = $3,
        mal_id = $4,
        mal_url = $5,
        episodes = $6
      WHERE id = $1
      `,
      [
        row.id,
        api.canonicalTitle,
        api.coverUrl,
        api.malId,
        api.malUrl,
        api.episodes,
      ]
    );

    // small pause to be polite to the API (helps avoid rate limiting)
    await sleep(600);
  }

  await db.end();
  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
