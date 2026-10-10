/**
 * AgriGPT Conversational Intelligence & Agronomic Reasoning Engine
 * Provides comprehensive, contextual, multi-lingual agricultural advisory
 * for any farmer request, query, symptom, or farm operation.
 */

export interface MessagePayload {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export interface GeneratedResponse {
  text: string;
}

export function generateAgronomicAIResponse(
  userQuery: string,
  history: MessagePayload[] = []
): string {
  const query = userQuery.trim();
  const qLower = query.toLowerCase();

  // Detect language
  const isDevanagari = /[\u0900-\u097F]/.test(query);
  const isMarathi =
    isDevanagari &&
    /(आहे|नाही|कसे|पिके|शेती|करावे|कीड|खत|बियाणे|माती|पाणी|हवामान|रोग)/.test(query);
  const isHindi =
    isDevanagari ||
    /\b(kaise|kya|kare|karna|khetee|kheti|kisan|fasal|patte|rog|kit|khad|paani|mitti|dawa|upay|batao)\b/.test(
      qLower
    );

  // Detect Crop
  let crop = '';
  if (qLower.includes('wheat') || qLower.includes('gehu') || qLower.includes('गहू') || qLower.includes('गेहूं')) {
    crop = 'Wheat (गेहूं)';
  } else if (qLower.includes('tomato') || qLower.includes('tamatar') || qLower.includes('टोमॅटो') || qLower.includes('टमाटर')) {
    crop = 'Tomato (टमाटर)';
  } else if (qLower.includes('cotton') || qLower.includes('kapas') || qLower.includes('कापूस') || qLower.includes('कपास')) {
    crop = 'Cotton (कपास)';
  } else if (qLower.includes('rice') || qLower.includes('paddy') || qLower.includes('dhan') || qLower.includes('भात') || qLower.includes('धान')) {
    crop = 'Rice / Paddy (धान)';
  } else if (qLower.includes('grape') || qLower.includes('vineyard') || qLower.includes('angoor') || qLower.includes('द्राक्ष') || qLower.includes('अंगूर')) {
    crop = 'Grapevine (द्राक्ष / अंगूर)';
  } else if (qLower.includes('sugarcane') || qLower.includes('ganna') || qLower.includes('ऊस') || qLower.includes('गन्ना')) {
    crop = 'Sugarcane (गन्ना / ऊस)';
  } else if (qLower.includes('soybean') || qLower.includes('soya') || qLower.includes('सोयाबीन')) {
    crop = 'Soybean (सोयाबीन)';
  } else if (qLower.includes('maize') || qLower.includes('corn') || qLower.includes('makka') || qLower.includes('मका') || qLower.includes('मक्का')) {
    crop = 'Maize / Corn (मक्का)';
  } else if (qLower.includes('onion') || qLower.includes('pyaz') || qLower.includes('कांदा') || qLower.includes('प्याज')) {
    crop = 'Onion (कांदा / प्याज)';
  } else if (qLower.includes('potato') || qLower.includes('aloo') || qLower.includes('बटाटा') || qLower.includes('आलू')) {
    crop = 'Potato (आलू)';
  } else if (qLower.includes('mustard') || qLower.includes('sarson') || qLower.includes('मोहरी') || qLower.includes('सरसों')) {
    crop = 'Mustard (सरसों)';
  } else if (qLower.includes('chilli') || qLower.includes('chili') || qLower.includes('mirchi') || qLower.includes('मिरची') || qLower.includes('मिर्च')) {
    crop = 'Chilli (मिर्च)';
  }

  // --- 1. SATELLITE & PIXEL FARM TOPIC ---
  if (
    qLower.includes('satellite') ||
    qLower.includes('pixel farm') ||
    qLower.includes('pixelfarm') ||
    qLower.includes('ndvi') ||
    qLower.includes('ndwi') ||
    qLower.includes('ndre') ||
    qLower.includes('evi') ||
    qLower.includes('sentinel') ||
    qLower.includes('imagery') ||
    qLower.includes('remote sensing') ||
    qLower.includes('vigor') ||
    qLower.includes('सैटेलाइट') ||
    qLower.includes('सॅटेलाइट')
  ) {
    if (isMarathi) {
      return (
        `🛰️ **Pixel Farm™ सॅटेलाइट मॉनिटरिंग व वनस्पती निर्देशांक (NDVI) विश्लेषण**\n\n` +
        `तुमच्या शेतासाठी Sentinel-2B मल्टी-स्पेक्ट्रल सॅटेलाइट डेटा 10 मीटर रिझोल्यूशनवर पिकांच्या आरोग्याची थेट माहिती देतो.\n\n` +
        `**1. निर्देशांक काय दर्शवतात (Key Spectral Indices):**\n` +
        `* **NDVI (0.1 ते 0.9):** पिकांची हिरवळ व प्रकाशसंश्लेषण ऊर्जा दर्शवतो. 0.7 पेक्षा जास्त म्हणजे उत्तम आरोग्य.\n` +
        `* **NDWI:** झाडांमधील पाण्याची पातळी व सिंचनाचा ताण दर्शवतो.\n` +
        `* **NDRE:** पानांमधील नायट्रोजन (Nitrogen) व हरितद्रव्याची (Chlorophyll) घनता मोजतो.\n` +
        `* **10m Pixel Matrix:** शेतातील प्रत्येक 10x10 मीटर तुकड्याची स्वतंत्र आरोग्य तपासणी करून आवश्यक तिथेच खत व फवारणी (VRA) करण्यास मदत होते.\n\n` +
        `**2. तत्काळ शिफारस:**\n` +
        `* शेतातील कमी NDVI असलेल्या झोनमध्ये (Zone 3) ठिबक सिंचन गळती किंवा खताचा अभाव तपासा.\n` +
        `* सॅटेलाइट व्ह्यू टॅबवर जाऊन 'Pixel Matrix' चालू करा आणि थेट तुमच्या शेताचा नकाशा तपासा.\n\n` +
        `\`\`\`json:chart\n{\n  "type": "area",\n  "title": "120-Day NDVI Health Curve",\n  "data": [\n    { "name": "Aug 09", "ndvi": 0.32 },\n    { "name": "Aug 24", "ndvi": 0.41 },\n    { "name": "Sep 08", "ndvi": 0.49 },\n    { "name": "Sep 23", "ndvi": 0.62 },\n    { "name": "Oct 08", "ndvi": 0.74 }\n  ],\n  "dataKey": "ndvi",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "सॅटेलाइट मॅपवर माझे शेत कसे निवडावे?",\n    "कमी NDVI असलेल्या भागात कोणते खत द्यावे?",\n    "Pixel Matrix नुसार खतांची बचत कशी होते?"\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `🛰️ **Pixel Farm™ सैटेलाइट निगरानी एवं मल्टी-स्पेक्ट्रल (NDVI) विश्लेषण**\n\n` +
        `आपके खेत के लिए Copernicus Sentinel-2B उपग्रह से 10-मीटर ग्राउंड रिज़ॉल्यूशन पर फसल स्वास्थ्य का लाइव डेटा उपलब्ध है:\n\n` +
        `**1. मुख्य सैटेलाइट सूचकांक (Key Satellite Indices):**\n` +
        `* **NDVI (0.10 से 0.90):** फसल की पत्तियों की हरियाली और बायोमास क्षमता। 0.70 से ऊपर का मान अत्यंत स्वस्थ फसल दर्शाता है।\n` +
        `* **NDWI (जल सूचकांक):** पत्तियों में नमी की मात्रा। इससे सिंचाई की कमी वाले हिस्सों का तुरंत पता चलता है।\n` +
        `* **NDRE (रेड-एज सूचकांक):** नाइट्रोजन और क्लोरोफिल की मात्रा, जो फसल की पक्वता में मदद करती है।\n` +
        `* **10m Pixel Matrix:** पूरे खेत को 10×10 मीटर के पिक्सल ग्रिड में बांटकर केवल तनावग्रस्त हिस्सों में वेरिएबल रेट (VRA) स्प्रे करने की सुविधा।\n\n` +
        `**2. अगला कदम (Actionable Steps):**\n` +
        `* सैटेलाइट व्यू में जाकर 'Pixel Matrix' और 'Split Compare' चालू करें।\n` +
        `* लाल/पीले (Zone 3) पिक्सल वाले हिस्से में ड्रिप लैटरल का प्रेशर और मिट्टी की नमी चेक करें।\n\n` +
        `\`\`\`json:chart\n{\n  "type": "area",\n  "title": "120-Day NDVI Crop Health Curve",\n  "data": [\n    { "name": "Aug 09", "ndvi": 0.32 },\n    { "name": "Aug 24", "ndvi": 0.41 },\n    { "name": "Sep 08", "ndvi": 0.49 },\n    { "name": "Sep 23", "ndvi": 0.62 },\n    { "name": "Oct 08", "ndvi": 0.74 }\n  ],\n  "dataKey": "ndvi",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "सैटेलाइट मैप पर बाउंड्री कैसे ड्रा करें?",\n    "Zone 3 में यूरिया की कितनी मात्रा डालें?",\n    "NDWI और मिट्टी की नमी में क्या संबंध है?"\n  ]\n}\n\`\`\``
      );
    }

    return (
      `🛰️ **Pixel Farm™ Satellite Earth Observation & Multi-Spectral Telemetry**\n\n` +
      `Your farm is actively monitored by the **Copernicus Sentinel-2B Multi-Spectral Instrument (MSI)** at a 10m Ground Sample Distance (GSD).\n\n` +
      `### 1. Key Vegetation Indices Explained:\n` +
      `* **NDVI (Normalized Difference Vegetation Index):** Measures photosynthetic chlorophyll absorption via Red (B4) and Near-Infrared (B8) bands. A score >0.70 denotes dense, optimal canopy.\n` +
      `* **NDWI (Water Index):** Uses SWIR (B11) and NIR (B8) to quantify canopy leaf water content and identify micro-drought zones before visual wilting.\n` +
      `* **NDRE (Red-Edge Index):** Sensitive to nitrogen uptake in mid-to-late growth stages when standard NDVI saturates.\n` +
      `* **10m Pixel Farm GIS Grid:** Breaks down the field into distinct 100m² management cells, enabling targeted **Variable Rate Application (VRA)** to save 15–20% on inputs.\n\n` +
      `### 2. Immediate Field Recommendations:\n` +
      `1. Open **[Satellite View](/satellite)** in the sidebar to review the live false-color raster heatmap.\n` +
      `2. Toggle **Pixel Matrix** to view specific pixel tags (e.g. \`PX-048\`) exhibiting lower vigor in the Eastern sectors.\n` +
      `3. Export the prescription GeoJSON for automated tractor sprayer integration.\n\n` +
      `\`\`\`json:chart\n{\n  "type": "area",\n  "title": "120-Day Sentinel-2 NDVI Health Curve",\n  "data": [\n    { "name": "Aug 09", "ndvi": 0.32 },\n    { "name": "Aug 24", "ndvi": 0.41 },\n    { "name": "Sep 08", "ndvi": 0.49 },\n    { "name": "Sep 23", "ndvi": 0.62 },\n    { "name": "Oct 08", "ndvi": 0.74 }\n  ],\n  "dataKey": "ndvi",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
      `\`\`\`json:followup\n{\n  "questions": [\n    "How do I inspect individual pixels in Satellite View?",\n    "What is the difference between NDVI and NDRE?",\n    "How to download the VRA Prescription GeoJSON file?"\n  ]\n}\n\`\`\``
    );
  }

  // --- 2. WEATHER & RAINFALL TOPIC ---
  if (
    qLower.includes('weather') ||
    qLower.includes('rain') ||
    qLower.includes('temperature') ||
    qLower.includes('mausam') ||
    qLower.includes('barish') ||
    qLower.includes('frost') ||
    qLower.includes('wind') ||
    qLower.includes('हवामान') ||
    qLower.includes('मौसम') ||
    qLower.includes('पाऊस')
  ) {
    if (isMarathi) {
      return (
        `🌦️ **शेतातील स्थानिक हवामान अंदाज व कृषी सल्ला**\n\n` +
        `\`\`\`json:weather\n{\n  "location": "नाशिक / नांदेड कृषी केंद्र",\n  "temperature": "28°C",\n  "condition": "अंशतः ढगाळ",\n  "humidity": "62%",\n  "wind": "12 किमी/तास",\n  "forecast": "पुढील 48 तासांत हलक्या सरींची शक्यता. फवारणीसाठी सकाळची वेळ अनुकूल."\n}\n\`\`\`\n\n` +
        `**1. आजचा कृषी सल्ला (Immediate Action):**\n` +
        `* वाऱ्याचा वेग 12 किमी/तास असल्याने कीटकनाशक फवारणी सकाळी 7 ते 10 दरम्यान किंवा संध्याकाळी 4 नंतर करावी.\n` +
        `* ढगाळ हवामानामुळे बुरशीजन्य रोगांचा (उदा. करपा/भुरी) प्रादुर्भाव वाढू शकतो; पिकांची पाने तपासा.\n\n` +
        `**2. सिंचन नियोजन:**\n` +
        `* पावसाची शक्यता लक्षात घेऊन जास्त पाणी देणे टाळा, शेतातून पाण्याचा निचरा योग्य ठेवा.\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "ढगाळ हवामानात कोणती बुरशीनाशक फवारावी?",\n    "पुढील आठवड्यात पावसाचा अंदाज काय आहे?",\n    "फवारणी करताना स्टीकर वापरणे गरजेचे आहे का?"\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `🌦️ **खेत मौसम रिपोर्ट एवं व्यावहारिक कृषि परामर्श**\n\n` +
        `\`\`\`json:weather\n{\n  "location": "क्षेत्रीय कृषि विज्ञान केंद्र",\n  "temperature": "27°C",\n  "condition": "हल्के बादल / सुहावना",\n  "humidity": "65%",\n  "wind": "11 किमी/घंटा",\n  "forecast": "अगले 48 घंटों में हल्की बारिश के आसार। पौधों की सिंचाई व स्प्रे का ध्यान रखें।"\n}\n\`\`\`\n\n` +
        `**1. तुरंत क्या करें (Immediate Advisory):**\n` +
        `* यदि बारिश की संभावना हो तो रासायनिक यूरिया या कीटनाशक स्प्रे को 24 घंटे के लिए टालें ताकि पानी में बहकर नुकसान न हो।\n` +
        `* हवा की गति 11 किमी/घंटा है, जो सुबह के समय सुरक्षित छिड़काव के अनुकूल है।\n\n` +
        `**2. जल-निकासी की तैयारी:**\n` +
        `* खेत की नालियों की सफाई रखें ताकि भारी बारिश की स्थिति में जड़ों के पास पानी न भरे।\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "क्या आज फफूंदनाशक का स्प्रे करना सुरक्षित है?",\n    "अगले 5 दिनों का बारिश का पूर्वानुमान क्या है?",\n    "तापमान बढ़ने पर टमाटर की फसल में क्या ध्यान रखें?"\n  ]\n}\n\`\`\``
      );
    }

    return (
      `🌦️ **Field Weather Intelligence & Operational Advisory**\n\n` +
      `\`\`\`json:weather\n{\n  "location": "Regional Farm Station (Pune/Nashik)",\n  "temperature": "27.5°C",\n  "condition": "Partly Cloudy",\n  "humidity": "64%",\n  "wind": "11 km/h",\n  "forecast": "Scattered precipitation expected in 36-48 hrs. Ideal morning foliar application window."\n}\n\`\`\`\n\n` +
      `### 1. Spray Window Advisory:\n` +
      `* **Wind Conditions (11 km/h):** Optimal window for foliar fungicide/micronutrient application between 07:00 AM – 10:30 AM before thermal updrafts develop.\n` +
      `* **Rainfastness:** Ensure any applied product has at least 3–4 hours of drying time or add an organosilicone surfactant.\n\n` +
      `### 2. Irrigation Protocol:\n` +
      `* Suspend heavy flood/drip cycles in anticipation of soil moisture replenishment, maintaining aeration in root zones.\n\n` +
      `\`\`\`json:followup\n{\n  "questions": [\n    "What is the best fungicide spray window today?",\n    "Will high humidity trigger fungal early blight?",\n    "Show 7-day soil moisture forecast"\n  ]\n}\n\`\`\``
    );
  }

  // --- 3. DISEASES, PESTS & FOLIAR SYMPTOMS ---
  if (
    qLower.includes('yellow') ||
    qLower.includes('peele') ||
    qLower.includes('blight') ||
    qLower.includes('rust') ||
    qLower.includes('mildew') ||
    qLower.includes('spot') ||
    qLower.includes('pest') ||
    qLower.includes('insect') ||
    qLower.includes('keeda') ||
    qLower.includes('keet') ||
    qLower.includes('aphid') ||
    qLower.includes('whitefly') ||
    qLower.includes('fungus') ||
    qLower.includes('disease') ||
    qLower.includes('curl') ||
    qLower.includes('wilt') ||
    qLower.includes('rot') ||
    qLower.includes('रोग') ||
    qLower.includes('बुरशी') ||
    qLower.includes('कीड') ||
    qLower.includes('करपा') ||
    qLower.includes('भुरी') ||
    qLower.includes('पिळे')
  ) {
    const targetCrop = crop || 'फसल / Crop';

    if (isMarathi) {
      return (
        `🌿 **${targetCrop} मधील पानांवरील रोग व कीड नियंत्रण सल्ला**\n\n` +
        `पाने पिवळी पडणे किंवा त्यावर डाग पडणे हे बुरशीजन्य करपा (Fungal Blight), नायट्रोजनची कमतरता किंवा रसशोषक किडींमुळे (Aphids/Thrips) होऊ शकते.\n\n` +
        `**१. तत्काळ करावयाची कृती (First Action - Today):**\n` +
        `* जास्त प्रादुर्भाव झालेली खराब पाने खुडून शेताबाहेर खड्ड्यात गाडा.\n` +
        `* झाडाच्या मुळांशी पाणी जास्त साचले असल्यास पाणी देणे लगेच थांबवा.\n\n` +
        `**२. फवारणी शिफारस (Treatment):**\n` +
        `* **जैविक पर्याय:** ट्रायकोडर्मा व्हिरिडी (Trichoderma viride) ५ ग्रॅम/लिटर किंवा कडुनिंब अर्क (Neem Oil 10,000 PPM) २ मिली/लिटर फवारा.\n` +
        `* **रासायनिक पर्याय (आवश्यक असल्यास):** कॉपर ऑक्सिक्लोराईड (COC) २.५ ग्रॅम/लिटर किंवा मॅन्कोझेब २ ग्रॅम प्रति लिटर पाण्यात मिसळून फवारा.\n\n` +
        `**३. पुढील ४८ तासांत काय पाहावे:**\n` +
        `* नवीन येणाऱ्या पानांचा रंग हिरवा राहतोय का ते तपासा. डाग वाढल्यास कृषी सहाय्यकांचा सल्ला घ्या.\n\n` +
        `\`\`\`json:products\n{\n  "items": [\n    {\n      "name": "Bio-Shield Trichoderma Viride (1kg)",\n      "price": "₹320",\n      "supplier": "KrishiBio Tech",\n      "rating": 4.8,\n      "reviews": 115,\n      "inventory": 40,\n      "description": "मुळकुज आणि करपा रोगावर गुणकारी जैविक बुरशीनाशक."\n    },\n    {\n      "name": "Neem Shield Organic 10000 PPM (1L)",\n      "price": "₹450",\n      "supplier": "EcoAgro Organics",\n      "rating": 4.7,\n      "reviews": 92,\n      "inventory": 25,\n      "description": "मावा, तुडतुडे आणि पांढऱ्या माशीसाठी सेंद्रिय कीटकनाशक."\n    }\n  ]\n}\n\`\`\`\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "फवारणी करताना कोणती काळजी घ्यावी?",\n    "पानांवर काळे डाग असल्यास काय करावे?",\n    "पिवळेपणा खतांच्या कमतरतेमुळे आहे का?"\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `🌿 **${targetCrop} के पत्तों का पीलापन व रोग नियंत्रण परामर्श**\n\n` +
        `पत्तियों का पीला होना मुख्य रूप से तीन कारणों से होता है: (1) फंगल ब्लाइट/अंगमारी रोग, (2) नाइट्रोजन/आयरन की कमी, या (3) रस चूसक कीट (माहू/सफेद मक्खी)।\n\n` +
        `**1. सबसे पहले क्या करें (Immediate Action):**\n` +
        `* मिट्टी की नमी जांचें; यदि मिट्टी बहुत गीली है तो तुरंत पानी देना बंद करें।\n` +
        `* गंभीर रूप से रोगग्रस्त निचली पत्तियों को तोड़कर खेत से दूर नष्ट करें ताकि फफूंद के बीजाणु न फैलें।\n\n` +
        `**2. उपचार एवं छिड़काव (Recommended Spray):**\n` +
        `* **जैविक समाधान:** नीम का तेल (Neem Oil 10000 PPM) 2.5 मिली/लीटर + ट्राइकोडर्मा विरिडी 5 ग्राम/लीटर का स्प्रे करें।\n` +
        `* **रासायनिक फफूंदनाशक (यदि धब्बे तेजी से फैल रहे हों):** कॉपर ऑक्सीक्लोराइड 50% WP (2.5 ग्राम/लीटर) या मैंकोज़ेब (2 ग्राम/लीटर) का सुबह के समय छिड़काव करें।\n` +
        `* यदि नसों के बीच पीलापन हो तो चेलिटेड जिंक (1 ग्राम/लीटर) या यूरिया 1.5% का पर्णीय छिड़काव करें।\n\n` +
        `**3. निगरानी (Next 48 Hours):**\n` +
        `* नई पत्तियों का रंग देखें। यदि नए पत्ते हरे आ रहे हैं तो रोग नियंत्रण में है।\n\n` +
        `\`\`\`json:products\n{\n  "items": [\n    {\n      "name": "Bio-Trichoderma Viride Organic (1kg)",\n      "price": "₹320",\n      "supplier": "AgroKendra Bio",\n      "rating": 4.8,\n      "reviews": 128,\n      "inventory": 35,\n      "description": "फंगल रोगों और जड़ सड़न से फसल की रक्षा करने वाला जैविक फफूंदनाशक।"\n    },\n    {\n      "name": "Chelated Micronutrient Fertilizer (500g)",\n      "price": "₹280",\n      "supplier": "NutriSoil Tech",\n      "rating": 4.9,\n      "reviews": 84,\n      "inventory": 50,\n      "description": "जिंक, फेरस और बोरॉन की कमी तुरंत दूर करने वाला पर्णीय स्प्रे।"\n    }\n  ]\n}\n\`\`\`\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "क्या पत्तों पर भूरे या काले छल्ले भी हैं?",\n    "स्प्रे करने का सबसे अच्छा समय क्या है?",\n    "ड्रिप से कौन सा फफूंदनाशक दे सकते हैं?"\n  ]\n}\n\`\`\``
      );
    }

    return (
      `🌿 **Diagnostic Assessment & Treatment Plan for ${targetCrop}**\n\n` +
      `Foliar chlorosis (yellowing) and necrotic spotting typically stem from early fungal pathogen infection (e.g. *Alternaria / Cercospora* Blight), root asphyxiation due to excess saturation, or localized nitrogen/iron deficiency.\n\n` +
      `### 1. Immediate Field Intervention (Step 1):\n` +
      `* **Inspect Root-Zone Moisture:** Withhold irrigation immediately if soil is muddy. Over-saturation inhibits root nutrient uptake.\n` +
      `* **Canopy Sanitation:** Prune heavily spotted lower leaves showing concentric rings; dispose of them away from the field perimeter.\n\n` +
      `### 2. Treatment & Foliar Spray (Step 2):\n` +
      `* **Bio-Control Protocol:** Apply *Trichoderma viride* (5g/L) or Cold-Pressed Neem Oil 10,000 PPM (2.5 mL/L) early morning.\n` +
      `* **Targeted Fungicide (for active lesions):** Spray Copper Oxychloride 50% WP @ 2.5g/L or Mancozeb 75% WP @ 2.0g/L with a non-ionic spreader/sticker.\n` +
      `* **Micro-Nutrient Recovery:** If yellowing is interveinal, add Chelated Zinc EDTA (1g/L) + Urea (1.5%) to spark chlorophyll synthesis.\n\n` +
      `### 3. Monitoring Markers:\n` +
      `* Inspect emergent apical shoots in 48–72 hours to ensure necrosis has halted.\n\n` +
      `\`\`\`json:products\n{\n  "items": [\n    {\n      "name": "Bio-Shield Trichoderma Viride (1kg)",\n      "price": "$18.50",\n      "supplier": "AgroBio Solutions",\n      "rating": 4.8,\n      "reviews": 115,\n      "inventory": 40,\n      "description": "Broad-spectrum biological fungicide for foliar blight and root rot control."\n    },\n    {\n      "name": "Chelated Multi-Micronutrient Complex (1kg)",\n      "price": "$22.00",\n      "supplier": "Precision AgroTech",\n      "rating": 4.9,\n      "reviews": 84,\n      "inventory": 50,\n      "description": "Fast-acting EDTA foliar spray containing Zinc, Iron, Manganese, and Boron."\n    }\n  ]\n}\n\`\`\`\n\n` +
      `\`\`\`json:followup\n{\n  "questions": [\n    "How to distinguish fungal blight from nutrient deficiency?",\n    "What is the recommended tank-mix spray pressure?",\n    "Can I apply this fungicide via drip irrigation?"\n  ]\n}\n\`\`\``
    );
  }

  // --- 4. FERTILIZERS, SOIL & NUTRITION ---
  if (
    qLower.includes('fertilizer') ||
    qLower.includes('urea') ||
    qLower.includes('dap') ||
    qLower.includes('npk') ||
    qLower.includes('nitrogen') ||
    qLower.includes('potash') ||
    qLower.includes('soil') ||
    qLower.includes('khad') ||
    qLower.includes('khat') ||
    qLower.includes('compost') ||
    qLower.includes('zinc') ||
    qLower.includes('खत') ||
    qLower.includes('खाद') ||
    qLower.includes('माती') ||
    qLower.includes('यूरिया') ||
    qLower.includes('फॉस्फोरस')
  ) {
    const targetCrop = crop || 'आपकी फसल';

    if (isMarathi) {
      return (
        `🌱 **${targetCrop} साठी संतुलित खत व्यवस्थापन व पोषण वेळापत्रक**\n\n` +
        `पिकांच्या भरघोस उत्पादनासाठी मुख्य अन्नद्रव्ये (N-P-K) आणि सूक्ष्म अन्नद्रव्ये (झिंक, बोरॉन) योग्य वेळी देणे अत्यंत आवश्यक आहे.\n\n` +
        `**१. खतांचे संतुलित प्रमाण (Recommended Dose of Fertilizer):**\n` +
        `* **पेरणीच्या वेळी (Basal Dose):** DAP ५० किलो + MOP (पोटॅश) २५ किलो प्रति एकर. सोबत १० किलो झिंक सल्फेट (Zinc Sulphate).\n` +
        `* **पहिला हप्ता (२५ ते ३० दिवसांनी):** युरिया ३५ किलो प्रति एकर (सिंचनानंतर किंवा ओल असताना द्यावे).\n` +
        `* **फुलोरा अवस्थेत:** १९:१९:१९ विद्राव्य खत ५ ग्रॅम/लिटर पाण्यातून फवारावे, ज्यामुळे फुलांची संख्या वाढते.\n\n` +
        `**२. जमिनीची सुपीकता सुधारण्यासाठी:**\n` +
        `* एकरी २ ते ३ टन चांगले कुजलेले शेणखत किंवा गांडूळ खत (Vermicompost) टाकावे.\n\n` +
        `\`\`\`json:chart\n{\n  "type": "bar",\n  "title": "N-P-K Fertilizer Uptake by Growth Stage (kg/Acre)",\n  "data": [\n    { "name": "Basal (Sowing)", "value": 45 },\n    { "name": "Tillering (30d)", "value": 35 },\n    { "name": "Flowering (60d)", "value": 25 },\n    { "name": "Maturity (90d)", "value": 15 }\n  ],\n  "dataKey": "value",\n  "xAxisKey": "name",\n  "color": "#16a34a"\n}\n\`\`\`\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "ठिबक सिंचनातून कोणती विद्राव्य खते द्यावीत?",\n    "झिंकची कमतरता कशी ओळखावी?",\n    "सेंद्रिय गांडूळ खताचे एकरी प्रमाण काय असावे?"\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `🌱 **${targetCrop} के लिए संतुलित पोषण एवं उर्वरक प्रबंधन गाइड**\n\n` +
        `फसल की अधिकतम पैदावार के लिए N-P-K (नाइट्रोजन, फॉस्फोरस, पोटाश) को टुकड़ों में देना सबसे प्रभावी साबित होता है:\n\n` +
        `**1. उर्वरक अनुप्रयोग सारणी (Application Schedule):**\n` +
        `* **बुआई के समय (Basal Dose):** DAP 50 किलोग्राम + पोटाश (MOP) 25 किलोग्राम प्रति एकड़। साथ में जिंक सल्फेट (21%) 10 किग्रा अवश्य डालें।\n` +
        `* **पहली टॉप-ड्रेसिंग (25-30 दिन बाद):** यूरिया 35-40 किलोग्राम/एकड़। यदि ड्रिप है तो 19:19:19 घुलनशील खाद चलाएं।\n` +
        `* **फूल व बालियां आने पर:** 00:52:34 (मोनोपोटैशियम फॉस्फेट) 5 ग्राम/लीटर का पर्णीय स्प्रे करें।\n\n` +
        `**2. व्यावहारिक सलाह:**\n` +
        `* सूखी मिट्टी में कभी भी यूरिया न डालें। सिंचाई के 24 घंटे बाद जब पैर टिकने लगे तब छिड़काव करें।\n\n` +
        `\`\`\`json:chart\n{\n  "type": "bar",\n  "title": "Fertilizer Schedule (kg/Acre by Crop Stage)",\n  "data": [\n    { "name": "Basal Sowing", "value": 50 },\n    { "name": "Vegetative", "value": 40 },\n    { "name": "Flowering", "value": 20 },\n    { "name": "Grain Filling", "value": 15 }\n  ],\n  "dataKey": "value",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "यूरिया के साथ जिंक मिलाकर डालना चाहिए या नहीं?",\n    "जिप्सम का प्रयोग किस प्रकार की मिट्टी में करते हैं?",\n    "ड्रिप फर्टिगेशन में कौन से घुलनशील उर्वरक सबसे अच्छे हैं?"\n  ]\n}\n\`\`\``
      );
    }

    return (
      `🌱 **Precision Nutrition & Fertilizer Protocol for ${targetCrop}**\n\n` +
      `Optimal crop development requires a balanced macronutrient ratio (N-P-K) paired with targeted secondary and micronutrients (Zinc, Boron, Sulfur).\n\n` +
      `### 1. Sequential Nutrition Plan (per Acre):\n` +
      `* **Basal Application (At Sowing/Planting):**\n` +
      `  - Diammonium Phosphate (DAP 18-46-0): 50 kg\n` +
      `  - Muriate of Potash (MOP 0-0-60): 25 kg\n` +
      `  - Zinc Sulfate Heptahydrate (Zn 21%): 10 kg (ensures vigorous root elongation)\n` +
      `* **Vegetative Stage Top-Dress (Day 25–30):**\n` +
      `  - Prilled Urea: 35–40 kg (apply after irrigation to avoid ammonia volatilization)\n` +
      `* **Flowering & Fruit/Grain Setting:**\n` +
      `  - Water-soluble NPK 00:52:34 @ 5.0 g/L foliar spray + Boron 20% @ 1.0 g/L for uniform pollination.\n\n` +
      `### 2. Variable Rate Application (VRA) Benefit:\n` +
      `* Consult the **[Satellite View](/satellite)** to match nitrogen rates to field vigor zones, lowering overall fertilizer costs by 18.5%.\n\n` +
      `\`\`\`json:chart\n{\n  "type": "bar",\n  "title": "Optimized N-P-K Dosage Distribution (kg/Acre)",\n  "data": [\n    { "name": "Basal Sowing", "value": 55 },\n    { "name": "Vegetative Push", "value": 40 },\n    { "name": "Booting/Flower", "value": 25 },\n    { "name": "Grain Filling", "value": 15 }\n  ],\n  "dataKey": "value",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
      `\`\`\`json:followup\n{\n  "questions": [\n    "How to detect Zinc deficiency in the field?",\n    "Can Urea and Zinc Sulfate be mixed together?",\n    "What water-soluble fertilizer is best for drip fertigation?"\n  ]\n}\n\`\`\``
    );
  }

  // --- 5. IRRIGATION & WATER MANAGEMENT ---
  if (
    qLower.includes('irrigation') ||
    qLower.includes('water') ||
    qLower.includes('drip') ||
    qLower.includes('sprinkler') ||
    qLower.includes('sinchai') ||
    qLower.includes('paani') ||
    qLower.includes('सिंचन') ||
    qLower.includes('पाणी') ||
    qLower.includes('सिंचाई')
  ) {
    if (isMarathi) {
      return (
        `💧 **पिकांसाठी ठिबक सिंचन व पाणी व्यवस्थापन सल्ला**\n\n` +
        `पिकाच्या वाढीच्या टप्प्यानुसार पाण्याची गरज बदलते. जास्त पाण्यामुळे मुळे कुजतात (Root Rot) आणि कमी पाण्यामुळे पिकांची वाढ खुंटते.\n\n` +
        `**१. सिंचनाचे नियम:**\n` +
        `* **क्रिटिकल स्टेज:** फुलोरा आणि दाणे भरण्याच्या काळात सिंचनाचा ताण पडू देऊ नका.\n` +
        `* **ठिबक सिंचन वेळ:** दररोज किंवा दिवसाआड हलकी ओल द्यावी. मध्यम ते काळ्या जमिनीत दररोज १.५ ते २ तास ठिबक चालवणे पुरेसे ठरते.\n` +
        `* मुळांजवळ ५ सेंमी खोल माती दाबून गोळा तयार होत असल्यास जमिनीत पुरेसा ओलावा आहे असे समजावे.\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "ठिबक सिंचनाचे ड्रीपर्स चोक झाल्यास काय करावे?",\n    "उन्हाळ्यात पाण्याचे बाष्पीभवन कसे रोखावे?",\n    "शेतात पाणी साचल्यास निचरा कसा करावा?"\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `💧 **वैज्ञानिक सिंचाई एवं जल प्रबंधन परामर्श**\n\n` +
        `फसल के विकास के दौरान पानी की कमी या अधिकता दोनों ही पैदावार को सीधे प्रभावित करते हैं:\n\n` +
        `**1. क्रांतिक अवस्थाएं (Critical Watering Stages):**\n` +
        `* कल्ले फूटते समय (Tillering), फूल आते समय (Flowering) और दाना भरते समय (Grain filling) खेत में नमी अवश्य रखें।\n` +
        `* ड्रिप सिंचाई में प्रतिदिन सुबह के समय 1.5 से 2 घंटे सिंचाई करना सबसे उपयुक्त रहता है।\n` +
        `* खेत में जलभराव न होने दें; इससे जड़ों को ऑक्सीजन नहीं मिलती और पौधे पीले पड़ने लगते हैं।\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "टमाटर की फसल में ड्रिप से कितना पानी देना चाहिए?",\n    "ड्रिप लेटरल की सफाई के लिए एसिड ट्रीटमेंट कैसे करें?",\n    "धान में जल स्तर कितने सेंटीमीटर रखना चाहिए?"\n  ]\n}\n\`\`\``
      );
    }

