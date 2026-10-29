// Sample city taste profiles for the preview and for sample mode.
// Always shown with a "Sample" label. Real profiles come from Qloo.

const tr = (pairs) => pairs.map(([name, affinity]) => ({ name, affinity }));
const steps = (city, n) => [
  { name: `Taste words for people in ${city}`, tool: "Qloo /v2/insights (tag)", ok: true, detail: `${n.tags} results` },
  { name: `Brands people in ${city} like`, tool: "Qloo /v2/insights (brand)", ok: true, detail: `${n.brands} results` },
  { name: `Music people in ${city} like`, tool: "Qloo /v2/insights (artist)", ok: true, detail: `${n.artists} results` },
  { name: `Places in ${city}`, tool: "Qloo /v2/insights (place)", ok: true, detail: `${n.places} results` },
  { name: `Brands trending in ${city}`, tool: "Qloo /v2/insights (brand, trends)", ok: true, detail: `${n.trending} results` },
  { name: "Age and gender tendencies", tool: "Qloo /v2/insights (demographics)", ok: true, detail: "Age bands with affinity" },
  { name: "Turn the profile into product ideas", tool: "AI", ok: true, detail: "summary, opportunities, cautions" },
];

const DATA = {
  melbourne: {
    city: "Melbourne", country: { en: "Australia", id: "Australia" },
    taste_tags: tr([["Specialty coffee", 0.95], ["Brunch", 0.9], ["Sustainable", 0.86], ["Street art", 0.82], ["Minimalist", 0.78], ["Vintage", 0.74], ["Plant-based", 0.71], ["Craft beer", 0.68]]),
    brands: ["Aesop", "Patagonia", "Kinfolk", "Fellow", "Allbirds", "Muji"], trending_brands: ["Ozone Coffee", "Frank Green", "Mr Simple"],
    artists: ["Tame Impala", "Khruangbin", "Angus & Julia Stone"], places: ["Market Lane Coffee", "Queen Victoria Market", "Seven Seeds"],
    demographics: [{ label: "18–24", value: 0.62 }, { label: "25–34", value: 0.91 }, { label: "35–44", value: 0.78 }, { label: "45–54", value: 0.55 }, { label: "55+", value: 0.38 }],
    en: { summary: "This audience tends to treat coffee and food as everyday culture, values sustainability, and leans toward calm, design-led brands over loud ones.",
      opp: [["food", "Single-origin coffee kits", "Small-batch Indonesian beans sold with origin cards and brew guides for home brewers.", "Fits the strong specialty coffee and brunch signals.", ["Specialty coffee", "Fellow", "Market Lane Coffee"]],
        ["food", "Plant-based snack range", "Tempeh chips or coconut-based snacks with clean packaging.", "Matches the plant-based and sustainable leanings.", ["Plant-based", "Sustainable"]],
        ["fashion", "Natural-dye everyday wear", "Simple shirts or tote bags in natural indigo with minimal branding.", "Echoes the minimalist and sustainable taste.", ["Minimalist", "Patagonia", "Allbirds"]],
        ["fashion", "Vintage-inspired batik accessories", "Scarves and bandanas using older batik motifs in muted colours.", "Connects with the vintage and street art signals.", ["Vintage", "Street art"]],
        ["craft", "Ceramic coffee ware", "Hand-thrown cups and pour-over drippers in earthy glazes.", "Complements specialty coffee rituals.", ["Specialty coffee", "Kinfolk"]],
        ["craft", "Rattan home accents", "Small rattan trays and planters for apartments.", "Suits the minimalist, design-led brands this audience likes.", ["Minimalist", "Muji"]],
        ["beauty", "Botanical body care", "Lulur scrubs and natural soaps in refillable packaging.", "Aligns with brands like Aesop and the sustainable signal.", ["Aesop", "Sustainable"]],
        ["beauty", "Coffee-based scrubs", "Body scrubs made from coffee grounds with a clear origin story.", "Links coffee culture with natural care.", ["Specialty coffee", "Aesop"]]] },
    id: { summary: "Audiens ini cenderung menjadikan kopi dan makanan bagian dari budaya sehari-hari, menghargai keberlanjutan, dan memilih merek yang tenang dan berbasis desain.",
      opp: [["food", "Paket kopi single origin", "Biji kopi Indonesia skala kecil dengan kartu asal-usul dan panduan seduh untuk peminum di rumah.", "Cocok dengan sinyal kopi specialty dan brunch yang kuat.", ["Specialty coffee", "Fellow", "Market Lane Coffee"]],
        ["food", "Camilan nabati", "Keripik tempe atau camilan berbahan kelapa dengan kemasan bersih.", "Sesuai kecenderungan plant-based dan keberlanjutan.", ["Plant-based", "Sustainable"]],
        ["fashion", "Busana harian pewarna alami", "Kemeja atau tas jinjing sederhana berwarna indigo alami dengan logo minimal.", "Selaras dengan selera minimalis dan berkelanjutan.", ["Minimalist", "Patagonia", "Allbirds"]],
        ["fashion", "Aksesori batik bergaya vintage", "Syal dan bandana dengan motif batik lama dalam warna lembut.", "Terhubung dengan sinyal vintage dan seni jalanan.", ["Vintage", "Street art"]],
        ["craft", "Peralatan kopi keramik", "Cangkir dan dripper buatan tangan dengan glasir warna tanah.", "Melengkapi ritual kopi specialty.", ["Specialty coffee", "Kinfolk"]],
        ["craft", "Aksesori rumah rotan", "Nampan dan pot tanaman rotan kecil untuk apartemen.", "Cocok dengan merek minimalis yang disukai audiens ini.", ["Minimalist", "Muji"]],
        ["beauty", "Perawatan tubuh botani", "Lulur dan sabun alami dalam kemasan isi ulang.", "Sejalan dengan merek seperti Aesop dan sinyal keberlanjutan.", ["Aesop", "Sustainable"]],
        ["beauty", "Scrub berbahan kopi", "Scrub tubuh dari ampas kopi dengan cerita asal-usul yang jelas.", "Menghubungkan budaya kopi dengan perawatan alami.", ["Specialty coffee", "Aesop"]]] },
  },
  seoul: {
    city: "Seoul", country: { en: "South Korea", id: "Korea Selatan" },
    taste_tags: tr([["Minimalist", 0.93], ["Café culture", 0.9], ["Skincare", 0.88], ["Streetwear", 0.84], ["Craftsmanship", 0.8], ["K-indie", 0.76], ["Healthy eating", 0.72], ["Stationery", 0.69]]),
    brands: ["Muji", "Gentle Monster", "Aesop", "Ader Error", "Innisfree", "Fritz Hansen"], trending_brands: ["Tamburins", "Matin Kim", "Osulloc"],
    artists: ["Hyukoh", "Nujabes", "Jannabi"], places: ["Fritz Coffee Company", "Ikseon-dong", "Cafe Onion"],
    demographics: [{ label: "18–24", value: 0.84 }, { label: "25–34", value: 0.93 }, { label: "35–44", value: 0.66 }, { label: "45–54", value: 0.41 }, { label: "55+", value: 0.25 }],
    en: { summary: "This audience tends to be young, design-conscious and detail-oriented, with strong interest in café culture, skincare and carefully made objects.",
      opp: [["food", "Specialty tea and coffee blends", "Indonesian tea or coffee in small, beautifully packaged sets.", "Fits café culture and the brands people here follow.", ["Café culture", "Osulloc", "Fritz Coffee Company"]],
        ["food", "Healthy snack bars", "Low-sugar bars with Indonesian ingredients like cacao or palm sugar.", "Matches the healthy eating signal.", ["Healthy eating"]],
        ["fashion", "Batik-detail streetwear", "Clean streetwear pieces with small batik panels.", "Blends streetwear with craftsmanship.", ["Streetwear", "Ader Error", "Craftsmanship"]],
        ["fashion", "Minimal woven bags", "Neutral woven bags with modern hardware.", "Suits the minimalist taste.", ["Minimalist", "Matin Kim"]],
        ["craft", "Desk objects and stationery", "Wooden pen trays or batik notebook covers.", "Links stationery love with craftsmanship.", ["Stationery", "Craftsmanship"]],
        ["craft", "Ceramic café ware", "Small-batch cups for independent cafés.", "Connects with the café scene.", ["Café culture", "Cafe Onion"]],
        ["beauty", "Natural skincare ingredients", "Products built around Indonesian botanicals like centella or turmeric.", "Matches the strong skincare signal.", ["Skincare", "Innisfree"]],
        ["beauty", "Home fragrance", "Incense or candles with Indonesian woods and spices.", "Echoes brands like Tamburins and Aesop.", ["Tamburins", "Aesop"]]] },
    id: { summary: "Audiens ini cenderung muda, peduli desain, dan teliti, dengan minat kuat pada budaya kafe, perawatan kulit, dan barang yang dibuat dengan cermat.",
      opp: [["food", "Racikan teh dan kopi specialty", "Teh atau kopi Indonesia dalam set kecil berkemasan cantik.", "Cocok dengan budaya kafe dan merek yang diikuti audiens ini.", ["Café culture", "Osulloc", "Fritz Coffee Company"]],
        ["food", "Camilan batang sehat", "Camilan rendah gula dengan bahan Indonesia seperti kakao atau gula aren.", "Sesuai sinyal makan sehat.", ["Healthy eating"]],
        ["fashion", "Streetwear dengan detail batik", "Busana streetwear bersih dengan panel batik kecil.", "Memadukan streetwear dan kerajinan.", ["Streetwear", "Ader Error", "Craftsmanship"]],
        ["fashion", "Tas anyaman minimalis", "Tas anyaman warna netral dengan aksesori modern.", "Cocok dengan selera minimalis.", ["Minimalist", "Matin Kim"]],
        ["craft", "Perlengkapan meja dan alat tulis", "Tempat pena kayu atau sampul buku batik.", "Menghubungkan minat alat tulis dengan kerajinan.", ["Stationery", "Craftsmanship"]],
        ["craft", "Peralatan kafe keramik", "Cangkir produksi kecil untuk kafe independen.", "Terhubung dengan budaya kafe.", ["Café culture", "Cafe Onion"]],
        ["beauty", "Bahan perawatan kulit alami", "Produk berbasis tanaman Indonesia seperti pegagan atau kunyit.", "Sesuai sinyal perawatan kulit yang kuat.", ["Skincare", "Innisfree"]],
        ["beauty", "Pewangi ruangan", "Dupa atau lilin beraroma kayu dan rempah Indonesia.", "Selaras dengan merek seperti Tamburins dan Aesop.", ["Tamburins", "Aesop"]]] },
  },
  kyoto: {
    city: "Kyoto", country: { en: "Japan", id: "Jepang" },
    taste_tags: tr([["Heritage", 0.95], ["Craftsmanship", 0.93], ["Tea ceremony", 0.89], ["Natural dye", 0.85], ["Wabi-sabi", 0.82], ["Textile art", 0.79], ["Seasonal food", 0.74], ["Temples", 0.7]]),
    brands: ["Issey Miyake", "Muji", "Kaikado", "Ippodo Tea", "Toast", "Hasami Porcelain"], trending_brands: ["Mina Perhonen", "Kyoto Ichiharaheibei", "Snow Peak"],
    artists: ["Ryuichi Sakamoto", "Hiroshi Yoshimura", "Ólafur Arnalds"], places: ["Nishiki Market", "Nishijin Textile Center", "Ippodo Tea Main Store"],
    demographics: [{ label: "18–24", value: 0.45 }, { label: "25–34", value: 0.7 }, { label: "35–44", value: 0.82 }, { label: "45–54", value: 0.86 }, { label: "55+", value: 0.74 }],
    en: { summary: "This audience tends to value heritage, slow craft and natural materials, and appreciates objects with a long making process and a quiet look.",
      opp: [["food", "Heritage tea and spice sets", "Indonesian heirloom teas or spices presented with their origin story.", "Fits the tea ceremony and seasonal food signals.", ["Tea ceremony", "Ippodo Tea"]],
        ["food", "Artisanal palm sugar", "Traditionally made gula aren in simple, refined packaging.", "Matches the heritage and craftsmanship leanings.", ["Heritage", "Craftsmanship"]],
        ["fashion", "Batik tulis with natural dyes", "Hand-drawn scarves using indigo and other natural dyes.", "Directly matches natural dye and textile art.", ["Natural dye", "Textile art", "Issey Miyake"]],
        ["fashion", "Hand-woven tenun accessories", "Small tenun pieces like pouches or obi-style belts.", "Connects with the textile heritage here.", ["Textile art", "Nishijin Textile Center"]],
        ["craft", "Wabi-sabi ceramics", "Imperfect, hand-formed tableware in natural glazes.", "Echoes the wabi-sabi signal.", ["Wabi-sabi", "Hasami Porcelain"]],
        ["craft", "Bamboo and rattan tea tools", "Woven tea baskets and coasters.", "Pairs craft with tea culture.", ["Tea ceremony", "Kaikado"]],
        ["beauty", "Traditional jamu-inspired care", "Gentle herbal products with a clear heritage story.", "Fits heritage and natural material taste.", ["Heritage"]],
        ["beauty", "Natural incense", "Incense from Indonesian sandalwood and spices.", "Suits the temple and heritage atmosphere.", ["Temples", "Heritage"]]] },
    id: { summary: "Audiens ini cenderung menghargai warisan budaya, kerajinan yang dikerjakan perlahan, dan bahan alami, serta menyukai barang dengan proses panjang dan tampilan tenang.",
      opp: [["food", "Set teh dan rempah warisan", "Teh atau rempah pusaka Indonesia yang disajikan dengan cerita asal-usulnya.", "Cocok dengan sinyal upacara teh dan makanan musiman.", ["Tea ceremony", "Ippodo Tea"]],
        ["food", "Gula aren artisan", "Gula aren buatan tradisional dalam kemasan sederhana yang elegan.", "Sesuai kecenderungan warisan dan kerajinan.", ["Heritage", "Craftsmanship"]],
        ["fashion", "Batik tulis pewarna alami", "Syal lukis tangan dengan indigo dan pewarna alami lain.", "Langsung cocok dengan sinyal pewarna alami dan seni tekstil.", ["Natural dye", "Textile art", "Issey Miyake"]],
        ["fashion", "Aksesori tenun tangan", "Produk tenun kecil seperti dompet atau sabuk bergaya obi.", "Terhubung dengan warisan tekstil kota ini.", ["Textile art", "Nishijin Textile Center"]],
        ["craft", "Keramik wabi-sabi", "Peralatan makan buatan tangan yang tidak sempurna dengan glasir alami.", "Selaras dengan sinyal wabi-sabi.", ["Wabi-sabi", "Hasami Porcelain"]],
        ["craft", "Perlengkapan teh bambu dan rotan", "Keranjang teh anyaman dan tatakan gelas.", "Memadukan kerajinan dengan budaya teh.", ["Tea ceremony", "Kaikado"]],
        ["beauty", "Perawatan terinspirasi jamu", "Produk herbal lembut dengan cerita warisan yang jelas.", "Cocok dengan selera warisan dan bahan alami.", ["Heritage"]],
        ["beauty", "Dupa alami", "Dupa dari cendana dan rempah Indonesia.", "Sesuai suasana kuil dan warisan budaya.", ["Temples", "Heritage"]]] },
  },
  "los angeles": {
    city: "Los Angeles", country: { en: "United States", id: "Amerika Serikat" },
    taste_tags: tr([["Wellness", 0.94], ["Boho interior", 0.9], ["Plant-based", 0.88], ["Surf culture", 0.83], ["Mid-century", 0.8], ["Clean beauty", 0.78], ["Boutique hotels", 0.74], ["Vintage", 0.7]]),
    brands: ["Anthropologie", "Erewhon", "Glossier", "HAY", "Reformation", "Ace Hotel"], trending_brands: ["Graza", "Brightland", "Parachute"],
    artists: ["Khruangbin", "Men I Trust", "Glass Animals"], places: ["Ace Hotel Downtown LA", "Abbot Kinney", "Erewhon Venice"],
    demographics: [{ label: "18–24", value: 0.7 }, { label: "25–34", value: 0.9 }, { label: "35–44", value: 0.84 }, { label: "45–54", value: 0.6 }, { label: "55+", value: 0.42 }],
    en: { summary: "This audience tends to mix wellness and plant-based living with relaxed, natural interiors, and pays attention to brands with a clean, story-led image.",
      opp: [["food", "Wellness ingredients", "Indonesian superfoods like moringa or turmeric blends for smoothies.", "Fits wellness and the stores people here shop at.", ["Wellness", "Erewhon"]],
        ["food", "Premium cooking oils and sauces", "Small-batch coconut oil or sambal in design-led bottles.", "Matches trending pantry brands.", ["Graza", "Brightland", "Plant-based"]],
        ["fashion", "Relaxed natural-fibre wear", "Linen or batik resort wear in soft colours.", "Suits surf culture and sustainable fashion brands.", ["Surf culture", "Reformation"]],
        ["fashion", "Woven beach bags", "Rattan and pandan bags for beach and market days.", "Connects boho and surf signals.", ["Boho interior", "Surf culture"]],
        ["craft", "Rattan lighting", "Pendant lamps for homes, cafés and boutique hotels.", "Directly matches boho interior and boutique hotels.", ["Boho interior", "Boutique hotels", "Ace Hotel"]],
        ["craft", "Mid-century teak pieces", "Small teak side tables or trays.", "Echoes mid-century taste and design stores.", ["Mid-century", "HAY"]],
        ["beauty", "Clean beauty botanicals", "Minimal-ingredient skincare with Indonesian botanicals.", "Matches clean beauty and brands like Glossier.", ["Clean beauty", "Glossier"]],
        ["beauty", "Spa rituals at home", "Balinese-style scrub and massage oil sets.", "Links wellness with home rituals.", ["Wellness", "Parachute"]]] },
    id: { summary: "Audiens ini cenderung memadukan gaya hidup sehat dan nabati dengan interior santai bernuansa alami, serta memperhatikan merek dengan citra bersih dan bercerita.",
      opp: [["food", "Bahan pangan sehat", "Superfood Indonesia seperti racikan kelor atau kunyit untuk smoothie.", "Cocok dengan gaya hidup sehat dan toko tempat audiens ini berbelanja.", ["Wellness", "Erewhon"]],
        ["food", "Minyak dan saus premium", "Minyak kelapa atau sambal produksi kecil dalam botol berdesain menarik.", "Sesuai merek dapur yang sedang tren.", ["Graza", "Brightland", "Plant-based"]],
        ["fashion", "Busana serat alami santai", "Busana resort linen atau batik dalam warna lembut.", "Cocok dengan budaya selancar dan merek fashion berkelanjutan.", ["Surf culture", "Reformation"]],
        ["fashion", "Tas pantai anyaman", "Tas rotan dan pandan untuk ke pantai dan pasar.", "Menghubungkan sinyal boho dan selancar.", ["Boho interior", "Surf culture"]],
        ["craft", "Lampu rotan", "Lampu gantung untuk rumah, kafe, dan hotel butik.", "Langsung cocok dengan interior boho dan hotel butik.", ["Boho interior", "Boutique hotels", "Ace Hotel"]],
        ["craft", "Furnitur jati mid-century", "Meja samping atau nampan jati berukuran kecil.", "Selaras dengan selera mid-century dan toko desain.", ["Mid-century", "HAY"]],
        ["beauty", "Bahan botani clean beauty", "Perawatan kulit berbahan minimal dengan tanaman Indonesia.", "Sesuai clean beauty dan merek seperti Glossier.", ["Clean beauty", "Glossier"]],
        ["beauty", "Ritual spa di rumah", "Set lulur dan minyak pijat bergaya Bali.", "Menghubungkan gaya hidup sehat dengan ritual di rumah.", ["Wellness", "Parachute"]]] },
  },
};


