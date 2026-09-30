import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, '../content');

function validateKanaFile(filename, expectedType) {
  const filePath = path.join(contentDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`\n========================================`);
  console.log(`Validating ${filename} (${items.length} items)...`);
  console.log(`========================================`);

  const seenIds = new Set();
  const counts = { basic: 0, dakuten: 0, handakuten: 0, yoon: 0, special: 0, other: 0 };
  const errors = [];

  items.forEach((item, index) => {
    if (!item.id || typeof item.id !== 'string') errors.push(`[Item ${index}] Invalid 'id'`);
    else if (seenIds.has(item.id)) errors.push(`Duplicate ID: '${item.id}'`);
    else seenIds.add(item.id);

    if (!item.kana) errors.push(`[ID: ${item.id}] Missing 'kana'`);
    if (!item.romaji) errors.push(`[ID: ${item.id}] Missing 'romaji'`);
    if (!item.hindiPhonetic) errors.push(`[ID: ${item.id}] Missing 'hindiPhonetic'`);
    if (item.type !== expectedType) errors.push(`[ID: ${item.id}] Type mismatch`);
    if (!item.row) errors.push(`[ID: ${item.id}] Missing 'row'`);
    if (item.needs_review !== true) errors.push(`[ID: ${item.id}] 'needs_review' must be true`);

    const cat = item.groupCategory || 'other';
    if (counts[cat] !== undefined) counts[cat]++;
    else counts.other++;
  });

  if (counts.basic !== 46) errors.push(`Expected 46 basic characters, got ${counts.basic}`);
  if (counts.dakuten !== 20) errors.push(`Expected 20 dakuten characters, got ${counts.dakuten}`);
  if (counts.handakuten !== 5) errors.push(`Expected 5 handakuten characters, got ${counts.handakuten}`);
  if (counts.yoon !== 33) errors.push(`Expected 33 yoon combinations, got ${counts.yoon}`);
  if (counts.special < 3) errors.push(`Expected at least 3 special sounds, got ${counts.special}`);

  if (errors.length > 0) {
    console.error(`❌ Errors in ${filename}:`, errors);
    return false;
  }
  console.log(`✅ ${filename} passed! (${items.length} items)`);
  return true;
}

function validateLoanwords() {
  const filePath = path.join(contentDir, 'loanwords.json');
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`\n========================================`);
  console.log(`Validating loanwords.json (${items.length} items)...`);
  console.log(`========================================`);

  const seenIds = new Set();
  const errors = [];

  items.forEach((item, index) => {
    if (!item.id || seenIds.has(item.id)) errors.push(`[Item ${index}] Duplicate/invalid ID: ${item.id}`);
    seenIds.add(item.id);

    if (!item.word || !item.romaji || !item.englishMeaning || !item.hindiMeaning) {
      errors.push(`[ID: ${item.id}] Missing required fields`);
    }
    if (item.needs_review !== true) errors.push(`[ID: ${item.id}] 'needs_review' must be true`);
  });

  if (items.length !== 20) errors.push(`Expected 20 loanwords, got ${items.length}`);

  if (errors.length > 0) {
    console.error(`❌ Errors in loanwords.json:`, errors);
    return false;
  }
  console.log(`✅ loanwords.json passed! (20 items)`);
  return true;
}

