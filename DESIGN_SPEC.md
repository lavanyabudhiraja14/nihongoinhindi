# Design Specification (Nihongo Seekho Design System)

Extracted directly from `/design-reference` (Figma Make Export).

---

## 1. Typography & Exact Font Rules

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@300;400;500;600;700&family=Noto+Serif+JP:wght@400;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&display=swap');
```

### Font Families
| Token | Font Family | Usage |
|---|---|---|
| `--font-sans` | `'Noto Sans', 'Noto Sans Devanagari', system-ui, sans-serif` | All Hindi UI text, English subtext, navigation labels, numbers, and buttons |
| `--font-jp` | `'Noto Serif JP', 'Noto Sans JP', serif` | Japanese characters (Kanji, Hiragana, Katakana, Furigana), watermark glyphs |

### Exact Type Scale & Styles
| Role | Size | Weight | Line Height | Tracking | Color Token | Example Element |
|---|---|---|---|---|---|---|
| **Giant Watermark** | 160px – 400px | 700 | 1 | Normal | `text-white/[0.035]` or `text-navy/[0.06]` | Background watermark characters (家, 日, 学) |
| **Hero Kanji Character** | 80px | 700 | 1 | Normal | `text-white` or `text-navy` | Today's highlighted Kanji/Vocab (`家族`) |
| **Auth / Modal Headline** | 28px – 32px | 700 / 300 | 1.25 | Tight | `text-navy` / `text-white` | "स्वागत है", "जापानी भाषा की शुरुआत" |
| **Card / Section Heading** | 16px – 18px | 700 | 1.2 | Normal | `text-navy` | "नमस्ते, अनुराग 👋", "अभ्यास करें", "आपकी प्रगति" |
| **Tile Title** | 16px | 700 | 1.25 | Normal | `text-navy` | "हिरागाना", "काताकाना", "शब्दावली" |
| **Body / Description** | 14px | 400 | 1.6 (relaxed) | Normal | `text-navy/40` or `text-white/40` | Explanations, lesson descriptions |
| **Action Button Text** | 14px | 600 | 1 | Normal | `text-white` | "पाठ शुरू करें", "लॉग इन करें", "खाता बनाएं" |
| **Subtext / Counts** | 12px | 400 / 500 | 1.4 | Normal | `text-navy/40` or `text-white/35` | "32 / 46 वर्ण", "~15 मिनट · 12 शब्द" |
| **Badges & Overlines** | 10px – 11px | 600 | 1.2 | `0.08em` – `0.12em` (uppercase) | `text-saffron`, `text-navy/50`, `text-jp-red` | "आज का पाठ · पाठ 35", "ईमेल पता", "N5 पूरा" |

---

## 2. Color Palette & Tokens

### Primary Theme Variables
```css
@theme {
  --color-jp-red: #BC2025;
  --color-jp-red-dark: #8B1519;
  --color-navy: #0D1B4B;
  --color-navy-light: #162560;
  --color-saffron: #FF9933;
  --color-saffron-light: #FFB366;
  --color-leaf: #138808;
  --color-leaf-light: #1AAD0A;
  --color-ash: #F4F4F6;
  --color-border: #E8E8EC;
  --font-sans: 'Noto Sans', 'Noto Sans Devanagari', system-ui, sans-serif;
  --font-jp: 'Noto Serif JP', 'Noto Sans JP', serif;
}
```

### Color Usage Matrix
| Color Name | Hex Code | Purpose & Specific Components |
|---|---|---|
| **Japan Red** | `#BC2025` | Primary brand accent, primary CTA buttons, logo badge, Hiragana category accent, active progress ring, text selection background (`rgba(188,32,37,0.12)`) |
| **Japan Red Dark** | `#8B1519` | Hover state for primary buttons |
| **Red Tint** | `rgba(188,32,37,0.05)` | Light badge and icon background for Hiragana |
| **Deep Navy** | `#0D1B4B` | App sidebar background, hero banner cards, primary text (`text-navy`), dark theme surfaces |
| **Navy Light** | `#162560` | Subtle background highlights on navy cards |
| **Navy Opacity Scale** | `navy/50`, `navy/40`, `navy/25`, `navy/15` | Muted labels, secondary descriptions, placeholder text, dividers |
| **Saffron** | `#FF9933` | Streak pills, Katakana category accent, weekly XP progress fill, active sidebar marker |
| **Saffron Light** | `#FFB366` | Saffron badge tint, secondary glow (`box-shadow: 0 0 6px #FF9933`) |
| **Leaf Green** | `#138808` | Mastery checkmarks, completed state pills, Vocab tile accent, password match indicator |
| **Leaf Tint** | `rgba(19,136,8,0.05)` / `bg-leaf/8` | Completed character card background, mastered item badges |
| **Canvas Ash** | `#F4F4F6` | Global page background behind cards |
| **Card White** | `#FFFFFF` | Content tiles, character grid cards, review surface, inputs |
| **Borders** | `#E8E8EC`, `#E2E2E8` | Card dividers, input borders, pill outlines |