const demo = (a) => ["18–24", "25–34", "35–44", "45–54", "55+"].map((label, i) => ({ label, value: a[i] }));
// o(category, [titleEN, ideaEN, whyEN], [titleID, ideaID, whyID], signals)
const o = (c, en, id, sig) => ({ c, en, id, sig });
function city(key, name, country, tags, brands, trending, artists, places, ages, sumEn, sumId, opps) {
  DATA[key] = {
    city: name, country, taste_tags: tr(tags), brands, trending_brands: trending, artists, places, demographics: demo(ages),
    en: { summary: sumEn, opp: opps.map((x) => [x.c, x.en[0], x.en[1], x.en[2], x.sig]) },
    id: { summary: sumId, opp: opps.map((x) => [x.c, x.id[0], x.id[1], x.id[2], x.sig]) },
  };
}

city("tokyo", "Tokyo", { en: "Japan", id: "Jepang" },
  [["Minimalist", 0.94], ["Convenience culture", 0.9], ["Kawaii", 0.86], ["Craftsmanship", 0.84], ["Café culture", 0.81], ["Streetwear", 0.78], ["Gift wrapping", 0.74], ["Seasonal", 0.7]],
  ["Muji", "Uniqlo", "Beams", "Blue Bottle Coffee", "Shiseido", "Loft"], ["Comme des Garçons Play", "Cosme Kitchen", "Onitsuka Tiger"],
  ["Nujabes", "Yoasobi", "Fujii Kaze"], ["Shimokitazawa", "Daikanyama T-Site", "Nakameguro"], [0.8, 0.9, 0.76, 0.58, 0.44],
  "This audience tends to value minimal design, careful presentation and small, well-made items, often bought as gifts or for seasonal moments.",
  "Audiens ini cenderung menghargai desain minimalis, penyajian yang rapi, dan barang kecil yang dibuat dengan baik, sering dibeli sebagai hadiah atau untuk momen musiman.",
  [o("food", ["Gift-boxed snack sets", "Small, beautifully wrapped Indonesian snacks for seasonal gifting.", "Fits gift wrapping and seasonal signals."], ["Set camilan dalam kotak hadiah", "Camilan Indonesia kecil berkemasan cantik untuk hadiah musiman.", "Cocok dengan sinyal bungkus hadiah dan musiman."], ["Gift wrapping", "Seasonal"]),
   o("fashion", ["Batik-trim accessories", "Pouches and handkerchiefs with small batik details.", "Matches minimalist taste with a craft touch."], ["Aksesori bertepi batik", "Dompet kecil dan sapu tangan dengan detail batik.", "Selaras dengan selera minimalis plus sentuhan kerajinan."], ["Minimalist", "Beams"]),
   o("craft", ["Compact home goods", "Small rattan or wooden organisers for tiny apartments.", "Suits the brands people here like for home items."], ["Perlengkapan rumah ringkas", "Wadah rotan atau kayu kecil untuk apartemen mungil.", "Cocok dengan merek yang disukai untuk barang rumah."], ["Muji", "Loft"]),
   o("beauty", ["Natural skincare minis", "Travel-size lulur and oils with gentle ingredients.", "Fits brands like Cosme Kitchen."], ["Perawatan kulit alami ukuran mini", "Lulur dan minyak ukuran perjalanan dengan bahan lembut.", "Cocok dengan merek seperti Cosme Kitchen."], ["Cosme Kitchen", "Shiseido"])]);

