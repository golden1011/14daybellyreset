from __future__ import annotations

import os
import textwrap
import zipfile
from dataclasses import dataclass
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    Flowable,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "output" / "pdf"
DOWNLOAD_DIR = ROOT / "public" / "downloads"

PAGE_W, PAGE_H = letter

INK = colors.HexColor("#171412")
CREAM = colors.HexColor("#F7F1E6")
MUTED = colors.HexColor("#6E6257")
ORANGE = colors.HexColor("#F0531C")
ORANGE_LIGHT = colors.HexColor("#FF7A3D")
GREEN = colors.HexColor("#A6B85C")
TAN = colors.HexColor("#E9D7BB")
LINE = colors.HexColor("#D8C5A8")
PALE = colors.HexColor("#FFF8EC")


@dataclass(frozen=True)
class Meal:
    name: str
    role: str
    ingredients: str
    steps: str
    reset_rule: str


@dataclass(frozen=True)
class Day:
    num: int
    breakfast: str
    lunch: str
    dinner: str
    movement: str
    habit: str
    note: str


MEALS = [
    Meal(
        "3-Egg Reset Plate",
        "Breakfast",
        "3 eggs, spinach or peppers, salsa, 1 piece of fruit, coffee or water.",
        "Scramble eggs with vegetables. Add salsa. Keep toast out unless training hard that day.",
        "Protein first. No sweet drink with breakfast.",
    ),
    Meal(
        "Greek Yogurt Protein Bowl",
        "Breakfast",
        "Plain Greek yogurt, berries, walnuts, cinnamon, optional scoop of protein.",
        "Stir, top, eat. Use plain yogurt, not dessert yogurt.",
        "Sweet taste from fruit only.",
    ),
    Meal(
        "Chicken and Greens Bowl",
        "Lunch",
        "Chicken breast or thighs, big greens, cucumber, tomatoes, olive oil, vinegar.",
        "Batch cook chicken. Build a large salad bowl and keep dressing measured.",
        "Half the bowl is vegetables.",
    ),
    Meal(
        "Turkey Burger Bowl",
        "Lunch",
        "Lean turkey patty, lettuce, pickles, tomato, mustard, roasted potatoes.",
        "Cook patties in a pan. Serve over lettuce with potatoes on the side.",
        "Burger flavor, no drive-through damage.",
    ),
    Meal(
        "Tuna Power Wrap",
        "Lunch",
        "Tuna, Greek yogurt or light mayo, mustard, celery, high-fiber wrap, greens.",
        "Mix tuna, wrap tight, add greens. Use a bowl if you want fewer calories.",
        "One wrap, not two.",
    ),
    Meal(
        "Steak and Roast Veg",
        "Dinner",
        "Lean steak, broccoli, carrots, peppers, olive oil, salt, pepper.",
        "Roast vegetables at 425 F. Sear steak. Stop eating when satisfied, not stuffed.",
        "Vegetables cover half the plate.",
    ),
    Meal(
        "Salmon Rice Plate",
        "Dinner",
        "Salmon, microwave rice or potatoes, asparagus or green beans, lemon.",
        "Bake salmon 10-14 minutes. Add one fist-sized carb portion.",
        "Carb portion is earned and measured.",
    ),
    Meal(
        "Beef and Bean Chili",
        "Dinner",
        "Lean ground beef, beans, crushed tomatoes, onion, chili spice.",
        "Simmer a pot and save leftovers. Top with Greek yogurt, not a cheese blanket.",
        "High protein, high fiber, easy leftovers.",
    ),
    Meal(
        "Chicken Fajita Skillet",
        "Dinner",
        "Chicken, peppers, onions, fajita spice, salsa, avocado, optional corn tortillas.",
        "Cook chicken and vegetables hot and fast. Serve in a bowl or two small tortillas.",
        "Skip chips while cooking.",
    ),
    Meal(
        "Cottage Cheese Night Plate",
        "Snack / Light Meal",
        "Cottage cheese, berries or apple, cucumber, turkey slices or boiled eggs.",
        "Use this when dinner was late, heavy, or chaotic.",
        "Do not turn a snack into a second dinner.",
    ),
]


