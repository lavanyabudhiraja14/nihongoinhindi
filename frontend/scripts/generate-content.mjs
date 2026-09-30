import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, '../content');

// =============================================================
// VOCABULARY: 100 Beginner JLPT N5 Words (10 Units of 10)
// =============================================================

const vocabBatch1 = [
  // --- UNIT 1: अभिवादन व शिष्टाचार (Greetings & Politeness) ---
  {
    id: "v-ohayou",
    unitId: "unit-v1",
    kana: "おはよう",
    romaji: "ohayou",
    hindiMeaning: "सुप्रभात (सुबह का अभिवादन)",
    englishMeaning: "Good morning (casual)",
    category: "greetings",
    exampleJp: "おはよう、田中さん。",
    exampleRomaji: "Ohayou, Tanaka-san.",
    exampleHindi: "सुप्रभात, तनाका जी।",
    needs_review: true
  },
  {
    id: "v-konnichiwa",
    unitId: "unit-v1",
    kana: "こんにちは",
    romaji: "konnichiwa",
    hindiMeaning: "नमस्ते (दिन/दोपहर का अभिवादन)",
    englishMeaning: "Hello / Good afternoon",
    category: "greetings",
    exampleJp: "皆さん、こんにちは。",
    exampleRomaji: "Minasan, konnichiwa.",
    exampleHindi: "आप सभी को नमस्ते।",
    note: "लिखते 'ha' हैं पर उच्चारण 'wa' होता है।",
    needs_review: true
  },
  {
    id: "v-konbanwa",
    unitId: "unit-v1",
    kana: "こんばんは",
    romaji: "konbanwa",
    hindiMeaning: "शुभ संध्या (शाम का अभिवादन)",
    englishMeaning: "Good evening",
    category: "greetings",
    exampleJp: "先生、こんばんは。",
    exampleRomaji: "Sensei, konbanwa.",
    exampleHindi: "शिक्षक महोदय, शुभ संध्या।",
    needs_review: true
  },
  {
    id: "v-sayounara",
    unitId: "unit-v1",
    kana: "さようなら",
    romaji: "sayounara",
    hindiMeaning: "अलविदा (लंबे समय के लिए विदाई)",
    englishMeaning: "Goodbye",
    category: "greetings",
    exampleJp: "皆さん、さようなら。",
    exampleRomaji: "Minasan, sayounara.",
    exampleHindi: "सबको अलविदा।",
    needs_review: true
  },
  {
    id: "v-arigatou",
    unitId: "unit-v1",
    kana: "ありがとう",
    romaji: "arigatou",
    hindiMeaning: "धन्यवाद / शुक्रिया",
    englishMeaning: "Thank you (casual)",
    category: "greetings",
    exampleJp: "本当にありがとう。",
    exampleRomaji: "Hontou ni arigatou.",
    exampleHindi: "सचमुच बहुत धन्यवाद।",
    needs_review: true
  },
  {
    id: "v-sumimasen",
    unitId: "unit-v1",
    kana: "すみません",
    romaji: "sumimasen",
    hindiMeaning: "माफ़ कीजिए / सुनिए",
    englishMeaning: "Excuse me / I'm sorry",
    category: "greetings",
    exampleJp: "すみません、水をください。",
    exampleRomaji: "Sumimasen, mizu o kudasai.",
    exampleHindi: "माफ़ कीजिए, कृपया पानी दीजिए।",
    needs_review: true
  },
  {
    id: "v-hai",
    unitId: "unit-v1",
    kana: "はい",
    romaji: "hai",
    hindiMeaning: "हाँ (सहमति)",
    englishMeaning: "Yes",
    category: "greetings",
    exampleJp: "はい、分かりました。",
    exampleRomaji: "Hai, wakarimashita.",
    exampleHindi: "हाँ, मैं समझ गया।",
    needs_review: true
  },
  {
    id: "v-iie",
    unitId: "unit-v1",
    kana: "いいえ",
    romaji: "iie",
    hindiMeaning: "नहीं (अस्वीकृति)",
    englishMeaning: "No / Not at all",
    category: "greetings",
    exampleJp: "いいえ、違います。",
    exampleRomaji: "Iie, chigaimasu.",
    exampleHindi: "नहीं, ऐसा नहीं है।",
    needs_review: true
  },
  {
    id: "v-onegai",
    unitId: "unit-v1",
    kana: "おねがいします",
    kanji: "お願いします",
    romaji: "onegaishimasu",
    hindiMeaning: "कृपया (अनुरोध के लिए)",
    englishMeaning: "Please (request)",
    category: "greetings",
    exampleJp: "これを宜しくお願いします。",
    exampleRomaji: "Kore o yoroshiku onegaishimasu.",
    exampleHindi: "कृपया इसे स्वीकार करें।",
    needs_review: true
  },
  {
    id: "v-hajimemashite",
    unitId: "unit-v1",
    kana: "はじめまして",
    kanji: "初めまして",
    romaji: "hajimemashite",
    hindiMeaning: "आपसे पहली बार मिलकर खुशी हुई",
    englishMeaning: "Nice to meet you (first time)",
    category: "greetings",
    exampleJp: "初めまして、ラフルです。",
    exampleRomaji: "Hajimemashite, Rahuru desu.",
    exampleHindi: "आपसे मिलकर खुशी हुई, मैं राहुल हूँ।",
    needs_review: true
  },

  // --- UNIT 2: संख्याएँ (Numbers 1-10) ---
  {
    id: "v-ichi",
    unitId: "unit-v2",
    kana: "いち",
    kanji: "一",
    romaji: "ichi",
    hindiMeaning: "एक (१)",
    englishMeaning: "One (1)",
    category: "numbers",
    exampleJp: "りんごを一個ください。",
    exampleRomaji: "Ringo o ikko kudasai.",
    exampleHindi: "एक सेब दीजिए।",
    needs_review: true
  },
  {
    id: "v-ni-num",
    unitId: "unit-v2",
    kana: "に",
    kanji: "二",
    romaji: "ni",
    hindiMeaning: "दो (२)",
    englishMeaning: "Two (2)",
    category: "numbers",
    exampleJp: "ペンが二本あります。",
    exampleRomaji: "Pen ga nihon arimasu.",
    exampleHindi: "दो पेन हैं।",
    needs_review: true
  },
  {
    id: "v-san-num",
    unitId: "unit-v2",
    kana: "さん",
    kanji: "三",
    romaji: "san",
    hindiMeaning: "तीन (३)",
    englishMeaning: "Three (3)",
    category: "numbers",
    exampleJp: "三時にお茶を飲みます。",
    exampleRomaji: "San-ji ni ocha o nomimasu.",
    exampleHindi: "तीन बजे चाय पीते हैं।",
    needs_review: true
  },
  {
    id: "v-yon",
    unitId: "unit-v2",
    kana: "よん",
    kanji: "四",
    romaji: "yon",
    hindiMeaning: "चार (४)",
    englishMeaning: "Four (4)",
    category: "numbers",
    exampleJp: "四時に会いましょう。",
    exampleRomaji: "Yo-ji ni aimashou.",
    exampleHindi: "चार बजे मिलते हैं।",
    note: "इसका दूसरा वैकल्पिक उच्चारण 'し' (shi) भी होता है।",
    needs_review: true
  },
  {
    id: "v-go-num",
    unitId: "unit-v2",
    kana: "ご",
    kanji: "五",
    romaji: "go",
    hindiMeaning: "पाँच (५)",
    englishMeaning: "Five (5)",
    category: "numbers",
    exampleJp: "五分待ってください。",
    exampleRomaji: "Gofun matte kudasai.",
    exampleHindi: "पाँच मिनट रुकिए।",
    needs_review: true
  },
  {
    id: "v-roku",
    unitId: "unit-v2",
    kana: "ろく",
    kanji: "六",
    romaji: "roku",
    hindiMeaning: "छह (६)",
    englishMeaning: "Six (6)",
    category: "numbers",
    exampleJp: "六時に起きます。",
    exampleRomaji: "Roku-ji ni okimasu.",
    exampleHindi: "छह बजे उठता हूँ।",
    needs_review: true
  },
  {
    id: "v-nana",
    unitId: "unit-v2",
    kana: "なな",
    kanji: "七",
    romaji: "nana",
    hindiMeaning: "सात (७)",
    englishMeaning: "Seven (7)",
    category: "numbers",
    exampleJp: "七日間旅行します。",
    exampleRomaji: "Nanokakan ryokou shimasu.",
    exampleHindi: "सात दिन यात्रा करेंगे।",
    note: "इसका दूसरा वैकल्पिक उच्चारण 'しち' (shichi) भी होता है।",
    needs_review: true
  },
  {
    id: "v-hachi",
    unitId: "unit-v2",
    kana: "はち",
    kanji: "八",
    romaji: "hachi",
    hindiMeaning: "आठ (८)",
    englishMeaning: "Eight (8)",
    category: "numbers",
    exampleJp: "八月は暑いです。",
    exampleRomaji: "Hachigatsu wa atsui desu.",
    exampleHindi: "अगस्त (आठवाँ महीना) गर्म होता है।",
    needs_review: true
  },
  {
    id: "v-kyuu",
    unitId: "unit-v2",
    kana: "きゅう",
    kanji: "九",
    romaji: "kyuu",
    hindiMeaning: "नौ (९)",
    englishMeaning: "Nine (9)",
    category: "numbers",
    exampleJp: "九時に寝ます。",
    exampleRomaji: "Ku-ji ni nemasu.",
    exampleHindi: "नौ बजे सोता हूँ।",
    note: "समय (घंटे) के साथ इसका उच्चारण 'く' (ku) होता है (e.g. kuji)।",
    needs_review: true
  },
  {
    id: "v-juu",
    unitId: "unit-v2",
    kana: "じゅう",
    kanji: "十",
    romaji: "juu",
    hindiMeaning: "दस (१०)",
    englishMeaning: "Ten (10)",
    category: "numbers",
    exampleJp: "十本のペンがあります。",
    exampleRomaji: "Juppon no pen ga arimasu.",
    exampleHindi: "दस पेन हैं।",
    needs_review: true
  },

  // --- UNIT 3 (Part 1): परिवार (Family) ---
  {
    id: "v-kazoku",
    unitId: "unit-v3",
    kana: "かぞく",
    kanji: "家族",
    romaji: "kazoku",
    hindiMeaning: "परिवार",
    englishMeaning: "Family",
    category: "family",
    exampleJp: "私の家族は四人です。",
    exampleRomaji: "Watashi no kazoku wa yonin desu.",
    exampleHindi: "मेरे परिवार में चार लोग हैं।",
    needs_review: true
  },
  {
    id: "v-chichi",
    unitId: "unit-v3",
    kana: "ちち",
    kanji: "父",
    romaji: "chichi",
    hindiMeaning: "मेरे पिताजी (अपने पिता के लिए)",
    englishMeaning: "My father (humble)",
    category: "family",
    exampleJp: "父は会社員です。",
    exampleRomaji: "Chichi wa kaishain desu.",
    exampleHindi: "मेरे पिताजी कंपनी कर्मचारी हैं।",
    note: "अपने पिता की बात करते समय 'ちち' (chichi) कहें।",
    needs_review: true
  },
  {
    id: "v-haha",
    unitId: "unit-v3",
    kana: "はは",
    kanji: "母",
    romaji: "haha",
    hindiMeaning: "मेरी माँ (अपनी माँ के लिए)",
    englishMeaning: "My mother (humble)",
    category: "family",
    exampleJp: "母は先生です。",
    exampleRomaji: "Haha wa sensei desu.",
    exampleHindi: "मेरी माँ शिक्षिका हैं।",
    note: "अपनी माँ की बात करते समय 'はは' (haha) कहें।",
    needs_review: true
  },
  {
    id: "v-otousan",
    unitId: "unit-v3",
    kana: "おとうさん",
    kanji: "お父さん",
    romaji: "otousan",
    hindiMeaning: "पिताजी (दूसरों के पिता या प्रत्यक्ष संबोधन)",
    englishMeaning: "Father / someone else's father (polite)",
    category: "family",
    exampleJp: "お父さんはお元気ですか。",
    exampleRomaji: "Otousan wa ogenki desu ka.",
    exampleHindi: "क्या आपके पिताजी कुशल हैं?",
    note: "दूसरों के पिता या अपने पिता को सीधे बुलाते समय 'おとうさん' कहें।",
    needs_review: true
  },
  {
    id: "v-okaasan",
    unitId: "unit-v3",
    kana: "おかあさん",
    kanji: "お母さん",
    romaji: "okaasan",
    hindiMeaning: "माताजी (दूसरों की माँ या प्रत्यक्ष संबोधन)",
    englishMeaning: "Mother / someone else's mother (polite)",
    category: "family",
    exampleJp: "田中さんのお母さんは優しいです。",
    exampleRomaji: "Tanaka-san no okaasan wa yasashii desu.",
    exampleHindi: "तनाका जी की माताजी दयालु हैं।",
    note: "दूसरों की माताजी या अपनी माँ को सीधे आदरपूर्वक बुलाने के लिए 'おかあさん' कहें।",
    needs_review: true
  }
];

