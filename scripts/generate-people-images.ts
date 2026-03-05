/**
 * Generates portrait images for all people in data/people.json
 * using gemini-2.5-flash-image via the Gemini API generateContent endpoint.
 *
 * Usage:
 *   GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts
 *   GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts --force
 *   GEMINI_API_KEY=your_key npx tsx scripts/generate-people-images.ts --id=taras-shevchenko
 *
 * Output: public/people/{id}.png (1024×1024, square)
 */

import fs from "fs";
import path from "path";
import https from "https";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Error: GEMINI_API_KEY environment variable is not set.");
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

// Shared suffix for every prompt — enforces consistent portrait format
const PORTRAIT_SUFFIX =
  "Square 1:1 format, tight head-and-shoulders crop, subject looking directly at viewer, " +
  "sharp focus on face, soft studio lighting, plain dark neutral background. " +
  "Photorealistic, highly detailed, cinematic portrait photography style. " +
  "No text, no watermarks, no borders, no landscapes, no full-body shots.";

// Per-person prompts based on actual historical photographs, paintings, and forensic reconstructions
const PROMPTS: Record<string, string> = {
  "yaroslav-wise":
    `Photorealistic portrait of Yaroslav the Wise (978–1054), Grand Prince of Kyiv. ` +
    `Based on forensic facial reconstruction from his skull: broad Slavic face, strong square jaw, ` +
    `prominent cheekbones, full dark beard streaked with grey, deep-set authoritative eyes, ` +
    `wearing a Byzantine-style gold crown and royal red and gold robes. ` +
    `Medieval ruler, dignified and powerful. ${PORTRAIT_SUFFIX}`,

  "taras-shevchenko":
    `Photorealistic portrait of Taras Shevchenko (1814–1861), Ukrainian national poet and painter. ` +
    `Based on his own self-portraits and contemporaneous photographs: round broad Slavic face, ` +
    `prominent wide nose, large dark expressive eyes, dark hair, full beard and mustache turning grey, ` +
    `wearing a simple dark coat or peasant shirt. Warm, soulful, world-weary expression. ${PORTRAIT_SUFFIX}`,

  "ivan-franko":
    `Photorealistic portrait of Ivan Franko (1856–1916), Ukrainian writer and intellectual. ` +
    `Based on late 19th-century photographs: stocky broad-shouldered man, full dark beard ` +
    `going grey at the edges, broad forehead, intense deep-set grey-brown eyes, ` +
    `wearing a dark suit with high collar. Galician intellectual, mid-50s appearance. ${PORTRAIT_SUFFIX}`,

  "ivan-mazepa":
    `Photorealistic portrait of Ivan Mazepa (1639–1709), Hetman of Ukraine. ` +
    `Based on contemporary 17th-century portrait paintings: aristocratic weathered face in his late 60s, ` +
    `long pointed Cossack mustache with no beard, long dark hair greying at temples, ` +
    `wearing elaborately embroidered Hetman's regalia with a fur-trimmed coat. ` +
    `Proud, noble, resolute expression. ${PORTRAIT_SUFFIX}`,

  "solomiya-krushelnytska":
    `Photorealistic portrait of Solomiya Krushelnytska (1872–1952), Ukrainian opera soprano. ` +
    `Based on early 20th-century opera photographs: beautiful oval face, dark lustrous hair ` +
    `elegantly styled up, fine Galician features, large expressive dark eyes, ` +
    `wearing an elegant dark evening dress. Graceful, commanding operatic presence, age 30s-40s. ${PORTRAIT_SUFFIX}`,

  "paul-celan":
    `Photorealistic studio portrait of a European man in his 40s, 1950s Paris. ` +
    `Thin angular face, dark hair swept back from a high forehead, ` +
    `deep-set melancholic eyes, prominent straight nose, wearing a dark suit with tie. ` +
    `Introspective, poetic expression. ${PORTRAIT_SUFFIX}`,

  "lesya-ukrainka":
    `Photorealistic portrait of Lesya Ukrainka (1871–1913), Ukrainian poet and playwright. ` +
    `Based on 1890s-1900s photographs: delicate pale oval face, dark hair parted in the middle ` +
    `and pulled back, large sad intelligent eyes, fine features, slight fragility in her appearance ` +
    `from chronic illness, wearing a simple dark blouse with white collar. Age mid-30s. ${PORTRAIT_SUFFIX}`,

  "kazimir-malevich":
    `Photorealistic portrait of Kazimir Malevich (1879–1935), Kyiv-born founder of Suprematism. ` +
    `Based on known photographs and self-portraits: very strong broad face, high prominent Slavic ` +
    `cheekbones, piercing wide-set grey eyes, short dark hair, clean-shaven, ` +
    `wearing a simple dark shirt or artist's smock. Intense, uncompromising, direct gaze. ${PORTRAIT_SUFFIX}`,

  "yuri-kondratyuk":
    `Photorealistic portrait of Yuri Kondratyuk (1897–1941), Ukrainian space pioneer and engineer. ` +
    `Based on 1920s-30s photographs: young man in his 30s, angular Slavic face, dark hair, ` +
    `high forehead, thoughtful intelligent eyes, wearing a simple Soviet-era shirt or jacket. ` +
    `Self-taught genius, modest, quietly intense expression. ${PORTRAIT_SUFFIX}`,

  "igor-sikorsky":
    `Photorealistic studio portrait of a distinguished American engineer, age 60s, mid-20th century. ` +
    `Round kind face, balding on top with dark hair on sides, warm intelligent eyes, clean-shaven, ` +
    `wearing a suit and tie. Approachable, confident, senior executive presence. ${PORTRAIT_SUFFIX}`,

  "mykola-leontovych":
    `Photorealistic portrait of Mykola Leontovych (1877–1921), Ukrainian composer of Carol of the Bells. ` +
    `Based on contemporary photographs: gentle face, dark full beard and mustache, ` +
    `sensitive musician's eyes, modest dark clothing. Quiet, introspective, artistic expression. ${PORTRAIT_SUFFIX}`,

  "oleksandr-dovzhenko":
    `Photorealistic portrait of Oleksandr Dovzhenko (1894–1956), Ukrainian film director. ` +
    `Based on known photographs: strong angular Slavic face, high cheekbones, deep-set intense ` +
    `dark eyes, dark hair, clean-shaven, wearing a dark shirt or jacket. ` +
    `Visionary filmmaker, authoritative, passionate expression. ${PORTRAIT_SUFFIX}`,

  "lev-landau":
    `Photorealistic studio portrait of a European scientist, age 45, mid-20th century. ` +
    `Elongated thin face, dark deep-set eyes, wire-rimmed round glasses, dark receding hair, ` +
    `slender build, wearing a suit jacket with open collar. ` +
    `Intellectually vibrant, slightly eccentric, animated expression. ${PORTRAIT_SUFFIX}`,

  "john-hughes":
    `Photorealistic portrait of John Hughes (1814–1889), Welsh industrialist who founded Donetsk. ` +
    `Victorian-era Welsh businessman: sturdy stocky build, full Victorian-style beard and sideburns, ` +
    `dark hair, confident industrialist's bearing, wearing a formal Victorian frock coat and cravat. ` +
    `Self-made man, determined and pragmatic expression. ${PORTRAIT_SUFFIX}`,

  "vasyl-stus":
    `Photorealistic portrait of a Ukrainian poet and political prisoner of the Soviet era, 1970s. ` +
    `Gaunt thin face marked by hardship, intensely dark deep-set eyes burning with conviction, ` +
    `dark hair, slight stubble, wearing a simple dark shirt. ` +
    `Suffering yet unbroken, defiant inner strength, age late 30s to 40s. ${PORTRAIT_SUFFIX}`,

  "hryhorii-skovoroda":
    `Photorealistic portrait of Hryhorii Skovoroda (1722–1794), Ukraine's greatest philosopher. ` +
    `Based on 18th-century portrait paintings: elderly man in his 60s-70s, long flowing white ` +
    `beard and long grey-white hair, wise deep-set eyes, lean weathered wanderer's face, ` +
    `wearing simple dark philosopher's robes or a plain dark coat. Serene, wise, Socratic expression. ${PORTRAIT_SUFFIX}`,

  "pamfil-yurkevych":
    `Photorealistic portrait of Pamfil Yurkevych (1826–1874), Ukrainian philosopher. ` +
    `19th-century Ukrainian academic: full dark beard and mustache, high scholarly forehead, ` +
    `thoughtful eyes, wearing a dark academic frock coat. ` +
    `Gentle, deeply contemplative, philosophical expression. ${PORTRAIT_SUFFIX}`,

  "mykhailo-drahomanov":
    `Photorealistic portrait of Mykhailo Drahomanov (1841–1895), Ukrainian political philosopher. ` +
    `Based on 1870s-90s photographs: full dark beard and mustache streaked with grey, ` +
    `broad intellectual forehead, intense dark eyes, wearing a dark frock coat. ` +
    `Revolutionary intellectual, passionate, principled expression. ${PORTRAIT_SUFFIX}`,

  "volodymyr-vernadsky":
    `Photorealistic portrait of Volodymyr Vernadsky (1863–1945), Ukrainian scientist and philosopher. ` +
    `Based on well-known photographs: distinguished elderly man in his 70s-80s, ` +
    `full neat white beard, white hair, wire-rimmed glasses, warm wise eyes, ` +
    `wearing a dark suit. Gentle, brilliant, grandfatherly scientific authority. ${PORTRAIT_SUFFIX}`,

  "maria-pryimachenko":
    `Photorealistic portrait of an elderly Ukrainian folk artist and painter from the Kyiv region, age 70s-80s. ` +
    `Round warm peasant face, white hair pulled neatly back, kind eyes full of life and creativity, ` +
    `wearing a traditional Ukrainian embroidered blouse (vyshyvanka) with a dark cardigan. ` +
    `Warm, wise, earthy Ukrainian grandmother artist. ${PORTRAIT_SUFFIX}`,
};