DAYS = [
    Day(1, "3-Egg Reset Plate", "Chicken and Greens Bowl", "Steak and Roast Veg", "15-min brisk walk", "Measure waist. Take front and side photos.", "Do the start line calmly. No judgment, just data."),
    Day(2, "Greek Yogurt Protein Bowl", "Turkey Burger Bowl", "Chicken Fajita Skillet", "10-min core circuit", "Drink water before every meal.", "The plan starts working when meals stop being random."),
    Day(3, "3-Egg Reset Plate", "Tuna Power Wrap", "Beef and Bean Chili", "15-min brisk walk", "No alcohol today.", "Expect less bloat first. Fat loss follows consistency."),
    Day(4, "Greek Yogurt Protein Bowl", "Chicken and Greens Bowl", "Salmon Rice Plate", "12-min strength circuit", "Stop eating 2 hours before bed.", "Better sleep makes the next day easier."),
    Day(5, "3-Egg Reset Plate", "Turkey Burger Bowl", "Steak and Roast Veg", "15-min brisk walk", "Add one extra vegetable serving.", "Win the plate before you worry about perfection."),
    Day(6, "Greek Yogurt Protein Bowl", "Tuna Power Wrap", "Chicken Fajita Skillet", "10-min core circuit", "If drinking, cap it at 2 and skip snacks.", "Real life is allowed. Wandering is not."),
    Day(7, "3-Egg Reset Plate", "Chicken and Greens Bowl", "Beef and Bean Chili", "20-min walk", "Measure waist again.", "Halfway. Look for the trend, not a miracle."),
    Day(8, "Greek Yogurt Protein Bowl", "Turkey Burger Bowl", "Salmon Rice Plate", "12-min strength circuit", "Protein at every meal.", "The second week is where men usually drift. Stay boring."),
    Day(9, "3-Egg Reset Plate", "Tuna Power Wrap", "Steak and Roast Veg", "15-min brisk walk", "No liquid calories.", "Coffee, water, zero-cal drinks. Keep calories chewable."),
    Day(10, "Greek Yogurt Protein Bowl", "Chicken and Greens Bowl", "Chicken Fajita Skillet", "10-min core circuit", "Eat dinner from a plate, seated.", "No counter grazing. No bag-in-hand eating."),
    Day(11, "3-Egg Reset Plate", "Turkey Burger Bowl", "Beef and Bean Chili", "20-min walk", "10-minute kitchen reset after dinner.", "A cleaner kitchen protects tomorrow morning."),
    Day(12, "Greek Yogurt Protein Bowl", "Tuna Power Wrap", "Salmon Rice Plate", "12-min strength circuit", "Stop at satisfied.", "Leave a few bites if you do not need them."),
    Day(13, "3-Egg Reset Plate", "Chicken and Greens Bowl", "Steak and Roast Veg", "15-min brisk walk", "Plan tomorrow's measurement time.", "Same tape, same spot, same conditions."),
    Day(14, "Greek Yogurt Protein Bowl", "Turkey Burger Bowl", "Chicken Fajita Skillet", "15-min victory walk", "Measure waist. Compare Day 1, 7, and 14.", "You now have proof that simple can move the number."),
]


GROCERY = {
    "Protein": [
        "2 dozen eggs",
        "3 lb chicken breast or boneless thighs",
        "1.5 lb lean ground beef",
        "1.5 lb lean ground turkey",
        "4 salmon fillets",
        "4 cans tuna",
        "2 large tubs plain Greek yogurt",
        "1 tub cottage cheese",
        "Turkey slices or extra boiled eggs for backup protein",
    ],
    "Produce": [
        "Large box spinach or mixed greens",
        "Broccoli, asparagus, or green beans",
        "Bell peppers and onions",
        "Cucumbers, tomatoes, celery",
        "Carrots or other roasting vegetables",
        "Berries, apples, or bananas",
        "Lemons or limes",
        "Avocados",
    ],
    "Carbs and Fiber": [
        "Microwave rice cups or potatoes",
        "Beans for chili",
        "High-fiber wraps",
        "Optional corn tortillas",
    ],
    "Flavor and Staples": [
        "Salsa, mustard, pickles",
        "Crushed tomatoes",
        "Olive oil and vinegar",
        "Chili spice, fajita spice, salt, pepper, cinnamon",
        "Walnuts or almonds",
        "Zero-calorie drinks if they help replace soda or beer",
    ],
}