const vocabBatch2 = [
  // --- UNIT 3 (Part 2): परिवार (Family) ---
  {
    id: "v-ani",
    unitId: "unit-v3",
    kana: "あに",
    kanji: "兄",
    romaji: "ani",
    hindiMeaning: "मेरा बड़ा भाई (अपने भाई के लिए)",
    englishMeaning: "My older brother (humble)",
    category: "family",
    exampleJp: "兄は東京に住んでいます。",
    exampleRomaji: "Ani wa Toukyou ni sunde imasu.",
    exampleHindi: "मेरा बड़ा भाई टोक्यो में रहता है।",
    needs_review: true
  },
  {
    id: "v-ane",
    unitId: "unit-v3",
    kana: "あね",
    kanji: "姉",
    romaji: "ane",
    hindiMeaning: "मेरी बड़ी बहन (अपनी बहन के लिए)",
    englishMeaning: "My older sister (humble)",
    category: "family",
    exampleJp: "姉は大学生です。",
    exampleRomaji: "Ane wa daigakusei desu.",
    exampleHindi: "मेरी बड़ी बहन कॉलेज छात्रा है।",
    needs_review: true
  },
  {
    id: "v-otouto",
    unitId: "unit-v3",
    kana: "おとうと",
    kanji: "弟",
    romaji: "otouto",
    hindiMeaning: "छोटा भाई",
    englishMeaning: "Younger brother",
    category: "family",
    exampleJp: "弟は高校生です。",
    exampleRomaji: "Otouto wa koukousei desu.",
    exampleHindi: "छोटा भाई हाईस्कूल का छात्र है।",
    needs_review: true
  },
  {
    id: "v-imouto",
    unitId: "unit-v3",
    kana: "いもうと",
    kanji: "妹",
    romaji: "imouto",
    hindiMeaning: "छोटी बहन",
    englishMeaning: "Younger sister",
    category: "family",
    exampleJp: "妹は日本語を勉強しています。",
    exampleRomaji: "Imouto wa nihongo o benkyou shite imasu.",
    exampleHindi: "छोटी बहन जापानी भाषा पढ़ रही है।",
    needs_review: true
  },
  {
    id: "v-kodomo",
    unitId: "unit-v3",
    kana: "こども",
    kanji: "子供",
    romaji: "kodomo",
    hindiMeaning: "बच्चा / बच्चे",
    englishMeaning: "Child / children",
    category: "family",
    exampleJp: "公園で子供が遊んでいます。",
    exampleRomaji: "Kouen de kodomo ga asonde imasu.",
    exampleHindi: "पार्क में बच्चे खेल रहे हैं।",
    needs_review: true
  },

  // --- UNIT 4: भोजन और पेय (Food & Drink) ---
  {
    id: "v-mizu",
    unitId: "unit-v4",
    kana: "みず",
    kanji: "水",
    romaji: "mizu",
    hindiMeaning: "पानी / जल",
    englishMeaning: "Water",
    category: "food-drink",
    exampleJp: "冷たい水を飲みます。",
    exampleRomaji: "Tsumetai mizu o nomimasu.",
    exampleHindi: "ठंडा पानी पीता हूँ।",
    needs_review: true
  },
  {
    id: "v-ocha",
    unitId: "unit-v4",
    kana: "おちゃ",
    kanji: "お茶",
    romaji: "ocha",
    hindiMeaning: "जापानी चाय (ग्रीन टी)",
    englishMeaning: "Tea / green tea",
    category: "food-drink",
    exampleJp: "温かいお茶をどうぞ。",
    exampleRomaji: "Atatakai ocha o douzo.",
    exampleHindi: "गरम चाय लीजिए।",
    needs_review: true
  },
  {
    id: "v-gohan",
    unitId: "unit-v4",
    kana: "ごはん",
    kanji: "ご飯",
    romaji: "gohan",
    hindiMeaning: "पका हुआ चावल / भोजन",
    englishMeaning: "Cooked rice / meal",
    category: "food-drink",
    exampleJp: "朝ご飯を食べました。",
    exampleRomaji: "Asagohan o tabemashita.",
    exampleHindi: "सुबह का नाश्ता किया।",
    needs_review: true
  },
  {
    id: "v-niku",
    unitId: "unit-v4",
    kana: "にく",
    kanji: "肉",
    romaji: "niku",
    hindiMeaning: "मांस / मीट",
    englishMeaning: "Meat",
    category: "food-drink",
    exampleJp: "肉と野菜を買います。",
    exampleRomaji: "Niku to yasai o kaimasu.",
    exampleHindi: "मीट और सब्ज़ियाँ खरीदूँगा।",
    needs_review: true
  },
  {
    id: "v-sakana",
    unitId: "unit-v4",
    kana: "さかな",
    kanji: "魚",
    romaji: "sakana",
    hindiMeaning: "मछली",
    englishMeaning: "Fish",
    category: "food-drink",
    exampleJp: "魚が好きです。",
    exampleRomaji: "Sakana ga suki desu.",
    exampleHindi: "मुझे मछली पसंद है।",
    needs_review: true
  },
  {
    id: "v-yasai",
    unitId: "unit-v4",
    kana: "やさい",
    kanji: "野菜",
    romaji: "yasai",
    hindiMeaning: "सब्ज़ी / तरकारी",
    englishMeaning: "Vegetables",
    category: "food-drink",
    exampleJp: "新鮮な野菜を食べます。",
    exampleRomaji: "Shinsen na yasai o tabemasu.",
    exampleHindi: "ताज़ी सब्ज़ियाँ खाता हूँ।",
    needs_review: true
  },
  {
    id: "v-kudamono",
    unitId: "unit-v4",
    kana: "くだもの",
    kanji: "果物",
    romaji: "kudamono",
    hindiMeaning: "फल",
    englishMeaning: "Fruit",
    category: "food-drink",
    exampleJp: "果物をたくさん買いました。",
    exampleRomaji: "Kudamono o takusan kaimashita.",
    exampleHindi: "बहुत सारे फल खरीदे।",
    needs_review: true
  },
  {
    id: "v-tamago",
    unitId: "unit-v4",
    kana: "たまご",
    kanji: "卵",
    romaji: "tamago",
    hindiMeaning: "अंडा",
    englishMeaning: "Egg",
    category: "food-drink",
    exampleJp: "朝に卵を二個食べます。",
    exampleRomaji: "Asa ni tamago o niko tabemasu.",
    exampleHindi: "सुबह दो अंडे खाता हूँ।",
    needs_review: true
  },
  {
    id: "v-asagohan",
    unitId: "unit-v4",
    kana: "あさごはん",
    kanji: "朝ご飯",
    romaji: "asagohan",
    hindiMeaning: "सुबह का नाश्ता (Breakfast)",
    englishMeaning: "Breakfast",
    category: "food-drink",
    exampleJp: "毎朝七時に朝ご飯を食べます。",
    exampleRomaji: "Maiasa shichiji ni asagohan o tabemasu.",
    exampleHindi: "हर सुबह सात बजे नाश्ता करता हूँ।",
    needs_review: true
  },
  {
    id: "v-bangohan",
    unitId: "unit-v4",
    kana: "ばんごはん",
    kanji: "晩ご飯",
    romaji: "bangohan",
    hindiMeaning: "रात का भोजन (Dinner)",
    englishMeaning: "Dinner / evening meal",
    category: "food-drink",
    exampleJp: "家族と晩ご飯を食べます。",
    exampleRomaji: "Kazoku to bangohan o tabemasu.",
    exampleHindi: "परिवार के साथ रात का खाना खाता हूँ।",
    needs_review: true
  },

  // --- UNIT 5: समय और दिन (Time & Days) ---
  {
    id: "v-ima",
    unitId: "unit-v5",
    kana: "いま",
    kanji: "今",
    romaji: "ima",
    hindiMeaning: "अब / अभी",
    englishMeaning: "Now",
    category: "time",
    exampleJp: "今何時ですか。",
    exampleRomaji: "Ima nanji desu ka.",
    exampleHindi: "अभी क्या समय हुआ है?",
    needs_review: true
  },
  {
    id: "v-kyou",
    unitId: "unit-v5",
    kana: "きょう",
    kanji: "今日",
    romaji: "kyou",
    hindiMeaning: "आज (Today)",
    englishMeaning: "Today",
    category: "time",
    exampleJp: "今日はいい天気です。",
    exampleRomaji: "Kyou wa ii tenki desu.",
    exampleHindi: "आज मौसम अच्छा है।",
    needs_review: true
  },
  {
    id: "v-ashita",
    unitId: "unit-v5",
    kana: "あした",
    kanji: "明日",
    romaji: "ashita",
    hindiMeaning: "कल (आने वाला कल - Tomorrow)",
    englishMeaning: "Tomorrow",
    category: "time",
    exampleJp: "明日は休みです。",
    exampleRomaji: "Ashita wa yasumi desu.",
    exampleHindi: "कल छुट्टी है।",
    needs_review: true
  },
  {
    id: "v-kinou",
    unitId: "unit-v5",
    kana: "きのう",
    kanji: "昨日",
    romaji: "kinou",
    hindiMeaning: "कल (बीता हुआ कल - Yesterday)",
    englishMeaning: "Yesterday",
    category: "time",
    exampleJp: "昨日本を買いました。",
    exampleRomaji: "Kinou hon o kaimashita.",
    exampleHindi: "कल किताब खरीदी थी।",
    needs_review: true
  },
  {
    id: "v-jikan",
    unitId: "unit-v5",
    kana: "じかん",
    kanji: "時間",
    romaji: "jikan",
    hindiMeaning: "समय / वक्त",
    englishMeaning: "Time / hour",
    category: "time",
    exampleJp: "時間がありません。",
    exampleRomaji: "Jikan ga arimasen.",
    exampleHindi: "समय नहीं है।",
    needs_review: true
  }
];