city("singapore", "Singapore", { en: "Singapore", id: "Singapura" },
  [["Food halls", 0.95], ["Wellness", 0.88], ["Premium gifting", 0.85], ["Heritage", 0.8], ["Sustainable", 0.77], ["Modern Asian", 0.75], ["Rooftop bars", 0.7], ["Design hotels", 0.68]],
  ["TWG Tea", "Bengawan Solo", "Charles & Keith", "Aesop", "Common Man Coffee Roasters", "Naiise"], ["Bynd Artisan", "Love, Bonito", "Tiong Bahru Bakery"],
  ["Gentle Bones", "Khruangbin", "JJ Lin"], ["Tiong Bahru", "Haji Lane", "Dempsey Hill"], [0.72, 0.9, 0.84, 0.66, 0.5],
  "This audience tends to love food culture and premium gifts, mixes heritage with modern design, and responds well to wellness and sustainable products.",
  "Audiens ini cenderung menyukai budaya kuliner dan hadiah premium, memadukan warisan budaya dengan desain modern, serta tertarik pada produk sehat dan berkelanjutan.",
  [o("food", ["Premium kueh and spice gifts", "Heritage Indonesian cakes or spice blends in gift tins.", "Matches premium gifting and heritage, near brands like Bengawan Solo."], ["Hadiah kue dan rempah premium", "Kue warisan atau racikan rempah Indonesia dalam kaleng hadiah.", "Cocok dengan hadiah premium dan warisan, dekat merek seperti Bengawan Solo."], ["Premium gifting", "Heritage", "Bengawan Solo"]),
   o("fashion", ["Modern batik workwear", "Clean office blouses and shirts with batik prints.", "Fits modern Asian style and local fashion brands."], ["Busana kerja batik modern", "Blus dan kemeja kantor bersih bermotif batik.", "Cocok dengan gaya Asia modern dan merek fashion lokal."], ["Modern Asian", "Love, Bonito"]),
   o("craft", ["Handmade stationery", "Leather or batik-covered notebooks for gifting.", "Echoes brands like Bynd Artisan."], ["Alat tulis buatan tangan", "Buku catatan bersampul kulit atau batik untuk hadiah.", "Selaras dengan merek seperti Bynd Artisan."], ["Bynd Artisan", "Premium gifting"]),
   o("beauty", ["Wellness tea and jamu", "Ready-to-brew jamu blends with clear benefits labels.", "Fits wellness and tea-gifting brands."], ["Teh dan jamu sehat", "Racikan jamu siap seduh dengan label manfaat yang jelas.", "Cocok dengan gaya hidup sehat dan merek hadiah teh."], ["Wellness", "TWG Tea"])]);

