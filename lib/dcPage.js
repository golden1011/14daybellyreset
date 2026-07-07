import fs from "node:fs";
import path from "node:path";

const items = [
  {
    title: "The 14-Day Belly Fat Burning Calendar",
    body: "One page for every day. Exactly what to eat, the 15-minute move, and the single habit that matters. Zero decisions to make."
  },
  {
    title: "10 Done-For-You Meals + One Grocery List",
    body: "Shop once for the whole two weeks. Real food a grown man wants to eat. You never wonder what's for dinner again."
  },
  {
    title: "The Waist Tracker",
    body: "Measure on day 1, day 7, and day 14. The one scoreboard the bathroom scale can't lie to you about."
  },
  {
    title: "The First 24 Hours Guide",
    body: "A short, do-this-now start so you can move while the fire is still lit, instead of waiting for Monday that never comes."
  },
  {
    title: "Daily Orders Checklist",
    body: "Morning, meals, movement, one habit. Check the boxes, close the day, watch the tape move."
  }
];

const stack = [
  { name: "The 14-Day Belly Fat Burning Calendar", value: "$39" },
  { name: "10 Done-For-You Meals + Grocery List", value: "$29" },
  { name: "The Waist Tracker", value: "$17" },
  { name: "The First 24 Hours Guide", value: "$14" },
  { name: "Daily Orders Checklist", value: "$15" }
];

const faqs = [
  {
    q: "I've failed at this before. Why is this different?",
    a: "Because it doesn't ask you to overhaul your life. It's 14 days, one page a day, with every choice already made for you. Small enough to actually finish, which is the only version that ever works."
  },
  {
    q: "Do I need a gym or equipment?",
    a: "No. The movement is 15 minutes a day and you can do all of it at home with nothing but your body and a bit of floor."
  },
  {
    q: "Do I have to quit drinking?",
    a: "No. The plan is built around real life, beer included. You'll learn the small adjustments that let the belly move without going cold turkey on everything you enjoy."
  },
  {
    q: "How fast will I see something?",
    a: "Most men see the tape move by day 7. Fourteen days is enough to prove to yourself the belly can and will shrink when you feed it the right plan."
  },
  {
    q: "Is this a subscription?",
    a: "No. It's a one-time $27 payment. No trial that bills you later, no upsells at checkout, nothing to cancel."
  },
  {
    q: "What if it doesn't work for me?",
    a: "Then you email us inside 60 days and we refund every cent, no questions and no hoops. You keep the materials either way."
  }
];

function readWorkspaceFile(fileName) {
  return fs.readFileSync(path.join(process.cwd(), fileName), "utf8");
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function extractDcBody(html) {
  const match = html.match(/<\/helmet>\s*([\s\S]*?)<\/x-dc>/);
  if (!match) {
    throw new Error("Could not find Design Canvas body content.");
  }
  return match[1].trim();
}

function renderLoop(html, listName, values, replacements) {
  const pattern = new RegExp(
    `<sc-for list="{{ ${listName} }}"[^>]*>([\\s\\S]*?)<\\/sc-for>`,
    "g"
  );

  return html.replace(pattern, (_match, template) =>
    values
      .map((value) => {
        let row = template;
        for (const [token, key] of replacements) {
          row = row.replaceAll(token, escapeHtml(value[key]));
        }
        return row;
      })
      .join("")
  );
}

function getMockupHtml() {
  const mockup = extractDcBody(readWorkspaceFile("Belly Reset Mockup Wide.dc.html"));
  return mockup.replace(
    /<image-slot\b[^>]*src="([^"]+)"[^>]*style="([^"]*)"[^>]*><\/image-slot>/g,
    (_match, src, style) => `<img src="/${src}" alt="" style="${style}; object-fit: cover;">`
  );
}

export function getSalesPageHtml() {
  let html = extractDcBody(readWorkspaceFile("Belly Reset Sales Page.dc.html"));

  html = html.replace(
    /<dc-import name="Belly Reset Mockup Wide"[^>]*><\/dc-import>/,
    getMockupHtml()
  );
  html = renderLoop(html, "items", items, [
    ["{{ item.title }}", "title"],
    ["{{ item.body }}", "body"]
  ]);
  html = renderLoop(html, "stack", stack, [
    ["{{ row.name }}", "name"],
    ["{{ row.value }}", "value"]
  ]);
  html = renderLoop(html, "faqs", faqs, [
    ["{{ q.q }}", "q"],
    ["{{ q.a }}", "a"]
  ]);

  return normalizeAssetPaths(html);
}

export function getThankYouPageHtml() {
  return normalizeAssetPaths(extractDcBody(readWorkspaceFile("Thank You.dc.html")));
}

function normalizeAssetPaths(html) {
  return html
    .replaceAll('src="assets/', 'src="/assets/')
    .replaceAll("src='assets/", "src='/assets/")
    .replaceAll('src="uploads/', 'src="/uploads/')
    .replaceAll("src='uploads/", "src='/uploads/")
    .replaceAll('src="screenshots/', 'src="/screenshots/')
    .replaceAll("src='screenshots/", "src='/screenshots/");
}