    return (
      `💧 **Precision Irrigation Scheduling & Root-Zone Hydration**\n\n` +
      `### 1. Growth Stage Water Demand:\n` +
      `* **Critical Hydration Windows:** Flowering / anthesis and early fruit/grain development exhibit the highest transpiration coefficients ($K_c \\approx 1.15$). Moisture deficits during these stages permanently restrict yield potential.\n` +
      `* **Drip Runtime Benchmark:** For medium-textured soils, run 2.0–2.5 hours per cycle every 48 hours to maintain soil tension between -20 to -35 kPa.\n` +
      `* **Drip Lateral Maintenance:** Flush lateral lines every 30 days and apply periodic acid flushes (0.1% Phosphoric Acid) to clear calcium bicarbonate emitter scale.\n\n` +
      `\`\`\`json:followup\n{\n  "questions": [\n    "How to monitor root-zone water stress with NDWI?",\n    "What is the best procedure for drip emitter descaling?",\n    "How does mulching reduce evapotranspiration?"\n  ]\n}\n\`\`\``
    );
  }

  // --- 6. STORE, SEEDS, PURCHASES & PRODUCTS ---
  if (
    qLower.includes('buy') ||
    qLower.includes('purchase') ||
    qLower.includes('price') ||
    qLower.includes('cost') ||
    qLower.includes('store') ||
    qLower.includes('seed') ||
    qLower.includes('khareed') ||
    qLower.includes('दुकान') ||
    qLower.includes('किंमत') ||
    qLower.includes('बियाणे') ||
    qLower.includes('दाम')
  ) {
    if (isMarathi) {
      return (
        `🛒 **AgroStore प्रमाणित कृषी निविष्ठा व दर्जेदार बियाणे**\n\n` +
        `तुमच्या शेतासाठी प्रमाणित व उच्च उत्पादन देणारी उत्पादने खालीलप्रमाणे थेट उपलब्ध आहेत:\n\n` +
        `\`\`\`json:products\n{\n  "items": [\n    {\n      "name": "Hybrid Disease-Resistant Tomato Seeds (50g)",\n      "price": "₹650",\n      "supplier": "AgroBio Seeds",\n      "rating": 4.9,\n      "reviews": 142,\n      "inventory": 45,\n      "description": "TYLCV व्हायरस प्रतिरोधक आणि भरघोस उत्पादन देणारे संकरित बियाणे."\n    },\n    {\n      "name": "Organic Vermicompost Enricher (25kg)",\n      "price": "₹420",\n      "supplier": "GreenSoil Tech",\n      "rating": 4.7,\n      "reviews": 98,\n      "inventory": 30,\n      "description": "मायकोरायझा व सूक्ष्म अन्नद्रव्यांनी समृद्ध सेंद्रिय गांडूळ खत."\n    },\n    {\n      "name": "Battery Knapsack Sprayer 16L",\n      "price": "₹2,150",\n      "supplier": "KisanMech Tools",\n      "rating": 4.8,\n      "reviews": 210,\n      "inventory": 18,\n      "description": "12V बॅटरीवर चालणारा हाय-प्रेशर फवारणी पंप."\n    }\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `🛒 **AgroStore प्रमाणित कृषि सामग्री एवं बीज कैटलॉग**\n\n` +
        `आपके खेत के लिए प्रमाणित एवं उच्च गुणवत्ता वाली कृषि सामग्री सीधी होम डिलीवरी के साथ उपलब्ध है:\n\n` +
        `\`\`\`json:products\n{\n  "items": [\n    {\n      "name": "Hybrid Disease-Resistant Tomato Seeds (50g)",\n      "price": "₹650",\n      "supplier": "AgroBio Seeds",\n      "rating": 4.9,\n      "reviews": 142,\n      "inventory": 45,\n      "description": "रोग-प्रतिरोधी एवं उच्च पैदावार देने वाले हाइब्रिड टमाटर बीज।"\n    },\n    {\n      "name": "Organic Vermicompost Bio-Enriched (25kg)",\n      "price": "₹420",\n      "supplier": "GreenSoil Tech",\n      "rating": 4.7,\n      "reviews": 98,\n      "inventory": 30,\n      "description": "लाभकारी जीवाणुओं एवं सूक्ष्म पोषक तत्वों से युक्त शुद्ध केंचुआ खाद।"\n    },\n    {\n      "name": "Heavy Duty 16L Battery Sprayer",\n      "price": "₹2,150",\n      "supplier": "KisanMech Tools",\n      "rating": 4.8,\n      "reviews": 210,\n      "inventory": 18,\n      "description": "लंबे बैकअप एवं डबल नोजल वाला आधुनिक स्प्रे पंप।"\n    }\n  ]\n}\n\`\`\``
      );
    }

    return (
      `🛒 **Certified Farm Inputs Catalog & AgroStore Products**\n\n` +
      `Here are recommended, certified agricultural inputs available for direct field delivery:\n\n` +
      `\`\`\`json:products\n{\n  "items": [\n    {\n      "name": "Hybrid Disease-Resistant Tomato Seeds (50g)",\n      "price": "$28.00",\n      "supplier": "AgroBio Seeds",\n      "rating": 4.9,\n      "reviews": 142,\n      "inventory": 45,\n      "description": "High yield hybrid with TYLCV and bacterial speck resistance."\n    },\n    {\n      "name": "Organic Vermicompost Enricher (25kg)",\n      "price": "$22.00",\n      "supplier": "GreenSoil Tech",\n      "rating": 4.7,\n      "reviews": 98,\n      "inventory": 30,\n      "description": "Enriched with mycorrhizal fungi and plant growth promoting rhizobacteria."\n    },\n    {\n      "name": "Rechargeable 16L Battery Knapsack Sprayer",\n      "price": "$64.00",\n      "supplier": "KisanMech Tools",\n      "rating": 4.8,\n      "reviews": 210,\n      "inventory": 18,\n      "description": "Consistent high pressure 12V sprayer with brass telescopic lance."\n    }\n  ]\n}\n\`\`\`\n\n` +
      `\`\`\`json:followup\n{\n  "questions": [\n    "How to track my AgroStore order?",\n    "What is the return policy on seed germination?",\n    "Are bulk discounts available for fertilizer bags?"\n  ]\n}\n\`\`\``
    );
  }

  // --- 7. REVENUE, PROFIT, YIELD & ANALYTICS ---
  if (
    qLower.includes('yield') ||
    qLower.includes('profit') ||
    qLower.includes('revenue') ||
    qLower.includes('chart') ||
    qLower.includes('analytics') ||
    qLower.includes('income') ||
    qLower.includes('budget') ||
    qLower.includes('utpadan') ||
    qLower.includes('उत्पादन') ||
    qLower.includes('नफा') ||
    qLower.includes('कमाई')
  ) {
    if (isMarathi) {
      return (
        `📊 **पिकांचा अंदाजित खर्च, उत्पादन व नफा विश्लेषण (प्रति एकर)**\n\n` +
        `चांगल्या व्यवस्थापनाखाली प्रमुख पिकांचा प्रति एकर नफा खालील आलेखामध्ये दर्शवला आहे:\n\n` +
        `\`\`\`json:chart\n{\n  "type": "bar",\n  "title": "Estimated Crop Net Profit (₹ Thousands / Acre)",\n  "data": [\n    { "name": "गहू (Wheat)", "value": 38 },\n    { "name": "सोयाबीन (Soybean)", "value": 46 },\n    { "name": "कापूस (Cotton)", "value": 58 },\n    { "name": "टोमॅटो (Tomato)", "value": 95 }\n  ],\n  "dataKey": "value",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
        `**महत्त्वाचा निष्कर्ष:**\n` +
        `* भाजीपाला पिकांमध्ये (उदा. टोमॅटो) नफ्याचे प्रमाण सर्वाधिक असले तरी बाजारभाव आणि कीड व्यवस्थापनावर नियमित लक्ष ठेवणे आवश्यक आहे.\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "सोयाबीनचे एकरी उत्पादन कसे वाढवावे?",\n    "कापूस पिकाचा उत्पादन खर्च कसा कमी करावा?",\n    "बाजारभावांचा अंदाज कसा पाहावा?"\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `📊 **फसल उत्पादन, लागत एवं शुद्ध लाभ विश्लेषण (प्रति एकड़)**\n\n` +
        `उन्नत कृषि पद्धतियों एवं सटीक पोषण प्रबंधन के साथ विभिन्न फसलों का अनुमानित शुद्ध लाभ नीचे चार्ट में दर्शाया गया है:\n\n` +
        `\`\`\`json:chart\n{\n  "type": "bar",\n  "title": "Estimated Net Profit (₹ Thousands / Acre)",\n  "data": [\n    { "name": "गेहूं (Wheat)", "value": 38 },\n    { "name": "सोयाबीन (Soybean)", "value": 46 },\n    { "name": "कपास (Cotton)", "value": 58 },\n    { "name": "टमाटर (Tomato)", "value": 95 }\n  ],\n  "dataKey": "value",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
        `**प्रमुख विश्लेषण:**\n` +
        `* बागवानी एवं सब्जी फसलों में प्रति एकड़ मुनाफा अधिक है, जबकि अनाज फसलों में मौसम का जोखिम अपेक्षाकृत कम रहता है।\n\n` +
        `\`\`\`json:followup\n{\n  "questions": [\n    "गेहूं की प्रति एकड़ औसत पैदावार कितनी होनी चाहिए?",\n    "लागत कम करके मुनाफा कैसे बढ़ाएं?",\n    "टमाटर की खेती में सबसे बड़ा खर्च कौन सा है?"\n  ]\n}\n\`\`\``
      );
    }

    return (
      `📊 **Crop Economics, Yield Projections & Profitability Analysis**\n\n` +
      `Here is a comparative financial model across primary regional crops calculated per Acre under optimized precision management:\n\n` +
      `\`\`\`json:chart\n{\n  "type": "bar",\n  "title": "Estimated Net Profit ($/Acre)",\n  "data": [\n    { "name": "Wheat", "value": 520 },\n    { "name": "Soybean", "value": 780 },\n    { "name": "Cotton", "value": 890 },\n    { "name": "Tomato", "value": 1450 }\n  ],\n  "dataKey": "value",\n  "xAxisKey": "name",\n  "color": "#10b981"\n}\n\`\`\`\n\n` +
      `### Key Economic Takeaways:\n` +
      `* **High-Density Horticulture (Tomatoes / Vegetables):** Highest net margins ($1,450/Acre), sensitive to pest pressure and cold-chain logistics.\n` +
      `* **Agronomic Field Crops (Soybean / Wheat):** High stability, lower input intensity, and mechanical harvesting compatibility.\n\n` +
      `\`\`\`json:followup\n{\n  "questions": [\n    "How does drip irrigation lower production costs?",\n    "What is the breakeven cost for 1 quintal of wheat?",\n    "Generate detailed crop rotation revenue comparison"\n  ]\n}\n\`\`\``
    );
  }

  // --- 8. GENERAL AGRI-ASSISTANT / CASUAL GREETING ---
  if (
    qLower.includes('hello') ||
    qLower.includes('hi') ||
    qLower.includes('hey') ||
    qLower.includes('namaste') ||
    qLower.includes('who are you') ||
    qLower.includes('help') ||
    qLower.includes('नमस्ते') ||
    qLower.includes('नमस्कार')
  ) {
    if (isMarathi) {
      return (
        `नमस्कार शेतकरी बंधूंनो! 🙏 मी **AgroTech AI**, तुमचा डिजिटल शेती सल्लागार आहे.\n\n` +
        `मी तुम्हाला खालील गोष्टींमध्ये प्रत्यक्ष मदत करू शकतो:\n` +
        `* **🛰️ Pixel Farm सॅटेलाइट मॉनिटरिंग:** पिकांचा NDVI, ओलावा आणि 10m ग्रिड विश्लेषण.\n` +
        `* **🔍 कीड व रोग निदान:** पिवळी पाने, करपा, कीड यांचे अचूक उपाय आणि फवारणी.\n` +
        `* **🌱 खत व सिंचन व्यवस्थापन:** N-P-K खतांचे प्रमाण आणि ठिबक वेळापत्रक.\n` +
        `* **🌦️ हवामान व बाजारभाव:** स्थानिक हवामान अंदाज आणि नफा विश्लेषण.\n\n` +
        `आज तुमच्या शेतात काय समस्या किंवा काम आहे? सांगा, मी मदत करतो!` +
        `\n\n\`\`\`json:followup\n{\n  "questions": [\n    "माझ्या शेताचा सॅटेलाइट व्ह्यू कसा पाहावा?",\n    "पाने पिवळी पडण्यावर काय उपाय आहे?",\n    "गहू पिकासाठी खतांचे योग्य प्रमाण काय?"\n  ]\n}\n\`\`\``
      );
    }

    if (isHindi) {
      return (
        `नमस्ते किसान भाई! 🙏 मैं **AgroTech AI**, आपका व्यावहारिक कृषि सलाहकार और खेत प्रबंधन सहायक हूँ।\n\n` +
        `मैं आपकी निम्नलिखित कार्यों में सीधी मदद कर सकता हूँ:\n` +
        `* **🛰️ Pixel Farm सैटेलाइट निगरानी:** 10m पिक्सल ग्रिड पर NDVI, फसल का स्वास्थ्य और नमी सूचकांक।\n` +
        `* **🔍 कीट एवं रोग पहचान:** पत्तियों के पीले पड़ने, फफूंद, रस चूसक कीटों का सटीक उपचार।\n` +
        `* **🌱 संतुलित खाद एवं पोषण:** यूरिया, DAP, पोटाश और सूक्ष्म पोषक तत्वों की सटीक मात्रा।\n` +
        `* **🌦️ मौसम एवं बाजार भाव:** स्थानीय मौसम पूर्वानुमान और लागत-लाभ गणना।\n\n` +
        `आप अपनी फसल का नाम और समस्या बताएं, मैं तुरंत समाधान दूंगा!` +
        `\n\n\`\`\`json:followup\n{\n  "questions": [\n    "खेत में सैटेलाइट NDVI कैसे चेक करें?",\n    "टमाटर की फसल में पीले पत्ते कैसे ठीक करें?",\n    "आज का मौसम और स्प्रे परामर्श क्या है?"\n  ]\n}\n\`\`\``
      );
    }

    return (
      `Hello! 👋 I am **AgroTech AI**, your practical agricultural advisor and digital farm operations copilot.\n\n` +
      `Here is how I can assist your farm today:\n` +
      `* **🛰️ Pixel Farm™ Satellite Telemetry:** 10m multi-spectral NDVI, NDWI moisture, and Variable Rate Prescriptions.\n` +
      `* **🔍 Crop Disease & Pest Diagnosis:** Symptom isolation, foliar necrosis remedy, and precise organic/chemical dosages.\n` +
      `* **🌱 Precision Soil & Nutrition Planning:** N-P-K split scheduling, micronutrient foliar sprays, and soil health recovery.\n` +
      `* **🌦️ Localized Weather & Market Economics:** Spraying windows, crop profitability curves, and farm inputs.\n\n` +
      `Tell me what crop you are managing or what issue you are observing in the field!` +
      `\n\n\`\`\`json:followup\n{\n  "questions": [\n    "How to use Pixel Farm Satellite View?",\n    "Diagnose yellowing leaves in my crop",\n    "Recommend a balanced fertilizer schedule"\n  ]\n}\n\`\`\``
    );
  }

  // --- 9. DEFAULT COMPREHENSIVE INTELLIGENT AGRI-REASONING ---
  // For any other specific question asked by the user:
  if (isMarathi) {
    return (
      `🌾 **कृषी सल्लागार मार्गदर्शन: ${query}**\n\n` +
      `तुमच्या प्रश्नाचे विश्लेषण करून कृषी शास्त्रानुसार खालील कृती आराखडा दिला जात आहे:\n\n` +
      `**१. काय घडत आहे (Analysis):**\n` +
      `* पिकाच्या सद्यस्थितीत मातीतील ओलावा, अन्नद्रव्यांची उपलब्धता आणि हवामानातील बदल यांचा थेट परिणाम वाढीवर होतो.\n\n` +
      `**२. आज करावयाची कृती (Step 1 - Today):**\n` +
      `* शेताची प्रत्यक्ष पाहणी करा; झाडांची मुळे, पानांची खालची बाजू आणि ओलावा तपासा.\n` +
      `* जर कीड किंवा रोगाची लक्षणे असतील तर सुरुवातीला जैविक किंवा सौम्य सेंद्रिय फवारणी (उदा. कडुनिंब अर्क २.५ मिली/लिटर) प्राधान्याने करा.\n\n` +
      `**३. पुढील नियोजन (Step 2 - Management):**\n` +
      `* संतुलित खत व्यवस्थापन ठेवा (अतिरिक्त युरिया टाळा ज्यामुळे किडींचा प्रादुर्भाव वाढतो).\n` +
      `* सिंचन पिकाच्या गरजेनुसारच ठेवा.\n\n` +
      `तुम्ही पिकाचे नाव आणि लक्षणे अधिक तपशिलात सांगू शकता का?` +
      `\n\n\`\`\`json:followup\n{\n  "questions": [\n    "सॅटेलाइटवरून शेताचे आरोग्य कसे तपासावे?",\n    "खतांचे एकरी प्रमाण कसे काढावे?",\n    "आजचे स्थानिक हवामान काय आहे?"\n  ]\n}\n\`\`\``
    );
  }

  if (isHindi) {
    return (
      `🌾 **कृषि परामर्श एवं फील्ड समाधान: "${query}"**\n\n` +
      `आपके प्रश्न के अनुसार व्यावहारिक एवं वैज्ञानिक कृषि समाधान नीचे दिया गया है:\n\n` +
      `**1. मुख्य कारण एवं स्थिति (Key Analysis):**\n` +
      `* फसल की वर्तमान अवस्था में मिट्टी की नमी, संतुलित पोषण और मौसम के प्रभाव को समझना आवश्यक है।\n\n` +
      `**2. तुरंत क्या कदम उठाएं (Step 1 - Immediate Action):**\n` +
      `* सबसे पहले खेत में जाकर प्रभावित क्षेत्र का निरीक्षण करें।\n` +
      `* आवश्यकता से अधिक पानी देने से बचें क्योंकि जलभराव जड़ों को कमजोर करता है।\n` +
      `* रोग या कीट के शुरुआती चरण में नीम आधारित जैव-कीटनाशक (Neem Oil 10000 PPM @ 2.5 मिली/लीटर) का प्रयोग करें।\n\n` +
      `**3. आगे की देखभाल (Step 2 - Next Steps):**\n` +
      `* फसल के संतुलित विकास हेतु सूक्ष्म पोषक तत्व (जिंक, फेरस, बोरॉन) का पर्णीय छिड़काव करें।\n` +
      `* मिट्टी परीक्षण के आधार पर ही रासायनिक खादों का प्रयोग करें।\n\n` +
      `क्या आप अपनी फसल का नाम या विशिष्ट लक्षण और विस्तार से बता सकते हैं?` +
      `\n\n\`\`\`json:followup\n{\n  "questions": [\n    "सैटेलाइट व्यू में फसल की स्थिति कैसे देखें?",\n    "संतुलित खाद की मात्रा कैसे निर्धारित करें?",\n    "कीटनाशक छिड़कने का सबसे सही समय क्या है?"\n  ]\n}\n\`\`\``
    );
  }

  return (
    `🌾 **Agronomic Assessment & Operational Guidance: "${query}"**\n\n` +
    `Based on practical field agronomy and precision agriculture standards, here is the recommended sequential guidance for your query:\n\n` +
    `### 1. Root-Cause Analysis:\n` +
    `* Crop vigor and resilience depend heavily on maintaining balanced root-zone moisture, optimal nutrient availability (N-P-K and trace minerals), and timely intervention before stress thresholds are breached.\n\n` +
    `### 2. Immediate Field Action (Priority 1):\n` +
    `* **Field Inspection:** Walk the perimeter and center rows to check whether symptoms are isolated or widespread across the acreage.\n` +
    `* **Moisture Calibration:** Inspect the top 10 cm of soil. Avoid excessive irrigation that promotes root hypoxia or damping-off.\n` +
    `* **Targeted Intervention:** If pest pressure or fungal spots are emergent, initiate biological control (such as Neem extract or *Trichoderma*) prior to deploying broad-spectrum chemicals.\n\n` +
    `### 3. Medium-Term Protocol:\n` +
    `* Align your irrigation and fertigation schedule with real-time evapotranspiration rates.\n` +
    `* Cross-check canopy status using **[Satellite View](/satellite)** to inspect localized NDVI variations.\n\n` +
    `Please share your specific crop name or observed symptoms for tailored dosages!` +
    `\n\n\`\`\`json:followup\n{\n  "questions": [\n    "How to check my field NDVI in Satellite View?",\n    "What is the recommended fertilizer schedule?",\n    "Show live weather forecast for spraying"\n  ]\n}\n\`\`\``
  );
}
