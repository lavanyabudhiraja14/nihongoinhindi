import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, '../content');

// -------------------------------------------------------------
// HIRAGANA FULL SET
// -------------------------------------------------------------
const hiraganaData = [
  // --- BASIC ROWS (46) ---
  // A-Row
  {
    id: "h-a",
    kana: "あ",
    romaji: "a",
    hindiPhonetic: "अ",
    type: "hiragana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "अक्षर 'अ' जैसा गोल घुमावदार आकार।",
    needs_review: true
  },
  {
    id: "h-i",
    kana: "い",
    romaji: "i",
    hindiPhonetic: "इ",
    type: "hiragana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "दो खड़ी रेखाएं (इ की दो छड़ियां)।",
    needs_review: true
  },
  {
    id: "h-u",
    kana: "う",
    romaji: "u",
    hindiPhonetic: "उ",
    type: "hiragana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "ऊपर बिंदी और नीचे 'उ' जैसा मोड़।",
    needs_review: true
  },
  {
    id: "h-e",
    kana: "え",
    romaji: "e",
    hindiPhonetic: "ए",
    type: "hiragana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "हवा में लहराता हुआ 'ए' (z-जैसा मोड़)।",
    needs_review: true
  },
  {
    id: "h-o",
    kana: "お",
    romaji: "o",
    hindiPhonetic: "ओ",
    type: "hiragana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "दाएं तरफ बिंदी के साथ 'ओ' का आकार।",
    needs_review: true
  },

  // Ka-Row
  {
    id: "h-ka",
    kana: "か",
    romaji: "ka",
    hindiPhonetic: "का / क",
    type: "hiragana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "काटने के लिए उठाया हुआ हाथ और एक छोटा निशान।",
    needs_review: true
  },
  {
    id: "h-ki",
    kana: "き",
    romaji: "ki",
    hindiPhonetic: "कि",
    type: "hiragana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "चाबी (Key) जैसी दो समानांतर रेखाएं।",
    needs_review: true
  },
  {
    id: "h-ku",
    kana: "く",
    romaji: "ku",
    hindiPhonetic: "कु",
    type: "hiragana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "पक्षी की खुली चोंच (कू-कू)।",
    needs_review: true
  },
  {
    id: "h-ke",
    kana: "け",
    romaji: "ke",
    hindiPhonetic: "के",
    type: "hiragana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "केले (Kela) का पेड़ या लकड़ी का खंभा।",
    needs_review: true
  },
  {
    id: "h-ko",
    kana: "こ",
    romaji: "ko",
    hindiPhonetic: "को",
    type: "hiragana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "दो क्षैतिज रेखाएं (कोने जैसा)।",
    needs_review: true
  },

  // Sa-Row
  {
    id: "h-sa",
    kana: "さ",
    romaji: "sa",
    hindiPhonetic: "सा / स",
    type: "hiragana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "साइकिल की सीट जैसा एक कट।",
    needs_review: true
  },
  {
    id: "h-shi",
    kana: "し",
    romaji: "shi",
    hindiPhonetic: "शि",
    type: "hiragana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "मछली पकड़ने का हुक (शी / शि ध्वनि)।",
    needs_review: true
  },
  {
    id: "h-su",
    kana: "す",
    romaji: "su",
    hindiPhonetic: "सु",
    type: "hiragana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "सुई और धागे का लूप (सुई -> सु)।",
    needs_review: true
  },
  {
    id: "h-se",
    kana: "せ",
    romaji: "se",
    hindiPhonetic: "से",
    type: "hiragana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "सेब की टोकरी या बैठने की जगह।",
    needs_review: true
  },
  {
    id: "h-so",
    kana: "そ",
    romaji: "so",
    hindiPhonetic: "सो",
    type: "hiragana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "ज़िग-ज़ैग रेखा जो 'सो'ने के बिस्तर जैसी लगे।",
    needs_review: true
  },

  // Ta-Row
  {
    id: "h-ta",
    kana: "た",
    romaji: "ta",
    hindiPhonetic: "ता / त",
    type: "hiragana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "अंग्रेजी के 'ta' जैसा दिखने वाला अक्षर।",
    needs_review: true
  },
  {
    id: "h-chi",
    kana: "ち",
    romaji: "chi",
    hindiPhonetic: "चि",
    type: "hiragana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "चीयरलीडर का चेहरा या 5 जैसा आकार।",
    needs_review: true
  },
  {
    id: "h-tsu",
    kana: "つ",
    romaji: "tsu",
    hindiPhonetic: "त्सु (ts as in cats)",
    type: "hiragana",
    row: "ta-row",
    groupCategory: "basic",
    pronunciationNote: "हिंदी में 'त्सु' का सटीक अक्षर नहीं है; इसका उच्चारण 'cats' या 'tsunami' के 'ts' की तरह हवा छोड़ते हुए किया जाता है।",
    mnemonic: "त्सुनामी (Tsunami) की विशाल लहर का मोड़।",
    needs_review: true
  },
  {
    id: "h-te",
    kana: "て",
    romaji: "te",
    hindiPhonetic: "ते",
    type: "hiragana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "टेलीफ़ोन का घुमावदार तार (ते)।",
    needs_review: true
  },
  {
    id: "h-to",
    kana: "と",
    romaji: "to",
    hindiPhonetic: "तो",
    type: "hiragana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "पैर का अंगूठा (Toe -> तो) जिसमें कांटा लगा हो।",
    needs_review: true
  },

  // Na-Row
  {
    id: "h-na",
    kana: "な",
    romaji: "na",
    hindiPhonetic: "ना / न",
    type: "hiragana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "नटराज की नाचती हुई मुद्रा।",
    needs_review: true
  },
  {
    id: "h-ni",
    kana: "に",
    romaji: "ni",
    hindiPhonetic: "नि",
    type: "hiragana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "सुई और दो धागे (नींबू -> नि)।",
    needs_review: true
  },
  {
    id: "h-nu",
    kana: "ぬ",
    romaji: "nu",
    hindiPhonetic: "नु",
    type: "hiragana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "नूडल्स (Noodles) का घुमावदार लूप।",
    needs_review: true
  },
  {
    id: "h-ne",
    kana: "ね",
    romaji: "ne",
    hindiPhonetic: "ने",
    type: "hiragana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "नेवले की पूंछ का घुमाव (नेवला -> ने)।",
    needs_review: true
  },
  {
    id: "h-no",
    kana: "の",
    romaji: "no",
    hindiPhonetic: "नो",
    type: "hiragana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "एक गोल प्रतिबंध चिह्न (No-Entry -> नो)।",
    needs_review: true
  },

  // Ha-Row
  {
    id: "h-ha",
    kana: "は",
    romaji: "ha",
    hindiPhonetic: "हा / ह (particle: wa)",
    type: "hiragana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "हंसता हुआ चेहरा (हा-हा-हा)। वाक्य में विषय चिह्न के रूप में 'wa' उच्चारित होता है।",
    needs_review: true
  },
  {
    id: "h-hi",
    kana: "ひ",
    romaji: "hi",
    hindiPhonetic: "हि",
    type: "hiragana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "मुस्कान (Hee-hee) का चेहरा।",
    needs_review: true
  },
  {
    id: "h-fu",
    kana: "ふ",
    romaji: "fu",
    hindiPhonetic: "फु (soft blown f/h)",
    type: "hiragana",
    row: "ha-row",
    groupCategory: "basic",
    pronunciationNote: "हिंदी 'फ' या अंग्रेजी 'f' की तरह दांतों को होंठ पर दबाए बिना, दोनों होंठों के बीच से मोमबत्ती बुझाते हुए फूंक मारने जैसी ध्वनि।",
    mnemonic: "माउंट फ़ूजी (Fuji) और उसके ऊपर उड़ते बादल।",
    needs_review: true
  },
  {
    id: "h-he",
    kana: "へ",
    romaji: "he",
    hindiPhonetic: "हे (particle: e)",
    type: "hiragana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "पहाड़ की चोटी (हेल्प -> हे)।",
    needs_review: true
  },
  {
    id: "h-ho",
    kana: "ほ",
    romaji: "ho",
    hindiPhonetic: "हो",
    type: "hiragana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "सिर पर टोपी पहने हुए व्यक्ति (हो-हो-हो)।",
    needs_review: true
  },

  // Ma-Row
  {
    id: "h-ma",
    kana: "ま",
    romaji: "ma",
    hindiPhonetic: "मा / म",
    type: "hiragana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "माँ (Maa) का प्यार भरा चेहरा।",
    needs_review: true
  },
  {
    id: "h-mi",
    kana: "み",
    romaji: "mi",
    hindiPhonetic: "मि",
    type: "hiragana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "संगीत का सुर 'मी' या 21 जैसा घुमाव।",
    needs_review: true
  },
  {
    id: "h-mu",
    kana: "む",
    romaji: "mu",
    hindiPhonetic: "मु",
    type: "hiragana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "गाय का मुंह (Moo -> मु)।",
    needs_review: true
  },
  {
    id: "h-me",
    kana: "め",
    romaji: "me",
    hindiPhonetic: "मे",
    type: "hiragana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "मेमने (Mēmnā) का चेहरा।",
    needs_review: true
  },
  {
    id: "h-mo",
    kana: "も",
    romaji: "mo",
    hindiPhonetic: "मो",
    type: "hiragana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "मछली का कांटा जिसमें अधिक (More -> मो) चारा लगा हो।",
    needs_review: true
  },

  // Ya-Row (3)
  {
    id: "h-ya",
    kana: "や",
    romaji: "ya",
    hindiPhonetic: "या / य",
    type: "hiragana",
    row: "ya-row",
    groupCategory: "basic",
    mnemonic: "याक (Yak) के सींग।",
    needs_review: true
  },
  {
    id: "h-yu",
    kana: "ゆ",
    romaji: "yu",
    hindiPhonetic: "यु",
    type: "hiragana",
    row: "ya-row",
    groupCategory: "basic",
    mnemonic: "मछली जैसी आकृति (युवक -> यु)।",
    needs_review: true
  },
  {
    id: "h-yo",
    kana: "よ",
    romaji: "yo",
    hindiPhonetic: "यो",
    type: "hiragana",
    row: "ya-row",
    groupCategory: "basic",
    mnemonic: "यो-यो (Yo-yo) का खिलौना।",
    needs_review: true
  },

  // Ra-Row (5)
  {
    id: "h-ra",
    kana: "ら",
    romaji: "ra",
    hindiPhonetic: "रा (tap r)",
    type: "hiragana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जापानी 'r' ध्वनि हिंदी के 'र' और 'ड़/ल' के बीच की जीभ के हल्के स्पर्श (tap) वाली ध्वनि है।",
    mnemonic: "रास्ते (Raasta) का घुमावदार मोड़।",
    needs_review: true
  },
  {
    id: "h-ri",
    kana: "り",
    romaji: "ri",
    hindiPhonetic: "रि (tap r)",
    type: "hiragana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से छूकर 'रि' बोलें।",
    mnemonic: "रिमझिम (Rimjhim) बारिश की दो बूंदें।",
    needs_review: true
  },
  {
    id: "h-ru",
    kana: "る",
    romaji: "ru",
    hindiPhonetic: "रु (tap r)",
    type: "hiragana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से छूकर 'रु' बोलें।",
    mnemonic: "रुपये (Rupaya) का गोल सिक्का नीचे लटकता हुआ।",
    needs_review: true
  },
  {
    id: "h-re",
    kana: "れ",
    romaji: "re",
    hindiPhonetic: "रे (tap r)",
    type: "hiragana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से छूकर 'रे' बोलें।",
    mnemonic: "रेल (Rail) की पटरी का किनारा।",
    needs_review: true
  },
  {
    id: "h-ro",
    kana: "ろ",
    romaji: "ro",
    hindiPhonetic: "रो (tap r)",
    type: "hiragana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से छूकर 'रो' बोलें। (る जैसा पर नीचे लूप नहीं होता)।",
    mnemonic: "रोटी (Roti) का खुला हुआ घेरा।",
    needs_review: true
  },

  // Wa-Row (3)
  {
    id: "h-wa",
    kana: "わ",
    romaji: "wa",
    hindiPhonetic: "वा / व",
    type: "hiragana",
    row: "wa-row",
    groupCategory: "basic",
    mnemonic: "वाटर (Water) का घड़ा।",
    needs_review: true
  },
  {
    id: "h-wo",
    kana: "を",
    romaji: "o",
    hindiPhonetic: "ओ (written 'wo', pronounced 'o')",
    type: "hiragana",
    row: "wa-row",
    groupCategory: "basic",
    pronunciationNote: "रोमाजी में इसे 'wo' लिखा जाता है लेकिन उच्चारण शुद्ध 'ओ' (o) होता है। यह केवल कर्म कारक (Object marker) के रूप में प्रयुक्त होता है।",
    mnemonic: "ओलिंपिक धावक जो बाधा पार कर रहा हो।",
    needs_review: true
  },
  {
    id: "h-n",
    kana: "ん",
    romaji: "n",
    hindiPhonetic: "न / ं (nasal n)",
    type: "hiragana",
    row: "wa-row",
    groupCategory: "basic",
    pronunciationNote: "नासिक्य ध्वनि (अनुस्वार)। आगे आने वाले व्यंजन के आधार पर यह 'न्', 'म्' या 'ङ्' जैसा हल्का बदलता है (जैसे: pan -> pamm/pan)।",
    mnemonic: "अंग्रेजी के छोटे 'n' जैसी आकृति।",
    needs_review: true
  },

  // --- DAKUTEN ROWS (20) ---
  // Ga-Row
  {
    id: "h-ga",
    kana: "が",
    romaji: "ga",
    hindiPhonetic: "गा / ग",
    type: "hiragana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "か (ka) पर दो बिंदी (दकुतेन) = गा।",
    needs_review: true
  },
  {
    id: "h-gi",
    kana: "ぎ",
    romaji: "gi",
    hindiPhonetic: "गि",
    type: "hiragana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "き (ki) पर दो बिंदी = गि।",
    needs_review: true
  },
  {
    id: "h-gu",
    kana: "ぐ",
    romaji: "gu",
    hindiPhonetic: "गु",
    type: "hiragana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "く (ku) पर दो बिंदी = गु।",
    needs_review: true
  },
  {
    id: "h-ge",
    kana: "げ",
    romaji: "ge",
    hindiPhonetic: "गे",
    type: "hiragana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "け (ke) पर दो बिंदी = गे।",
    needs_review: true
  },
  {
    id: "h-go",
    kana: "ご",
    romaji: "go",
    hindiPhonetic: "गो",
    type: "hiragana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "こ (ko) पर दो बिंदी = गो।",
    needs_review: true
  },

  // Za-Row
  {
    id: "h-za",
    kana: "ざ",
    romaji: "za",
    hindiPhonetic: "ज़ा",
    type: "hiragana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "さ (sa) पर दो बिंदी = ज़ा।",
    needs_review: true
  },
  {
    id: "h-ji",
    kana: "じ",
    romaji: "ji",
    hindiPhonetic: "जि",
    type: "hiragana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "し (shi) पर दो बिंदी = जि।",
    needs_review: true
  },
  {
    id: "h-zu",
    kana: "ず",
    romaji: "zu",
    hindiPhonetic: "ज़ु",
    type: "hiragana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "す (su) पर दो बिंदी = ज़ु।",
    needs_review: true
  },
  {
    id: "h-ze",
    kana: "ぜ",
    romaji: "ze",
    hindiPhonetic: "ज़े",
    type: "hiragana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "せ (se) पर दो बिंदी = ज़े।",
    needs_review: true
  },
  {
    id: "h-zo",
    kana: "ぞ",
    romaji: "zo",
    hindiPhonetic: "ज़ो",
    type: "hiragana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "そ (so) पर दो बिंदी = ज़ो।",
    needs_review: true
  },

  // Da-Row
  {
    id: "h-da",
    kana: "だ",
    romaji: "da",
    hindiPhonetic: "दा / द",
    type: "hiragana",
    row: "da-row",
    groupCategory: "dakuten",
    mnemonic: "た (ta) पर दो बिंदी = दा।",
    needs_review: true
  },
  {
    id: "h-dji",
    kana: "ぢ",
    romaji: "ji",
    hindiPhonetic: "जि (rare, same as じ)",
    type: "hiragana",
    row: "da-row",
    groupCategory: "dakuten",
    pronunciationNote: "उच्चारण 'じ' (ji) जैसा ही होता है। यह बहुत कम प्रयुक्त होता है (यॉत्सुगाना)।",
    mnemonic: "ち (chi) पर दो बिंदी = जि (यॉत्सुगाना)।",
    needs_review: true
  },
  {
    id: "h-dzu",
    kana: "づ",
    romaji: "zu",
    hindiPhonetic: "ज़ु (rare, same as ず)",
    type: "hiragana",
    row: "da-row",
    groupCategory: "dakuten",
    pronunciationNote: "उच्चारण 'ず' (zu) जैसा ही होता है। यह केवल विशेष शब्दों में आता है (जैसे: つづく)।",
    mnemonic: "つ (tsu) पर दो बिंदी = ज़ु (यॉत्सुगाना)।",
    needs_review: true
  },
  {
    id: "h-de",
    kana: "で",
    romaji: "de",
    hindiPhonetic: "दे",
    type: "hiragana",
    row: "da-row",
    groupCategory: "dakuten",
    mnemonic: "て (te) पर दो बिंदी = दे।",
    needs_review: true
  },
  {
    id: "h-do",
    kana: "ど",
    romaji: "do",
    hindiPhonetic: "दो",
    type: "hiragana",
    row: "da-row",
    groupCategory: "dakuten",
    mnemonic: "と (to) पर दो बिंदी = दो।",
    needs_review: true
  },

  // Ba-Row
  {
    id: "h-ba",
    kana: "ば",
    romaji: "ba",
    hindiPhonetic: "बा / ब",
    type: "hiragana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "は (ha) पर दो बिंदी = बा।",
    needs_review: true
  },
  {
    id: "h-bi",
    kana: "び",
    romaji: "bi",
    hindiPhonetic: "बि",
    type: "hiragana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "ひ (hi) पर दो बिंदी = बि।",
    needs_review: true
  },
  {
    id: "h-bu",
    kana: "ぶ",
    romaji: "bu",
    hindiPhonetic: "बु",
    type: "hiragana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "ふ (fu) पर दो बिंदी = बु।",
    needs_review: true
  },
  {
    id: "h-be",
    kana: "べ",
    romaji: "be",
    hindiPhonetic: "बे",
    type: "hiragana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "へ (he) पर दो बिंदी = बे।",
    needs_review: true
  },
  {
    id: "h-bo",
    kana: "ぼ",
    romaji: "bo",
    hindiPhonetic: "बो",
    type: "hiragana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "ほ (ho) पर दो बिंदी = बो।",
    needs_review: true
  },

  // --- HANDAKUTEN ROW (5) ---
  // Pa-Row
  {
    id: "h-pa",
    kana: "ぱ",
    romaji: "pa",
    hindiPhonetic: "पा / प",
    type: "hiragana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "は (ha) पर छोटा वृत्त (हन्दाकुतेन) = पा।",
    needs_review: true
  },
  {
    id: "h-pi",
    kana: "ぴ",
    romaji: "pi",
    hindiPhonetic: "पि",
    type: "hiragana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "ひ (hi) पर छोटा वृत्त = पि।",
    needs_review: true
  },
  {
    id: "h-pu",
    kana: "ぷ",
    romaji: "pu",
    hindiPhonetic: "पु",
    type: "hiragana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "ふ (fu) पर छोटा वृत्त = पु।",
    needs_review: true
  },
  {
    id: "h-pe",
    kana: "ぺ",
    romaji: "pe",
    hindiPhonetic: "पे",
    type: "hiragana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "へ (he) पर छोटा वृत्त = पे।",
    needs_review: true
  },
  {
    id: "h-po",
    kana: "ぽ",
    romaji: "po",
    hindiPhonetic: "पो",
    type: "hiragana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "ほ (ho) पर छोटा वृत्त = पो।",
    needs_review: true
  },

  // --- YOON COMBINATIONS (33) ---
  // Kya, Kyu, Kyo
  {
    id: "h-kya",
    kana: "きゃ",
    romaji: "kya",
    hindiPhonetic: "क्या",
    type: "hiragana",
    row: "kya-group",
    groupCategory: "yoon",
    mnemonic: "き (ki) + छोटा ゃ (ya) = kya (क्या)",
    needs_review: true
  },
  {
    id: "h-kyu",
    kana: "きゅ",
    romaji: "kyu",
    hindiPhonetic: "क्यु",
    type: "hiragana",
    row: "kya-group",
    groupCategory: "yoon",
    mnemonic: "き (ki) + छोटा ゅ (yu) = kyu (क्यु)",
    needs_review: true
  },
  {
    id: "h-kyo",
    kana: "きょ",
    romaji: "kyo",
    hindiPhonetic: "क्यो",
    type: "hiragana",
    row: "kya-group",
    groupCategory: "yoon",
    mnemonic: "き (ki) + छोटा ょ (yo) = kyo (क्यो)",
    needs_review: true
  },

  // Sha, Shu, Sho
  {
    id: "h-sha",
    kana: "しゃ",
    romaji: "sha",
    hindiPhonetic: "शा",
    type: "hiragana",
    row: "sha-group",
    groupCategory: "yoon",
    mnemonic: "し (shi) + छोटा ゃ (ya) = sha (शा)",
    needs_review: true
  },
  {
    id: "h-shu",
    kana: "しゅ",
    romaji: "shu",
    hindiPhonetic: "शु",
    type: "hiragana",
    row: "sha-group",
    groupCategory: "yoon",
    mnemonic: "し (shi) + छोटा ゅ (yu) = shu (शु)",
    needs_review: true
  },
  {
    id: "h-sho",
    kana: "しょ",
    romaji: "sho",
    hindiPhonetic: "शो",
    type: "hiragana",
    row: "sha-group",
    groupCategory: "yoon",
    mnemonic: "し (shi) + छोटा ょ (yo) = sho (शो)",
    needs_review: true
  },

  // Cha, Chu, Cho
  {
    id: "h-cha",
    kana: "ちゃ",
    romaji: "cha",
    hindiPhonetic: "चा",
    type: "hiragana",
    row: "cha-group",
    groupCategory: "yoon",
    mnemonic: "ち (chi) + छोटा ゃ (ya) = cha (चा)",
    needs_review: true
  },
  {
    id: "h-chu",
    kana: "ちゅ",
    romaji: "chu",
    hindiPhonetic: "चु",
    type: "hiragana",
    row: "cha-group",
    groupCategory: "yoon",
    mnemonic: "ち (chi) + छोटा ゅ (yu) = chu (चु)",
    needs_review: true
  },
  {
    id: "h-cho",
    kana: "ちょ",
    romaji: "cho",
    hindiPhonetic: "चो",
    type: "hiragana",
    row: "cha-group",
    groupCategory: "yoon",
    mnemonic: "ち (chi) + छोटा ょ (yo) = cho (चो)",
    needs_review: true
  },

  // Nya, Nyu, Nyo
  {
    id: "h-nya",
    kana: "にゃ",
    romaji: "nya",
    hindiPhonetic: "न्या",
    type: "hiragana",
    row: "nya-group",
    groupCategory: "yoon",
    mnemonic: "に (ni) + छोटा ゃ (ya) = nya (न्या)",
    needs_review: true
  },
  {
    id: "h-nyu",
    kana: "にゅ",
    romaji: "nyu",
    hindiPhonetic: "न्यु",
    type: "hiragana",
    row: "nya-group",
    groupCategory: "yoon",
    mnemonic: "に (ni) + छोटा ゅ (yu) = nyu (न्यु)",
    needs_review: true
  },
  {
    id: "h-nyo",
    kana: "にょ",
    romaji: "nyo",
    hindiPhonetic: "न्यो",
    type: "hiragana",
    row: "nya-group",
    groupCategory: "yoon",
    mnemonic: "に (ni) + छोटा ょ (yo) = nyo (न्यो)",
    needs_review: true
  },

  // Hya, Hyu, Hyo
  {
    id: "h-hya",
    kana: "ひゃ",
    romaji: "hya",
    hindiPhonetic: "ह्या",
    type: "hiragana",
    row: "hya-group",
    groupCategory: "yoon",
    mnemonic: "ひ (hi) + छोटा ゃ (ya) = hya (ह्या)",
    needs_review: true
  },
  {
    id: "h-hyu",
    kana: "ひゅ",
    romaji: "hyu",
    hindiPhonetic: "ह्यु",
    type: "hiragana",
    row: "hya-group",
    groupCategory: "yoon",
    mnemonic: "ひ (hi) + छोटा ゅ (yu) = hyu (ह्यु)",
    needs_review: true
  },
  {
    id: "h-hyo",
    kana: "ひょ",
    romaji: "hyo",
    hindiPhonetic: "ह्यो",
    type: "hiragana",
    row: "hya-group",
    groupCategory: "yoon",
    mnemonic: "ひ (hi) + छोटा ょ (yo) = hyo (ह्यो)",
    needs_review: true
  },

  // Mya, Myu, Myo
  {
    id: "h-mya",
    kana: "みゃ",
    romaji: "mya",
    hindiPhonetic: "म्या",
    type: "hiragana",
    row: "mya-group",
    groupCategory: "yoon",
    mnemonic: "み (mi) + छोटा ゃ (ya) = mya (म्या)",
    needs_review: true
  },
  {
    id: "h-myu",
    kana: "みゅ",
    romaji: "myu",
    hindiPhonetic: "म्यु",
    type: "hiragana",
    row: "mya-group",
    groupCategory: "yoon",
    mnemonic: "み (mi) + छोटा ゅ (yu) = myu (म्यु)",
    needs_review: true
  },
  {
    id: "h-myo",
    kana: "みょ",
    romaji: "myo",
    hindiPhonetic: "म्यो",
    type: "hiragana",
    row: "mya-group",
    groupCategory: "yoon",
    mnemonic: "み (mi) + छोटा ょ (yo) = myo (म्यो)",
    needs_review: true
  },

  // Rya, Ryu, Ryo
  {
    id: "h-rya",
    kana: "りゃ",
    romaji: "rya",
    hindiPhonetic: "र्या",
    type: "hiragana",
    row: "rya-group",
    groupCategory: "yoon",
    mnemonic: "り (ri) + छोटा ゃ (ya) = rya (र्या)",
    needs_review: true
  },
  {
    id: "h-ryu",
    kana: "りゅ",
    romaji: "ryu",
    hindiPhonetic: "र्यु",
    type: "hiragana",
    row: "rya-group",
    groupCategory: "yoon",
    mnemonic: "り (ri) + छोटा ゅ (yu) = ryu (र्यु)",
    needs_review: true
  },
  {
    id: "h-ryo",
    kana: "りょ",
    romaji: "ryo",
    hindiPhonetic: "र्यो",
    type: "hiragana",
    row: "rya-group",
    groupCategory: "yoon",
    mnemonic: "り (ri) + छोटा ょ (yo) = ryo (र्यो)",
    needs_review: true
  },

  // Gya, Gyu, Gyo
  {
    id: "h-gya",
    kana: "ぎゃ",
    romaji: "gya",
    hindiPhonetic: "ग्या",
    type: "hiragana",
    row: "gya-group",
    groupCategory: "yoon",
    mnemonic: "ぎ (gi) + छोटा ゃ (ya) = gya (ग्या)",
    needs_review: true
  },
  {
    id: "h-gyu",
    kana: "ぎゅ",
    romaji: "gyu",
    hindiPhonetic: "ग्यु",
    type: "hiragana",
    row: "gya-group",
    groupCategory: "yoon",
    mnemonic: "ぎ (gi) + छोटा ゅ (yu) = gyu (ग्यु)",
    needs_review: true
  },
  {
    id: "h-gyo",
    kana: "ぎょ",
    romaji: "gyo",
    hindiPhonetic: "ग्यो",
    type: "hiragana",
    row: "gya-group",
    groupCategory: "yoon",
    mnemonic: "ぎ (gi) + छोटा ょ (yo) = gyo (ग्यो)",
    needs_review: true
  },

  // Ja, Ju, Jo
  {
    id: "h-ja",
    kana: "じゃ",
    romaji: "ja",
    hindiPhonetic: "जा",
    type: "hiragana",
    row: "ja-group",
    groupCategory: "yoon",
    mnemonic: "じ (ji) + छोटा ゃ (ya) = ja (जा)",
    needs_review: true
  },
  {
    id: "h-ju",
    kana: "じゅ",
    romaji: "ju",
    hindiPhonetic: "जु",
    type: "hiragana",
    row: "ja-group",
    groupCategory: "yoon",
    mnemonic: "じ (ji) + छोटा ゅ (yu) = ju (जु)",
    needs_review: true
  },
  {
    id: "h-jo",
    kana: "じょ",
    romaji: "じょ",
    hindiPhonetic: "जो",
    type: "hiragana",
    row: "ja-group",
    groupCategory: "yoon",
    mnemonic: "じ (ji) + छोटा ょ (yo) = jo (जो)",
    needs_review: true
  },

  // Bya, Byu, Byo
  {
    id: "h-bya",
    kana: "びゃ",
    romaji: "bya",
    hindiPhonetic: "ब्या",
    type: "hiragana",
    row: "bya-group",
    groupCategory: "yoon",
    mnemonic: "び (bi) + छोटा ゃ (ya) = bya (ब्या)",
    needs_review: true
  },
  {
    id: "h-byu",
    kana: "びゅ",
    romaji: "byu",
    hindiPhonetic: "ब्यु",
    type: "hiragana",
    row: "bya-group",
    groupCategory: "yoon",
    mnemonic: "び (bi) + छोटा ゅ (yu) = byu (ब्यु)",
    needs_review: true
  },
  {
    id: "h-byo",
    kana: "びょ",
    romaji: "びょ",
    hindiPhonetic: "ब्यो",
    type: "hiragana",
    row: "bya-group",
    groupCategory: "yoon",
    mnemonic: "び (bi) + छोटा ょ (yo) = byo (ब्यो)",
    needs_review: true
  },

  // Pya, Pyu, Pyo
  {
    id: "h-pya",
    kana: "ぴゃ",
    romaji: "pya",
    hindiPhonetic: "प्या",
    type: "hiragana",
    row: "pya-group",
    groupCategory: "yoon",
    mnemonic: "ぴ (pi) + छोटा ゃ (ya) = pya (प्या)",
    needs_review: true
  },
  {
    id: "h-pyu",
    kana: "ぴゅ",
    romaji: "pyu",
    hindiPhonetic: "प्यु",
    type: "hiragana",
    row: "pya-group",
    groupCategory: "yoon",
    mnemonic: "ぴ (pi) + छोटा ゅ (yu) = pyu (प्यु)",
    needs_review: true
  },
  {
    id: "h-pyo",
    kana: "ぴょ",
    romaji: "pyo",
    hindiPhonetic: "प्यो",
    type: "hiragana",
    row: "pya-group",
    groupCategory: "yoon",
    mnemonic: "ぴ (pi) + छोटा ょ (yo) = pyo (प्यो)",
    needs_review: true
  },

  // --- SPECIAL SOUNDS (3 entries) ---
  {
    id: "h-special-sokuon",
    kana: "っ",
    romaji: "small tsu (pause/double consonant)",
    hindiPhonetic: "छोटा त्सु (आधा अक्षर / ठहराव)",
    type: "hiragana",
    row: "special-sounds",
    groupCategory: "special",
    mnemonic: "अगले व्यंजन को दोहराता है (व्यंजन पर हल्का ठहराव)।",
    pronunciationNote: "छोटा 'っ' ध्वनि को एक पल के लिए रोकता है, जिससे अगला अक्षर आधा सुनाई देता है।",
    examples: [
      {
        jp: "ちょっと",
        romaji: "chotto",
        hindi: "चोत्तो",
        meaning: "ज़रा सा / थोड़ा (a little)"
      },
      {
        jp: "きって",
        romaji: "kitte",
        hindi: "कित्ते",
        meaning: "डाक टिकट (postage stamp)"
      },
      {
        jp: "がっこう",
        romaji: "gakkou",
        hindi: "गाक्कोउ",
        meaning: "विद्यालय / स्कूल (school)"
      }
    ],
    needs_review: true
  },
  {
    id: "h-special-chouon",
    kana: "おう / えい",
    romaji: "long vowels (ō, ē)",
    hindiPhonetic: "दीर्घ स्वर (लंबा उच्चारण)",
    type: "hiragana",
    row: "special-sounds",
    groupCategory: "special",
    mnemonic: "स्वर को 2 मात्राओं जितना लंबा खींचकर बोलना।",
    pronunciationNote: "'おう' को 'ओ' (ō) और 'えい/ええ' को 'ए' (ē) लंबा खींचकर बोला जाता है।",
    examples: [
      {
        jp: "とうきょう",
        romaji: "Tōkyō",
        hindi: "तोक्यो (दीर्घ ओ)",
        meaning: "टोक्यो (Tokyo city)"
      },
      {
        jp: "せんせい",
        romaji: "Sensei",
        hindi: "सेन्सेई (दीर्घ ए)",
        meaning: "शिक्षक / गुरु (teacher)"
      },
      {
        jp: "おとうさん",
        romaji: "Otousan",
        hindi: "ओतोउसान (दीर्घ ओ)",
        meaning: "पिताजी (father)"
      }
    ],
    needs_review: true
  },
  {
    id: "h-special-yotsugana",
    kana: "ぢ / づ",
    romaji: "ji / zu (yotsugana)",
    hindiPhonetic: "जि / ज़ु (दुर्लभ प्रयुक्त)",
    type: "hiragana",
    row: "special-sounds",
    groupCategory: "special",
    mnemonic: "じ और ず जैसी ही ध्वनि; संधि या पुनरावृत्ति वाले शब्दों में आती है।",
    pronunciationNote: "आधुनिक जापानी में ぢ = じ (ji) और づ = ず (zu) समान हैं। केवल शब्द-व्युत्पत्ति के अनुसार ぢ/づ लिखे जाते हैं।",
    examples: [
      {
        jp: "はなぢ",
        romaji: "hanaji",
        hindi: "हानाजि",
        meaning: "नाक से खून (nosebleed: hana + chi -> hanaji)"
      },
      {
        jp: "つづく",
        romaji: "tsuzuku",
        hindi: "त्सुज़ुकु",
        meaning: "जारी रहना (to continue: tsu + tsuku -> tsuzuku)"
      },
      {
        jp: "ちぢむ",
        romaji: "chijimu",
        hindi: "चिजिमु",
        meaning: "सिकुड़ना (to shrink)"
      }
    ],
    needs_review: true
  }
];