const vocabBatch3 = [
  // --- UNIT 5 (Part 2): समय और दिन (Time & Days) ---
  {
    id: "v-asa",
    unitId: "unit-v5",
    kana: "あさ",
    kanji: "朝",
    romaji: "asa",
    hindiMeaning: "सुबह / प्रातःकाल",
    englishMeaning: "Morning",
    category: "time",
    exampleJp: "朝早く散歩します。",
    exampleRomaji: "Asa hayaku sanpo shimasu.",
    exampleHindi: "सुबह जल्दी टहलता हूँ।",
    needs_review: true
  },
  {
    id: "v-hiru",
    unitId: "unit-v5",
    kana: "ひる",
    kanji: "昼",
    romaji: "hiru",
    hindiMeaning: "दोपहर / मध्याह्न",
    englishMeaning: "Noon / daytime",
    category: "time",
    exampleJp: "お昼を食べに行きましょう。",
    exampleRomaji: "Ohiru o tabe ni ikimashou.",
    exampleHindi: "दोपहर का खाना खाने चलें।",
    needs_review: true
  },
  {
    id: "v-yoru",
    unitId: "unit-v5",
    kana: "よる",
    kanji: "夜",
    romaji: "yoru",
    hindiMeaning: "रात / रात्रि",
    englishMeaning: "Night",
    category: "time",
    exampleJp: "夜十一時に寝ます。",
    exampleRomaji: "Yoru juuichi-ji ni nemasu.",
    exampleHindi: "रात ग्यारह बजे सोता हूँ।",
    needs_review: true
  },
  {
    id: "v-nichiyoubi",
    unitId: "unit-v5",
    kana: "にちようび",
    kanji: "日曜日",
    romaji: "nichiyoubi",
    hindiMeaning: "रविवार (Sunday)",
    englishMeaning: "Sunday",
    category: "time",
    exampleJp: "日曜日に映画を見ます。",
    exampleRomaji: "Nichiyoubi ni eiga o mimasu.",
    exampleHindi: "रविवार को फ़िल्म देखूँगा।",
    needs_review: true
  },
  {
    id: "v-getsuyoubi",
    unitId: "unit-v5",
    kana: "げつようび",
    kanji: "月曜日",
    romaji: "getsuyoubi",
    hindiMeaning: "सोमवार (Monday)",
    englishMeaning: "Monday",
    category: "time",
    exampleJp: "月曜日に学校へ行きます。",
    exampleRomaji: "Getsuyoubi ni gakkou e ikimasu.",
    exampleHindi: "सोमवार को स्कूल जाता हूँ।",
    needs_review: true
  },

  // --- UNIT 6: स्थान और शहर (Places) ---
  {
    id: "v-gakkou",
    unitId: "unit-v6",
    kana: "がっこう",
    kanji: "学校",
    romaji: "gakkou",
    hindiMeaning: "विद्यालय / स्कूल",
    englishMeaning: "School",
    category: "places",
    exampleJp: "学校で日本語を勉強します。",
    exampleRomaji: "Gakkou de nihongo o benkyou shimasu.",
    exampleHindi: "स्कूल में जापानी पढ़ता हूँ।",
    needs_review: true
  },
  {
    id: "v-eki",
    unitId: "unit-v6",
    kana: "えき",
    kanji: "駅",
    romaji: "eki",
    hindiMeaning: "रेलवे स्टेशन",
    englishMeaning: "Train station",
    category: "places",
    exampleJp: "駅の前で会いましょう。",
    exampleRomaji: "Eki no mae de aimashou.",
    exampleHindi: "स्टेशन के सामने मिलते हैं।",
    needs_review: true
  },
  {
    id: "v-ie",
    unitId: "unit-v6",
    kana: "いえ",
    kanji: "家",
    romaji: "ie",
    hindiMeaning: "घर / मकान",
    englishMeaning: "House / home",
    category: "places",
    exampleJp: "六時に家に帰ります。",
    exampleRomaji: "Roku-ji ni ie ni kaerimasu.",
    exampleHindi: "छह बजे घर लौटता हूँ।",
    needs_review: true
  },
  {
    id: "v-heya",
    unitId: "unit-v6",
    kana: "へや",
    kanji: "部屋",
    romaji: "heya",
    hindiMeaning: "कमरा / कक्ष",
    englishMeaning: "Room",
    category: "places",
    exampleJp: "私の部屋は広いです。",
    exampleRomaji: "Watashi no heya wa hiroi desu.",
    exampleHindi: "मेरा कमरा बड़ा है।",
    needs_review: true
  },
  {
    id: "v-mise",
    unitId: "unit-v6",
    kana: "みせ",
    kanji: "店",
    romaji: "mise",
    hindiMeaning: "दुकान",
    englishMeaning: "Shop / store",
    category: "places",
    exampleJp: "あの店で本を買いました。",
    exampleRomaji: "Ano mise de hon o kaimashita.",
    exampleHindi: "उस दुकान से किताब खरीदी थी।",
    needs_review: true
  },
  {
    id: "v-ginkou",
    unitId: "unit-v6",
    kana: "ぎんこう",
    kanji: "銀行",
    romaji: "ginkou",
    hindiMeaning: "बैंक (वित्तीय संस्थान)",
    englishMeaning: "Bank",
    category: "places",
    exampleJp: "銀行は九時に開きます。",
    exampleRomaji: "Ginkou wa kuji ni akimasu.",
    exampleHindi: "बैंक नौ बजे खुलता है।",
    needs_review: true
  },
  {
    id: "v-byouin",
    unitId: "unit-v6",
    kana: "びょういん",
    kanji: "病院",
    romaji: "byouin",
    hindiMeaning: "अस्पताल / चिकित्सालय",
    englishMeaning: "Hospital",
    category: "places",
    exampleJp: "病院へ薬をもらいに行きます。",
    exampleRomaji: "Byouin e kusuri o morai ni ikimasu.",
    exampleHindi: "दवा लेने अस्पताल जा रहा हूँ।",
    needs_review: true
  },
  {
    id: "v-kouen",
    unitId: "unit-v6",
    kana: "こうえん",
    kanji: "公園",
    romaji: "kouen",
    hindiMeaning: "पार्क / बगीचा",
    englishMeaning: "Park / public garden",
    category: "places",
    exampleJp: "公園を散歩します。",
    exampleRomaji: "Kouen o sanpo shimasu.",
    exampleHindi: "पार्क में टहलता हूँ।",
    needs_review: true
  },
  {
    id: "v-toshokan",
    unitId: "unit-v6",
    kana: "としょかん",
    kanji: "図書館",
    romaji: "toshokan",
    hindiMeaning: "पुस्तकालय (Library)",
    englishMeaning: "Library",
    category: "places",
    exampleJp: "図書館で本を読みます。",
    exampleRomaji: "Toshokan de hon o yomimasu.",
    exampleHindi: "पुस्तकालय में किताब पढ़ता हूँ।",
    needs_review: true
  },
  {
    id: "v-nihon-country",
    unitId: "unit-v6",
    kana: "にほん",
    kanji: "日本",
    romaji: "nihon",
    hindiMeaning: "जापान देश",
    englishMeaning: "Japan",
    category: "places",
    exampleJp: "来年日本へ行きます。",
    exampleRomaji: "Rainen nihon e ikimasu.",
    exampleHindi: "अगले साल जापान जाऊंगा।",
    needs_review: true
  },

  // --- UNIT 7: मुख्य क्रियाएँ (Common Verbs - Dict Form) ---
  {
    id: "v-taberu",
    unitId: "unit-v7",
    kana: "たべる",
    kanji: "食べる",
    romaji: "taberu",
    hindiMeaning: "खाना (क्रिया - to eat)",
    englishMeaning: "To eat",
    category: "verbs",
    exampleJp: "パンを食べます。",
    exampleRomaji: "Pan o tabemasu.",
    exampleHindi: "ब्रेड खाता हूँ।",
    note: "Dictionary form: たべる (taberu), Polite: たべます (tabemasu)।",
    needs_review: true
  },
  {
    id: "v-nomu",
    unitId: "unit-v7",
    kana: "のむ",
    kanji: "飲む",
    romaji: "nomu",
    hindiMeaning: "पीना (क्रिया - to drink)",
    englishMeaning: "To drink",
    category: "verbs",
    exampleJp: "お茶を飲みます。",
    exampleRomaji: "Ocha o nomimasu.",
    exampleHindi: "चाय पीता हूँ।",
    needs_review: true
  },
  {
    id: "v-miru",
    unitId: "unit-v7",
    kana: "みる",
    kanji: "見る",
    romaji: "miru",
    hindiMeaning: "देखना (क्रिया - to see/watch)",
    englishMeaning: "To see / watch / look",
    category: "verbs",
    exampleJp: "テレビを見ます。",
    exampleRomaji: "Terebi o mimasu.",
    exampleHindi: "टीवी देखता हूँ।",
    needs_review: true
  },
  {
    id: "v-kiku",
    unitId: "unit-v7",
    kana: "きく",
    kanji: "聞く",
    romaji: "kiku",
    hindiMeaning: "सुनना / पूछना (क्रिया - to listen/ask)",
    englishMeaning: "To listen / hear / ask",
    category: "verbs",
    exampleJp: "音楽を聞きます。",
    exampleRomaji: "Ongaku o kikimasu.",
    exampleHindi: "संगीत सुनता हूँ।",
    needs_review: true
  },
  {
    id: "v-iku",
    unitId: "unit-v7",
    kana: "いく",
    kanji: "行く",
    romaji: "iku",
    hindiMeaning: "जाना (क्रिया - to go)",
    englishMeaning: "To go",
    category: "verbs",
    exampleJp: "駅へ行きます。",
    exampleRomaji: "Eki e ikimasu.",
    exampleHindi: "स्टेशन जाता हूँ।",
    needs_review: true
  }
];

