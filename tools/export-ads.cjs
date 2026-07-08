const path = require("node:path");
const fs = require("node:fs/promises");
const { chromium } = require("playwright");

async function main() {
  const root = path.resolve(__dirname, "..");
  const adHtml = path.join(root, "Ad Creatives.dc.html");
  const outRoot = path.join(root, "facebook-ads-7");
  await fs.mkdir(outRoot, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
  });
  const page = await browser.newPage({ viewport: { width: 1300, height: 1300 }, deviceScaleFactor: 1 });
  await page.goto(`file:///${adHtml.replaceAll("\\", "/")}`, { waitUntil: "load" });
  await page.addStyleTag({
    content: `
      body { background: #0a0908 !important; }
      .adframe { width: 1080px !important; height: 1080px !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
      .ad1080 { transform: none !important; }
    `
  });
  await page.evaluate(async () => {
    await document.fonts?.ready;
    await Promise.all(Array.from(document.images).map((img) => img.complete ? Promise.resolve() : new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve;
    })));
  });

  for (let i = 1; i <= 10; i += 1) {
    const id = String(i).padStart(2, "0");
    await page.locator(`#ad${i} .adframe`).screenshot({ path: path.join(outRoot, `ad-${id}.png`) });
  }

  await browser.close();
  console.log(`Exported 10 square ads to ${outRoot}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