city("dubai", "Dubai", { en: "United Arab Emirates", id: "Uni Emirat Arab" },
  [["Luxury", 0.95], ["Oud and fragrance", 0.92], ["Modest fashion", 0.88], ["Specialty coffee", 0.82], ["Gifting", 0.8], ["Home décor", 0.76], ["Halal", 0.74], ["Desert resorts", 0.7]],
  ["Ajmal", "Bateel", "Ounass", "% Arabica", "Home Centre", "Namshi"], ["Kilian", "Bloomingdale’s Home", "Nightjar Coffee"],
  ["Hans Zimmer", "The Weeknd", "Hussain Al Jassmi"], ["Alserkal Avenue", "Dubai Mall", "Jumeirah"], [0.6, 0.9, 0.86, 0.7, 0.52],
  "This audience tends to value luxury, fragrance and generous gifting, with strong interest in modest fashion, halal products and refined home décor.",
  "Audiens ini cenderung menghargai kemewahan, wewangian, dan hadiah yang royal, dengan minat kuat pada busana muslim, produk halal, dan dekorasi rumah yang elegan.",
  [o("food", ["Halal premium coffee", "Specialty Indonesian beans with halal certification and gift boxes.", "Fits specialty coffee, halal and gifting signals."], ["Kopi premium halal", "Biji kopi specialty Indonesia bersertifikat halal dalam kotak hadiah.", "Cocok dengan sinyal kopi specialty, halal, dan hadiah."], ["Specialty coffee", "Halal", "Gifting"]),
   o("fashion", ["Modest batik and songket wear", "Abayas, scarves and kaftans with batik or songket detail.", "Matches modest fashion and luxury taste."], ["Busana muslim batik dan songket", "Abaya, kerudung, dan kaftan dengan detail batik atau songket.", "Cocok dengan busana muslim dan selera mewah."], ["Modest fashion", "Luxury", "Namshi"]),
   o("craft", ["Carved teak décor", "Statement teak trays and wall pieces for villas.", "Fits luxury home décor and resort taste."], ["Dekorasi jati ukir", "Nampan dan hiasan dinding jati yang mencolok untuk vila.", "Cocok dengan dekorasi rumah mewah dan selera resort."], ["Home décor", "Desert resorts"]),
   o("beauty", ["Agarwood and sandalwood scents", "Indonesian gaharu and sandalwood oils or incense.", "Directly matches the oud and fragrance signal."], ["Wewangian gaharu dan cendana", "Minyak atau dupa gaharu dan cendana Indonesia.", "Langsung cocok dengan sinyal oud dan wewangian."], ["Oud and fragrance", "Ajmal", "Kilian"])]);