function validateVocab(allowPartial = false) {
  const filePath = path.join(contentDir, 'vocab.json');
  if (!fs.existsSync(filePath)) {
    console.warn(`vocab.json not found yet.`);
    return false;
  }
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const loanwords = JSON.parse(fs.readFileSync(path.join(contentDir, 'loanwords.json'), 'utf-8'));
  const loanwordSet = new Set(loanwords.map((lw) => lw.word));

  console.log(`\n========================================`);
  console.log(`Validating vocab.json (${items.length} items)...`);
  console.log(`========================================`);

  const seenIds = new Set();
  const unitMap = new Map(); // unitId -> Map of Hindi meaning to id
  const errors = [];
  const warnings = [];

  items.forEach((item, index) => {
    if (!item.id || typeof item.id !== 'string') errors.push(`[Item ${index}] Invalid 'id'`);
    else if (seenIds.has(item.id)) errors.push(`Duplicate ID: '${item.id}'`);
    else seenIds.add(item.id);

    if (!item.unitId) errors.push(`[ID: ${item.id}] Missing 'unitId'`);
    if (!item.kana) errors.push(`[ID: ${item.id}] Missing 'kana'`);
    if (!item.romaji) errors.push(`[ID: ${item.id}] Missing 'romaji'`);
    if (!item.hindiMeaning) errors.push(`[ID: ${item.id}] Missing 'hindiMeaning'`);
    if (!item.englishMeaning) errors.push(`[ID: ${item.id}] Missing 'englishMeaning'`);
    if (!item.exampleJp || !item.exampleRomaji || !item.exampleHindi) {
      errors.push(`[ID: ${item.id}] Missing example sentence fields`);
    }
    if (item.needs_review !== true) errors.push(`[ID: ${item.id}] 'needs_review' must be true`);

    // Check no duplicate with loanwords
    if (loanwordSet.has(item.kana) || (item.kanji && loanwordSet.has(item.kanji))) {
      errors.push(`[ID: ${item.id}] Vocab '${item.kana}' duplicates a word in loanwords.json`);
    }

    // Check distinct Hindi meaning within the same unit
    if (item.unitId && item.hindiMeaning) {
      if (!unitMap.has(item.unitId)) {
        unitMap.set(item.unitId, new Map());
      }
      const unitMeanings = unitMap.get(item.unitId);
      const trimmedMeaning = item.hindiMeaning.trim();
      if (unitMeanings.has(trimmedMeaning)) {
        errors.push(`[Unit: ${item.unitId}] Duplicate Hindi meaning '${trimmedMeaning}' found in items '${unitMeanings.get(trimmedMeaning)}' and '${item.id}'`);
      } else {
        unitMeanings.set(trimmedMeaning, item.id);
      }
    }

    // Stem matching warning for example sentence
    const wordKana = item.kana;
    const wordKanji = item.kanji || '';
    const kanjiRoot = wordKanji ? wordKanji[0] : '';
    const stemKana = wordKana.length > 2 ? wordKana.slice(0, -1) : wordKana;

    const inExample =
      item.exampleJp.includes(wordKana) ||
      (wordKanji && item.exampleJp.includes(wordKanji)) ||
      (kanjiRoot && item.exampleJp.includes(kanjiRoot)) ||
      item.exampleJp.includes(stemKana);

    if (!inExample) {
      warnings.push(`[Warning ID: ${item.id}] Word '${wordKanji || wordKana}' not found in example: '${item.exampleJp}'`);
    }
  });

  if (!allowPartial) {
    if (items.length !== 200) errors.push(`Expected 200 vocab items, got ${items.length}`);
    if (unitMap.size !== 20) errors.push(`Expected exactly 20 units, got ${unitMap.size}`);

    unitMap.forEach((meanings, unitId) => {
      if (meanings.size !== 10) {
        errors.push(`Unit '${unitId}' has ${meanings.size} words, expected 10.`);
      }
    });
  }

  if (warnings.length > 0) {
    console.log(`⚠️ ${warnings.length} Example Stem Warnings (non-fatal):`);
    warnings.forEach((w) => console.log(`   ${w}`));
  }

  if (errors.length > 0) {
    console.error(`❌ Errors in vocab.json:`, errors);
    return false;
  }
  console.log(`✅ vocab.json passed! (${items.length} items in ${unitMap.size} units)`);
  return true;
}

function validateGrammar() {
  const filePath = path.join(contentDir, 'grammar.json');
  if (!fs.existsSync(filePath)) {
    console.warn(`grammar.json not found yet.`);
    return false;
  }
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`\n========================================`);
  console.log(`Validating grammar.json (${items.length} points)...`);
  console.log(`========================================`);

  const seenIds = new Set();
  const errors = [];

  items.forEach((item, index) => {
    if (!item.id || seenIds.has(item.id)) errors.push(`[Item ${index}] Duplicate/invalid ID: ${item.id}`);
    seenIds.add(item.id);

    if (item.pointNumber !== index + 1) {
      errors.push(`[ID: ${item.id}] pointNumber must be ${index + 1}, got ${item.pointNumber}`);
    }

    if (!item.titleJp || !item.titleHindi || !item.formula || !item.explanationHindi || !item.hindiComparison) {
      errors.push(`[ID: ${item.id}] Missing core text fields`);
    }

    if (!Array.isArray(item.examples) || item.examples.length !== 3) {
      errors.push(`[ID: ${item.id}] Expected exactly 3 examples, got ${item.examples?.length}`);
    }

    if (!item.commonMistake || !item.commonMistake.mistakeJp || !item.commonMistake.correctionJp || !item.commonMistake.explanationHindi) {
      errors.push(`[ID: ${item.id}] Invalid commonMistake object`);
    }

    if (!Array.isArray(item.quiz) || item.quiz.length !== 3) {
      errors.push(`[ID: ${item.id}] Expected exactly 3 quiz questions, got ${item.quiz?.length}`);
    } else {
      item.quiz.forEach((q, qIdx) => {
        if (!q.question) errors.push(`[ID: ${item.id}, Q${qIdx + 1}] Missing question`);
        if (!Array.isArray(q.options) || q.options.length !== 4) {
          errors.push(`[ID: ${item.id}, Q${qIdx + 1}] Expected 4 options, got ${q.options?.length}`);
        } else {
          const uniqueOpts = new Set(q.options.map((o) => o.trim()));
          if (uniqueOpts.size !== 4) {
            errors.push(`[ID: ${item.id}, Q${qIdx + 1}] Options must be unique, found duplicates`);
          }
        }
        if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex > 3) {
          errors.push(`[ID: ${item.id}, Q${qIdx + 1}] correctIndex must be 0..3, got ${q.correctIndex}`);
        }
        if (!q.explanationHindi) errors.push(`[ID: ${item.id}, Q${qIdx + 1}] Missing explanationHindi`);
      });
    }

    if (item.needs_review !== true) errors.push(`[ID: ${item.id}] 'needs_review' must be true`);
  });

  if (items.length !== 25) errors.push(`Expected 25 grammar points, got ${items.length}`);

  if (errors.length > 0) {
    console.error(`❌ Errors in grammar.json:`, errors);
    return false;
  }
  console.log(`✅ grammar.json passed! (25 points)`);
  return true;
}

