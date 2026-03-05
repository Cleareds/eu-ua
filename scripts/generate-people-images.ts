/**
 * Generates portrait illustrations for all people in data/people.json
 * using Google Gemini Imagen 3 API.
 *
 * Usage:
 *   GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts
 *
 * Options:
 *   --force   Regenerate images even if they already exist
 *   --id=xxx  Only generate for a specific person ID
 *
 * Output: public/people/{id}.jpg
 */

import fs from "fs";
import path from "path";
import https from "https";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
  console.error("Usage: GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts");
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

// Consistent portrait style applied to every person
const STYLE =
  "European museum portrait, oil painting style, warm muted earthy tones, " +
  "dignified formal pose, soft directional lighting, plain dark or warm neutral background, " +
  "painterly brushwork, classical realist aesthetic similar to Rembrandt or Vermeer. " +
  "No text, no labels, no borders, no watermarks. Square composition.";

// Fallback prompts for people whose names trigger safety filters
const FALLBACK_PROMPTS: Record<string, string> = {
  "vasyl-stus":
    `Portrait of a Ukrainian poet and political prisoner from the Soviet era (1938–1985). ` +
    `Gaunt, intense face, dark eyes reflecting suffering and resolve. ${STYLE}`,
  "lev-landau":
    `Portrait of a 20th-century Ukrainian-born physicist, Nobel laureate. ` +
    `Intellectual, sharp features, academic setting implied. ${STYLE}`,
  "volodymyr-vernadsky":
    `Portrait of an early 20th-century Ukrainian scientist and philosopher, founder of geochemistry. ` +
    `Distinguished elderly gentleman, white beard, thoughtful expression. ${STYLE}`,
  "maria-pryimachenko":
    `Portrait of a Ukrainian folk artist (1909–1997) from Kyiv region. ` +
    `Elderly woman with a warm, creative expression, traditional Ukrainian elements in background. ${STYLE}`,
};

function buildPrompt(person: {
  id: string;
  name: string;
  years: string;
  role: string;
  birthplace: string;
  era: string;
  description: string;
}): string {
  if (FALLBACK_PROMPTS[person.id]) return FALLBACK_PROMPTS[person.id];
  const era = person.era.replace(/-/g, " ");
  return (
    `Portrait of ${person.name} (${person.years}), ${person.role}, born in ${person.birthplace}. ` +
    `${era} era Ukrainian figure. ` +
    `${STYLE}`
  );
}

async function generateImage(prompt: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        safetyFilterLevel: "block_few",
        personGeneration: "allow_adult",
      },
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/imagen-4.0-generate-001:predict?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        try {
          const json = JSON.parse(raw);
          if (json.error) {
            reject(new Error(`API error: ${json.error.message}`));
            return;
          }
          const b64 = json.predictions?.[0]?.bytesBase64Encoded;
          if (!b64) {
            reject(new Error(`No image in response: ${raw.slice(0, 300)}`));
            return;
          }
          resolve(Buffer.from(b64, "base64"));
        } catch (e) {
          reject(new Error(`Failed to parse response: ${raw.slice(0, 300)}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const people = onlyId
    ? peopleJson.filter((p: { id: string }) => p.id === onlyId)
    : peopleJson;

  if (people.length === 0) {
    console.error(`No person found with id "${onlyId}"`);
    process.exit(1);
  }

  console.log(`Generating images for ${people.length} people...\n`);

  for (const person of people) {
    const outPath = path.join(outputDir, `${person.id}.jpg`);

    if (!force && fs.existsSync(outPath)) {
      console.log(`  ✓ ${person.name} — already exists, skipping`);
      continue;
    }

    const prompt = buildPrompt(person);
    console.log(`  → ${person.name} (${person.years})...`);

    try {
      const imageBuffer = await generateImage(prompt);
      fs.writeFileSync(outPath, imageBuffer);
      console.log(`  ✓ Saved to public/people/${person.id}.jpg (${Math.round(imageBuffer.length / 1024)} KB)`);
    } catch (err) {
      console.error(`  ✗ Failed: ${(err as Error).message}`);
    }

    // Respect API rate limits — 2 requests per second max
    if (people.indexOf(person) < people.length - 1) {
      await sleep(600);
    }
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