MOVEMENTS = {
    "15-min brisk walk": [
        "Walk fast enough that talking takes effort.",
        "No phone scrolling. This is the daily reset switch.",
    ],
    "20-min walk": [
        "Same pace as the 15-minute walk, just longer.",
        "Use it as the halfway audit: how do your jeans feel?",
    ],
    "15-min victory walk": [
        "Walk after the final measurement.",
        "Decide which 3 habits you will keep for the next 14 days.",
    ],
    "10-min core circuit": [
        "3 rounds: 30-sec plank, 10 dead bugs per side, 12 glute bridges, 30-sec rest.",
        "Modify by dropping knees on plank or taking more rest.",
    ],
    "12-min strength circuit": [
        "4 rounds: 10 squats, 8 pushups or incline pushups, 12 reverse lunges, 30-sec rest.",
        "Move cleanly. Stop if pain shows up.",
    ],
}


REFERENCES = [
    ("CDC adult physical activity guidance", "https://www.cdc.gov/physical-activity-basics/guidelines/adults.html"),
    ("CDC moderate alcohol guidance", "https://www.cdc.gov/alcohol/about-alcohol-use/moderate-alcohol-use.html"),
    ("AHA waist measurement quick guide", "https://professional.heart.org/en/-/media/PHD-Files/Education/CKMH-Obesity-Measuring-Waist-Circumference_030226.pdf"),
    ("Pontzer et al., Daily energy expenditure through the human life course", "https://pmc.ncbi.nlm.nih.gov/articles/PMC8370708/"),
]


def styles():
    base = getSampleStyleSheet()
    base.add(ParagraphStyle("CoverKicker", fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=ORANGE_LIGHT, alignment=TA_CENTER, spaceAfter=8, uppercase=True))
    base.add(ParagraphStyle("CoverTitle", fontName="Helvetica-Bold", fontSize=40, leading=42, textColor=CREAM, alignment=TA_CENTER, spaceAfter=10))
    base.add(ParagraphStyle("CoverSub", fontName="Helvetica-Bold", fontSize=16, leading=22, textColor=TAN, alignment=TA_CENTER, spaceAfter=18))
    base.add(ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=25, leading=30, textColor=INK, spaceAfter=10))
    base.add(ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=ORANGE, spaceBefore=8, spaceAfter=6))
    base.add(ParagraphStyle("H3", fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=INK, spaceBefore=4, spaceAfter=3))
    base.add(ParagraphStyle("Body", fontName="Helvetica", fontSize=10.4, leading=14.2, textColor=INK, spaceAfter=6))
    base.add(ParagraphStyle("Small", fontName="Helvetica", fontSize=8.4, leading=11, textColor=MUTED, spaceAfter=4))
    base.add(ParagraphStyle("Callout", fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=INK, backColor=colors.HexColor("#F2E4CA"), borderColor=LINE, borderWidth=0.8, borderPadding=9, spaceBefore=8, spaceAfter=10))
    base.add(ParagraphStyle("Center", fontName="Helvetica-Bold", fontSize=12, leading=16, textColor=INK, alignment=TA_CENTER, spaceAfter=8))
    base.add(ParagraphStyle("TableHead", fontName="Helvetica-Bold", fontSize=8.8, leading=10.5, textColor=CREAM, alignment=TA_LEFT))
    base.add(ParagraphStyle("TableCell", fontName="Helvetica", fontSize=8.4, leading=10.4, textColor=INK))
    return base


S = styles()


