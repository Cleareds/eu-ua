/**
 * Downloads real historical photos from Wikipedia, then uses gemini-2.5-flash-image
 * to restyle each one as a consistent black-and-white portrait.
 *
 * Usage:
 *   GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts
 *   GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts --force
 *   GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts --id=taras-shevchenko
 *
 * Output: public/people/{id}.png (square, B&W)
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlyId = args.find((a) => a.startsWith("--id="))?.split("=")[1];

const peopleJson = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "data/people.json"), "utf-8")
);

const outputDir = path.join(process.cwd(), "public/people");
fs.mkdirSync(outputDir, { recursive: true });

// Wikipedia article titles for each person
const WIKI_TITLES: Record<string, string> = {
  "yaroslav-wise":          "Yaroslav_the_Wise",
  "taras-shevchenko":       "Taras_Shevchenko",
  "ivan-franko":            "Ivan_Franko",
  "ivan-mazepa":            "Ivan_Mazepa",
  "solomiya-krushelnytska": "Solomiya_Krushelnytska",
  "paul-celan":             "Paul_Celan",
  "lesya-ukrainka":         "Lesya_Ukrainka",
  "kazimir-malevich":       "Kazimir_Malevich",
  "yuri-kondratyuk":        "Yuri_Kondratyuk",
  "igor-sikorsky":          "Igor_Sikorsky",
  "mykola-leontovych":      "Mykola_Leontovych",
  "oleksandr-dovzhenko":    "Oleksandr_Dovzhenko",
  "lev-landau":             "Lev_Landau",
  "john-hughes":            "John_Hughes_(industrialist)",
  "vasyl-stus":             "Vasyl_Stus",
  "hryhorii-skovoroda":     "Hryhorii_Skovoroda",
  "pamfil-yurkevych":       "Pamfil_Yurkevych",
  "mykhailo-drahomanov":    "Mykhailo_Drahomanov",
  "volodymyr-vernadsky":    "Vladimir_Vernadsky",
  "maria-pryimachenko":     "Maria_Pryimachenko",
};

// Style prompt applied to every image
const RESTYLE_PROMPT =
  "Apply a dramatic black-and-white photographic treatment to this historical image. " +
  "High-contrast monochrome: deep rich blacks, bright whites, sharp mid-tones. " +
  "Tight head-and-shoulders crop centred on the face, plain dark background. " +
  "Square 1:1 output. Cinematic editorial style. No text, no watermarks, no borders.";

// Fallback direct Wikimedia Commons URLs for people whose Wikipedia summary has no image
const FALLBACK_IMAGE_URLS: Record<string, { url: string; mimeType: string }> = {
  "paul-celan": {
    url: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Celan_1938.jpg",
    mimeType: "image/jpeg",
  },
  "john-hughes": {
    url: "https://upload.wikimedia.org/wikipedia/en/0/08/John_James_Hughes.jpg",
    mimeType: "image/jpeg",
  },
  "vasyl-stus": {
    url: "https://upload.wikimedia.org/wikipedia/commons/4/4d/Vasyl_Stus_%281938-1985%29.jpg",
    mimeType: "image/jpeg",
  },
  "pamfil-yurkevych": {
    url: "https://upload.wikimedia.org/wikipedia/commons/9/92/Pamfil_Yurkevych.jpg",
    mimeType: "image/jpeg",
  },
};

// Text-only B&W portrait prompts for people where image-to-image is blocked
const TEXT_ONLY_BW_PROMPTS: Record<string, string> = {
  "paul-celan":
    "Dramatic black-and-white studio portrait of a Jewish poet from Chernivtsi, Ukraine, living in Paris in the 1960s. " +
    "Thin angular face, dark hair swept back from high forehead, deep melancholic eyes, prominent nose, wearing dark suit and tie. " +
    "High-contrast monochrome, cinematic lighting, square 1:1 format, tight head-and-shoulders crop, plain dark background. No text.",
  "kazimir-malevich":
    "Dramatic black-and-white studio portrait of a Ukrainian-born avant-garde artist from Kyiv, early 20th century. " +
    "Strong broad face, very high prominent cheekbones, piercing wide-set eyes, short hair, clean-shaven. " +
    "High-contrast monochrome, cinematic lighting, square 1:1 format, tight head-and-shoulders crop, plain dark background. No text.",
  "yuri-kondratyuk":
    "Dramatic black-and-white studio portrait of a young Ukrainian self-taught engineer and space pioneer, 1920s Soviet era, age early 30s. " +
    "Angular Slavic face, dark hair, high forehead, intelligent thoughtful eyes, simple shirt. " +
    "High-contrast monochrome, cinematic lighting, square 1:1 format, tight head-and-shoulders crop, plain dark background. No text.",
  "igor-sikorsky":
    "Dramatic black-and-white studio portrait of a distinguished Ukrainian-American aviation engineer and inventor, age 60s, mid-20th century. " +
    "Round kind face, balding on top with dark hair on sides, warm intelligent eyes, clean-shaven, formal suit and tie. " +
    "High-contrast monochrome, cinematic lighting, square 1:1 format, tight head-and-shoulders crop, plain dark background. No text.",
  "lev-landau":
    "Dramatic black-and-white studio portrait of a theoretical physicist who worked in Kharkiv, Ukraine, Nobel laureate, age 45, mid-20th century. " +
    "Famously elongated thin face, dark deep-set eyes, wire-rimmed round glasses, dark receding hair, slender build, suit jacket. " +
    "High-contrast monochrome, cinematic lighting, square 1:1 format, tight head-and-shoulders crop, plain dark background. No text.",
  "volodymyr-vernadsky":
    "Dramatic black-and-white studio portrait of an elderly distinguished Ukrainian scientist and philosopher, founder of the Ukrainian Academy of Sciences, age late 70s. " +
    "Full neat white beard, white hair, wire-rimmed glasses, warm wise eyes, dark suit. " +
    "High-contrast monochrome, cinematic lighting, square 1:1 format, tight head-and-shoulders crop, plain dark background. No text.",
};

// ─── HTTP helpers ────────────────────────────────────────────────────────────

function fetchBuffer(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    client.get(url, { headers: { "User-Agent": "eu-ua-portrait-script/1.0" } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 303) {
        return fetchBuffer(res.headers.location!).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

function fetchJson(url: string): Promise<any> {
  return fetchBuffer(url).then((b) => JSON.parse(b.toString("utf-8")));
}

// ─── Wikipedia image fetcher ─────────────────────────────────────────────────

async function getWikipediaImage(title: string): Promise<{ url: string; mimeType: string } | null> {
  // Try REST v1 summary first
  try {
    const data = await fetchJson(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    );
    const imgUrl: string | undefined = data.originalimage?.source ?? data.thumbnail?.source;
    if (imgUrl) {
      const mime = imgUrl.match(/\.png(\?|$)/i) ? "image/png" : "image/jpeg";
      return { url: imgUrl, mimeType: mime };
    }
  } catch {}

  // Fallback: MediaWiki API pageimages
  try {
    const data = await fetchJson(
      `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=pageimages&format=json&pithumbsize=600&piprop=original`
    );
    const pages = Object.values(data.query?.pages ?? {}) as any[];
    const imgUrl = pages[0]?.original?.source ?? pages[0]?.thumbnail?.source;
    if (imgUrl) {
      const mime = imgUrl.match(/\.png(\?|$)/i) ? "image/png" : "image/jpeg";
      return { url: imgUrl, mimeType: mime };
    }
  } catch {}

  return null;
}

// ─── Gemini image-to-image ───────────────────────────────────────────────────

async function restyle(imageBuffer: Buffer, mimeType: string): Promise<{ data: Buffer; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{
        role: "user",
        parts: [
          { text: RESTYLE_PROMPT },
          { inlineData: { mimeType, data: imageBuffer.toString("base64") } },
        ],
      }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        try {
          const json = JSON.parse(raw);
          if (json.error) return reject(new Error(`API error: ${json.error.message}`));
          const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
          const imgPart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
          if (!imgPart) {
            const text = parts.find((p: any) => p.text)?.text ?? "";
            const reason = json.candidates?.[0]?.finishReason ?? "";
            return reject(new Error(`No image returned. Reason: ${reason}. ${text.slice(0, 200)}`));
          }
          resolve({
            data: Buffer.from(imgPart.inlineData.data, "base64"),
            mimeType: imgPart.inlineData.mimeType,
          });
        } catch {
          reject(new Error(`Parse error: ${raw.slice(0, 300)}`));
        }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function generateTextOnly(prompt: string): Promise<{ data: Buffer; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
    });
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/gemini-2.5-flash-image:generateContent?key=${API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        try {
          const json = JSON.parse(raw);
          if (json.error) return reject(new Error(`API error: ${json.error.message}`));
          const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
          const imgPart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
          if (!imgPart) return reject(new Error(`No image: ${json.candidates?.[0]?.finishReason}`));
          resolve({ data: Buffer.from(imgPart.inlineData.data, "base64"), mimeType: imgPart.inlineData.mimeType });
        } catch { reject(new Error(`Parse error: ${raw.slice(0, 200)}`)); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function ext(mime: string) {
  return mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const people: any[] = onlyId
    ? peopleJson.filter((p: any) => p.id === onlyId)
    : peopleJson;

  if (!people.length) { console.error(`No person found: "${onlyId}"`); process.exit(1); }

  console.log(`Processing ${people.length} portraits...\n`);

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const wikiTitle = WIKI_TITLES[person.id];

    if (!wikiTitle) {
      console.warn(`  ⚠ No Wikipedia title for "${person.id}" — skipping`);
      continue;
    }

    const existingFile = ["png", "jpg", "webp"]
      .map((e) => path.join(outputDir, `${person.id}.${e}`))
      .find((f) => fs.existsSync(f));

    if (!force && existingFile) {
      console.log(`  ✓ ${person.name} — already exists, skipping`);
      continue;
    }

    process.stdout.write(`  → ${person.name}... `);

    // 1. Fetch reference image from Wikipedia (with fallback to direct Wikimedia URL)
    let imgInfo = await getWikipediaImage(wikiTitle);
    if (!imgInfo) {
      imgInfo = FALLBACK_IMAGE_URLS[person.id] ?? null;
      if (!imgInfo) {
        console.log(`SKIP — no image found`);
        continue;
      }
    }

    let sourceBuffer: Buffer;
    try {
      sourceBuffer = await fetchBuffer(imgInfo.url);
      process.stdout.write(`got reference (${Math.round(sourceBuffer.length / 1024)}KB)... `);
    } catch (e) {
      console.log(`SKIP — download failed: ${(e as Error).message}`);
      continue;
    }

    // 2. Restyle via Gemini (with text-only fallback if image-to-image is blocked)
    try {
      let result: { data: Buffer; mimeType: string };
      try {
        result = await restyle(sourceBuffer, imgInfo.mimeType);
      } catch (e) {
        const fallbackPrompt = TEXT_ONLY_BW_PROMPTS[person.id];
        if (fallbackPrompt && (e as Error).message.includes("IMAGE_OTHER") || (e as Error).message.includes("RECITATION")) {
          process.stdout.write(`(image blocked, using text fallback)... `);
          result = await generateTextOnly(fallbackPrompt);
        } else {
          throw e;
        }
      }
      const { data, mimeType: outMime } = result;
      const outExt = ext(outMime);
      const outPath = path.join(outputDir, `${person.id}.${outExt}`);

      // Remove old versions with different extensions
      ["png", "jpg", "webp"].forEach((e) => {
        const old = path.join(outputDir, `${person.id}.${e}`);
        if (e !== outExt && fs.existsSync(old)) fs.unlinkSync(old);
      });

      fs.writeFileSync(outPath, data);
      console.log(`saved ${person.id}.${outExt} (${Math.round(data.length / 1024)}KB)`);
    } catch (e) {
      console.log(`FAILED — ${(e as Error).message}`);
    }

    if (i < people.length - 1) await sleep(1500);
  }

  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exit(1); });