---

## 3. Elevation, Radius & Spacing Scale

### Border Radius
- `rounded-lg` (8px): Inputs, compact action buttons, small character cells
- `rounded-xl` (12px): Navigation items, icon containers (w-10 h-10), sub-cards
- `rounded-2xl` (16px): Content tiles, dashboard cards, modal bodies, logo icon (w-12 h-12)
- `rounded-3xl` (24px): Hero cards, large dialog containers
- `rounded-full`: Streak pills, user avatar, progress bars, status dots

### Box Shadows
- **Card Default**: `box-shadow: 0 1px 3px rgba(0,0,0,0.07)`
- **Card Hover**: `box-shadow: 0 10px 25px -5px rgba(0,0,0,0.10)` with `-translate-y-1`
- **Saffron Glow**: `box-shadow: 0 0 6px #FF9933` (Live lesson indicator)
- **Selection Highlight**: `background: rgba(188, 32, 37, 0.12); color: #BC2025`

### Spacing Scale
- Page layout max width: `max-w-[1100px] mx-auto`
- Sidebar width: `w-[228px]` (desktop fixed/static), responsive drawer on mobile
- Grid gaps: `gap-3` (cards), `gap-2` (character cells), `gap-1.5` (sub-tabs)
- Padding: `px-6 py-5` (card interior), `px-5 py-5` (page container)

---

## 4. Layout & Navigation Architecture

### Dual Responsive Shell
1. **Desktop ($>1024$px)**:
   - Fixed 228px Deep Navy Sidebar on the left:
     - Top: Logo badge (Japan Red square with white `学`, "Nihongo Seekho", "N5 स्तर · हिंदी में")
     - Red vertical 3px accent line on left border
     - Navigation items with saffron left-indicator when active
     - Weekly XP progress bar widget
     - User profile badge & logout
   - Main content area with sticky top bar:
     - Date & personalized greeting
     - Streak counter pill (Gradient Saffron `#FF9933` to `#FF7F00` with flame icon)
     - Total XP badge
2. **Mobile ($<1024$px)**:
   - Sticky top bar with hamburger menu button (`Icon.Menu`), logo, and streak pill
   - Slide-out Navy Drawer for full navigation
   - Sticky bottom tab bar (`BottomNav`) styled with the new color tokens (Navy/Saffron/Red accents) for rapid thumb access.

---

## 5. Screen Component Structures

### A. Hero Card (`Today's Lesson / Spaced Repetition Review`)
- Deep Navy (`#0D1B4B`) rounded-2xl background
- Left side:
  - Saffron live dot + overline ("आज का पाठ · पाठ 35" or "SM-2 स्मृति समीक्षा")
  - Giant Japanese character (80px `Noto Serif JP`) + Kana/Romaji reading
  - Title in Hindi (30px 700) + bilingual summary
  - Primary button: Japan Red pill with Play icon
- Right side:
  - Giant faded background character (`家`, opacity `0.04`)
  - Radial SVG Progress Arc (`ProgressArc`) showing percentage
  - 7-day weekly completion strip with checkmarks

### B. Practice Category Tiles (3 Columns: Hiragana / Katakana / Vocab / Kanji / Grammar)
- Clean white card (`#FFFFFF`) with 4px colored top accent strip (Red for Hiragana, Saffron for Katakana, Leaf Green for Vocab, Navy for Kanji, Rose for Grammar)
- Faded giant character in bottom-right corner (160px, opacity 0.06)
- Icon badge in top-left with matching light tint
- Title (16px 700), subtitle count (12px), progress bar with percentage, and "जारी रखें →" action

### C. Character Grid Cards (Kana & Kanji)
- Interactive cell with `hover:scale-105` and `transition-all`
- Mastered state: `bg-leaf/8` with small green checkmark badge in top-right
- Unlearned state: `bg-black/[0.03]`
- 3-level vertical stack:
  1. Japanese Character (24px `Noto Serif JP` 700)
  2. Romaji (10px 500 `text-navy/50`)
  3. Hindi Phonetic (10px 600 `text-leaf` / `text-rose-600`)