function validateKanji(allowPartial = false) {
  const filePath = path.join(contentDir, 'kanji.json');
  if (!fs.existsSync(filePath)) {
    console.warn(`kanji.json not found yet.`);
    return false;
  }
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const vocabPath = path.join(contentDir, 'vocab.json');
  const vocabItems = fs.existsSync(vocabPath) ? JSON.parse(fs.readFileSync(vocabPath, 'utf-8')) : [];
  const vocabIdSet = new Set(vocabItems.map((v) => v.id));

  console.log(`\n========================================`);
  console.log(`Validating kanji.json (${items.length} items)...`);
  console.log(`========================================`);

  const seenIds = new Set();
  const groupMeanings = new Map(); // groupId -> Map of Hindi meaning to id
  const errors = [];

  items.forEach((item, index) => {
    if (!item.id || typeof item.id !== 'string') errors.push(`[Item ${index}] Invalid 'id'`);
    else if (seenIds.has(item.id)) errors.push(`Duplicate ID: '${item.id}'`);
    else seenIds.add(item.id);

    if (!item.groupId) errors.push(`[ID: ${item.id}] Missing 'groupId'`);
    if (!item.character) errors.push(`[ID: ${item.id}] Missing 'character'`);
    if (!Array.isArray(item.onyomi)) errors.push(`[ID: ${item.id}] 'onyomi' must be an array`);
    if (!Array.isArray(item.kunyomi)) errors.push(`[ID: ${item.id}] 'kunyomi' must be an array`);
    if (!item.meaningHindi) errors.push(`[ID: ${item.id}] Missing 'meaningHindi'`);
    if (!item.meaningEnglish) errors.push(`[ID: ${item.id}] Missing 'meaningEnglish'`);
    if (typeof item.strokeCount !== 'number' || item.strokeCount <= 0) errors.push(`[ID: ${item.id}] Invalid 'strokeCount'`);
    if (!item.mnemonic) errors.push(`[ID: ${item.id}] Missing 'mnemonic'`);
    if (item.needs_review !== true) errors.push(`[ID: ${item.id}] 'needs_review' must be true`);

    // Check duplicate Hindi meaning within the same groupId
    if (item.groupId && item.meaningHindi) {
      if (!groupMeanings.has(item.groupId)) {
        groupMeanings.set(item.groupId, new Map());
      }
      const meaningsInGroup = groupMeanings.get(item.groupId);
      const trimmedMeaning = item.meaningHindi.trim();
      if (meaningsInGroup.has(trimmedMeaning)) {
        errors.push(`[Group: ${item.groupId}] Duplicate Hindi meaning '${trimmedMeaning}' found in items '${meaningsInGroup.get(trimmedMeaning)}' and '${item.id}'`);
      } else {
        meaningsInGroup.set(trimmedMeaning, item.id);
      }
    }

    // Validate that every linkedVocabIds entry exists in vocab.json
    if (Array.isArray(item.linkedVocabIds)) {
      item.linkedVocabIds.forEach((vId) => {
        if (!vocabIdSet.has(vId)) {
          errors.push(`[ID: ${item.id}] Linked vocab ID '${vId}' does not exist in vocab.json`);
        }
      });
    } else {
      errors.push(`[ID: ${item.id}] 'linkedVocabIds' must be an array`);
    }
  });

  if (!allowPartial) {
    if (items.length !== 50) errors.push(`Expected 50 kanji items, got ${items.length}`);
  }

  if (errors.length > 0) {
    console.error(`❌ Errors in kanji.json:`, errors);
    return false;
  }
  console.log(`✅ kanji.json passed! (${items.length} items in ${groupMeanings.size} groups)`);
  return true;
}

try {
  const hValid = validateKanaFile('hiragana.json', 'hiragana');
  const kValid = validateKanaFile('katakana.json', 'katakana');
  const lValid = validateLoanwords();
  const vValid = validateVocab(false);
  const kjValid = validateKanji(false);
  const gValid = validateGrammar();

  if (hValid && kValid && lValid && vValid && kjValid && gValid) {
    console.log(`\n🎉 ALL CONTENT VALIDATIONS PASSED SUCCESSFULLY!\n`);
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (err) {
  console.error('Validation execution error:', err);
  process.exit(1);
}
