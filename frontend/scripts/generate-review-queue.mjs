import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.join(__dirname, '..', 'content');
const repoRoot = path.join(__dirname, '..', '..');
const outputPath = path.join(repoRoot, 'REVIEW_QUEUE.md');

function readJson(filename) {
  const filePath = path.join(contentDir, filename);
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function generateReviewQueue() {
  console.log('Generating REVIEW_QUEUE.md at repo root...');

  const hiragana = readJson('hiragana.json');
  const katakana = readJson('katakana.json');
  const loanwords = readJson('loanwords.json');
  const vocab = readJson('vocab.json');
  const grammar = readJson('grammar.json');
  const units = readJson('units.json');

  let md = `# Content Review Queue (सामग्री समीक्षा सूची)\n\n`;
  md += `This document lists all curriculum items in **Nihongo in Hindi** marked with \`needs_review: true\` or containing special notes/mnemonics. It is generated automatically by \`npm run review-queue\`.\n\n`;
  md += `**Generated Date:** ${new Date().toISOString().split('T')[0]}\n\n`;
  md += `---\n\n`;

  let totalItemsNeedingReview = 0;
  let totalItemsWithNotes = 0;

  // 1. Units Curriculum Structure
  md += `## 1. Units & Curriculum Structure (\`units.json\`)\n\n`;
  const reviewUnits = units.filter((u) => u.needs_review || u.lessons.some((l) => l.needs_review));
  if (reviewUnits.length === 0) {
    md += `*No units marked for review.*\n\n`;
  } else {
    reviewUnits.forEach((u) => {
      totalItemsNeedingReview++;
      md += `### Unit ${u.unitNumber}: ${u.titleHindi} (${u.titleJp})\n`;
      md += `- **ID:** \`${u.id}\`\n`;
      md += `- **Description:** ${u.descriptionHindi}\n`;
      md += `- **Needs Review:** \`${u.needs_review ? 'true' : 'false'}\`\n`;
      md += `- **Lessons (${u.lessons.length}):**\n`;
      u.lessons.forEach((l) => {
        if (l.needs_review) totalItemsNeedingReview++;
        md += `  - \`${l.id}\`: **${l.titleHindi}** (\`${l.titleJp}\`) — ${l.durationMinutes} min (Ref: \`${l.contentRef}\`)${l.needs_review ? ' ⚠️ [needs_review]' : ''}\n`;
      });
      md += `\n`;
    });
  }

  // 2. Hiragana Content
  md += `## 2. Hiragana Characters (\`hiragana.json\`)\n\n`;
  const reviewHiragana = hiragana.filter((h) => h.needs_review || h.mnemonic || h.pronunciationNote || h.examples);
  md += `| ID | Kana | Romaji | Hindi Hint | Group | Mnemonic / Note | Status |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  reviewHiragana.forEach((h) => {
    if (h.needs_review) totalItemsNeedingReview++;
    if (h.mnemonic || h.pronunciationNote) totalItemsWithNotes++;
    const note = [h.mnemonic, h.pronunciationNote].filter(Boolean).join('; ') || '-';
    md += `| \`${h.id}\` | **${h.kana}** | \`${h.romaji}\` | ${h.hindiPhonetic} | ${h.row} | ${note} | ${h.needs_review ? '⚠️ Review' : 'OK'} |\n`;
  });
  md += `\n`;

  // 3. Katakana Content
  md += `## 3. Katakana Characters (\`katakana.json\`)\n\n`;
  const reviewKatakana = katakana.filter((k) => k.needs_review || k.mnemonic || k.pronunciationNote || k.examples);
  md += `| ID | Kana | Romaji | Hindi Hint | Group | Mnemonic / Note | Status |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  reviewKatakana.forEach((k) => {
    if (k.needs_review) totalItemsNeedingReview++;
    if (k.mnemonic || k.pronunciationNote) totalItemsWithNotes++;
    const note = [k.mnemonic, k.pronunciationNote].filter(Boolean).join('; ') || '-';
    md += `| \`${k.id}\` | **${k.kana}** | \`${k.romaji}\` | ${k.hindiPhonetic} | ${k.row} | ${note} | ${k.needs_review ? '⚠️ Review' : 'OK'} |\n`;
  });
  md += `\n`;

  // 4. Loanwords Content
  md += `## 4. Katakana Loanwords (\`loanwords.json\`)\n\n`;
  md += `| ID | Word | Romaji | English Meaning | Hindi Meaning | Note | Status |\n`;
  md += `|---|---|---|---|---|---|---|\n`;
  loanwords.forEach((lw) => {
    if (lw.needs_review) totalItemsNeedingReview++;
    if (lw.noteHindi) totalItemsWithNotes++;
    md += `| \`${lw.id}\` | **${lw.word}** | \`${lw.romaji}\` | ${lw.englishMeaning} | ${lw.hindiMeaning} | ${lw.noteHindi || '-'} | ${lw.needs_review ? '⚠️ Review' : 'OK'} |\n`;
  });
  md += `\n`;

  // 5. Vocabulary Content Grouped by Unit
  md += `## 5. Vocabulary (\`vocab.json\`)\n\n`;
  const vocabByUnit = {};
  vocab.forEach((v) => {
    if (!vocabByUnit[v.unitId]) {
      vocabByUnit[v.unitId] = [];
    }
    vocabByUnit[v.unitId].push(v);
  });

  Object.keys(vocabByUnit).sort().forEach((unitId) => {
    const items = vocabByUnit[unitId];
    md += `### Unit: \`${unitId}\` (${items.length} words)\n\n`;
    md += `| ID | Japanese | Romaji | English | Hindi Meaning | Example Sentence | Note | Status |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;
    items.forEach((v) => {
      if (v.needs_review) totalItemsNeedingReview++;
      if (v.note) totalItemsWithNotes++;
      const jpDisplay = v.kanji ? `${v.kana} (${v.kanji})` : v.kana;
      const example = `${v.exampleJp || ''} <br/>*${v.exampleHindi || ''}*`;
      md += `| \`${v.id}\` | **${jpDisplay}** | \`${v.romaji}\` | ${v.englishMeaning} | ${v.hindiMeaning} | ${example} | ${v.note || '-'} | ${v.needs_review ? '⚠️ Review' : 'OK'} |\n`;
    });
    md += `\n`;
  });

  // 6. Grammar Points Content
  md += `## 6. Grammar Points (\`grammar.json\`)\n\n`;
  grammar.forEach((g) => {
    if (g.needs_review) totalItemsNeedingReview++;
    md += `### Point ${g.pointNumber}: ${g.titleJp} — ${g.titleHindi}\n`;
    md += `- **ID:** \`${g.id}\`\n`;
    md += `- **Formula:** \`${g.formula}\`\n`;
    md += `- **Explanation:** ${g.explanationHindi.replace(/\n/g, ' ')}\n`;
    md += `- **Hindi Comparison:** ${g.hindiComparison.replace(/\n/g, ' ')}\n`;
    md += `- **Examples (${g.examples.length}):**\n`;
    g.examples.forEach((ex, idx) => {
      md += `  ${idx + 1}. **${ex.jp}** (\`${ex.romaji}\`) = *${ex.hindi}* ${ex.noteHindi ? `(${ex.noteHindi})` : ''}\n`;
    });
    if (g.commonMistake) {
      totalItemsWithNotes++;
      md += `- **Common Mistake:** ❌ \`${g.commonMistake.mistakeJp}\` ➔ ✅ \`${g.commonMistake.correctionJp}\` (${g.commonMistake.explanationHindi})\n`;
    }
    md += `- **Needs Review:** \`${g.needs_review ? 'true' : 'false'}\`\n\n`;
  });

  // Summary header insertion
  const summaryHeader = `> **Summary Statistics:**\n> - Total Content Items Flagged for Review: **${totalItemsNeedingReview}**\n> - Total Items with Special Notes / Mnemonics / Explanations: **${totalItemsWithNotes}**\n\n`;
  md = md.replace('---\n\n', `---\n\n${summaryHeader}`);

  fs.writeFileSync(outputPath, md, 'utf-8');
  console.log(`✅ Successfully generated ${outputPath}`);
}

generateReviewQueue();