city("amsterdam", "Amsterdam", { en: "Netherlands", id: "Belanda" },
  [["Sustainable", 0.94], ["Cycling", 0.88], ["Design", 0.86], ["Slow fashion", 0.84], ["Indonesian food", 0.8], ["Vintage", 0.77], ["Plant-based", 0.74], ["Concept stores", 0.7]],
  ["COS", "Toast", "Hay", "Fairphone", "Tony’s Chocolonely", "Rains"], ["Mud Jeans", "Arket", "Sissy-Boy"],
  ["Khruangbin", "Bon Iver", "Fred again.."], ["De Negen Straatjes", "Foodhallen", "Hutspot"], [0.74, 0.9, 0.8, 0.6, 0.48],
  "This audience tends to choose sustainable and design-led products, already knows Indonesian food well, and shops at concept stores and vintage shops.",
  "Audiens ini cenderung memilih produk berkelanjutan dan berbasis desain, sudah akrab dengan masakan Indonesia, dan berbelanja di concept store serta toko vintage.",
  [o("food", ["Ready-to-cook bumbu kits", "Authentic spice pastes for rendang or soto with recipe cards.", "Builds on the familiar Indonesian food signal."], ["Paket bumbu siap masak", "Bumbu asli untuk rendang atau soto dengan kartu resep.", "Memanfaatkan sinyal masakan Indonesia yang sudah akrab."], ["Indonesian food", "Foodhallen"]),
   o("fashion", ["Natural-dye slow fashion", "Simple natural-dye garments with full maker transparency.", "Matches slow fashion and sustainable brands."], ["Slow fashion pewarna alami", "Busana sederhana pewarna alami dengan informasi pembuat yang lengkap.", "Cocok dengan slow fashion dan merek berkelanjutan."], ["Slow fashion", "Sustainable", "Mud Jeans"]),
   o("craft", ["Rattan and bamboo design pieces", "Modern rattan chairs or lamps for concept stores.", "Fits design taste and concept store shopping."], ["Produk desain rotan dan bambu", "Kursi atau lampu rotan modern untuk concept store.", "Cocok dengan selera desain dan kebiasaan belanja di concept store."], ["Design", "Concept stores", "Hay"]),
   o("beauty", ["Plastic-free soap bars", "Natural soaps and shampoo bars with compostable wrapping.", "Aligns with sustainable and plant-based leanings."], ["Sabun batang tanpa plastik", "Sabun dan sampo batang alami dengan bungkus kompos.", "Sejalan dengan kecenderungan berkelanjutan dan nabati."], ["Sustainable", "Plant-based"])]);