const vocabBatch4 = [
  // --- UNIT 7 (Part 2): मुख्य क्रियाएँ (Common Verbs) ---
  {
    id: "v-kuru",
    unitId: "unit-v7",
    kana: "くる",
    kanji: "来る",
    romaji: "kuru",
    hindiMeaning: "आना (अनियमित क्रिया - to come)",
    englishMeaning: "To come",
    category: "verbs",
    exampleJp: "友だちが家に来ます。",
    exampleRomaji: "Tomodachi ga ie ni kimasu.",
    exampleHindi: "दोस्त घर आता है।",
    note: "अनियमित क्रिया: くる (kuru) -> きます (kimasu)।",
    needs_review: true
  },
  {
    id: "v-kaku",
    unitId: "unit-v7",
    kana: "かく",
    kanji: "書く",
    romaji: "kaku",
    hindiMeaning: "लिखना (क्रिया - to write)",
    englishMeaning: "To write",
    category: "verbs",
    exampleJp: "手紙を書きます。",
    exampleRomaji: "Tegami o kakimasu.",
    exampleHindi: "पत्र लिखता हूँ।",
    needs_review: true
  },
  {
    id: "v-yomu",
    unitId: "unit-v7",
    kana: "よむ",
    kanji: "読む",
    romaji: "yomu",
    hindiMeaning: "पढ़ना (क्रिया - to read)",
    englishMeaning: "To read",
    category: "verbs",
    exampleJp: "本を読みます。",
    exampleRomaji: "Hon o yomimasu.",
    exampleHindi: "किताब पढ़ता हूँ।",
    needs_review: true
  },
  {
    id: "v-hanasu",
    unitId: "unit-v7",
    kana: "はなす",
    kanji: "話す",
    romaji: "hanasu",
    hindiMeaning: "बातचीत करना (क्रिया - to speak/talk)",
    englishMeaning: "To speak / talk",
    category: "verbs",
    exampleJp: "日本語で話します。",
    exampleRomaji: "Nihongo de hanashimasu.",
    exampleHindi: "जापानी में बात करता हूँ।",
    needs_review: true
  },
  {
    id: "v-suru",
    unitId: "unit-v7",
    kana: "する",
    romaji: "suru",
    hindiMeaning: "करना (अनियमित क्रिया - to do)",
    englishMeaning: "To do",
    category: "verbs",
    exampleJp: "勉強をします。",
    exampleRomaji: "Benkyou o shimasu.",
    exampleHindi: "पढ़ाई करता हूँ।",
    note: "अनियमित क्रिया: する (suru) -> します (shimasu)।",
    needs_review: true
  },

  // --- UNIT 8: विशेषण (Adjectives) ---
  {
    id: "v-ookii",
    unitId: "unit-v8",
    kana: "おおきい",
    kanji: "大きい",
    romaji: "ookii",
    hindiMeaning: "बड़ा / विशाल (आकार में)",
    englishMeaning: "Big / large",
    category: "adjectives",
    exampleJp: "大きい家に住んでいます。",
    exampleRomaji: "Ookii ie ni sunde imasu.",
    exampleHindi: "बड़े घर में रहता हूँ।",
    needs_review: true
  },
  {
    id: "v-chiisai",
    unitId: "unit-v8",
    kana: "ちいさい",
    kanji: "小さい",
    romaji: "chiisai",
    hindiMeaning: "छोटा (आकार में)",
    englishMeaning: "Small / little",
    category: "adjectives",
    exampleJp: "小さい猫がいます。",
    exampleRomaji: "Chiisai neko ga imasu.",
    exampleHindi: "एक छोटी बिल्ली है।",
    needs_review: true
  },
  {
    id: "v-ii",
    unitId: "unit-v8",
    kana: "いい",
    kanji: "良い",
    romaji: "ii",
    hindiMeaning: "अच्छा / उत्तम",
    englishMeaning: "Good / nice",
    category: "adjectives",
    exampleJp: "今日はいい天気です。",
    exampleRomaji: "Kyou wa ii tenki desu.",
    exampleHindi: "आज मौसम अच्छा है।",
    note: "यह अनियमित विशेषण है: नकारात्मक 'よくない' (yokunai) और भूतकाल 'よかった' (yokatta) होता है।",
    needs_review: true
  },
  {
    id: "v-warui",
    unitId: "unit-v8",
    kana: "わるい",
    kanji: "悪い",
    romaji: "warui",
    hindiMeaning: "बुरा / खराब",
    englishMeaning: "Bad / poor",
    category: "adjectives",
    exampleJp: "天気が悪いです。",
    exampleRomaji: "Tenki ga warui desu.",
    exampleHindi: "मौसम खराब है।",
    needs_review: true
  },
  {
    id: "v-takai",
    unitId: "unit-v8",
    kana: "たかい",
    kanji: "高い",
    romaji: "takai",
    hindiMeaning: "महंगा / ऊँचा",
    englishMeaning: "Expensive / high / tall",
    category: "adjectives",
    exampleJp: "この本は高いです。",
    exampleRomaji: "Kono hon wa takai desu.",
    exampleHindi: "यह किताब महंगी है।",
    needs_review: true
  },
  {
    id: "v-yasui",
    unitId: "unit-v8",
    kana: "やすい",
    kanji: "安い",
    romaji: "yasui",
    hindiMeaning: "सस्ता / कम दाम का",
    englishMeaning: "Cheap / inexpensive",
    category: "adjectives",
    exampleJp: "この店は安いです。",
    exampleRomaji: "Kono mise wa yasui desu.",
    exampleHindi: "यह दुकान सस्ती है।",
    needs_review: true
  },
  {
    id: "v-atarashii",
    unitId: "unit-v8",
    kana: "あたらしい",
    kanji: "新しい",
    romaji: "atarashii",
    hindiMeaning: "नया / नवीन",
    englishMeaning: "New / fresh",
    category: "adjectives",
    exampleJp: "新しい靴を買いました。",
    exampleRomaji: "Atarashii kutsu o kaimashita.",
    exampleHindi: "नए जूते खरीदे।",
    needs_review: true
  },
  {
    id: "v-furui",
    unitId: "unit-v8",
    kana: "ふるい",
    kanji: "古い",
    romaji: "furui",
    hindiMeaning: "पुराना (वस्तुओं के लिए)",
    englishMeaning: "Old (for things)",
    category: "adjectives",
    exampleJp: "古い時計があります。",
    exampleRomaji: "Furui tokei ga arimasu.",
    exampleHindi: "पुरानी घड़ी है।",
    needs_review: true
  },
  {
    id: "v-oishii",
    unitId: "unit-v8",
    kana: "おいしい",
    kanji: "美味しい",
    romaji: "oishii",
    hindiMeaning: "स्वादिष्ट / लज़ीज़",
    englishMeaning: "Delicious / tasty",
    category: "adjectives",
    exampleJp: "このご飯はおいしいです。",
    exampleRomaji: "Kono gohan wa oishii desu.",
    exampleHindi: "यह खाना स्वादिष्ट है।",
    needs_review: true
  },
  {
    id: "v-suki",
    unitId: "unit-v8",
    kana: "すき",
    kanji: "好き",
    romaji: "suki",
    hindiMeaning: "पसंदीदा / प्रिय (Like)",
    englishMeaning: "Like / fond of",
    category: "adjectives",
    exampleJp: "私は日本が好きです。",
    exampleRomaji: "Watashi wa nihon ga suki desu.",
    exampleHindi: "मुझे जापान पसंद है।",
    note: "ध्यान दें: 'すき' (suki) व्याकरण की दृष्टि से 'ना-विशेषण' (Na-adjective) है।",
    needs_review: true
  },

  // --- UNIT 9: रंग और वस्तुएँ (Colors & Things) ---
  {
    id: "v-aka",
    unitId: "unit-v9",
    kana: "あか",
    kanji: "赤",
    romaji: "aka",
    hindiMeaning: "लाल रंग",
    englishMeaning: "Red color",
    category: "colors",
    exampleJp: "赤い花が咲いています。",
    exampleRomaji: "Akai hana ga saite imasu.",
    exampleHindi: "लाल फूल खिल रहा है।",
    needs_review: true
  },
  {
    id: "v-ao",
    unitId: "unit-v9",
    kana: "あお",
    kanji: "青",
    romaji: "ao",
    hindiMeaning: "नीला रंग",
    englishMeaning: "Blue color",
    category: "colors",
    exampleJp: "青い空が綺麗です。",
    exampleRomaji: "Aoi sora ga kirei desu.",
    exampleHindi: "नीला आसमान सुंदर है।",
    needs_review: true
  },
  {
    id: "v-shiro",
    unitId: "unit-v9",
    kana: "しろ",
    kanji: "白",
    romaji: "shiro",
    hindiMeaning: "सफेद रंग",
    englishMeaning: "White color",
    category: "colors",
    exampleJp: "白いシャツを着ます。",
    exampleRomaji: "Shiroi shatsu o kimasu.",
    exampleHindi: "सफेद शर्ट पहनता हूँ।",
    needs_review: true
  },
  {
    id: "v-kuro",
    unitId: "unit-v9",
    kana: "くろ",
    kanji: "黒",
    romaji: "kuro",
    hindiMeaning: "काला रंग",
    englishMeaning: "Black color",
    category: "colors",
    exampleJp: "黒い鞄を買いました。",
    exampleRomaji: "Kuroi kaban o kaimashita.",
    exampleHindi: "काला बैग खरीदा।",
    needs_review: true
  },
  {
    id: "v-hon",
    unitId: "unit-v9",
    kana: "ほん",
    kanji: "本",
    romaji: "hon",
    hindiMeaning: "किताब / पुस्तक",
    englishMeaning: "Book",
    category: "things",
    exampleJp: "日本語の本を読みます。",
    exampleRomaji: "Nihongo no hon o yomimasu.",
    exampleHindi: "जापानी किताब पढ़ता हूँ।",
    needs_review: true
  },
  {
    id: "v-kuruma",
    unitId: "unit-v9",
    kana: "くるま",
    kanji: "車",
    romaji: "kuruma",
    hindiMeaning: "गाड़ी / कार",
    englishMeaning: "Car / automobile",
    category: "things",
    exampleJp: "新しい車に乗ります。",
    exampleRomaji: "Atarashii kuruma ni norimasu.",
    exampleHindi: "नई गाड़ी में बैठता हूँ।",
    needs_review: true
  },
  {
    id: "v-densha",
    unitId: "unit-v9",
    kana: "でんしゃ",
    kanji: "電車",
    romaji: "densha",
    hindiMeaning: "लोकल ट्रेन / रेलगाड़ी",
    englishMeaning: "Train / electric train",
    category: "things",
    exampleJp: "電車で学校へ行きます。",
    exampleRomaji: "Densha de gakkou e ikimasu.",
    exampleHindi: "ट्रेन से स्कूल जाता हूँ।",
    needs_review: true
  },
  {
    id: "v-kaban",
    unitId: "unit-v9",
    kana: "かばん",
    kanji: "鞄",
    romaji: "kaban",
    hindiMeaning: "बैग / बस्ता",
    englishMeaning: "Bag",
    category: "things",
    exampleJp: "鞄の中に本があります。",
    exampleRomaji: "Kaban no naka ni hon ga arimasu.",
    exampleHindi: "बैग के अंदर किताब है।",
    needs_review: true
  },
  {
    id: "v-kagi",
    unitId: "unit-v9",
    kana: "かぎ",
    kanji: "鍵",
    romaji: "kagi",
    hindiMeaning: "चाबी / कुंजी",
    englishMeaning: "Key",
    category: "things",
    exampleJp: "部屋の鍵を閉めます。",
    exampleRomaji: "Heya no kagi o shimemasu.",
    exampleHindi: "कमरे की चाबी बंद करता हूँ।",
    needs_review: true
  },
  {
    id: "v-tokei",
    unitId: "unit-v9",
    kana: "とけい",
    kanji: "時計",
    romaji: "tokei",
    hindiMeaning: "घड़ी (Watch/Clock)",
    englishMeaning: "Watch / clock",
    category: "things",
    exampleJp: "机の上に時計があります。",
    exampleRomaji: "Tsukue no ue ni tokei ga arimasu.",
    exampleHindi: "मेज़ पर घड़ी है।",
    needs_review: true
  },

  // --- UNIT 10: दैनिक जीवन की वस्तुएँ (Daily Objects) ---
  {
    id: "v-tsukue",
    unitId: "unit-v10",
    kana: "つくえ",
    kanji: "机",
    romaji: "tsukue",
    hindiMeaning: "पढ़ने की मेज़ (Desk)",
    englishMeaning: "Desk",
    category: "daily-objects",
    exampleJp: "机で勉強します。",
    exampleRomaji: "Tsukue de benkyou shimasu.",
    exampleHindi: "मेज़ पर पढ़ाई करता हूँ।",
    needs_review: true
  },
  {
    id: "v-isu",
    unitId: "unit-v10",
    kana: "いす",
    kanji: "椅子",
    romaji: "isu",
    hindiMeaning: "कुर्सी",
    englishMeaning: "Chair",
    category: "daily-objects",
    exampleJp: "椅子に座ってください。",
    exampleRomaji: "Isu ni suwatte kudasai.",
    exampleHindi: "कुर्सी पर बैठिए।",
    needs_review: true
  },
  {
    id: "v-mado",
    unitId: "unit-v10",
    kana: "まど",
    kanji: "窓",
    romaji: "mado",
    hindiMeaning: "खिड़की",
    englishMeaning: "Window",
    category: "daily-objects",
    exampleJp: "窓を開けます。",
    exampleRomaji: "Mado o akemasu.",
    exampleHindi: "खिड़की खोलता हूँ।",
    needs_review: true
  },
  {
    id: "v-kasa",
    unitId: "unit-v10",
    kana: "かさ",
    kanji: "傘",
    romaji: "kasa",
    hindiMeaning: "छाता",
    englishMeaning: "Umbrella",
    category: "daily-objects",
    exampleJp: "雨ですから傘を持ちます。",
    exampleRomaji: "Ame desu kara kasa o mochimasu.",
    exampleHindi: "बारिश है इसलिए छाता ले जाता हूँ।",
    needs_review: true
  },
  {
    id: "v-denwa",
    unitId: "unit-v10",
    kana: "でんわ",
    kanji: "電話",
    romaji: "denwa",
    hindiMeaning: "टेलीफ़ोन / फ़ोन कॉल",
    englishMeaning: "Telephone / phone call",
    category: "daily-objects",
    exampleJp: "友だちに電話をかけます。",
    exampleRomaji: "Tomodachi ni denwa o kakemasu.",
    exampleHindi: "दोस्त को फ़ोन करता हूँ।",
    needs_review: true
  },
  {
    id: "v-kami",
    unitId: "unit-v10",
    kana: "かみ",
    kanji: "紙",
    romaji: "kami",
    hindiMeaning: "कागज़ / पत्र",
    englishMeaning: "Paper",
    category: "daily-objects",
    exampleJp: "白い紙に名前を書きます。",
    exampleRomaji: "Shiroi kami ni namae o kakemasu.",
    exampleHindi: "सफेद कागज़ पर नाम लिखता हूँ।",
    needs_review: true
  },
  {
    id: "v-hashi",
    unitId: "unit-v10",
    kana: "はし",
    kanji: "箸",
    romaji: "hashi",
    hindiMeaning: "चॉपस्टिक्स (खाने की तीलियाँ)",
    englishMeaning: "Chopsticks",
    category: "daily-objects",
    exampleJp: "箸でご飯を食べます。",
    exampleRomaji: "Hashi de gohan o tabemasu.",
    exampleHindi: "चॉपस्टिक्स से खाना खाता हूँ।",
    needs_review: true
  },
  {
    id: "v-okane",
    unitId: "unit-v10",
    kana: "おかね",
    kanji: "お金",
    romaji: "okane",
    hindiMeaning: "पैसे / धन / मुद्रा",
    englishMeaning: "Money",
    category: "daily-objects",
    exampleJp: "財布にお金があります。",
    exampleRomaji: "Saifu ni okane ga arimasu.",
    exampleHindi: "बटुए में पैसे हैं।",
    needs_review: true
  },
  {
    id: "v-kutsu",
    unitId: "unit-v10",
    kana: "くつ",
    kanji: "靴",
    romaji: "kutsu",
    hindiMeaning: "जूते",
    englishMeaning: "Shoes",
    category: "daily-objects",
    exampleJp: "玄関で靴を脱ぎます。",
    exampleRomaji: "Genkan de kutsu o nugimasu.",
    exampleHindi: "प्रवेश द्वार पर जूते उतारते हैं।",
    needs_review: true
  },
  {
    id: "v-fuku",
    unitId: "unit-v10",
    kana: "ふく",
    kanji: "服",
    romaji: "fuku",
    hindiMeaning: "कपड़े / वस्त्र",
    englishMeaning: "Clothes",
    category: "daily-objects",
    exampleJp: "新しい服を着ます。",
    exampleRomaji: "Atarashii fuku o kimasu.",
    exampleHindi: "नए कपड़े पहनता हूँ।",
    needs_review: true
  }
];