async function generateImage(prompt: string): Promise<{ data: Buffer; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
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
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const raw = Buffer.concat(chunks).toString("utf-8");
        try {
          const json = JSON.parse(raw);
          if (json.error) {
            reject(new Error(`API error: ${json.error.message}`));
            return;
          }
          const parts: any[] = json.candidates?.[0]?.content?.parts ?? [];
          const imagePart = parts.find((p: any) => p.inlineData?.mimeType?.startsWith("image/"));
          if (!imagePart) {
            // Log any text response for debugging
            const textPart = parts.find((p: any) => p.text);
            reject(new Error(`No image in response. Text: ${textPart?.text ?? raw.slice(0, 300)}`));
            return;
          }
          resolve({
            data: Buffer.from(imagePart.inlineData.data, "base64"),
            mimeType: imagePart.inlineData.mimeType,
          });
        } catch (e) {
          reject(new Error(`Failed to parse response: ${raw.slice(0, 400)}`));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function mimeToExt(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  return "jpg";
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const people: any[] = onlyId
    ? peopleJson.filter((p: { id: string }) => p.id === onlyId)
    : peopleJson;

  if (people.length === 0) {
    console.error(`No person found with id "${onlyId}"`);
    process.exit(1);
  }

  console.log(`Generating portraits for ${people.length} people using gemini-2.5-flash-image...\n`);

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    const prompt = PROMPTS[person.id];

    if (!prompt) {
      console.warn(`  ⚠ No prompt defined for "${person.id}" — skipping`);
      continue;
    }

    // Check if any image file already exists for this person
    const existing = ["png", "jpg", "webp"]
      .map((ext) => path.join(outputDir, `${person.id}.${ext}`))
      .find((p) => fs.existsSync(p));

    if (!force && existing) {
      console.log(`  ✓ ${person.name} — already exists (${path.basename(existing)}), skipping`);
      continue;
    }

    console.log(`  → ${person.name} (${person.years})...`);

    try {
      const { data, mimeType } = await generateImage(prompt);
      const ext = mimeToExt(mimeType);
      const outPath = path.join(outputDir, `${person.id}.${ext}`);

      // Remove any old versions with different extension
      ["png", "jpg", "webp"].forEach((e) => {
        const old = path.join(outputDir, `${person.id}.${e}`);
        if (e !== ext && fs.existsSync(old)) fs.unlinkSync(old);
      });

      fs.writeFileSync(outPath, data);
      console.log(`  ✓ Saved ${person.id}.${ext} (${Math.round(data.length / 1024)} KB)`);
    } catch (err) {
      console.error(`  ✗ ${person.name}: ${(err as Error).message}`);
    }

    if (i < people.length - 1) await sleep(1500);
  }

  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
