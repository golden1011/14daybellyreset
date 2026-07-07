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


const beforeAfterProofSection = `
      <div style="max-width: 980px; margin: 34px auto 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; text-align: left;">
        <div style="background: #14120f; border: 1px solid rgba(240,83,28,0.24); border-radius: 12px; overflow: hidden; box-shadow: 0 18px 42px rgba(0,0,0,0.32);">
          <img src="/uploads/How-to-lose-belly-fat-thumbnail.webp" alt="Before and after belly fat transformation" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: cover;">
          <div style="padding: 15px 16px 17px;">
            <div style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; letter-spacing: 1.2px; color: #FF7A3D; font-size: 13px;">THE VISIBLE TARGET</div>
            <div style="font-size: 15.5px; line-height: 1.45; color: rgba(244,240,232,0.74); margin-top: 5px;">The waist is the scoreboard. When it changes, the mirror changes with it.</div>
          </div>
        </div>
        <div style="background: #14120f; border: 1px solid rgba(240,83,28,0.24); border-radius: 12px; overflow: hidden; box-shadow: 0 18px 42px rgba(0,0,0,0.32);">
          <img src="/uploads/1_NNJ8ujTGMBAle2XcMS4ThA.png" alt="Visceral fat before and after illustration" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: contain; object-position: center; background: #f5efe5; padding: 6px;">
          <div style="padding: 15px 16px 17px;">
            <div style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; letter-spacing: 1.2px; color: #FF7A3D; font-size: 13px;">WHAT DROPS FIRST</div>
            <div style="font-size: 15.5px; line-height: 1.45; color: rgba(244,240,232,0.74); margin-top: 5px;">The Reset focuses on the belly fat you feel around the midsection, not a random scale number.</div>
          </div>
        </div>
        <div style="background: #14120f; border: 1px solid rgba(240,83,28,0.24); border-radius: 12px; overflow: hidden; box-shadow: 0 18px 42px rgba(0,0,0,0.32);">
          <img src="/uploads/maxresdefault (1).jpg" alt="Body fat and visceral fat comparison illustration" style="display: block; width: 100%; aspect-ratio: 16 / 9; object-fit: contain; object-position: center; background: #f5efe5; padding: 6px;">
          <div style="padding: 15px 16px 17px;">
            <div style="font-family: 'Barlow Condensed', sans-serif; font-weight: 700; letter-spacing: 1.2px; color: #FF7A3D; font-size: 13px;">THE DIRECTION</div>
            <div style="font-size: 15.5px; line-height: 1.45; color: rgba(244,240,232,0.74); margin-top: 5px;">Less belly, tighter waist, more proof that the plan is moving the right thing.</div>
          </div>
        </div>
      </div>
      <style>
        @media (max-width: 820px) {
          div[style*="grid-template-columns: repeat(3, minmax(0, 1fr))"] { grid-template-columns: 1fr !important; }
        }
      </style>`;
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

  return polishHero(widenLayout(normalizeAssetPaths(injectBeforeAfterProof(html))));
}

export function getThankYouPageHtml() {
  return normalizeAssetPaths(extractDcBody(readWorkspaceFile("Thank You.dc.html")));
}


function injectBeforeAfterProof(html) {
  const marker = `      <div style="font-family: 'Barlow', sans-serif; font-size: 12px; color: rgba(244,240,232,0.35); margin-top: 20px;">Images shown for illustration. Results vary from person to person.</div>`;
  if (!html.includes(marker)) return html;
  return html.replace(marker, `${marker}${beforeAfterProofSection}`);
}

function widenLayout(html) {
  const widths = {
    460: 560,
    470: 620,
    480: 620,
    500: 640,
    520: 660,
    540: 680,
    560: 700,
    620: 780,
    640: 820,
    780: 980
  };

  return html.replace(/max-width: (460|470|480|500|520|540|560|620|640|780)px/g, (_match, width) => {
    return `max-width: ${widths[width]}px`;
  });
}

function polishHero(html) {
  return html
    .replace(
      'border-bottom: 1px solid rgba(240,83,28,0.22); padding: 14px 20px; display: flex;',
      'border-bottom: 1px solid rgba(240,83,28,0.22); padding: 10px 20px; display: flex;'
    )
    .replace(
      'max-width: 820px; margin: 0 auto; padding: 40px 22px 30px; text-align: center;',
      'max-width: 1040px; margin: 0 auto; padding: 18px 22px 12px; text-align: center;'
    )
    .replace(
      'font-size: 46px; line-height: 0.98; letter-spacing: 0.5px; margin: 20px 0 0;',
      'font-size: 46px; line-height: 0.92; letter-spacing: 0.5px; margin: 10px 0 0;'
    )
    .replace(
      'font-size: 44px; display: inline-block;',
      'font-size: 44px; display: inline-block;'
    )
    .replace(
      'font-size: 19px; line-height: 1.5; color: rgba(244,240,232,0.82); margin: 20px auto 0; max-width: 660px; font-weight: 500;',
      'font-size: 17px; line-height: 1.35; color: rgba(244,240,232,0.82); margin: 10px auto 0; max-width: 720px; font-weight: 500;'
    )
    .replace(
      '<div style="margin: 22px auto 0; width: 100%;">',
      '<div style="margin: 6px auto 0; width: min(100%, 760px);">'
    )
    .replace(
      'display: block; max-width: 560px; margin: 26px auto 0; text-decoration: none;',
      'display: block; max-width: 540px; margin: 8px auto 0; text-decoration: none;'
    )
    .replace(
      'font-family: \'Barlow Condensed\', sans-serif; font-size: 15px; letter-spacing: 1px; color: rgba(244,240,232,0.55); margin: 14px 0 0;">One-time payment. No subscription. 60-day money-back guarantee.</p>',
      'font-family: \'Barlow Condensed\', sans-serif; font-size: 13.5px; letter-spacing: 1px; color: rgba(244,240,232,0.72); margin: 8px auto 0; display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;"><span style="display: inline-flex; align-items: center; gap: 6px;"><span style="font-size: 14px; line-height: 1;">&#128274;</span> Secure checkout</span><span style="color: rgba(244,240,232,0.28);">&bull;</span><span>One-time payment</span><span style="color: rgba(244,240,232,0.28);">&bull;</span><span>No subscription</span><span style="color: rgba(244,240,232,0.28);">&bull;</span><span>60-day money-back guarantee</span></p><div style="margin: 7px auto 0; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; font-family: \'Barlow Condensed\', sans-serif; font-weight: 700; letter-spacing: 1.2px; font-size: 12.5px; color: rgba(244,240,232,0.58);"><span style="border: 1px solid rgba(166,184,92,0.45); color: #A6B85C; border-radius: 999px; padding: 5px 10px;">60-DAY GUARANTEE</span><span style="border: 1px solid rgba(240,83,28,0.32); border-radius: 999px; padding: 5px 10px;">INSTANT DIGITAL ACCESS</span><span style="border: 1px solid rgba(240,83,28,0.32); border-radius: 999px; padding: 5px 10px;">NO HIDDEN FEES</span></div>'
    );
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