city("london", "London", { en: "United Kingdom", id: "Inggris" },
  [["Independent shops", 0.92], ["Specialty coffee", 0.88], ["Vintage", 0.86], ["Ethical", 0.84], ["Street food", 0.8], ["Gallery culture", 0.77], ["Tea", 0.74], ["Gifting", 0.7]],
  ["Liberty", "Monmouth Coffee", "Aesop", "Toast", "Neal’s Yard Remedies", "Selfridges"], ["Kitri", "Daylesford", "Oatly"],
  ["Little Simz", "Jungle", "Arlo Parks"], ["Borough Market", "Columbia Road", "Spitalfields"], [0.7, 0.88, 0.82, 0.66, 0.52],
  "This audience tends to support independent and ethical brands, loves markets and street food, and appreciates heritage prints and well-made gifts.",
  "Audiens ini cenderung mendukung merek independen dan etis, menyukai pasar dan jajanan kaki lima, serta menghargai motif warisan dan hadiah yang dibuat dengan baik.",
  [o("food", ["Single-origin tea and coffee", "Indonesian teas and coffees with farm stories for market stalls.", "Fits specialty coffee, tea and market culture."], ["Teh dan kopi single origin", "Teh dan kopi Indonesia dengan cerita kebun untuk lapak pasar.", "Cocok dengan budaya kopi specialty, teh, dan pasar."], ["Specialty coffee", "Tea", "Borough Market"]),
   o("fashion", ["Heritage print accessories", "Batik scarves and ties sold through independent boutiques.", "Echoes print-loving stores like Liberty."], ["Aksesori motif warisan", "Syal dan dasi batik lewat butik independen.", "Selaras dengan toko pencinta motif seperti Liberty."], ["Liberty", "Independent shops"]),
   o("craft", ["Gallery-ready textiles", "Framed tenun or batik pieces for art lovers.", "Matches gallery culture and gifting."], ["Tekstil siap pajang galeri", "Tenun atau batik berbingkai untuk pecinta seni.", "Cocok dengan budaya galeri dan hadiah."], ["Gallery culture", "Gifting"]),
   o("beauty", ["Ethical herbal remedies", "Jamu-based balms and teas with clear sourcing.", "Fits ethical brands like Neal’s Yard Remedies."], ["Ramuan herbal etis", "Balsem dan teh berbasis jamu dengan sumber bahan yang jelas.", "Cocok dengan merek etis seperti Neal’s Yard Remedies."], ["Ethical", "Neal’s Yard Remedies"])]);

city("berlin", "Berlin", { en: "Germany", id: "Jerman" },
  [["Underground culture", 0.92], ["Sustainable", 0.9], ["Vegan", 0.87], ["Minimalist", 0.83], ["Vintage", 0.8], ["Third-wave coffee", 0.78], ["DIY", 0.73], ["Techno", 0.7]],
  ["Armedangels", "The Barn", "Vitra", "Freitag", "Manufactum", "Weleda"], ["Ooia", "Holy Flat", "Einhorn"],
  ["Moderat", "Apparat", "Ben Böhmer"], ["Kreuzberg", "Mauerpark", "Markthalle Neun"], [0.78, 0.9, 0.74, 0.55, 0.4],
  "This audience tends to favour vegan, sustainable and minimalist products, values function over flash, and supports independent and DIY culture.",
  "Audiens ini cenderung memilih produk vegan, berkelanjutan, dan minimalis, mengutamakan fungsi daripada tampilan, serta mendukung budaya independen dan DIY.",
  [o("food", ["Vegan tempeh products", "Tempeh starters or ready tempeh for home cooks.", "Directly matches the strong vegan signal."], ["Produk tempe vegan", "Ragi tempe atau tempe siap olah untuk masak di rumah.", "Langsung cocok dengan sinyal vegan yang kuat."], ["Vegan", "Markthalle Neun"]),
   o("fashion", ["Organic cotton basics", "Simple natural-dye tees and totes, certified organic.", "Fits sustainable fashion brands like Armedangels."], ["Busana dasar katun organik", "Kaus dan tas jinjing sederhana pewarna alami bersertifikat organik.", "Cocok dengan merek fashion berkelanjutan seperti Armedangels."], ["Sustainable", "Armedangels"]),
   o("craft", ["Functional woven goods", "Durable rattan storage and bike baskets.", "Matches minimalist, function-first taste."], ["Barang anyaman fungsional", "Wadah rotan dan keranjang sepeda yang awet.", "Cocok dengan selera minimalis yang mengutamakan fungsi."], ["Minimalist", "Manufactum"]),
   o("beauty", ["Certified natural cosmetics", "Coconut and botanical care with natural-cosmetics certification.", "Fits brands like Weleda."], ["Kosmetik alami bersertifikat", "Perawatan berbahan kelapa dan tanaman dengan sertifikasi kosmetik alami.", "Cocok dengan merek seperti Weleda."], ["Weleda", "Vegan"])]);