// -------------------------------------------------------------
// KATAKANA FULL SET
// -------------------------------------------------------------
const katakanaData = [
  // --- BASIC ROWS (46) ---
  // A-Row
  {
    id: "k-a",
    kana: "ア",
    romaji: "a",
    hindiPhonetic: "अ",
    type: "katakana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "आइसक्रीम (アイス - Aisu) का 'अ'।",
    needs_review: true
  },
  {
    id: "k-i",
    kana: "イ",
    romaji: "i",
    hindiPhonetic: "इ",
    type: "katakana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "ईज़ी (Easy) की तरह दो सरल छड़ियां।",
    needs_review: true
  },
  {
    id: "k-u",
    kana: "ウ",
    romaji: "u",
    hindiPhonetic: "उ",
    type: "katakana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "उंगलियों से पकड़ी हुई छतरी का सिरा।",
    needs_review: true
  },
  {
    id: "k-e",
    kana: "エ",
    romaji: "e",
    hindiPhonetic: "ए",
    type: "katakana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "एलीवेटर (Elevator) का आई-बीम (I-Beam) ढांचा।",
    needs_review: true
  },
  {
    id: "k-o",
    kana: "オ",
    romaji: "o",
    hindiPhonetic: "ओ",
    type: "katakana",
    row: "a-row",
    groupCategory: "basic",
    mnemonic: "ओपेरा गायक जो हाथ फैलाकर गा रहा हो।",
    needs_review: true
  },

  // Ka-Row
  {
    id: "k-ka",
    kana: "カ",
    romaji: "ka",
    hindiPhonetic: "का / क",
    type: "katakana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "कैमरा (カメラ - Kamera) और कार्ड (Card) का 'का'।",
    needs_review: true
  },
  {
    id: "k-ki",
    kana: "キ",
    romaji: "ki",
    hindiPhonetic: "कि",
    type: "katakana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "की (Key / चाबी) की तरह समानांतर कट।",
    needs_review: true
  },
  {
    id: "k-ku",
    kana: "ク",
    romaji: "ku",
    hindiPhonetic: "कु",
    type: "katakana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "कुक (Cook) की तेज शेफ़ चाकू।",
    needs_review: true
  },
  {
    id: "k-ke",
    kana: "ケ",
    romaji: "ke",
    hindiPhonetic: "के",
    type: "katakana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "केक (ケーキ - Keeki) का टुकड़ा।",
    needs_review: true
  },
  {
    id: "k-ko",
    kana: "コ",
    romaji: "ko",
    hindiPhonetic: "को",
    type: "katakana",
    row: "ka-row",
    groupCategory: "basic",
    mnemonic: "कॉफ़ी (コーヒー - Koohii) का बॉक्स।",
    needs_review: true
  },

  // Sa-Row
  {
    id: "k-sa",
    kana: "サ",
    romaji: "sa",
    hindiPhonetic: "सा / स",
    type: "katakana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "सॉकर (サッカー - Sakkaa) का गोलपोस्ट।",
    needs_review: true
  },
  {
    id: "k-shi",
    kana: "シ",
    romaji: "shi",
    hindiPhonetic: "शि",
    type: "katakana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "शर्ट (シャツ - Shatsu) पर नीचे से ऊपर की तीन बूंदें।",
    needs_review: true
  },
  {
    id: "k-su",
    kana: "ス",
    romaji: "su",
    hindiPhonetic: "सु",
    type: "katakana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "सूटकेस (Suitcase) या सुपरमैन का एंगल।",
    needs_review: true
  },
  {
    id: "k-se",
    kana: "セ",
    romaji: "se",
    hindiPhonetic: "से",
    type: "katakana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "सेट (Set) और सेवन (Seven) जैसा कोणीय आकार।",
    needs_review: true
  },
  {
    id: "k-so",
    kana: "ソ",
    romaji: "so",
    hindiPhonetic: "सो",
    type: "katakana",
    row: "sa-row",
    groupCategory: "basic",
    mnemonic: "सोडा (Soda) का गिलास (ऊपर से नीचे का स्ट्रोक)।",
    needs_review: true
  },

  // Ta-Row
  {
    id: "k-ta",
    kana: "タ",
    romaji: "ta",
    hindiPhonetic: "ता / त",
    type: "katakana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "टैक्सी (タクシー - Takushii) का मीटर।",
    needs_review: true
  },
  {
    id: "k-chi",
    kana: "チ",
    romaji: "chi",
    hindiPhonetic: "चि",
    type: "katakana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "चीयर्स (Cheers) और चीप (Cheap) का 'चि' (नंबर 4 जैसा)।",
    needs_review: true
  },
  {
    id: "k-tsu",
    kana: "ツ",
    romaji: "tsu",
    hindiPhonetic: "त्सु (ts as in cats)",
    type: "katakana",
    row: "ta-row",
    groupCategory: "basic",
    pronunciationNote: "हिंदी में 'त्सु' का सटीक अक्षर नहीं है; 'cats' या 'tsunami' के 'ts' की तरह उच्चारण करें। (シ से अलग: इसमें स्ट्रोक ऊपर से नीचे आते हैं)।",
    mnemonic: "त्सुनामी (Tsunami) की लहरें।",
    needs_review: true
  },
  {
    id: "k-te",
    kana: "テ",
    romaji: "te",
    hindiPhonetic: "ते",
    type: "katakana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "टेलीविज़न (テレビ - Terebi) और टेबल (テーブル - Teeburu) का 'ते'।",
    needs_review: true
  },
  {
    id: "k-to",
    kana: "ト",
    romaji: "to",
    hindiPhonetic: "तो",
    type: "katakana",
    row: "ta-row",
    groupCategory: "basic",
    mnemonic: "टॉयलेट (トイレ - Toire) और टोस्ट (Toast) का 'तो'।",
    needs_review: true
  },

  // Na-Row
  {
    id: "k-na",
    kana: "ナ",
    romaji: "na",
    hindiPhonetic: "ना / न",
    type: "katakana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "नाइफ़ (Knife / चाकू) का क्रॉस।",
    needs_review: true
  },
  {
    id: "k-ni",
    kana: "ニ",
    romaji: "ni",
    hindiPhonetic: "नि",
    type: "katakana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "दो (Two / जापानी में 'ni') समानांतर रेखाएं।",
    needs_review: true
  },
  {
    id: "k-nu",
    kana: "ヌ",
    romaji: "nu",
    hindiPhonetic: "नु",
    type: "katakana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "नूडल्स (Noodles) का कांटा।",
    needs_review: true
  },
  {
    id: "k-ne",
    kana: "ネ",
    romaji: "ne",
    hindiPhonetic: "ने",
    type: "katakana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "नेटवर्क (Network) या नेकटाई (Necktie) का आकार।",
    needs_review: true
  },
  {
    id: "k-no",
    kana: "ノ",
    romaji: "no",
    hindiPhonetic: "नो",
    type: "katakana",
    row: "na-row",
    groupCategory: "basic",
    mnemonic: "नोटबुक (ノート - Nooto) की एक सरल तिरछी रेखा।",
    needs_review: true
  },

  // Ha-Row
  {
    id: "k-ha",
    kana: "ハ",
    romaji: "ha",
    hindiPhonetic: "हा / ह",
    type: "katakana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "हैट (Hat) की दो ढलान वाली रेखाएं।",
    needs_review: true
  },
  {
    id: "k-hi",
    kana: "ヒ",
    romaji: "hi",
    hindiPhonetic: "हि",
    type: "katakana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "हाई हील (High heel) का जूता।",
    needs_review: true
  },
  {
    id: "k-fu",
    kana: "フ",
    romaji: "fu",
    hindiPhonetic: "फु (soft blown f/h)",
    type: "katakana",
    row: "ha-row",
    groupCategory: "basic",
    pronunciationNote: "हिंदी 'फ' या अंग्रेजी 'f' की तरह दांतों को होंठ पर दबाए बिना, फूंक मारने जैसी हल्की ध्वनि।",
    mnemonic: "फ़ुटबॉल (Football) और फ़ैन (Fan) का 'फु'।",
    needs_review: true
  },
  {
    id: "k-he",
    kana: "ヘ",
    romaji: "he",
    hindiPhonetic: "हे",
    type: "katakana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "हेलमेट (Helmet) की ऊपरी ढलान (हिरागाना へ जैसा ही)।",
    needs_review: true
  },
  {
    id: "k-ho",
    kana: "ホ",
    romaji: "ho",
    hindiPhonetic: "हो",
    type: "katakana",
    row: "ha-row",
    groupCategory: "basic",
    mnemonic: "होटल (ホテル - Hoteru) का स्वागत चिह्न।",
    needs_review: true
  },

  // Ma-Row
  {
    id: "k-ma",
    kana: "マ",
    romaji: "ma",
    hindiPhonetic: "मा / म",
    type: "katakana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "मास्क (Mask) और मार्केट (Market) का 'मा'।",
    needs_review: true
  },
  {
    id: "k-mi",
    kana: "ミ",
    romaji: "mi",
    hindiPhonetic: "मि",
    type: "katakana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "मिल्क (Milk) की तीन बूंदें।",
    needs_review: true
  },
  {
    id: "k-mu",
    kana: "ム",
    romaji: "mu",
    hindiPhonetic: "मु",
    type: "katakana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "म्यूज़िक (Music) का त्रिभुज।",
    needs_review: true
  },
  {
    id: "k-me",
    kana: "メ",
    romaji: "me",
    hindiPhonetic: "मे",
    type: "katakana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "मेनु (Menu) और मेसेज (Message) का क्रॉस।",
    needs_review: true
  },
  {
    id: "k-mo",
    kana: "モ",
    romaji: "mo",
    hindiPhonetic: "मो",
    type: "katakana",
    row: "ma-row",
    groupCategory: "basic",
    mnemonic: "मोबाइल (Mobile) का एंटीना।",
    needs_review: true
  },

  // Ya-Row (3)
  {
    id: "k-ya",
    kana: "ヤ",
    romaji: "ya",
    hindiPhonetic: "या / य",
    type: "katakana",
    row: "ya-row",
    groupCategory: "basic",
    mnemonic: "याक (Yak) के कोणीय सींग।",
    needs_review: true
  },
  {
    id: "k-yu",
    kana: "ユ",
    romaji: "yu",
    hindiPhonetic: "यु",
    type: "katakana",
    row: "ya-row",
    groupCategory: "basic",
    mnemonic: "यू-टर्न (U-Turn) का मोड़।",
    needs_review: true
  },
  {
    id: "k-yo",
    kana: "ヨ",
    romaji: "yo",
    hindiPhonetic: "यो",
    type: "katakana",
    row: "ya-row",
    groupCategory: "basic",
    mnemonic: "योगर्ट (Yogurt) का 'E' जैसा डिब्बा।",
    needs_review: true
  },

  // Ra-Row (5)
  {
    id: "k-ra",
    kana: "ラ",
    romaji: "ra",
    hindiPhonetic: "रा (tap r)",
    type: "katakana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से स्पर्श (tap) करके बोलें।",
    mnemonic: "रेडियो (Radio) का एंटीना।",
    needs_review: true
  },
  {
    id: "k-ri",
    kana: "リ",
    romaji: "ri",
    hindiPhonetic: "रि (tap r)",
    type: "katakana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से स्पर्श करके बोलें।",
    mnemonic: "रिबन (Ribbon) की दो सीधी पट्टियां।",
    needs_review: true
  },
  {
    id: "k-ru",
    kana: "ル",
    romaji: "ru",
    hindiPhonetic: "रु (tap r)",
    type: "katakana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से स्पर्श करके बोलें।",
    mnemonic: "रूट (Root / जड़) की दो शाखाएं।",
    needs_review: true
  },
  {
    id: "k-re",
    kana: "レ",
    romaji: "re",
    hindiPhonetic: "रे (tap r)",
    type: "katakana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से स्पर्श करके बोलें।",
    mnemonic: "रेस्टोरेंट (レストラン - Resutoran) का 'रे'।",
    needs_review: true
  },
  {
    id: "k-ro",
    kana: "ロ",
    romaji: "ro",
    hindiPhonetic: "रो (tap r)",
    type: "katakana",
    row: "ra-row",
    groupCategory: "basic",
    pronunciationNote: "जीभ को तालू से हल्के से स्पर्श करके बोलें।",
    mnemonic: "रोबोट (Robot) का चौकोर मुंह।",
    needs_review: true
  },

  // Wa-Row (3)
  {
    id: "k-wa",
    kana: "ワ",
    romaji: "wa",
    hindiPhonetic: "वा / व",
    type: "katakana",
    row: "wa-row",
    groupCategory: "basic",
    mnemonic: "वाइन ग्लास (Wine glass) का किनारा।",
    needs_review: true
  },
  {
    id: "k-wo",
    kana: "ヲ",
    romaji: "o",
    hindiPhonetic: "ओ (written 'wo', pronounced 'o')",
    type: "katakana",
    row: "wa-row",
    groupCategory: "basic",
    pronunciationNote: "रोमाजी में 'wo' लेकिन उच्चारण शुद्ध 'ओ' (o)। काताकाना में आधुनिक प्रयोग बहुत दुर्लभ है।",
    mnemonic: "फ् (フ) पर एक अतिरिक्त डंडी।",
    needs_review: true
  },
  {
    id: "k-n",
    kana: "ン",
    romaji: "n",
    hindiPhonetic: "न / ं (nasal n)",
    type: "katakana",
    row: "wa-row",
    groupCategory: "basic",
    pronunciationNote: "नासिक्य ध्वनि (अनुस्वार)। (सो ソ से अलग: इसमें निचला स्ट्रोक नीचे से ऊपर जाता है)।",
    mnemonic: "पेन (ペン - Pen) और पैन (Pan) का 'न'।",
    needs_review: true
  },

  // --- DAKUTEN ROWS (20) ---
  // Ga-Row
  {
    id: "k-ga",
    kana: "ガ",
    romaji: "ga",
    hindiPhonetic: "गा / ग",
    type: "katakana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "カ (ka) पर दो बिंदी = गा (गैस - Gas)।",
    needs_review: true
  },
  {
    id: "k-gi",
    kana: "ギ",
    romaji: "gi",
    hindiPhonetic: "गि",
    type: "katakana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "キ (ki) पर दो बिंदी = गि (गिटार - Guitar)।",
    needs_review: true
  },
  {
    id: "k-gu",
    kana: "グ",
    romaji: "gu",
    hindiPhonetic: "गु",
    type: "katakana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "ク (ku) पर दो बिंदी = गु (ग्लास - Glass)।",
    needs_review: true
  },
  {
    id: "k-ge",
    kana: "ゲ",
    romaji: "ge",
    hindiPhonetic: "गे",
    type: "katakana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "ケ (ke) पर दो बिंदी = गे (गेम - Game)।",
    needs_review: true
  },
  {
    id: "k-go",
    kana: "ゴ",
    romaji: "go",
    hindiPhonetic: "गो",
    type: "katakana",
    row: "ga-row",
    groupCategory: "dakuten",
    mnemonic: "コ (ko) पर दो बिंदी = गो (गोल्फ़ - Golf)।",
    needs_review: true
  },

  // Za-Row
  {
    id: "k-za",
    kana: "ザ",
    romaji: "za",
    hindiPhonetic: "ज़ा",
    type: "katakana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "サ (sa) पर दो बिंदी = ज़ा।",
    needs_review: true
  },
  {
    id: "k-ji",
    kana: "ジ",
    romaji: "ji",
    hindiPhonetic: "जि",
    type: "katakana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "シ (shi) पर दो बिंदी = जि (जूस - ジュース Juusu)।",
    needs_review: true
  },
  {
    id: "k-zu",
    kana: "ズ",
    romaji: "zu",
    hindiPhonetic: "ज़ु",
    type: "katakana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "ス (su) पर दो बिंदी = ज़ु (ज़ू / चिड़ियाघर - Zoo)।",
    needs_review: true
  },
  {
    id: "k-ze",
    kana: "ゼ",
    romaji: "ze",
    hindiPhonetic: "ज़े",
    type: "katakana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "セ (se) पर दो बिंदी = ज़े (ज़ेब्रा - Zebra)।",
    needs_review: true
  },
  {
    id: "k-zo",
    kana: "ゾ",
    romaji: "zo",
    hindiPhonetic: "ज़ो",
    type: "katakana",
    row: "za-row",
    groupCategory: "dakuten",
    mnemonic: "ソ (so) पर दो बिंदी = ज़ो (ज़ोन - Zone)।",
    needs_review: true
  },

  // Da-Row
  {
    id: "k-da",
    kana: "ダ",
    romaji: "da",
    hindiPhonetic: "दा / द",
    type: "katakana",
    row: "da-row",
    groupCategory: "dakuten",
    mnemonic: "タ (ta) पर दो बिंदी = दा (डांस - Dance)।",
    needs_review: true
  },
  {
    id: "k-dji",
    kana: "ヂ",
    romaji: "ji",
    hindiPhonetic: "जि (rare, same as ジ)",
    type: "katakana",
    row: "da-row",
    groupCategory: "dakuten",
    pronunciationNote: "उच्चारण 'ジ' (ji) जैसा ही होता है। काताकाना में यह अत्यंत दुर्लभ है।",
    mnemonic: "チ (chi) पर दो बिंदी = जि (यॉत्सुगाना)।",
    needs_review: true
  },
  {
    id: "k-dzu",
    kana: "ヅ",
    romaji: "zu",
    hindiPhonetic: "ज़ु (rare, same as ズ)",
    type: "katakana",
    row: "da-row",
    groupCategory: "dakuten",
    pronunciationNote: "उच्चारण 'ズ' (zu) जैसा ही होता है।",
    mnemonic: "ツ (tsu) पर दो बिंदी = ज़ु (यॉत्सुगाना)।",
    needs_review: true
  },
  {
    id: "k-de",
    kana: "デ",
    romaji: "de",
    hindiPhonetic: "दे",
    type: "katakana",
    row: "da-row",
    groupCategory: "dakuten",
    mnemonic: "テ (te) पर दो बिंदी = दे (डेस्क - Desk)।",
    needs_review: true
  },
  {
    id: "k-do",
    kana: "ド",
    romaji: "do",
    hindiPhonetic: "दो",
    type: "katakana",
    row: "da-row",
    groupCategory: "dakuten",
    mnemonic: "ト (to) पर दो बिंदी = दो (डोर / दरवाज़ा - ドア Doa)।",
    needs_review: true
  },

  // Ba-Row
  {
    id: "k-ba",
    kana: "バ",
    romaji: "ba",
    hindiPhonetic: "बा / ब",
    type: "katakana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "ハ (ha) पर दो बिंदी = बा (बस - バス Basu)।",
    needs_review: true
  },
  {
    id: "k-bi",
    kana: "ビ",
    romaji: "bi",
    hindiPhonetic: "बि",
    type: "katakana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "ヒ (hi) पर दो बिंदी = बि (बीयर - Biiru)।",
    needs_review: true
  },
  {
    id: "k-bu",
    kana: "ブ",
    romaji: "bu",
    hindiPhonetic: "बु",
    type: "katakana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "フ (fu) पर दो बिंदी = बु (बुक - Book)।",
    needs_review: true
  },
  {
    id: "k-be",
    kana: "ベ",
    romaji: "be",
    hindiPhonetic: "बे",
    type: "katakana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "ヘ (he) पर दो बिंदी = बे (बेड - ベッド Beddo)।",
    needs_review: true
  },
  {
    id: "k-bo",
    kana: "ボ",
    romaji: "bo",
    hindiPhonetic: "बो",
    type: "katakana",
    row: "ba-row",
    groupCategory: "dakuten",
    mnemonic: "ホ (ho) पर दो बिंदी = बो (बॉल - Ball / बॉटल)।",
    needs_review: true
  },

  // --- HANDAKUTEN ROW (5) ---
  // Pa-Row
  {
    id: "k-pa",
    kana: "パ",
    romaji: "pa",
    hindiPhonetic: "पा / प",
    type: "katakana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "ハ (ha) पर छोटा वृत्त = पा (पाव/ब्रेड - パン Pan, कंप्यूटर - パソコン Pasokon)।",
    needs_review: true
  },
  {
    id: "k-pi",
    kana: "ピ",
    romaji: "pi",
    hindiPhonetic: "पि",
    type: "katakana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "ヒ (hi) पर छोटा वृत्त = पि (पियानो - Piano, पिज़्ज़ा - Pizza)।",
    needs_review: true
  },
  {
    id: "k-pu",
    kana: "プ",
    romaji: "pu",
    hindiPhonetic: "पु",
    type: "katakana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "フ (fu) पर छोटा वृत्त = पु (पूल - Pool)।",
    needs_review: true
  },
  {
    id: "k-pe",
    kana: "ペ",
    romaji: "pe",
    hindiPhonetic: "पे",
    type: "katakana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "ヘ (he) पर छोटा वृत्त = पे (पेन - ペン Pen)।",
    needs_review: true
  },
  {
    id: "k-po",
    kana: "ポ",
    romaji: "po",
    hindiPhonetic: "पो",
    type: "katakana",
    row: "pa-row",
    groupCategory: "handakuten",
    mnemonic: "ホ (ho) पर छोटा वृत्त = पो (पोस्ट - Post, पॉकेट)।",
    needs_review: true
  },

  // --- YOON COMBINATIONS (33) ---
  // Kya, Kyu, Kyo
  {
    id: "k-kya",
    kana: "キャ",
    romaji: "kya",
    hindiPhonetic: "क्या",
    type: "katakana",
    row: "kya-group",
    groupCategory: "yoon",
    mnemonic: "キ (ki) + छोटा ャ (ya) = kya (कैंप - キャンプ)",
    needs_review: true
  },
  {
    id: "k-kyu",
    kana: "キュ",
    romaji: "kyu",
    hindiPhonetic: "क्यु",
    type: "katakana",
    row: "kya-group",
    groupCategory: "yoon",
    mnemonic: "キ (ki) + छोटा ュ (yu) = kyu (क्यू - キュー)",
    needs_review: true
  },
  {
    id: "k-kyo",
    kana: "キョ",
    romaji: "kyo",
    hindiPhonetic: "क्यो",
    type: "katakana",
    row: "kya-group",
    groupCategory: "yoon",
    mnemonic: "キ (ki) + छोटा ョ (yo) = kyo",
    needs_review: true
  },

  // Sha, Shu, Sho
  {
    id: "k-sha",
    kana: "シャ",
    romaji: "sha",
    hindiPhonetic: "शा",
    type: "katakana",
    row: "sha-group",
    groupCategory: "yoon",
    mnemonic: "シ (shi) + छोटा ャ (ya) = sha (शर्ट - シャツ Shatsu)",
    needs_review: true
  },
  {
    id: "k-shu",
    kana: "シュ",
    romaji: "shu",
    hindiPhonetic: "शु",
    type: "katakana",
    row: "sha-group",
    groupCategory: "yoon",
    mnemonic: "シ (shi) + छोटा ュ (yu) = shu (शूज़ - シューズ)",
    needs_review: true
  },
  {
    id: "k-sho",
    kana: "ショ",
    romaji: "sho",
    hindiPhonetic: "शो",
    type: "katakana",
    row: "sha-group",
    groupCategory: "yoon",
    mnemonic: "シ (shi) + छोटा ョ (yo) = sho (शॉपिंग - ショッピング)",
    needs_review: true
  },

  // Cha, Chu, Cho
  {
    id: "k-cha",
    kana: "チャ",
    romaji: "cha",
    hindiPhonetic: "चा",
    type: "katakana",
    row: "cha-group",
    groupCategory: "yoon",
    mnemonic: "チ (chi) + छोटा ャ (ya) = cha (चार्ट - チャート, चांस)",
    needs_review: true
  },
  {
    id: "k-chu",
    kana: "チュ",
    romaji: "chu",
    hindiPhonetic: "चु",
    type: "katakana",
    row: "cha-group",
    groupCategory: "yoon",
    mnemonic: "チ (chi) + छोटा ュ (yu) = chu (चॉकलेट)",
    needs_review: true
  },
  {
    id: "k-cho",
    kana: "チョ",
    romaji: "cho",
    hindiPhonetic: "चो",
    type: "katakana",
    row: "cha-group",
    groupCategory: "yoon",
    mnemonic: "チ (chi) + छोटा ョ (yo) = cho (चॉकलेट - チョコレート)",
    needs_review: true
  },

  // Nya, Nyu, Nyo
  {
    id: "k-nya",
    kana: "ニャ",
    romaji: "nya",
    hindiPhonetic: "न्या",
    type: "katakana",
    row: "nya-group",
    groupCategory: "yoon",
    mnemonic: "ニ (ni) + छोटा ャ (ya) = nya",
    needs_review: true
  },
  {
    id: "k-nyu",
    kana: "ニュ",
    romaji: "nyu",
    hindiPhonetic: "न्यु",
    type: "katakana",
    row: "nya-group",
    groupCategory: "yoon",
    mnemonic: "ニ (ni) + छोटा ュ (yu) = nyu (न्यूज़ - ニュース Nyuusu)",
    needs_review: true
  },
  {
    id: "k-nyo",
    kana: "ニョ",
    romaji: "nyo",
    hindiPhonetic: "न्यो",
    type: "katakana",
    row: "nya-group",
    groupCategory: "yoon",
    mnemonic: "ニ (ni) + छोटा ョ (yo) = nyo",
    needs_review: true
  },

  // Hya, Hyu, Hyo
  {
    id: "k-hya",
    kana: "ヒャ",
    romaji: "hya",
    hindiPhonetic: "ह्या",
    type: "katakana",
    row: "hya-group",
    groupCategory: "yoon",
    mnemonic: "ヒ (hi) + छोटा ャ (ya) = hya",
    needs_review: true
  },
  {
    id: "k-hyu",
    kana: "ヒュ",
    romaji: "hyu",
    hindiPhonetic: "ह्यु",
    type: "katakana",
    row: "hya-group",
    groupCategory: "yoon",
    mnemonic: "ヒ (hi) + छोटा ュ (yu) = hyu",
    needs_review: true
  },
  {
    id: "k-hyo",
    kana: "ヒョ",
    romaji: "hyo",
    hindiPhonetic: "ह्यो",
    type: "katakana",
    row: "hya-group",
    groupCategory: "yoon",
    mnemonic: "ヒ (hi) + छोटा ョ (yo) = hyo",
    needs_review: true
  },

  // Mya, Myu, Myo
  {
    id: "k-mya",
    kana: "ミャ",
    romaji: "mya",
    hindiPhonetic: "म्या",
    type: "katakana",
    row: "mya-group",
    groupCategory: "yoon",
    mnemonic: "ミ (mi) + छोटा ャ (ya) = mya (म्यांमार - ミャンマー)",
    needs_review: true
  },
  {
    id: "k-myu",
    kana: "ミュ",
    romaji: "myu",
    hindiPhonetic: "म्यु",
    type: "katakana",
    row: "mya-group",
    groupCategory: "yoon",
    mnemonic: "ミ (mi) + छोटा ュ (yu) = myu (म्यूज़ियम - ミュージアム)",
    needs_review: true
  },
  {
    id: "k-myo",
    kana: "ミョ",
    romaji: "myo",
    hindiPhonetic: "म्यो",
    type: "katakana",
    row: "mya-group",
    groupCategory: "yoon",
    mnemonic: "ミ (mi) + छोटा ョ (yo) = myo",
    needs_review: true
  },

  // Rya, Ryu, Ryo
  {
    id: "k-rya",
    kana: "リャ",
    romaji: "rya",
    hindiPhonetic: "र्या",
    type: "katakana",
    row: "rya-group",
    groupCategory: "yoon",
    mnemonic: "リ (ri) + छोटा ャ (ya) = rya",
    needs_review: true
  },
  {
    id: "k-ryu",
    kana: "リュ",
    romaji: "ryu",
    hindiPhonetic: "र्यु",
    type: "katakana",
    row: "rya-group",
    groupCategory: "yoon",
    mnemonic: "リ (ri) + छोटा ュ (yu) = ryu (रुकसैक / बैग - リュック)",
    needs_review: true
  },
  {
    id: "k-ryo",
    kana: "リョ",
    romaji: "ryo",
    hindiPhonetic: "र्यो",
    type: "katakana",
    row: "rya-group",
    groupCategory: "yoon",
    mnemonic: "リ (ri) + छोटा ョ (yo) = ryo",
    needs_review: true
  },

  // Gya, Gyu, Gyo
  {
    id: "k-gya",
    kana: "ギャ",
    romaji: "gya",
    hindiPhonetic: "ग्या",
    type: "katakana",
    row: "gya-group",
    groupCategory: "yoon",
    mnemonic: "ギ (gi) + छोटा ャ (ya) = gya (गैलरी - ギャラリー)",
    needs_review: true
  },
  {
    id: "k-gyu",
    kana: "ギュ",
    romaji: "gyu",
    hindiPhonetic: "ग्यु",
    type: "katakana",
    row: "gya-group",
    groupCategory: "yoon",
    mnemonic: "ギ (gi) + छोटा ュ (yu) = gyu",
    needs_review: true
  },
  {
    id: "k-gyo",
    kana: "ギョ",
    romaji: "gyo",
    hindiPhonetic: "ग्यो",
    type: "katakana",
    row: "gya-group",
    groupCategory: "yoon",
    mnemonic: "ギ (gi) + छोटा ョ (yo) = gyo",
    needs_review: true
  },

  // Ja, Ju, Jo
  {
    id: "k-ja",
    kana: "ジャ",
    romaji: "ja",
    hindiPhonetic: "जा",
    type: "katakana",
    row: "ja-group",
    groupCategory: "yoon",
    mnemonic: "ジ (ji) + छोटा ャ (ya) = ja (जैम - ジャム, जैकेट - ジャケット)",
    needs_review: true
  },
  {
    id: "k-ju",
    kana: "ジュ",
    romaji: "ju",
    hindiPhonetic: "जु",
    type: "katakana",
    row: "ja-group",
    groupCategory: "yoon",
    mnemonic: "ジ (ji) + छोटा ュ (yu) = ju (जूस - ジュース Juusu)",
    needs_review: true
  },
  {
    id: "k-jo",
    kana: "ジョ",
    romaji: "jo",
    hindiPhonetic: "जो",
    type: "katakana",
    row: "ja-group",
    groupCategory: "yoon",
    mnemonic: "ジ (ji) + छोटा ョ (yo) = jo (जॉगिंग - ジョギング)",
    needs_review: true
  },

  // Bya, Byu, Byo
  {
    id: "k-bya",
    kana: "ビャ",
    romaji: "bya",
    hindiPhonetic: "ब्या",
    type: "katakana",
    row: "bya-group",
    groupCategory: "yoon",
    mnemonic: "ビ (bi) + छोटा ャ (ya) = bya",
    needs_review: true
  },
  {
    id: "k-byu",
    kana: "ビュ",
    romaji: "byu",
    hindiPhonetic: "ब्यु",
    type: "katakana",
    row: "bya-group",
    groupCategory: "yoon",
    mnemonic: "ビ (bi) + छोटा ュ (yu) = byu (बुफे - ビュッフェ)",
    needs_review: true
  },
  {
    id: "k-byo",
    kana: "ビョ",
    romaji: "byo",
    hindiPhonetic: "ब्यो",
    type: "katakana",
    row: "bya-group",
    groupCategory: "yoon",
    mnemonic: "ビ (bi) + छोटा ョ (yo) = byo",
    needs_review: true
  },

  // Pya, Pyu, Pyo
  {
    id: "k-pya",
    kana: "ピャ",
    romaji: "pya",
    hindiPhonetic: "प्या",
    type: "katakana",
    row: "pya-group",
    groupCategory: "yoon",
    mnemonic: "ピ (pi) + छोटा ャ (ya) = pya",
    needs_review: true
  },
  {
    id: "k-pyu",
    kana: "ピュ",
    romaji: "pyu",
    hindiPhonetic: "प्यु",
    type: "katakana",
    row: "pya-group",
    groupCategory: "yoon",
    mnemonic: "ピ (pi) + छोटा ュ (yu) = pyu (प्योर / प्यूरी - ピューレ)",
    needs_review: true
  },
  {
    id: "k-pyo",
    kana: "ピョ",
    romaji: "pyo",
    hindiPhonetic: "प्यो",
    type: "katakana",
    row: "pya-group",
    groupCategory: "yoon",
    mnemonic: "ピ (pi) + छोटा ョ (yo) = pyo",
    needs_review: true
  },

  // --- SPECIAL SOUNDS (3 entries) ---
  {
    id: "k-special-sokuon",
    kana: "ッ",
    romaji: "small tsu (pause/double consonant)",
    hindiPhonetic: "छोटा त्सु (आधा अक्षर / स्टॉप)",
    type: "katakana",
    row: "special-sounds",
    groupCategory: "special",
    mnemonic: "विदेशी शब्दों के डबल कॉन्सोनेंट या आधे अक्षर को दर्शाता है।",
    pronunciationNote: "छोटा 'ッ' अगले व्यंजन पर एक बीट का ठहराव देता है।",
    examples: [
      {
        jp: "ベッド",
        romaji: "beddo",
        hindi: "बेड्दो",
        meaning: "बिस्तर / बेड (bed)"
      },
      {
        jp: "サッカー",
        romaji: "sakkaa",
        hindi: "साक्का",
        meaning: "फ़ुटबॉल / सॉकर (soccer)"
      },
      {
        jp: "コップ",
        romaji: "koppu",
        hindi: "कोप्पु",
        meaning: "कांच का गिलास / कप (cup / glass)"
      }
    ],
    needs_review: true
  },
  {
    id: "k-special-chouon",
    kana: "ー",
    romaji: "chouonpu (long vowel mark)",
    hindiPhonetic: "दीर्घ स्वर चिह्न (लंबा स्वर)",
    type: "katakana",
    row: "special-sounds",
    groupCategory: "special",
    mnemonic: "स्वर को 2 मात्राओं तक खींचने की क्षैतिज रेखा।",
    pronunciationNote: "काताकाना में स्वर को लंबा करने के लिए अलग अक्षर की जगह केवल 'ー' रेखा लगाई जाती है।",
    examples: [
      {
        jp: "コーヒー",
        romaji: "koohii",
        hindi: "कॉफ़ी (दीर्घ ओ और दीर्घ ई)",
        meaning: "कॉफ़ी (coffee)"
      },
      {
        jp: "ケーキ",
        romaji: "keeki",
        hindi: "केक (दीर्घ ए)",
        meaning: "केक (cake)"
      },
      {
        jp: "ノート",
        romaji: "nooto",
        hindi: "नोटबुक (दीर्घ ओ)",
        meaning: "नोटबुक (notebook)"
      }
    ],
    needs_review: true
  },
  {
    id: "k-special-yotsugana",
    kana: "ヂ / ヅ",
    romaji: "ji / zu (yotsugana)",
    hindiPhonetic: "जि / ज़ु (अत्यंत दुर्लभ)",
    type: "katakana",
    row: "special-sounds",
    groupCategory: "special",
    mnemonic: "ジ और ズ जैसी ही ध्वनि; काताकाना में बहुत कम प्रयोग होती है।",
    pronunciationNote: "उच्चारण 'ジ' (ji) और 'ズ' (zu) समान है।",
    examples: [
      {
        jp: "ハナヂ",
        romaji: "hanaji",
        hindi: "हानाजि",
        meaning: "नाक से खून (nosebleed)"
      },
      {
        jp: "ツヅク",
        romaji: "tsuzuku",
        hindi: "त्सुज़ुकु",
        meaning: "जारी रहना (to continue)"
      }
    ],
    needs_review: true
  }
];

// Write Hiragana JSON
fs.writeFileSync(
  path.join(contentDir, 'hiragana.json'),
  JSON.stringify(hiraganaData, null, 2),
  'utf-8'
);
console.log(`Generated hiragana.json with ${hiraganaData.length} items`);

// Write Katakana JSON
fs.writeFileSync(
  path.join(contentDir, 'katakana.json'),
  JSON.stringify(katakanaData, null, 2),
  'utf-8'
);
console.log(`Generated katakana.json with ${katakanaData.length} items`);