const allVocab = [...vocabBatch1, ...vocabBatch2, ...vocabBatch3, ...vocabBatch4];

fs.writeFileSync(
  path.join(contentDir, 'vocab.json'),
  JSON.stringify(allVocab, null, 2),
  'utf-8'
);
console.log(`Generated vocab.json with ${allVocab.length} words across 10 units.`);

// =============================================================
// GRAMMAR: 15 Core JLPT N5 Points with Explanations & Quizzes
// =============================================================

const grammarData = [
  {
    id: "grammar-1-wa-desu",
    pointNumber: 1,
    titleJp: "X は Y です",
    titleHindi: "विषय चिह्न 'は' और '〜है/हूँ' (Desu)",
    formula: "X は Y です (X wa Y desu)",
    explanationHindi: "जापानी में 'は' (उच्चारण 'wa') वाक्य के मुख्य विषय (Topic) को दर्शाता है कि 'जहाँ तक X की बात है...'\n'です' (desu) वाक्य के अंत में विनम्रता से 'है / हूँ / हैं' का काम करता है।\nध्यान दें: 'は' हिंदी के 'ने' या किसी सीधे कारक के बराबर नहीं है।",
    hindiComparison: "संरचना हिंदी जैसी ही (SOV) है: [कर्ता/विषय] + [पूरक/संज्ञा] + [है/हूँ क्रिया]।\nजैसे हिंदी में 'मैं राहुल हूँ' = जापानी में 'Watashi wa Rahuru desu'.",
    examples: [
      {
        jp: "私は学生です。",
        romaji: "Watashi wa gakusei desu.",
        hindi: "मैं छात्र हूँ।",
        noteHindi: "Watashi (मैं) + wa (विषय) + gakusei (छात्र) + desu (हूँ)।"
      },
      {
        jp: "田中さんは先生です。",
        romaji: "Tanaka-san wa sensei desu.",
        hindi: "तनाका जी शिक्षक हैं।",
        noteHindi: "Tanaka-san विषय हैं।"
      },
      {
        jp: "これは本です。",
        romaji: "Kore wa hon desu.",
        hindi: "यह किताब है।",
        noteHindi: "Kore (यह) + hon (किताब) + desu (है)।"
      }
    ],
    commonMistake: {
      mistakeJp: "私 は です 学生 (गलत पदक्रम)",
      correctionJp: "私は学生です (सही)",
      explanationHindi: "अंग्रेजी (I am student) की तरह 'desu' को बीच में न लगाएं। हिंदी की तरह 'desu' (है/हूँ) हमेशा वाक्य के अंत में आएगा।"
    },
    quiz: [
      {
        question: "'मैं भारत का नागरिक हूँ' के लिए सही जापानी वाक्य क्या है?",
        options: [
          "私はインド人です。",
          "私ですインド人。",
          "インド人私はです。",
          "私インド人はです。"
        ],
        correctIndex: 0,
        explanationHindi: "सही पदक्रम [विषय + は] + [संज्ञा] + [です] है: 'Watashi wa Indojin desu'."
      },
      {
        question: "वाक्य में विषय दर्शाने वाले चिह्न 'は' का उच्चारण क्या होता है?",
        options: [
          "wa (वा)",
          "ha (हा)",
          "ka (का)",
          "ga (गा)"
        ],
        correctIndex: 0,
        explanationHindi: "लिखते समय 'は' (ha) लिखा जाता है, लेकिन कण (particle) के रूप में उच्चारण हमेशा 'wa' (वा) होता है।"
      },
      {
        question: "'यह पानी है' को जापानी में कैसे कहेंगे?",
        options: [
          "これは水です。",
          "これ水はです。",
          "水はこれです。",
          "これは水ます。"
        ],
        correctIndex: 0,
        explanationHindi: "'Kore wa mizu desu' (यह पानी है)। संज्ञा के साथ अंत में 'desu' आता है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-2-ka",
    pointNumber: 2,
    titleJp: "प्रश्नवाचक कण「か」 (Question Marker)",
    titleHindi: "प्रश्न पूछना (Sentence-Ending 'ka')",
    formula: "[वाक्य] + か？",
    explanationHindi: "जापानी में किसी भी सामान्य वाक्य के अंत में 'か' (ka) जोड़ देने से वह प्रश्न बन जाता है।\nवाक्य की संरचना में कोई बदलाव नहीं करना पड़ता, न ही प्रश्नचिह्न '?' की अनिवार्य आवश्यकता होती है।",
    hindiComparison: "यह हिंदी में वाक्य की शुरुआत में 'क्या...' जोड़ने जैसा ही सरल है।\n(e.g., 'यह किताब है' ➔ 'क्या यह किताब है?' = 'Kore wa hon desu ka?')",
    examples: [
      {
        jp: "田中さんは学生ですか。",
        romaji: "Tanaka-san wa gakusei desu ka.",
        hindi: "क्या तनाका जी छात्र हैं?",
        noteHindi: "Desu के बाद 'ka' लगाने से प्रश्न बन गया।"
      },
      {
        jp: "あれは何ですか。",
        romaji: "Are wa nan desu ka.",
        hindi: "वह क्या है?",
        noteHindi: "Nan = क्या।"
      },
      {
        jp: "お元気ですか。",
        romaji: "Ogenki desu ka.",
        hindi: "क्या आप कुशल हैं? (आप कैसे हैं?)",
        noteHindi: "दैनिक बातचीत का अत्यंत प्रचलित वाक्य।"
      }
    ],
    commonMistake: {
      mistakeJp: "か田中さんは学生です (गलत जगह 'ka')",
      correctionJp: "田中さんは学生ですか (सही)",
      explanationHindi: "हिंदी की तरह 'क्या' (ka) आगे नहीं आता; जापानी में प्रश्नवाचक 'か' हमेशा वाक्य के सबसे अंत में जुड़ता है।"
    },
    quiz: [
      {
        question: "'क्या आप राहुल हैं?' पूछने के लिए रिक्त स्थान भरें: あなたはラフルさん___。",
        options: [
          "ですか",
          "は",
          "の",
          "ます"
        ],
        correctIndex: 0,
        explanationHindi: "प्रश्न पूछने के लिए अंत में 'desu ka' (ですか) आएगा।"
      },
      {
        question: "जापानी में प्रश्नवाचक चिह्न 'か' वाक्य में कहाँ आता है?",
        options: [
          "वाक्य के सबसे अंत में",
          "वाक्य के शुरू में",
          "कर्ता के तुरंत बाद",
          "संज्ञा से पहले"
        ],
        correctIndex: 0,
        explanationHindi: "'か' हमेशा पूरे वाक्य के अंत में लगकर उसे प्रश्न बनाता है।"
      },
      {
        question: "'वह क्या है?' का सही अनुवाद चुनें:",
        options: [
          "あれは何ですか。",
          "あれは本です。",
          "何はあれですか。",
          "あれですか何。"
        ],
        correctIndex: 0,
        explanationHindi: "'Are wa nan desu ka' = वह क्या है?"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-3-no",
    pointNumber: 3,
    titleJp: "संबंध कारक कण「の」 (Possessive Particle 'no')",
    titleHindi: "संबंध कारक 'का / की / के' (No)",
    formula: "संज्ञा A + の + संज्ञा B",
    explanationHindi: "'の' (no) दो संज्ञाओं को जोड़ता है और संबंध या अधिकार दर्शाता है। यह दर्शाता है कि B का संबंध A से है।",
    hindiComparison: "यह हिंदी के 'का / की / के' के लगभग समान है।\n(e.g., 'मेरी किताब' = 'Watashi no hon', 'जापान की ट्रेन' = 'Nihon no densha').",
    examples: [
      {
        jp: "私の本です。",
        romaji: "Watashi no hon desu.",
        hindi: "मेरी किताब है।",
        noteHindi: "Watashi (मैं) + no (का/की) + hon (किताब)।"
      },
      {
        jp: "大学の先生です。",
        romaji: "Daigaku no sensei desu.",
        hindi: "विश्वविद्यालय के शिक्षक हैं।",
        noteHindi: "Daigaku (यूनिवर्सिटी) + no + sensei (प्रोफ़ेसर/शिक्षक)।"
      },
      {
        jp: "日本の車です。",
        romaji: "Nihon no kuruma desu.",
        hindi: "जापान की गाड़ी है।",
        noteHindi: "उत्पत्ति/देश का संबंध दर्शाने के लिए भी 'no' का प्रयोग होता है।"
      }
    ],
    commonMistake: {
      mistakeJp: "本 の 私 (उल्टा क्रम)",
      correctionJp: "私の本 (सही)",
      explanationHindi: "मालिक/मुख्य संदर्भ पहले आता है: 'किसकी किताब?' ➔ Watashi no hon (मेरी किताब)।"
    },
    quiz: [
      {
        question: "'यह तनाका जी की चाबी है' का सही जापानी अनुवाद क्या है?",
        options: [
          "これは田中さんの鍵です。",
          "これは鍵の田中さんです。",
          "田中さんは鍵のこれです。",
          "これは田中さん鍵です。"
        ],
        correctIndex: 0,
        explanationHindi: "'Tanaka-san no kagi' = तनाका जी की चाबी।"
      },
      {
        question: "'मेरी गाड़ी' के लिए सही विकल्प चुनें:",
        options: [
          "私の車 (Watashi no kuruma)",
          "車は私 (Kuruma wa watashi)",
          "私の私 (Watashi no watashi)",
          "車で私 (Kuruma de watashi)"
        ],
        correctIndex: 0,
        explanationHindi: "'Watashi no kuruma' = मेरी गाड़ी (Car)।"
      },
      {
        question: "रिक्त स्थान भरें: 日本___カメラ (जापान का कैमरा)",
        options: [
          "の",
          "は",
          "を",
          "か"
        ],
        correctIndex: 0,
        explanationHindi: "देश और उत्पाद के संबंध को 'no' (の) से जोड़ा जाता है: 'Nihon no kamera'."
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-4-wo",
    pointNumber: 4,
    titleJp: "कर्म कारक कण「を」 (Direct Object Marker 'o')",
    titleHindi: "कर्म कारक 'को' (Object Marker 'o')",
    formula: "[कर्म/वस्तु] + を (उच्चारण 'o') + [सकर्मक क्रिया]",
    explanationHindi: "'を' (लिखते 'wo' हैं, बोलते 'o' हैं) उस वस्तु के बाद आता है जिस पर क्रिया का सीधा प्रभाव पड़ता है (Direct Object)।\nध्यान दें: हिंदी में निर्जीव वस्तु पर अक्सर 'को' नहीं बोलते (जैसे: 'किताब पढ़ता हूँ' न कि 'किताब को पढ़ता हूँ'), लेकिन जापानी में 'を' लगाना अनिवार्य होता है।",
    hindiComparison: "हिंदी संरचना: [कर्म] + [क्रिया] ➔ जापानी: [कर्म] + を + [क्रिया]।\nजैसे: 'पानी पीता हूँ' = 'Mizu o nomimasu'.",
    examples: [
      {
        jp: "水を飲みます。",
        romaji: "Mizu o nomimasu.",
        hindi: "पानी पीता हूँ।",
        noteHindi: "Mizu (पानी) + o (कर्म चिह्न) + nomimasu (पीता हूँ)।"
      },
      {
        jp: "本を読みます。",
        romaji: "Hon o yomimasu.",
        hindi: "किताब पढ़ता हूँ।",
        noteHindi: "Hon (किताब) कर्म है।"
      },
      {
        jp: "日本語を勉強します。",
        romaji: "Nihongo o benkyou shimasu.",
        hindi: "जापानी भाषा सीखता/पढ़ता हूँ।",
        noteHindi: "Benkyou shimasu = पढ़ाई करना।"
      }
    ],
    commonMistake: {
      mistakeJp: "ご飯 は 食べます (बिना प्रसंग के は लगाना)",
      correctionJp: "ご飯を食べます (सही)",
      explanationHindi: "क्रिया के कर्म के लिए सामान्यतः 'を' (o) का प्रयोग होता है, 'は' का नहीं।"
    },
    quiz: [
      {
        question: "'मैं ब्रेड खाता हूँ' के लिए सही वाक्य चुनें:",
        options: [
          "パンを食べます。",
          "パンは食べますです。",
          "パンに行きます。",
          "パンを食べますか。"
        ],
        correctIndex: 0,
        explanationHindi: "'Pan o tabemasu' = ब्रेड खाता हूँ।"
      },
      {
        question: "कण 'を' का सही उच्चारण क्या है?",
        options: [
          "o (ओ)",
          "wo (वो)",
          "to (तो)",
          "no (नो)"
        ],
        correctIndex: 0,
        explanationHindi: "कण के रूप में 'を' का आधुनिक उच्चारण शुद्ध 'o' (ओ) होता है।"
      },
      {
        question: "रिक्त स्थान भरें: 手紙___書きます (पत्र लिखता हूँ)",
        options: [
          "を",
          "に",
          "で",
          "は"
        ],
        correctIndex: 0,
        explanationHindi: "पत्र (Tegami) कर्म है, अतः 'を' (o) आएगा।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-5-mo",
    pointNumber: 5,
    titleJp: "समावेशी कण「も」 (Inclusive Particle 'mo')",
    titleHindi: "समावेशी 'भी' (Also / Too 'mo')",
    formula: "X も (は / が / を की जगह)",
    explanationHindi: "'も' (mo) का अर्थ 'भी' (also/too) होता है। जब किसी पहले कही गई बात के समान दूसरी बात कहनी हो, तो यह 'は' या 'を' की जगह ले लेता है।",
    hindiComparison: "यह हिंदी के 'भी' के बिल्कुल समतुल्य है।\n(e.g., 'मैं भी छात्र हूँ' = 'Watashi mo gakusei desu').",
    examples: [
      {
        jp: "私も学生です。",
        romaji: "Watashi mo gakusei desu.",
        hindi: "मैं भी छात्र हूँ।",
        noteHindi: "Watashi wa की जगह Watashi mo (मैं भी)।"
      },
      {
        jp: "これも本です。",
        romaji: "Kore mo hon desu.",
        hindi: "यह भी किताब है।",
        noteHindi: "Kore mo = यह भी।"
      },
      {
        jp: "お茶も飲みます。",
        romaji: "Ocha mo nomimasu.",
        hindi: "चाय भी पीता हूँ।",
        noteHindi: "Ocha o की जगह Ocha mo।"
      }
    ],
    commonMistake: {
      mistakeJp: "私はも学生です (は और も दोनों साथ में)",
      correctionJp: "私も学生です (सही)",
      explanationHindi: "'も' अकेले आता है और 'は' को हटा देता है; 'wa mo' एक साथ नहीं आता।"
    },
    quiz: [
      {
        question: "तनाका जी कहते हैं: 'मैं जापानी हूँ'। आप कहना चाहते हैं: 'मैं भी जापानी हूँ'। क्या कहेंगे?",
        options: [
          "私も日本人です。",
          "私は日本人です。",
          "私の日本人です。",
          "私に日本人です。"
        ],
        correctIndex: 0,
        explanationHindi: "'Watashi mo nihonjin desu' = मैं भी जापानी हूँ।"
      },
      {
        question: "'यह भी स्वादिष्ट है' का सही अनुवाद क्या है?",
        options: [
          "これにおいしいです。",
          "これもおいしいです。",
          "これのおいしいです。",
          "これでおいしいです。"
        ],
        correctIndex: 1,
        explanationHindi: "'Kore mo oishii desu' = यह भी स्वादिष्ट है।"
      },
      {
        question: "कण 'も' (mo) का हिंदी में क्या अर्थ होता है?",
        options: [
          "भी (Also)",
          "का/की (Of)",
          "को (Object)",
          "नहीं (No)"
        ],
        correctIndex: 0,
        explanationHindi: "'も' का अर्थ 'भी' (Also/Too) होता है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-6-ni-de",
    pointNumber: 6,
    titleJp: "स्थान कण「に」बनाम「で」 (Location Particles)",
    titleHindi: "स्थान सूचक 'में / पर' (Ni vs De)",
    formula: "[स्थान] + に (अस्तित्व/दिशा) VS [स्थान] + で (सक्रिय क्रिया)",
    explanationHindi: "जापानी में स्थान दर्शाने के दो मुख्य कण हैं:\n1. 'に' (ni): किसी चीज़ के उपस्थित होने (arimasu/imasu) या जाने के लक्ष्य (ikimasu) के लिए (~ में/पर)।\n2. 'で' (de): जहाँ कोई सक्रिय कार्य या एक्शन हो रहा हो (~ में/पर)।\nध्यान दें: दोनों का अनुवाद हिंदी में 'में' हो सकता है, पर जापानी में इनका अंतर स्पष्ट है।",
    hindiComparison: "हिंदी में 'घर में हूँ' और 'घर में पढ़ता हूँ' दोनों में 'में' आता है, पर जापानी में: 'Ie ni imasu' (उपस्थिति ➔ に) लेकिन 'Ie de benkyou shimasu' (क्रिया ➔ で)।",
    examples: [
      {
        jp: "部屋に猫がいます。",
        romaji: "Heya ni neko ga imasu.",
        hindi: "कमरे में बिल्ली है।",
        noteHindi: "बिल्ली की उपस्थिति है, अतः 'ni' आया।"
      },
      {
        jp: "図書館で本を読みます。",
        romaji: "Toshokan de hon o yomimasu.",
        hindi: "पुस्तकालय में किताब पढ़ता हूँ।",
        noteHindi: "किताब पढ़ने की सक्रिय क्रिया हो रही है, अतः 'de' आया।"
      },
      {
        jp: "東京に行きます。",
        romaji: "Toukyou ni ikimasu.",
        hindi: "टोक्यो जा रहा हूँ।",
        noteHindi: "गमन की दिशा/मंज़िल के लिए 'ni' आता है।"
      }
    ],
    commonMistake: {
      mistakeJp: "学校 に 勉強します (क्रिया के स्थान पर に लगाना)",
      correctionJp: "学校で勉強します (सही)",
      explanationHindi: "पढ़ाई करना एक सक्रिय क्रिया (Action) है, इसलिए स्थान के साथ 'de' लगेगा।"
    },
    quiz: [
      {
        question: "रिक्त स्थान भरें: レストラン___ご飯を食べます (रेस्टोरेंट में खाना खाता हूँ)",
        options: [
          "で",
          "に",
          "へ",
          "の"
        ],
        correctIndex: 0,
        explanationHindi: "खाना खाना एक सक्रिय कार्य है, इसलिए स्थान के बाद 'de' (で) आएगा।"
      },
      {
        question: "रिक्त स्थान भरें: 机の上___本があります (मेज़ पर किताब है)",
        options: [
          "に",
          "で",
          "を",
          "と"
        ],
        correctIndex: 0,
        explanationHindi: "किताब की स्थिति/उपस्थिति (arimasu) दर्शाने के लिए 'ni' (に) आता है।"
      },
      {
        question: "'जापान जाऊंगा' के लिए सही गंतव्य कण चुनें: 日本___行きます。",
        options: [
          "に",
          "で",
          "を",
          "から"
        ],
        correctIndex: 0,
        explanationHindi: "मंज़िल (Destination) दर्शाने के लिए 'ni' (に) या 'e' (へ) आता है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-7-desu-masu",
    pointNumber: 7,
    titleJp: "आदरसूचक रूप「です / ます」 (Polite Forms)",
    titleHindi: "विनम्र वर्तमान/भविष्य 'Desu / Masu'",
    formula: "संज्ञा/विशेषण + です | क्रिया स्टेम + ます",
    explanationHindi: "जापानी में विनम्र बातचीत (Desu/Masu Form) के लिए:\n- संज्ञा और विशेषण के बाद 'です' (desu) लगाते हैं।\n- क्रिया के स्टेम (masu-stem) के बाद 'ます' (masu) लगाते हैं। यह वर्तमान और भविष्य दोनों कालों को दर्शाता है।",
    hindiComparison: "यह हिंदी में 'करता हूँ / करूँगा' जैसे आदरपूर्वक बात करने के समान है।",
    examples: [
      {
        jp: "私は毎日日本語を勉強します。",
        romaji: "Watashi wa mainichi nihongo o benkyou shimasu.",
        hindi: "मैं रोज़ाना जापानी पढ़ता हूँ।",
        noteHindi: "Benkyou shimasu = पढ़ता हूँ / पढूंगा।"
      },
      {
        jp: "明日東京に行きます。",
        romaji: "Ashita Toukyou ni ikimasu.",
        hindi: "कल टोक्यो जाऊंगा।",
        noteHindi: "भविष्य के लिए भी 'masu' रूप ही प्रयुक्त होता है।"
      },
      {
        jp: "このお茶はおいしいです。",
        romaji: "Kono ocha wa oishii desu.",
        hindi: "यह चाय स्वादिष्ट है।",
        noteHindi: "विशेषण के बाद 'desu' लगा है।"
      }
    ],
    commonMistake: {
      mistakeJp: "飲みますです (क्रिया के साथ desu लगाना)",
      correctionJp: "飲みます (सही)",
      explanationHindi: "क्रिया के 'masu' रूप के बाद दोबारा 'desu' नहीं लगाया जाता।"
    },
    quiz: [
      {
        question: "'たべる' (Taberu - खाना) का विनम्र 'ます' रूप क्या है?",
        options: [
          "たべます (Tabemasu)",
          "たべるです (Taberu desu)",
          "たべますです (Tabemasu desu)",
          "たべない (Tabenai)"
        ],
        correctIndex: 0,
        explanationHindi: "'Taberu' का विनम्र रूप 'Tabemasu' (たべます) होता है।"
      },
      {
        question: "जापानी में 'ます' (Masu) क्रिया रूप किस काल को दर्शाता है?",
        options: [
          "वर्तमान और भविष्य दोनों",
          "केवल भूतकाल",
          "केवल भूतकाल का नकारात्मक",
          "केवल आज्ञावाचक"
        ],
        correctIndex: 0,
        explanationHindi: "जापानी में गैर-भूतकाल (Non-past) रूप वर्तमान की आदत और भविष्य की योजना दोनों बताता है।"
      },
      {
        question: "'कल पानी पियूँगा' के लिए सही वाक्य चुनें:",
        options: [
          "明日水を飲みます。",
          "明日水を飲みました。",
          "明日水を飲むでした。",
          "明日水が飲みます。"
        ],
        correctIndex: 0,
        explanationHindi: "'Ashita mizu o nomimasu' = कल पानी पियूँगा।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-8-negative",
    pointNumber: 8,
    titleJp: "नकारात्मक रूप「ではありません / 〜ません」",
    titleHindi: "नकारात्मक विनम्र रूप (Negative Polite)",
    formula: "संज्ञा + ではありません (या じゃありません) | क्रिया + 〜ません",
    explanationHindi: "विनम्र भाषा में 'नहीं है' या 'नहीं करता':\n- संज्ञा के साथ: 'ではありません' (dewa arimasen) या बोलचाल में 'じゃありません' (ja arimasen)।\n- क्रिया के साथ: '〜ます' को हटाकर '〜ません' (masen) लगाते हैं।",
    hindiComparison: "हिंदी: 'नहीं हूँ' / 'नहीं खाता'।\n(e.g., 'मैं छात्र नहीं हूँ' = 'Watashi wa gakusei dewa arimasen').",
    examples: [
      {
        jp: "私は先生ではありません。",
        romaji: "Watashi wa sensei dewa arimasen.",
        hindi: "मैं शिक्षक नहीं हूँ।",
        noteHindi: "Dewa arimasen = नहीं हूँ।"
      },
      {
        jp: "お肉は食べません。",
        romaji: "Oniku wa tabemasen.",
        hindi: "मीट नहीं खाता हूँ।",
        noteHindi: "Tabemasu ➔ Tabemasen (नहीं खाता)।"
      },
      {
        jp: "今日はお酒を飲みません。",
        romaji: "Kyou wa osake o nomimasen.",
        hindi: "आज शराब नहीं पियूँगा।",
        noteHindi: "Nomimasen = नहीं पियूँगा।"
      }
    ],
    commonMistake: {
      mistakeJp: "食べますない (गलत नकारात्मक)",
      correctionJp: "食べません (सही)",
      explanationHindi: "विनम्र क्रिया में नकारात्मक 'masen' (ません) होता है, 'masu nai' नहीं।"
    },
    quiz: [
      {
        question: "'मैं जापानी नहीं हूँ' के लिए सही वाक्य चुनें:",
        options: [
          "私は日本人ではありません。",
          "私は日本人ですない。",
          "私は日本人ではありませんでした。",
          "私に日本人じゃない。"
        ],
        correctIndex: 0,
        explanationHindi: "'Sensei/Nihonjin dewa arimasen' = नहीं हूँ।"
      },
      {
        question: "'行きます' (Ikimasu - जाता हूँ) का नकारात्मक क्या होगा?",
        options: [
          "行きません (Ikimasen)",
          "行くない (Ikunai)",
          "行きますない (Ikimasunai)",
          "行かないでした (Ikanaideshita)"
        ],
        correctIndex: 0,
        explanationHindi: "'Ikimasu' का नकारात्मक 'Ikimasen' (行きません) होता है।"
      },
      {
        question: "बोलचाल में 'ではありません' की जगह आमतौर पर क्या बोला जाता है?",
        options: [
          "じゃありません (Ja arimasen)",
          "です (Desu)",
          "ます (Masu)",
          "でした (Deshita)"
        ],
        correctIndex: 0,
        explanationHindi: "बोलचाल की भाषा में 'dewa arimasen' को 'ja arimasen' कहा जाता है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-9-past",
    pointNumber: 9,
    titleJp: "भूतकाल রূপ「でした / 〜ました」 (Past Tense)",
    titleHindi: "भूतकाल रूप 'था / किया' (Past Polite)",
    formula: "संज्ञा + でした | क्रिया + 〜ました (नकारात्मक: 〜ませんでした)",
    explanationHindi: "बीते हुए समय की बात करने के लिए:\n- संज्ञा/संज्ञा वाक्य के अंत में 'でした' (deshita) आता है (~ था/थी/थे)।\n- क्रिया के साथ '〜ました' (mashita) आता है (~ किया/गया)।\n- भूतकाल नकारात्मक: '〜ませんでした' (masen deshita) (~ नहीं किया)।",
    hindiComparison: "हिंदी: 'गया था' / 'खाया था'।\n(e.g., 'कल किताब खरीदी थी' = 'Kinou hon o kaimashita').",
    examples: [
      {
        jp: "昨日は雨でした。",
        romaji: "Kinou wa ame deshita.",
        hindi: "कल बारिश थी।",
        noteHindi: "Ame (बारिश) + deshita (थी)।"
      },
      {
        jp: "朝ご飯を食べました。",
        romaji: "Asagohan o tabemashita.",
        hindi: "नाश्ता खाया था (कर लिया)।",
        noteHindi: "Tabemashita = खाया था।"
      },
      {
        jp: "昨日は勉強しませんでした。",
        romaji: "Kinou wa benkyou shimasen deshita.",
        hindi: "कल पढ़ाई नहीं की थी।",
        noteHindi: "Shimasen deshita = नहीं किया था।"
      }
    ],
    commonMistake: {
      mistakeJp: "昨日 行きます (भूतकाल में वर्तमान रूप लगाना)",
      correctionJp: "昨日 行きました (सही)",
      explanationHindi: "'Kinou' (बीता हुआ कल) के साथ क्रिया का भूतकाल रूप 'ikimashita' लगेगा।"
    },
    quiz: [
      {
        question: "'कल मैंने फ़िल्म देखी थी' के लिए सही वाक्य चुनें:",
        options: [
          "昨日映画を見ました。",
          "昨日映画を見ます。",
          "昨日映画を見るでした。",
          "昨日映画を見ません。"
        ],
        correctIndex: 0,
        explanationHindi: "'Kinou eiga o mimashita' = कल फ़िल्म देखी थी।"
      },
      {
        question: "'कल स्कूल नहीं गया था' के लिए सही क्रिया रूप चुनें: 昨日は学校へ___。",
        options: [
          "行きました",
          "行きませんでした",
          "行きません",
          "行きます"
        ],
        correctIndex: 1,
        explanationHindi: "भूतकाल के नकारात्मक के लिए 'ikimasen deshita' (行きませんでした) आएगा।"
      },
      {
        question: "'昨日は日曜日___' (कल रविवार था) में रिक्त स्थान भरें:",
        options: [
          "でした",
          "です",
          "ます",
          "ました"
        ],
        correctIndex: 0,
        explanationHindi: "संज्ञा के साथ भूतकाल में 'deshita' (でした) आता है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-10-kore-sore-are",
    pointNumber: 10,
    titleJp: "संकेतवाचक सर्वनाम「これ / それ / あれ」 (Ko-So-A-Do)",
    titleHindi: "यह / वह / वह दूर (Demonstratives)",
    formula: "これ (पास) | それ (श्रोता के पास) | あれ (दोनों से दूर) | どれ (कौन सा)",
    explanationHindi: "जापानी में दूरी के अनुसार 3 संकेतवाचक शब्द होते हैं:\n1. 'これ' (kore): बोलने वाले (Speaker) के पास की वस्तु (~ यह)।\n2. 'それ' (sore): सुनने वाले (Listener) के पास की वस्तु (~ वह)।\n3. 'あれ' (are): दोनों से दूर की वस्तु (~ वह दूर)।\n4. 'どれ' (dore): प्रश्नवाचक (~ कौन सा)।",
    hindiComparison: "हिंदी में 'यह' और 'वह' दो ही होते हैं, जबकि जापानी में तीन दूरियाँ होती हैं (मेरे पास, तुम्हारे पास, दोनों से दूर)।",
    examples: [
      {
        jp: "これは私のペンです。",
        romaji: "Kore wa watashi no pen desu.",
        hindi: "यह मेरा पेन है। (मेरे पास)",
        noteHindi: "Kore = यह वस्तु।"
      },
      {
        jp: "それは何の本ですか。",
        romaji: "Sore wa nan no hon desu ka.",
        hindi: "वह किस चीज़ की किताब है? (श्रोता के पास)",
        noteHindi: "Sore = वह वस्तु जो सुनने वाले के पास है।"
      },
      {
        jp: "あれは病院です。",
        romaji: "Are wa byouin desu.",
        hindi: "वह (दूर) अस्पताल है।",
        noteHindi: "Are = दोनों से दूर।"
      }
    ],
    commonMistake: {
      mistakeJp: "これ 本 (संज्ञा से सीधे पहले kore लगाना)",
      correctionJp: "この本 (सही) या これは本です (सही)",
      explanationHindi: "'kore' अकेला सर्वनाम है। यदि संज्ञा से ठीक पहले 'यह' जोड़ना हो तो 'kono' (この) का प्रयोग होता है।"
    },
    quiz: [
      {
        question: "अगर कोई वस्तु आपसे और सुनने वाले दोनों से बहुत दूर हो, तो कौन सा शब्द प्रयोग करेंगे?",
        options: [
          "あれ (Are)",
          "これ (Kore)",
          "それ (Sore)",
          "どれ (Dore)"
        ],
        correctIndex: 0,
        explanationHindi: "दोनों से दूर स्थित वस्तु के लिए 'Are' (あれ) का प्रयोग होता है।"
      },
      {
        question: "सुनने वाले के हाथ में रखी वस्तु की ओर इशारा करके पूछने के लिए क्या कहेंगे?",
        options: [
          "それは何ですか。",
          "これは何ですか。",
          "あれは何ですか。",
          "どれは何ですか。"
        ],
        correctIndex: 0,
        explanationHindi: "श्रोता के पास रखी चीज़ के लिए 'Sore wa nan desu ka' कहते हैं।"
      },
      {
        question: "'यह मेरी घड़ी है' का सही अनुवाद क्या है?",
        options: [
          "これは私の時計です。",
          "あれは時計の私です。",
          "それの私の時計です。",
          "どれは私の時計です。"
        ],
        correctIndex: 0,
        explanationHindi: "'Kore wa watashi no tokei desu' = यह मेरी घड़ी है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-11-i-adj",
    pointNumber: 11,
    titleJp: "「い」विशेषण (I-Adjectives)",
    titleHindi: "I-विशेषण और उनके रूप",
    formula: "वर्तमान: 〜い です | नकारात्मक: 〜く ない です | भूतकाल: 〜かった です",
    explanationHindi: "'い-विशेषण' वे होते हैं जिनका अंत 'い' (i) पर होता है (जैसे: たかい, おいしい, おおきい)।\nइनके रूप बदलते समय अंतिम 'い' को हटाया जाता है:\n- नकारात्मक: い ➔ くない (e.g., たかくない = महंगा नहीं है)\n- भूतकाल: い ➔ かった (e.g., たかかった = महंगा था)",
    hindiComparison: "हिंदी में विशेषण लिंग/वचन से बदलते हैं (बड़ा/बड़ी), जबकि जापानी में विशेषण का अपना काल (Tense) होता है!",
    examples: [
      {
        jp: "この料理はおいしいです。",
        romaji: "Kono ryouri wa oishii desu.",
        hindi: "यह भोजन स्वादिष्ट है।",
        noteHindi: "Oishii = स्वादिष्ट।"
      },
      {
        jp: "昨日は寒かったです。",
        romaji: "Kinou wa samukatta desu.",
        hindi: "कल ठंड थी।",
        noteHindi: "Samui (ठंडा) ➔ Samukatta (ठंडा था)।"
      },
      {
        jp: "この本は高くないです。",
        romaji: "Kono hon wa takakunai desu.",
        hindi: "यह किताब महंगी नहीं है।",
        noteHindi: "Takai ➔ Takakunai (महंगा नहीं)।"
      }
    ],
    commonMistake: {
      mistakeJp: "おいしい でした (i-विशेषण के साथ deshita लगाना)",
      correctionJp: "おいしかったです (सही)",
      explanationHindi: "I-विशेषण में 'deshita' नहीं लगता; 'i' हटकर 'katta desu' बनता है।"
    },
    quiz: [
      {
        question: "'たかい' (Takai - महंगा) का भूतकाल रूप क्या होगा?",
        options: [
          "たかかったです (Takakatta desu)",
          "たかいでした (Takai deshita)",
          "たかくない (Takakunai)",
          "たかいかった (Takaikatta)"
        ],
        correctIndex: 0,
        explanationHindi: "अंतिम 'い' हटाकर 'かったです' लगाते हैं: 'Takakatta desu'."
      },
      {
        question: "'おおきい' (Ookii - बड़ा) का नकारात्मक रूप क्या है?",
        options: [
          "おおきくないです (Ookikunai desu)",
          "おおきいじゃない (Ookii janai)",
          "おおきくないでした (Ookikunaideshita)",
          "おおきくでした (Ookikudeshita)"
        ],
        correctIndex: 0,
        explanationHindi: "नकारात्मक के लिए 'い' हटाकर 'くないです' लगाते हैं: 'Ookikunai desu'."
      },
      {
        question: "'いい' (Ii - अच्छा) का नकारात्मक रूप क्या होता है (अनियमित)?",
        options: [
          "よくないです (Yokunai desu)",
          "いくないです (Ikunai desu)",
          "いいじゃないです (Ii janai desu)",
          "よかった (Yokatta)"
        ],
        correctIndex: 0,
        explanationHindi: "'いい' अनियमित है, इसका रूप 'よくない' (yokunai) होता है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-12-na-adj",
    pointNumber: 12,
    titleJp: "「な」विशेषण (Na-Adjectives)",
    titleHindi: "Na-विशेषण और संज्ञा जोड़ना",
    formula: "संज्ञा से पहले: [विशेषण] + な + [संज्ञा] | वाक्य अंत: [विशेषण] + です",
    explanationHindi: "'な-विशेषण' (जैसे: すき, しずか, べんり) के दो मुख्य नियम हैं:\n1. जब ये संज्ञा से पहले आते हैं, तो बीच में 'な' (na) लगाना अनिवार्य होता है (e.g., しずかな 部屋 = शांत कमरा)।\n2. जब वाक्य के अंत में आते हैं, तो सीधे 'です/でした' लगता है, 'な' हट जाता है (e.g., この部屋はしずかです)।",
    hindiComparison: "संज्ञा के साथ 'विशेषण + ना' का नियम याद रखें (जैसे: 'Kirei na hana' = सुंदर फूल)।",
    examples: [
      {
        jp: "静かな部屋です。",
        romaji: "Shizuka na heya desu.",
        hindi: "शांत कमरा है।",
        noteHindi: "Shizuka (शांत) + na + heya (कमरा)।"
      },
      {
        jp: "日本のアニメが好きです。",
        romaji: "Nihon no anime ga suki desu.",
        hindi: "मुझे जापानी एनीमे पसंद है।",
        noteHindi: "Suki na-विशेषण है; अंत में suki desu आता है।"
      },
      {
        jp: "この町は便利です。",
        romaji: "Kono machi wa benri desu.",
        hindi: "यह शहर सुविधाजनक है।",
        noteHindi: "Benri = सुविधाजनक।"
      }
    ],
    commonMistake: {
      mistakeJp: "静か 部屋 (बिना な के संज्ञा जोड़ना)",
      correctionJp: "静かな部屋 (सही)",
      explanationHindi: "Na-विशेषण को संज्ञा से जोड़ते समय 'na' (な) लगाना अनिवार्य है।"
    },
    quiz: [
      {
        question: "रिक्त स्थान भरें: きれい___花 (सुंदर फूल)",
        options: [
          "な",
          "い",
          "の",
          "に"
        ],
        correctIndex: 0,
        explanationHindi: "'Kirei' एक Na-विशेषण है, अतः संज्ञा से पहले 'na' (な) लगेगा।"
      },
      {
        question: "'すき' (Suki - पसंद) किस प्रकार का विशेषण है?",
        options: [
          "な-विशेषण (Na-adjective)",
          "い-विशेषण (I-adjective)",
          "क्रिया (Verb)",
          "सर्वनाम (Pronoun)"
        ],
        correctIndex: 0,
        explanationHindi: "'Suki' (好き) व्याकरण की दृष्टि से Na-विशेषण होता है।"
      },
      {
        question: "'यह कमरा शांत है' का सही अनुवाद चुनें:",
        options: [
          "この部屋は静かです。",
          "この部屋は静かなです。",
          "この部屋は静かいます。",
          "この部屋は静かでしたない。"
        ],
        correctIndex: 0,
        explanationHindi: "वाक्य के अंत में 'Shizuka desu' आता है ('na' हट जाता है)।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-13-counters",
    pointNumber: 13,
    titleJp: "गिनती और संख्या सूचक (Counting Basics)",
    titleHindi: "सामान्य गिनती (ひとつ〜とお) और संख्या सूचक",
    formula: "वस्तुओं की सामान्य गिनती: ひとつ〜とお | व्यक्तियों के लिए: ひとり/ふたり/〜にん",
    explanationHindi: "जापानी में वस्तुओं को गिनने के लिए अलग-अलग काउंटर होते हैं:\n1. सामान्य वस्तुएं: ひとつ (1), ふたつ (2), みっつ (3), よっつ (4), いつつ (5), むっつ (6), ななつ (7), やっつ (8), ここのつ (9), とお (10)।\n2. व्यक्ति (People): ひとり (1 व्यक्ति), ふたり (2 व्यक्ति), さんにん (3 व्यक्ति), よにん (4 व्यक्ति)।\n3. लंबी/बेलनाकार वस्तुएं (〜本): ध्वनि परिवर्तन की चेतावनी! (1本 = いっぽん ippon, 2本 = にほん nihon, 3本 = さんぼん sanbon)।",
    hindiComparison: "हिंदी में 'एक सेब', 'दो लोग' कहते हैं, जबकि जापानी में वस्तु के प्रकार के अनुसार संख्या रूप बदलता है।",
    examples: [
      {
        jp: "りんごを二つください。",
        romaji: "Ringo o futatsu kudasai.",
        hindi: "दो सेब दीजिए।",
        noteHindi: "Futatsu = दो सामान्य वस्तुएं।"
      },
      {
        jp: "学生が三人います。",
        romaji: "Gakusei ga sannin imasu.",
        hindi: "तीन छात्र हैं।",
        noteHindi: "Sannin = 3 व्यक्ति।"
      },
      {
        jp: "ペンを三本買いました。",
        romaji: "Pen o sanbon kaimashita.",
        hindi: "तीन पेन खरीदे।",
        noteHindi: "ध्वनि परिवर्तन: 3本 = さんぼん (sanbon)।"
      }
    ],
    commonMistake: {
      mistakeJp: "学生 二人があります (व्यक्तियों के साथ arimasu लगाना)",
      correctionJp: "学生が二人います (सही)",
      explanationHindi: "सजीव प्राणियों (व्यक्तियों/जानवरों) की उपस्थिति के लिए 'imasu' (います) का प्रयोग होता है, 'arimasu' का नहीं।"
    },
    quiz: [
      {
        question: "'एक सेब' मांगने के लिए 'एक' का सामान्य काउंटर क्या है?",
        options: [
          "ひとつ (Hitotsu)",
          "ひとり (Hitori)",
          "いち (Ichi)",
          "いっぽん (Ippon)"
        ],
        correctIndex: 0,
        explanationHindi: "सामान्य वस्तुओं को गिनने के लिए 'Hitotsu' (ひとつ) कहते हैं।"
      },
      {
        question: "'दो व्यक्ति' (2 people) के लिए सही शब्द क्या है?",
        options: [
          "ふたり (Futari)",
          "ににん (Ninin)",
          "ふたつ (Futatsu)",
          "にほん (Nihon)"
        ],
        correctIndex: 0,
        explanationHindi: "दो व्यक्तियों के लिए 'Futari' (ふたり) विशेष शब्द है।"
      },
      {
        question: "'तीन पेन' (3 pens) के लिए सही उच्चारण क्या है (ध्वनि परिवर्तन)?",
        options: [
          "さんぼん (Sanbon)",
          "さんほん (Sanhon)",
          "さんぽん (Sanpon)",
          "みっつ (Mittsu)"
        ],
        correctIndex: 0,
        explanationHindi: "3 के साथ 'hon' बदलकर 'sanbon' (さんぼん) उच्चारित होता है।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-14-to",
    pointNumber: 14,
    titleJp: "संयोजक कण「と」 (Particle 'to' - And / With)",
    titleHindi: "संयोजक 'और' एवं 'के साथ' ('to')",
    formula: "संज्ञा A + と + संज्ञा B (और) | व्यक्ति + と + क्रिया (के साथ)",
    explanationHindi: "कण 'と' (to) के दो मुख्य प्रयोग हैं:\n1. दो संज्ञाओं को जोड़ना: 'A और B' (e.g., 肉と野菜 = मीट और सब्ज़ी)।\n2. किसी व्यक्ति के साथ कोई कार्य करना: 'के साथ' (e.g., 友だちと行きます = दोस्त के साथ जाऊंगा)।",
    hindiComparison: "यह हिंदी के 'और' (And) तथा 'के साथ' (Together with) दोनों के समान कार्य करता है।",
    examples: [
      {
        jp: "パンと卵を食べます。",
        romaji: "Pan to tamago o tabemasu.",
        hindi: "ब्रेड और अंडा खाता हूँ।",
        noteHindi: "Pan to tamago = ब्रेड और अंडा।"
      },
      {
        jp: "友だちと映画を見ます。",
        romaji: "Tomodachi to eiga o mimasu.",
        hindi: "दोस्त के साथ फ़िल्म देखता हूँ।",
        noteHindi: "Tomodachi to = दोस्त के साथ।"
      },
      {
        jp: "家族と日本へ行きます。",
        romaji: "Kazoku to nihon e ikimasu.",
        hindi: "परिवार के साथ जापान जाऊंगा।",
        noteHindi: "Kazoku to = परिवार के साथ।"
      }
    ],
    commonMistake: {
      mistakeJp: "パンと (वाक्य के अंत में 'to' छोड़ देना)",
      correctionJp: "パンと卵を食べます (सही)",
      explanationHindi: "'to' केवल संज्ञाओं के बीच सूची जोड़ने या 'साथ' बताने के लिए आता है।"
    },
    quiz: [
      {
        question: "'मैं और तनाका जी' के लिए सही जापानी क्या होगी?",
        options: [
          "私と田中さん",
          "私は田中さん",
          "私の田中さん",
          "私に田中さん"
        ],
        correctIndex: 0,
        explanationHindi: "'Watashi to Tanaka-san' = मैं और तनाका जी।"
      },
      {
        question: "रिक्त स्थान भरें: 兄___東京へ行きました (बड़े भाई के साथ टोक्यो गया था)",
        options: [
          "と",
          "を",
          "で",
          "は"
        ],
        correctIndex: 0,
        explanationHindi: "साथ जाने के अर्थ में 'to' (と) का प्रयोग होगा: 'Ani to'."
      },
      {
        question: "'पानी और चाय' का सही अनुवाद चुनें:",
        options: [
          "水とお茶",
          "水はお茶",
          "水の水",
          "水でお茶"
        ],
        correctIndex: 0,
        explanationHindi: "'Mizu to ocha' = पानी और चाय।"
      }
    ],
    needs_review: true
  },
  {
    id: "grammar-15-te-form",
    pointNumber: 15,
    titleJp: "क्रिया का「て-रूप」 (Te-Form Basics)",
    titleHindi: "Te-रूप और अनुरोध (〜てください)",
    formula: "क्रिया का て-रूप + ください (कृपया ... कीजिए)",
    explanationHindi: "जापानी क्रियाओं का 'て-रूप' (Te-form) बहुत महत्वपूर्ण है। इसका सबसे पहला और मुख्य प्रयोग विनम्र अनुरोध करना है:\n- 'क्रिया-て + ください' (Te kudasai) = 'कृपया यह कीजिए'।\n(e.g., たべてください = कृपया खाइए, みてください = कृपया देखिए)।",
    hindiComparison: "यह हिंदी में 'कृपया ... कीजिए / करिए' कहने के बिल्कुल समतुल्य है।\n(e.g., 'कृपया सुनिए' = 'Kiite kudasai').",
    examples: [
      {
        jp: "ちょっと待ってください。",
        romaji: "Chotto matte kudasai.",
        hindi: "कृपया ज़रा रुकिए।",
        noteHindi: "Matsu (रुकना) ➔ Matte kudasai (कृपया रुकिए)।"
      },
      {
        jp: "本を読んでください。",
        romaji: "Hon o yonde kudasai.",
        hindi: "कृपया किताब पढ़िए।",
        noteHindi: "Yomu ➔ Yonde kudasai (पढ़िए)।"
      },
      {
        jp: "日本語で話してください。",
        romaji: "Nihongo de hanashite kudasai.",
        hindi: "कृपया जापानी में बात कीजिए।",
        noteHindi: "Hanasu ➔ Hanashite kudasai (बात कीजिए)।"
      }
    ],
    commonMistake: {
      mistakeJp: "食べます ください (masu के बाद kudasai लगाना)",
      correctionJp: "食べてください (सही)",
      explanationHindi: "अनुरोध करने के लिए क्रिया का 'Te-रूप' (て) अनिवार्य है, 'masu' नहीं।"
    },
    quiz: [
      {
        question: "'कृपया खाइए' के लिए सही जापानी वाक्य क्या है?",
        options: [
          "食べてください (Tabete kudasai)",
          "食べますください (Tabemasu kudasai)",
          "食べるください (Taberu kudasai)",
          "食べないください (Tabenai kudasai)"
        ],
        correctIndex: 0,
        explanationHindi: "'Taberu' का Te-रूप 'Tabete' होता है, अतः 'Tabete kudasai' (食べてください) सही है।"
      },
      {
        question: "'कृपया ज़रा रुकिए' का अत्यंत प्रसिद्ध जापानी वाक्य क्या है?",
        options: [
          "ちょっと待ってください (Chotto matte kudasai)",
          "ちょっと行きます (Chotto ikimasu)",
          "ちょっと飲みます (Chotto nomimasu)",
          "ちょっと食べます (Chotto tabemasu)"
        ],
        correctIndex: 0,
        explanationHindi: "'Chotto matte kudasai' = कृपया ज़रा रुकिए।"
      },
      {
        question: "क्रिया के 'て-रूप' (Te-form) के बाद 'ください' लगाने से क्या भाव प्रकट होता है?",
        options: [
          "विनम्र अनुरोध (Please do...)",
          "कड़ा आदेश (Order)",
          "भूतकाल की घटना (Past event)",
          "नकारात्मक विचार (Negative thought)"
        ],
        correctIndex: 0,
        explanationHindi: "'〜てください' विनम्र अनुरोध (Polite request) का भाव देता है।"
      }
    ],
    needs_review: true
  }
];

fs.writeFileSync(
  path.join(contentDir, 'grammar.json'),
  JSON.stringify(grammarData, null, 2),
  'utf-8'
);
console.log(`Generated grammar.json with ${grammarData.length} core JLPT N5 points.`);