city("paris", "Paris", { en: "France", id: "Prancis" },
  [["Fashion", 0.95], ["Gastronomy", 0.9], ["Art", 0.87], ["Artisanal", 0.84], ["Perfume", 0.82], ["Vintage", 0.78], ["Natural wine", 0.73], ["Concept stores", 0.7]],
  ["Sézane", "Diptyque", "Merci", "A.P.C.", "Maison Kitsuné", "Le Bon Marché"], ["Rouje", "Cire Trudon", "Coutume Café"],
  ["Daft Punk", "Christine and the Queens", "Air"], ["Le Marais", "Canal Saint-Martin", "Merci"], [0.66, 0.88, 0.84, 0.7, 0.58],
  "This audience tends to treat fashion, food and fragrance as art, values artisanal craft, and discovers new makers through concept stores.",
  "Audiens ini cenderung memperlakukan fashion, kuliner, dan wewangian sebagai seni, menghargai kerajinan artisan, dan menemukan pembuat baru lewat concept store.",
  [o("food", ["Single-estate cacao and vanilla", "Indonesian cacao or vanilla for chocolatiers and pastry chefs.", "Fits the gastronomy and artisanal signals."], ["Kakao dan vanili satu kebun", "Kakao atau vanili Indonesia untuk pembuat cokelat dan pastry.", "Cocok dengan sinyal gastronomi dan artisan."], ["Gastronomy", "Artisanal"]),
   o("fashion", ["Collectible batik silk", "Limited-run hand-drawn silk pieces with maker signatures.", "Matches fashion and art taste."], ["Sutra batik koleksi", "Kain sutra lukis tangan edisi terbatas dengan tanda tangan pembuat.", "Cocok dengan selera fashion dan seni."], ["Fashion", "Art", "Sézane"]),
   o("craft", ["Concept-store homeware", "Ceramics and woven pieces for curated stores.", "Fits concept stores like Merci."], ["Perlengkapan rumah untuk concept store", "Keramik dan anyaman untuk toko kurasi.", "Cocok dengan concept store seperti Merci."], ["Concept stores", "Merci"]),
   o("beauty", ["Fine fragrance ingredients", "Patchouli, vetiver and ylang-ylang oils for perfumers.", "Matches perfume and brands like Diptyque."], ["Bahan parfum berkualitas", "Minyak nilam, akar wangi, dan kenanga untuk peracik parfum.", "Cocok dengan parfum dan merek seperti Diptyque."], ["Perfume", "Diptyque"])]);

city("copenhagen", "Copenhagen", { en: "Denmark", id: "Denmark" },
  [["Hygge", 0.94], ["Scandinavian design", 0.92], ["Sustainable", 0.88], ["New Nordic food", 0.83], ["Cycling", 0.8], ["Slow living", 0.78], ["Ceramics", 0.74], ["Natural materials", 0.72]],
  ["Hay", "Ganni", "Ferm Living", "Muuto", "Royal Copenhagen", "Kinfolk"], ["Ro Collection", "Stine Goya", "Atelier September"],
  ["Mø", "Agnes Obel", "Efterklang"], ["Torvehallerne", "Nørrebro", "Kødbyen"], [0.7, 0.9, 0.84, 0.62, 0.46],
  "This audience tends to love calm, natural interiors and slow living, prefers sustainable design, and pays for quality materials.",
  "Audiens ini cenderung menyukai interior tenang dan alami serta gaya hidup santai, memilih desain berkelanjutan, dan rela membayar untuk bahan berkualitas.",
  [o("food", ["Craft hot chocolate and spices", "Indonesian cacao and spice blends for cosy evenings.", "Fits hygge and slow living."], ["Cokelat panas dan rempah artisan", "Racikan kakao dan rempah Indonesia untuk malam yang hangat.", "Cocok dengan hygge dan gaya hidup santai."], ["Hygge", "Slow living"]),
   o("fashion", ["Soft natural-fibre knits", "Neutral linen or cotton pieces with subtle weave.", "Matches sustainable Danish fashion."], ["Busana serat alami yang lembut", "Busana linen atau katun netral dengan tenunan halus.", "Cocok dengan fashion Denmark yang berkelanjutan."], ["Sustainable", "Ganni"]),
   o("craft", ["Rattan and teak interiors", "Clean-lined rattan lamps and teak trays.", "Directly matches Scandinavian design and natural materials."], ["Interior rotan dan jati", "Lampu rotan dan nampan jati berdesain bersih.", "Langsung cocok dengan desain Skandinavia dan bahan alami."], ["Scandinavian design", "Natural materials", "Ferm Living"]),
   o("beauty", ["Candles and home scents", "Soy candles with Indonesian woods and spices.", "Fits hygge and calm home rituals."], ["Lilin dan pewangi rumah", "Lilin kedelai beraroma kayu dan rempah Indonesia.", "Cocok dengan hygge dan ritual rumah yang tenang."], ["Hygge", "Kinfolk"])]);

export const SAMPLE_CITY_NAMES = ["Tokyo", "Seoul", "Kyoto", "Singapore", "Melbourne", "Dubai", "Amsterdam", "London", "Paris", "Berlin", "Copenhagen", "Los Angeles"];