class CoverBand(Flowable):
    def __init__(self, height=4.8 * inch):
        super().__init__()
        self.width = PAGE_W
        self.height = height

    def draw(self):
        c = self.canv
        c.saveState()
        c.setFillColor(INK)
        c.rect(-inch, -0.4 * inch, PAGE_W + 2 * inch, self.height + inch, fill=1, stroke=0)
        c.setFillColor(ORANGE)
        c.rect(-inch, -0.4 * inch, PAGE_W + 2 * inch, 0.16 * inch, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.circle(PAGE_W - 1.5 * inch, self.height - 0.9 * inch, 0.48 * inch, fill=1, stroke=0)
        c.setStrokeColor(ORANGE_LIGHT)
        c.setLineWidth(2)
        for i in range(9):
            x = 0.2 * inch + i * 0.62 * inch
            c.line(x, 0.48 * inch, x + 0.36 * inch, 0.48 * inch)
        c.restoreState()


class Rule(Flowable):
    def __init__(self, color=LINE, thickness=1):
        super().__init__()
        self.height = 8
        self.color = color
        self.thickness = thickness

    def draw(self):
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(self.thickness)
        self.canv.line(0, 4, self.width, 4)


def checkbox(label: str) -> str:
    return f"[ ] {label}"


def p(text: str, style="Body"):
    return Paragraph(text, S[style])


def bullets(items: list[str], style="Body"):
    return ListFlowable(
        [ListItem(p(item, style), bulletColor=ORANGE) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=14,
        bulletFontName="Helvetica-Bold",
    )


def table(data, widths, header=True, repeat_rows=1):
    rows = []
    for row_index, row in enumerate(data):
        row_cells = []
        for cell in row:
            if hasattr(cell, "wrap"):
                row_cells.append(cell)
            else:
                style = "TableHead" if header and row_index == 0 else "TableCell"
                row_cells.append(p(str(cell), style))
        rows.append(row_cells)
    t = Table(rows, colWidths=widths, repeatRows=repeat_rows if header else 0, hAlign="LEFT")
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        commands += [
            ("BACKGROUND", (0, 0), (-1, 0), INK),
            ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]
    t.setStyle(TableStyle(commands))
    return t


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(doc.leftMargin, PAGE_H - 0.42 * inch, "THE 14-DAY BELLY RESET")
    canvas.setFillColor(ORANGE)
    canvas.rect(doc.leftMargin, PAGE_H - 0.5 * inch, doc.width, 0.03 * inch, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawRightString(PAGE_W - doc.rightMargin, 0.35 * inch, f"Page {doc.page}")
    canvas.drawString(doc.leftMargin, 0.35 * inch, "Educational only. Not medical advice. Results vary.")
    canvas.restoreState()


def cover_story():
    return [
        CoverBand(),
        Spacer(1, -3.9 * inch),
        p("FOR MEN 35+ WITH STUBBORN BELLY FAT", "CoverKicker"),
        p("THE 14-DAY<br/>BELLY RESET", "CoverTitle"),
        p("A one-page-a-day plan to measure your waist, eat from a simple list, move for 15 minutes, and build proof that the belly can move.", "CoverSub"),
        Spacer(1, 2.05 * inch),
        table(
            [
                [p("FIRST 24 HOURS", "TableHead"), p("14 DAILY ORDERS", "TableHead"), p("10 MEALS + GROCERY LIST", "TableHead"), p("WAIST TRACKER", "TableHead")],
                ["Start tonight instead of waiting for Monday.", "One page per day. No guessing.", "Normal food. Repeatable meals.", "Measure Day 1, Day 7, and Day 14."],
            ],
            [1.45 * inch, 1.45 * inch, 1.6 * inch, 1.35 * inch],
        ),
        Spacer(1, 0.2 * inch),
        p("Read this once. Then print the daily pages or keep the PDF open on your phone. The plan works because it removes decisions.", "Callout"),
        PageBreak(),
    ]


def first_24_story():
    return [
        p("Start Here: Your First 24 Hours", "H1"),
        p("You do not need a perfect week. You need one clean day that proves you can follow orders after work, with real food, without a gym.", "Body"),
        p("The Tonight Setup", "H2"),
        table(
            [
                ["Step", "Do This", "Why It Matters"],
                ["1", "Find a tape measure and write down your waist at belly-button height.", "The waist is the scoreboard. The scale can wait."],
                ["2", "Pick tomorrow's breakfast, lunch, and dinner from the meal list.", "No decisions when you are hungry."],
                ["3", "Put a 15-minute walk on the calendar.", "Movement is a daily appointment, not a mood."],
                ["4", "Clear the obvious tripwires: chips, sweets, second-beer snacks.", "You are not testing willpower at 9:30 PM."],
            ],
            [0.55 * inch, 3.2 * inch, 2.1 * inch],
        ),
        p("How to Measure Your Waist", "H2"),
        bullets([
            "Stand tall, relax your stomach, and breathe out normally.",
            "Wrap the tape around your middle at belly-button height.",
            "Keep the tape snug but not digging into your skin.",
            "Measure first thing in the morning on Day 1, Day 7, and Day 14.",
            "Use the same tape, same spot, and same time of day.",
        ]),
        p("Safety Rules", "H2"),
        bullets([
            "This is education, not medical advice. Talk to your doctor before starting if you have a health condition, take medication, have chest pain, or have been told to limit activity.",
            "Stop exercise if you feel chest pain, faintness, unusual shortness of breath, or sharp pain.",
            "Do not crash diet. Eat the meals. The Reset is built around consistency, protein, vegetables, walking, and sleep.",
            "If you have been advised not to drink alcohol, do not drink. If you drink, keep it planned and moderate.",
        ]),
        p("Your First Day Checklist", "H2"),
        table(
            [
                ["Done", "Order"],
                ["[ ]", "Measure waist and write it on the tracker."],
                ["[ ]", "Eat a protein breakfast."],
                ["[ ]", "Walk briskly for 15 minutes."],
                ["[ ]", "Eat from the meal list at lunch and dinner."],
                ["[ ]", "Close the kitchen 2 hours before bed."],
            ],
            [0.65 * inch, 5.2 * inch],
        ),
        PageBreak(),
    ]


def meal_story():
    story = [p("Meals and Grocery List", "H1"), p("The rule is simple: repeat meals until the waist moves. You are not trying to become a chef in the next 14 days. You are trying to stop winging it.", "Body")]
    story.append(p("Shop Once List", "H2"))
    rows = [["Category", "Buy This"]]
    for category, items in GROCERY.items():
        rows.append([category, "<br/>".join(items)])
    story.append(table(rows, [1.35 * inch, 4.7 * inch]))
    story.append(PageBreak())
    story.append(p("10 Done-For-You Meals", "H1"))
    for idx, meal in enumerate(MEALS, 1):
        story.append(
            KeepTogether(
                [
                    p(f"{idx:02d}. {meal.name}", "H2"),
                    table(
                        [
                            ["Role", meal.role],
                            ["Ingredients", meal.ingredients],
                            ["How", meal.steps],
                            ["Reset Rule", meal.reset_rule],
                        ],
                        [1.1 * inch, 4.85 * inch],
                        header=False,
                        repeat_rows=0,
                    ),
                    Spacer(1, 0.08 * inch),
                ]
            )
        )
    story.append(PageBreak())
    return story


def daily_orders_story(include_intro=True):
    story = []
    if include_intro:
        story.extend(
            [
                p("14-Day Belly Fat Burning Calendar", "H1"),
                p("Every day has the same structure: morning, meals, movement, one habit. Check the boxes, close the day, and move on.", "Body"),
            ]
        )
    rows = [["Day", "Breakfast", "Lunch", "Dinner", "Movement", "One Habit"]]
    for d in DAYS:
        rows.append([str(d.num), d.breakfast, d.lunch, d.dinner, d.movement, d.habit])
    story.append(table(rows, [0.38 * inch, 1.05 * inch, 1.1 * inch, 1.1 * inch, 1.05 * inch, 1.35 * inch]))
    story.append(PageBreak())

    for d in DAYS:
        story.extend(
            [
                p(f"Day {d.num:02d} / 14", "H1"),
                p(d.note, "Callout"),
                table(
                    [
                        ["Block", "Daily Orders", "Done"],
                        ["Morning", f"{d.movement}. Drink water. Review meals before the day gets loud.", "[ ]"],
                        ["Breakfast", d.breakfast, "[ ]"],
                        ["Lunch", d.lunch, "[ ]"],
                        ["Dinner", d.dinner, "[ ]"],
                        ["One Habit", d.habit, "[ ]"],
                    ],
                    [1.1 * inch, 4.15 * inch, 0.6 * inch],
                ),
                p("Scoreboard", "H2"),
                table(
                    [
                        ["Water", "Protein", "Vegetables", "Movement", "Kitchen Closed"],
                        ["[ ]", "[ ]", "[ ]", "[ ]", "[ ]"],
                    ],
                    [1.17 * inch] * 5,
                ),
                p("Notes: ________________________________________________________________________________________________", "Small"),
                p("____________________________________________________________________________________________________", "Small"),
            ]
        )
        if d.num != 14:
            story.append(PageBreak())
    story.append(PageBreak())
    return story


def tracker_story():
    return [
        p("Waist Tracker", "H1"),
        p("Measure your waist at belly-button height, first thing in the morning. The goal is not to bully yourself with numbers. The goal is to finally track the thing you actually care about.", "Body"),
        table(
            [
                ["Day", "Date", "Waist", "Change vs. Day 1", "Notes"],
                ["1", "", "", "", "Starting line"],
                ["7", "", "", "", "Halfway trend"],
                ["14", "", "", "", "Final check"],
            ],
            [0.55 * inch, 1.25 * inch, 1.15 * inch, 1.4 * inch, 1.5 * inch],
        ),
        Spacer(1, 0.18 * inch),
        p("Photo Check", "H2"),
        bullets([
            "Take a front and side photo on Day 1 and Day 14.",
            "Use the same lighting, same distance, and same shorts.",
            "Do not overanalyze daily mirror changes. Compare the endpoints.",
        ]),
        p("What Counts As Progress", "H2"),
        table(
            [
                ["Signal", "What It Means"],
                ["Waist down", "The belly is moving. Keep going."],
                ["Waist flat, bloating down", "Food quality and digestion are improving. Stay with the plan."],
                ["Scale up, waist down", "The waist wins. The scale is secondary."],
                ["No movement", "Review alcohol, snacks, portions, and sleep. Repeat the cleanest 3 days."],
            ],
            [1.6 * inch, 4.25 * inch],
        ),
        PageBreak(),
    ]


def movement_story():
    story = [p("Movement Library", "H1"), p("No gym is required. These sessions are short on purpose. Finish them with clean form and leave wanting a little more.", "Body")]
    for name, lines in MOVEMENTS.items():
        story.append(KeepTogether([p(name, "H2"), bullets(lines)]))
    story.append(PageBreak())
    return story


def finish_story():
    return [
        p("Day 15: Keep the Inch Moving", "H1"),
        p("You are not done because the PDF is done. You now know which meals you can repeat, which habits expose you, and what your waist does when you stop improvising.", "Body"),
        p("Pick Your Next 14 Days", "H2"),
        table(
            [
                ["Keep", "Upgrade"],
                ["The 15-minute walk", "Add a second walk after dinner twice per week"],
                ["Protein breakfast", "Prep 3 breakfasts at once"],
                ["Waist measurement weekly", "Add a belt-notch photo every 2 weeks"],
                ["Planned drinks only", "Keep 3 alcohol-free days per week"],
            ],
            [2.9 * inch, 2.95 * inch],
        ),
        p("References and Guardrails", "H2"),
        p("This program is built around widely accepted basics: regular moderate activity, simple strength work, waist tracking, protein-forward meals, vegetables, sleep support, and planned alcohol rather than random alcohol.", "Body"),
        bullets([f"{name}: {url}" for name, url in REFERENCES], "Small"),
        p("Important: this program is for educational purposes only and is not medical advice. Results vary by starting point, consistency, sleep, stress, medical history, and total food intake.", "Small"),
    ]


def build_pdf(path: Path, story):
    path.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(path),
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.68 * inch,
        bottomMargin=0.58 * inch,
        title="The 14-Day Belly Reset",
        author="The 14-Day Belly Reset",
    )
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


def copied_to_downloads(src: Path):
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    dest = DOWNLOAD_DIR / src.name
    dest.write_bytes(src.read_bytes())
    return dest


def generate():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)

    files = []
    full = OUTPUT_DIR / "14-day-belly-reset-full-kit.pdf"
    meals = OUTPUT_DIR / "14-day-belly-reset-meals-grocery-list.pdf"
    tracker = OUTPUT_DIR / "14-day-belly-reset-waist-tracker.pdf"
    calendar = OUTPUT_DIR / "14-day-belly-reset-calendar-daily-orders.pdf"

    build_pdf(full, cover_story() + first_24_story() + meal_story() + daily_orders_story() + tracker_story() + movement_story() + finish_story())
    build_pdf(meals, cover_story() + meal_story() + finish_story())
    build_pdf(tracker, cover_story() + first_24_story() + tracker_story() + finish_story())
    build_pdf(calendar, cover_story() + daily_orders_story() + movement_story() + finish_story())

    for src in [full, meals, tracker, calendar]:
        files.append(copied_to_downloads(src))

    zip_path = DOWNLOAD_DIR / "14-day-belly-reset-product-kit.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as bundle:
        for file_path in files:
            bundle.write(file_path, arcname=file_path.name)

    print("Generated:")
    for file_path in files + [zip_path]:
        print(f"- {file_path}")


if __name__ == "__main__":
    generate()