export function sampleCity(name, language) {
  const d = DATA[String(name).trim().toLowerCase()];
  if (!d) return null;
  const L = d[language] || d.en;
  return {
    mocked: true,
    city: d.city,
    country: d.country[language] || d.country.en,
    summary: L.summary,
    taste_tags: d.taste_tags, brands: d.brands, trending_brands: d.trending_brands, artists: d.artists, places: d.places,
    demographics: d.demographics,
    opportunities: L.opp.map(([category, title, idea, why, signals]) => ({ category, title, idea, why, signals })),
    cautions: language === "id"
      ? ["Ini data selera, bukan data penjualan. Cek permintaan sebenarnya di ITC Trade Map atau Export Potential Map.", "Hasil menggambarkan kecenderungan kelompok, bukan perilaku setiap orang."]
      : ["This is taste data, not sales data. Check real demand in ITC Trade Map or Export Potential Map.", "Results describe group tendencies, not what any one person will do."],
    trace: steps(d.city, { tags: d.taste_tags.length, brands: d.brands.length, artists: d.artists.length, places: d.places.length, trending: d.trending_brands.length }),
    fetchedAt: Date.now(),
  };
}

export function sampleOverview(name) {
  const d = DATA[String(name).trim().toLowerCase()];
  if (!d) return null;
  return { city: d.city, ok: true, mocked: true, taste_tags: d.taste_tags.slice(0, 6), trending_brands: d.trending_brands.slice(0, 5) };
}

// ----- Extra sample signals: cross-domain media, heatmap and places -----
import { coordsFor } from "./geo";

const CROSS = {
  melbourne: [["The Daily Aus", "Conversations", "Broadly Speaking"], ["Bluey", "Fisk", "Utopia"], ["The Dry", "Boy Swallows Universe", "Salt Fat Acid Heat"]],
  seoul: [["Kim Jong-hyun Radio", "Talk Talk Seoul", "Song Eun-i & Kim Sook"], ["Reply 1988", "My Liberation Notes", "Physical: 100"], ["Almond", "Pachinko", "Please Look After Mom"]],
  kyoto: [["Kyoto Journal Podcast", "Uncanny Japan", "Japan Station"], ["Midnight Diner", "The Makanai", "Samurai Gourmet"], ["The Book of Tea", "In Praise of Shadows", "Kokoro"]],
  tokyo: [["Uncanny Japan", "Tokyo Weekender Podcast", "Japan Station"], ["Midnight Diner", "Terrace House", "First Love"], ["Convenience Store Woman", "Norwegian Wood", "The Housekeeper and the Professor"]],
  singapore: [["The Daily Ketchup", "Mothership Podcast", "Wake Up, Singapore"], ["Crazy Rich Asians", "The Little Nyonya", "Tanglin"], ["Crazy Rich Asians", "Sarong Party Girls", "The Sympathizer"]],
  dubai: [["Arabian Business Podcast", "The Mo Show", "Kerning Cultures"], ["Dubai Bling", "Jinn", "Al Rawabi School for Girls"], ["The Alchemist", "Atomic Habits", "The Prophet"]],
  amsterdam: [["NRC Vandaag", "Dag en Nacht", "De Dag"], ["Undercover", "Mocro Maffia", "Floor Faber"], ["The Dinner", "Tirza", "The Discomfort of Evening"]],
  london: [["The Rest Is History", "Desert Island Discs", "Table Manners"], ["Fleabag", "The Great British Bake Off", "Slow Horses"], ["Normal People", "Bridget Jones’s Diary", "Shuggie Bain"]],
  paris: [["Transfert", "Les Pieds sur Terre", "Change ma vie"], ["Call My Agent!", "Lupin", "Emily in Paris"], ["The Little Prince", "Les Misérables", "My Brilliant Friend"]],
  berlin: [["Fest & Flauschig", "Lage der Nation", "Gemischtes Hack"], ["Babylon Berlin", "Dark", "4 Blocks"], ["Steppenwolf", "Berlin Alexanderplatz", "Go, Went, Gone"]],
  copenhagen: [["Third Ear", "Det Røde Felt", "Genstart"], ["Borgen", "The Killing", "Ride Upon the Storm"], ["The Year of Living Danishly", "Hygge", "Out Stealing Horses"]],
  "los angeles": [["SmartLess", "Call Her Daddy", "The Joe Budden Podcast"], ["The Bear", "Hacks", "Euphoria"], ["The Big Sleep", "Atomic Habits", "Tomorrow, and Tomorrow, and Tomorrow"]],
};

// Deterministic pseudo-random points around the city, so the sample heatmap looks the same every time.
function seeded(str) {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
export function sampleHeat(name) {
  const c = coordsFor(name);
  if (!c) return [];
  const rnd = seeded(String(name).toLowerCase());
  const clusters = Array.from({ length: 3 }, (_, i) => ({ lon: c[0] + (rnd() - 0.5) * 0.12, lat: c[1] + (rnd() - 0.5) * 0.09, w: 1 - i * 0.25 }));
  const pts = [];
  for (let i = 0; i < 140; i++) {
    const k = clusters[i % 3];
    const dx = (rnd() + rnd() + rnd() - 1.5) * 0.05, dy = (rnd() + rnd() + rnd() - 1.5) * 0.04;
    pts.push({ lon: k.lon + dx, lat: k.lat + dy, value: Math.max(0.05, k.w * Math.exp(-((dx * dx) / 0.0016 + (dy * dy) / 0.001))) });
  }
  return pts;
}

export function sampleWhere(name) {
  const key = String(name).trim().toLowerCase();
  const d = DATA[key];
  if (!d) return null;
  const tags = d.taste_tags.map((x) => x.name);
  return {
    mocked: true, city: d.city,
    places: d.places.map((p, i) => ({ name: p, address: "", affinity: 0.94 - i * 0.05, tags: tags.slice(i, i + 2) })),
    heatmap: sampleHeat(d.city),
    trace: [
      { name: `Places in ${d.city} for this audience`, tool: "Qloo /v2/insights (place)", ok: true, detail: `${d.places.length} results` },
      { name: `Where this audience is in ${d.city}`, tool: "Qloo /v2/insights (heatmap)", ok: true, detail: "140 results" },
    ],
  };
}

const _sampleCity = sampleCity;
export function sampleCityFull(name, language) {
  const base = _sampleCity(name, language);
  if (!base) return null;
  const x = CROSS[String(name).trim().toLowerCase()] || [[], [], []];
  return { ...base, podcasts: x[0], tv_shows: x[1], books: x[2], heatmap: sampleHeat(base.city) };
}
