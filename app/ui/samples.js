// Sample briefs for the "Load sample briefs" button and the preview.
// They are always marked as sample data in the interface.
const S = {
  coffee: {
    queries: ["specialty coffee", "third wave coffee", "sustainable", "single origin"], refs: ["Blue Bottle Coffee", "Patagonia"],
    signals: [["Specialty Coffee", "The place-genre tag matches people who seek out coffee shops, not films about coffee."], ["Sustainability", "Fits the compostable packaging story."], ["Blue Bottle Coffee", "Its fans already pay a premium for traceable beans."]],
    dest: "Melbourne, Seoul, Portland, Copenhagen", brands: "Aesop, Kinfolk, Fellow, Muji", artists: "Khruangbin, Nujabes, Bon Iver", taste: "Minimalist, Craftsmanship, Slow living", places: "Market Lane Coffee, Seven Seeds, Proud Mary",
    en: { headline: "Your Gayo coffee fits cities with a deep specialty café culture and an audience that cares about sustainability.",
      markets: [["Melbourne", "Australia", "Highest affinity for the specialty coffee and sustainability signals. The same audience leans toward brands like Aesop and Fellow.", ["Specialty Coffee", "Aesop", "Fellow"]], ["Seoul", "South Korea", "An audience with strong minimalist and craftsmanship leanings that suits a bean-origin story.", ["Minimalist", "Craftsmanship", "Muji"]], ["Copenhagen", "Denmark", "Slow-living culture makes compostable packaging a selling point rather than a footnote.", ["Slow living", "Kinfolk"]], ["Tokyo", "Japan", "Convenience culture and careful gifting suit small, beautifully packed single-origin bags.", ["Gift wrapping", "Minimalist"]], ["Singapore", "Singapore", "Specialty cafés and premium gifting make origin coffee an easy sell.", ["Café culture", "Premium gifting"]], ["London", "United Kingdom", "Independent coffee shops and market stalls welcome traceable beans.", ["Specialty coffee", "Independent shops"]], ["Berlin", "Germany", "Third-wave coffee fans who care about sustainable sourcing.", ["Third-wave coffee", "Sustainable"]], ["Dubai", "United Arab Emirates", "A growing specialty coffee scene with strong demand for halal, premium gifts.", ["Specialty coffee", "Gifting"]]],
      portrait: "This group tends to be 25 to 44, values products with a clear origin story, and leans toward calm, minimalist brands over loud ones.", loves: ["Aesop", "Kinfolk", "Khruangbin", "Nujabes"],
      positioning: "Sell it as the work of Gayo highland farmers, not just “Indonesian coffee”.", pitch: "Grown at 1,400 metres, dried under the Gayo sun.", packaging: ["Print the village name and farm altitude", "Plain packaging with a single earth tone"],
      channels: ["Pitch roasters and cafés like Market Lane Coffee in Melbourne", "List on stores that already carry brands like Fellow", "Partner with slow-living content creators"],
      cautions: ["Qloo results describe group tendencies, not what any one person will do.", "Check tariffs and import rules on ITC Market Access Map before shipping."],
      next: ["Check coffee demand for these countries on ITC Export Potential Map", "Register for UMKM BISA Ekspor business matching on InaExport", "Prepare samples and an English product profile"] },
    id: { headline: "Kopi Gayo kamu paling cocok untuk kota-kota dengan budaya kafe specialty yang kuat dan audiens yang peduli lingkungan.",
      markets: [["Melbourne", "Australia", "Afinitas tertinggi terhadap sinyal kopi specialty dan keberlanjutan. Audiens yang sama cenderung menyukai merek seperti Aesop dan Fellow.", ["Specialty Coffee", "Aesop", "Fellow"]], ["Seoul", "Korea Selatan", "Audiens dengan selera minimalis dan kerajinan yang kuat, cocok untuk cerita asal-usul biji kopi.", ["Minimalist", "Craftsmanship", "Muji"]], ["Copenhagen", "Denmark", "Budaya slow living membuat kemasan kompos menjadi nilai jual utama.", ["Slow living", "Kinfolk"]], ["Tokyo", "Jepang", "Budaya praktis dan hadiah yang rapi cocok untuk kemasan kopi single origin yang kecil dan cantik.", ["Gift wrapping", "Minimalist"]], ["Singapore", "Singapura", "Kafe specialty dan budaya hadiah premium membuat kopi asal-usul mudah dijual.", ["Café culture", "Premium gifting"]], ["London", "Inggris", "Kedai kopi independen dan lapak pasar menyambut biji kopi yang jelas asalnya.", ["Specialty coffee", "Independent shops"]], ["Berlin", "Jerman", "Penggemar kopi third-wave yang peduli sumber yang berkelanjutan.", ["Third-wave coffee", "Sustainable"]], ["Dubai", "Uni Emirat Arab", "Budaya kopi specialty yang tumbuh dengan permintaan hadiah premium dan halal.", ["Specialty coffee", "Gifting"]]],
      portrait: "Kelompok ini cenderung berusia 25 sampai 44 tahun, menghargai produk dengan cerita asal-usul yang jelas, dan memilih merek yang tenang dan minimalis.", loves: ["Aesop", "Kinfolk", "Khruangbin", "Nujabes"],
      positioning: "Jual kopi ini sebagai hasil kerja petani dataran tinggi Gayo, bukan sekadar “kopi Indonesia”.", pitch: "Ditanam di ketinggian 1.400 meter, dijemur di bawah matahari Gayo.", packaging: ["Tampilkan nama desa dan ketinggian kebun", "Kemasan polos dengan satu warna tanah"],
      channels: ["Tawarkan ke roaster dan kafe seperti Market Lane Coffee di Melbourne", "Masuk ke toko yang sudah menjual merek seperti Fellow", "Kolaborasi dengan kreator konten bertema slow living"],
      cautions: ["Hasil Qloo menggambarkan kecenderungan kelompok, bukan perilaku setiap orang.", "Periksa tarif dan aturan impor di ITC Market Access Map sebelum mengirim barang."],
      next: ["Cek permintaan kopi untuk negara-negara ini di ITC Export Potential Map", "Daftar business matching UMKM BISA Ekspor lewat InaExport", "Siapkan sampel dan profil produk berbahasa Inggris"] } },
  batik: {
    queries: ["batik", "natural dye", "handcrafted textile", "slow fashion"], refs: ["Issey Miyake", "Marimekko"],
    signals: [["Natural Dye", "Points to buyers who care how a textile is made."], ["Slow Fashion", "Matches the three-week making time."], ["Marimekko", "Its fans love bold, story-rich patterns."]],
    dest: "Kyoto, Amsterdam, Paris, London", brands: "Issey Miyake, COS, Eileen Fisher, Toast", artists: "Ryuichi Sakamoto, Ólafur Arnalds, Hiatus Kaiyote", taste: "Artisanal, Heritage, Textile art", places: "Kyoto Craft Center, Nishijin Textile Center",
    en: { headline: "Your batik tulis speaks to cities that treat textiles as art and pay attention to how things are made.",
      markets: [["Kyoto", "Japan", "Strong affinity for natural dye and heritage textile signals. This audience already values indigo craft and long making times.", ["Natural Dye", "Heritage", "Issey Miyake"]], ["Amsterdam", "Netherlands", "A slow-fashion audience that leans toward brands like COS and Toast and responds to pattern stories.", ["Slow Fashion", "COS", "Toast"]], ["Paris", "France", "Textile-art taste makes a hand-drawn silk scarf read as a collectible, not an accessory.", ["Textile art", "Artisanal"]], ["London", "United Kingdom", "Print-loving shoppers and independent boutiques value heritage textiles.", ["Liberty", "Gallery culture"]], ["Tokyo", "Japan", "Careful craft and gifting culture make a hand-drawn scarf a special present.", ["Craftsmanship", "Gift wrapping"]], ["Copenhagen", "Denmark", "Natural dyes match the calm, sustainable style here.", ["Sustainable", "Natural materials"]], ["Melbourne", "Australia", "A sustainable, design-minded audience that likes vintage-inspired patterns.", ["Sustainable", "Vintage"]], ["Dubai", "United Arab Emirates", "Modest fashion and luxury taste suit silk batik scarves.", ["Modest fashion", "Luxury"]]],
      portrait: "This group tends to be 30 to 54, buys fewer but better pieces, and wants to know who made an item and how long it took.", loves: ["Issey Miyake", "Toast", "Ryuichi Sakamoto", "Ólafur Arnalds"],
      positioning: "Present each scarf as a single work with its own folk story and making time, not as a fashion item.", pitch: "Three weeks, one pair of hands, one story from the Pekalongan coast.", packaging: ["A small card telling the folk story behind the pattern", "Note the natural dye sources on the label"],
      channels: ["Approach galleries and concept stores that stock brands like Toast", "Join craft fairs in Kyoto and Amsterdam", "Offer scarves to museum shops with textile collections"],
      cautions: ["Qloo results describe group tendencies, not what any one person will do.", "Silk and textile import rules differ by country, so check ITC Market Access Map."],
      next: ["Check textile demand on ITC Export Potential Map", "Register for UMKM BISA Ekspor business matching on InaExport", "Photograph the making process for your product profile"] },
    id: { headline: "Batik tulismu berbicara kepada kota-kota yang memperlakukan kain sebagai karya seni dan peduli cara barang dibuat.",
      markets: [["Kyoto", "Jepang", "Afinitas kuat terhadap sinyal pewarna alami dan tekstil warisan. Audiens ini sudah menghargai kerajinan indigo dan proses yang lama.", ["Natural Dye", "Heritage", "Issey Miyake"]], ["Amsterdam", "Belanda", "Audiens slow fashion yang cenderung menyukai merek seperti COS dan Toast, serta tertarik pada cerita di balik motif.", ["Slow Fashion", "COS", "Toast"]], ["Paris", "Prancis", "Selera seni tekstil membuat syal sutra lukis tangan terlihat sebagai barang koleksi.", ["Textile art", "Artisanal"]], ["London", "Inggris", "Pembeli pencinta motif dan butik independen menghargai tekstil warisan.", ["Liberty", "Gallery culture"]], ["Tokyo", "Jepang", "Budaya kerajinan dan hadiah membuat syal lukis tangan menjadi kado istimewa.", ["Craftsmanship", "Gift wrapping"]], ["Copenhagen", "Denmark", "Pewarna alami selaras dengan gaya tenang dan berkelanjutan di sini.", ["Sustainable", "Natural materials"]], ["Melbourne", "Australia", "Audiens yang peduli keberlanjutan dan desain, dan menyukai motif bergaya vintage.", ["Sustainable", "Vintage"]], ["Dubai", "Uni Emirat Arab", "Busana muslim dan selera mewah cocok untuk syal sutra batik.", ["Modest fashion", "Luxury"]]],
      portrait: "Kelompok ini cenderung berusia 30 sampai 54 tahun, membeli lebih sedikit tapi berkualitas, dan ingin tahu siapa pembuatnya serta berapa lama prosesnya.", loves: ["Issey Miyake", "Toast", "Ryuichi Sakamoto", "Ólafur Arnalds"],
      positioning: "Tampilkan setiap syal sebagai satu karya dengan kisah rakyat dan waktu pengerjaannya sendiri.", pitch: "Tiga minggu, sepasang tangan, satu kisah dari pesisir Pekalongan.", packaging: ["Kartu kecil berisi kisah rakyat di balik motif", "Cantumkan sumber pewarna alami di label"],
      channels: ["Dekati galeri dan concept store yang menjual merek seperti Toast", "Ikut pameran kerajinan di Kyoto dan Amsterdam", "Tawarkan ke toko museum yang punya koleksi tekstil"],
      cautions: ["Hasil Qloo menggambarkan kecenderungan kelompok, bukan perilaku setiap orang.", "Aturan impor sutra dan tekstil berbeda tiap negara, jadi cek ITC Market Access Map."],
      next: ["Cek permintaan tekstil di ITC Export Potential Map", "Daftar business matching UMKM BISA Ekspor lewat InaExport", "Foto proses pembuatan untuk profil produkmu"] } },
  rattan: {
    queries: ["rattan", "boho interior", "organic design", "boutique hotel"], refs: ["Anthropologie", "Ace Hotel"],
    signals: [["Boho Interior", "Describes homes that mix natural textures."], ["Boutique Hotel", "Matches the hospitality buyers you named."], ["Ace Hotel", "Its fans like warm, design-led spaces."]],
    dest: "Los Angeles, Copenhagen, Singapore, Tel Aviv", brands: "Anthropologie, HAY, Ferm Living, Article", artists: "Tame Impala, Men I Trust, Glass Animals", taste: "Mid-century, Bohemian, Natural materials", places: "Ace Hotel Downtown LA, Abbot Kinney shops",
    en: { headline: "Your rattan lamps fit sunny, design-minded cities where natural textures and boutique hospitality go together.",
      markets: [["Los Angeles", "United States", "Highest affinity for boho interior and boutique hotel signals, with an audience that also likes Anthropologie and HAY.", ["Boho Interior", "Anthropologie", "HAY"]], ["Copenhagen", "Denmark", "An audience that loves natural materials and calm, Scandinavian-style interiors.", ["Natural materials", "Ferm Living"]], ["Singapore", "Singapore", "Design hotels and cafés here look for warm, handmade lighting.", ["Boutique Hotel", "Design hotels"]], ["Melbourne", "Australia", "Café culture and relaxed interiors suit warm rattan lighting.", ["Café culture", "Minimalist"]], ["Amsterdam", "Netherlands", "Concept stores here look for natural, design-led home pieces.", ["Design", "Concept stores"]], ["Dubai", "United Arab Emirates", "Villas and resorts want statement lighting with natural textures.", ["Home décor", "Desert resorts"]], ["Tokyo", "Japan", "Compact homes favour light, handmade lamps with simple shapes.", ["Minimalist", "Craftsmanship"]]],
      portrait: "This group tends to be 25 to 44, decorates with natural textures, and often works in or follows hospitality and interior design.", loves: ["Anthropologie", "Ferm Living", "Tame Impala", "Men I Trust"],
      positioning: "Sell to designers and hotel buyers as sculptural lighting made by a named Cirebon workshop.", pitch: "Woven by hand in Cirebon, shaped to soften any room.", packaging: ["Flat-pack shipping guide for buyers ordering in volume", "Show the lamp lit in a real café photo"],
      channels: ["Pitch interior designers who furnish boutique hotels", "List with stores that carry HAY or Ferm Living", "Show the lamps lit in cafés and hotels on Instagram"],
      cautions: ["Qloo results describe group tendencies, not what any one person will do.", "Electrical fittings must meet each country’s safety standard, so check before shipping."],
      next: ["Check lighting and rattan demand on ITC Export Potential Map", "Register for UMKM BISA Ekspor business matching on InaExport", "Prepare a trade price list for volume orders"] },
    id: { headline: "Lampu rotanmu cocok untuk kota-kota cerah yang peduli desain, tempat tekstur alami dan hotel butik berjalan beriringan.",
      markets: [["Los Angeles", "Amerika Serikat", "Afinitas tertinggi terhadap sinyal interior boho dan hotel butik, dengan audiens yang juga menyukai Anthropologie dan HAY.", ["Boho Interior", "Anthropologie", "HAY"]], ["Copenhagen", "Denmark", "Audiens yang menyukai material alami dan interior tenang bergaya Skandinavia.", ["Natural materials", "Ferm Living"]], ["Singapore", "Singapura", "Hotel desain dan kafe di sini mencari lampu buatan tangan yang hangat.", ["Boutique Hotel", "Design hotels"]], ["Melbourne", "Australia", "Budaya kafe dan interior santai cocok untuk lampu rotan yang hangat.", ["Café culture", "Minimalist"]], ["Amsterdam", "Belanda", "Concept store di sini mencari perabot rumah alami yang berbasis desain.", ["Design", "Concept stores"]], ["Dubai", "Uni Emirat Arab", "Vila dan resort mencari lampu yang mencolok dengan tekstur alami.", ["Home décor", "Desert resorts"]], ["Tokyo", "Jepang", "Rumah mungil cocok dengan lampu buatan tangan yang ringan dan berbentuk sederhana.", ["Minimalist", "Craftsmanship"]]],
      portrait: "Kelompok ini cenderung berusia 25 sampai 44 tahun, menghias rumah dengan tekstur alami, dan sering tertarik di bidang perhotelan dan desain interior.", loves: ["Anthropologie", "Ferm Living", "Tame Impala", "Men I Trust"],
      positioning: "Jual ke desainer dan pembeli hotel sebagai lampu bernilai seni buatan bengkel Cirebon yang jelas namanya.", pitch: "Dianyam tangan di Cirebon, dibentuk untuk melembutkan ruangan mana pun.", packaging: ["Panduan pengiriman flat-pack untuk pesanan besar", "Tampilkan foto lampu menyala di kafe sungguhan"],
      channels: ["Tawarkan ke desainer interior yang mengisi hotel butik", "Masuk ke toko yang menjual HAY atau Ferm Living", "Tampilkan lampu menyala di kafe dan hotel lewat Instagram"],
      cautions: ["Hasil Qloo menggambarkan kecenderungan kelompok, bukan perilaku setiap orang.", "Komponen listrik harus memenuhi standar keamanan tiap negara, jadi cek sebelum mengirim."],
      next: ["Cek permintaan lampu dan rotan di ITC Export Potential Map", "Daftar business matching UMKM BISA Ekspor lewat InaExport", "Siapkan daftar harga grosir untuk pesanan besar"] } },
};

// Generic sample used by the preview for any other product, so every screen can be reviewed.
S.generic = {
  queries: ["handmade", "heritage craft", "sustainable"], refs: ["Muji", "Toast"],
  signals: [["Handmade", "Matches buyers who value products made by hand."], ["Heritage", "Fits a product with a clear origin story."], ["Muji", "Its fans like simple, well-made everyday goods."]],
  dest: "Kyoto, Amsterdam, Copenhagen, Melbourne", brands: "Muji, Toast, Kinfolk, Aesop", artists: "Ryuichi Sakamoto, Bon Iver, Khruangbin", taste: "Handmade, Heritage, Minimalist", places: "Nishiki Market, Foodhallen, Torvehallerne",
  en: { headline: "Your product fits cities that value handmade, story-rich goods and calm, natural design.",
    markets: [["Kyoto", "Japan", "Strong affinity for heritage and craftsmanship signals, with an audience that respects long making processes.", ["Heritage", "Craftsmanship", "Muji"]], ["Amsterdam", "Netherlands", "A sustainable, design-minded audience that shops at concept stores.", ["Sustainable", "Concept stores", "Toast"]], ["Copenhagen", "Denmark", "Natural materials and slow living make handmade goods feel premium here.", ["Natural materials", "Hygge"]]],
    portrait: "This group tends to be 30 to 49, buys fewer but better things, and wants to know who made a product and how.", loves: ["Muji", "Toast", "Kinfolk", "Aesop"],
    positioning: "Tell the maker’s story first: where it is made, by whom, and how long it takes.", pitch: "Made slowly, by hand, in Indonesia.", packaging: ["A small card with the maker’s story", "Natural, plastic-free packaging"],
    channels: ["Concept stores that stock brands like Toast", "Craft fairs and design markets", "Instagram content showing the making process"],
    cautions: ["Sample data: this brief is an example for reviewing the layout.", "Qloo results describe group tendencies, not what any one person will do."],
    next: ["Check demand for your product on ITC Export Potential Map", "Register for UMKM BISA Ekspor business matching on InaExport", "Prepare an English product profile and samples"] },
  id: { headline: "Produkmu cocok untuk kota-kota yang menghargai barang buatan tangan yang punya cerita, dengan desain tenang dan alami.",
    markets: [["Kyoto", "Jepang", "Afinitas kuat terhadap sinyal warisan dan kerajinan, dengan audiens yang menghargai proses pembuatan yang panjang.", ["Heritage", "Craftsmanship", "Muji"]], ["Amsterdam", "Belanda", "Audiens yang peduli keberlanjutan dan desain, dan suka berbelanja di concept store.", ["Sustainable", "Concept stores", "Toast"]], ["Copenhagen", "Denmark", "Material alami dan gaya hidup santai membuat barang buatan tangan terasa premium di sini.", ["Natural materials", "Hygge"]]],
    portrait: "Kelompok ini cenderung berusia 30 sampai 49 tahun, membeli lebih sedikit tapi berkualitas, dan ingin tahu siapa pembuat produk dan bagaimana caranya.", loves: ["Muji", "Toast", "Kinfolk", "Aesop"],
    positioning: "Ceritakan pembuatnya lebih dulu: di mana dibuat, oleh siapa, dan berapa lama prosesnya.", pitch: "Dibuat perlahan, dengan tangan, di Indonesia.", packaging: ["Kartu kecil berisi cerita pembuatnya", "Kemasan alami tanpa plastik"],
    channels: ["Concept store yang menjual merek seperti Toast", "Pameran kerajinan dan pasar desain", "Konten Instagram yang memperlihatkan proses pembuatan"],
    cautions: ["Data contoh: laporan ini hanya contoh untuk meninjau tampilan.", "Hasil Qloo menggambarkan kecenderungan kelompok, bukan perilaku setiap orang."],
    next: ["Cek permintaan produkmu di ITC Export Potential Map", "Daftar business matching UMKM BISA Ekspor lewat InaExport", "Siapkan profil produk berbahasa Inggris dan sampel"] },
};

// A brief with many markets, to review how the result list, map and dropdown handle long lists.
S.spices = {
  queries: ["spices", "home cooking", "natural ingredients", "gourmet"], refs: ["Diptyque", "Aesop"],
  signals: [["Home cooking", "Points to buyers who cook at home and try new cuisines."], ["Natural ingredients", "Fits single-origin, additive-free blends."], ["Gourmet", "Matches buyers who pay more for quality ingredients."]],
  dest: "Amsterdam, London, Melbourne, Singapore, Tokyo, Paris, Berlin, Dubai, Copenhagen, Los Angeles", brands: "Diptyque, Aesop, Toast, Kinfolk", artists: "Khruangbin, Bon Iver, Nujabes", taste: "Home cooking, Natural ingredients, Gourmet", places: "Foodhallen, Borough Market, Queen Victoria Market",
  en: { headline: "Your spice blends fit food-loving cities where people cook at home and look for authentic, natural ingredients.",
    markets: [
      ["Amsterdam", "Netherlands", "Indonesian food is already familiar here, and home cooks look for authentic spice pastes.", ["Indonesian food", "Home cooking"]],
      ["London", "United Kingdom", "Street food and market culture make new flavours easy to try.", ["Street food", "Borough Market"]],
      ["Melbourne", "Australia", "A brunch and café crowd that experiments with Asian flavours at home.", ["Brunch", "Plant-based"]],
      ["Singapore", "Singapore", "Food halls and premium gifting suit spice gift sets.", ["Food halls", "Premium gifting"]],
      ["Tokyo", "Japan", "Small, beautifully packed blends fit gifting and seasonal cooking.", ["Gift wrapping", "Seasonal"]],
      ["Paris", "France", "Gastronomy lovers value single-origin ingredients like Indonesian vanilla and pepper.", ["Gastronomy", "Artisanal"]],
      ["Berlin", "Germany", "A vegan audience that needs bold flavour for plant-based dishes.", ["Vegan", "Markthalle Neun"]],
      ["Dubai", "United Arab Emirates", "A halal, spice-loving audience with a strong gifting culture.", ["Halal", "Gifting"]],
      ["Copenhagen", "Denmark", "New Nordic cooks look for natural ingredients with a clear story.", ["New Nordic food", "Natural materials"]],
      ["Los Angeles", "United States", "Wellness and plant-based cooking create demand for turmeric and ginger blends.", ["Wellness", "Plant-based"]],
    ],
    portrait: "This group tends to be 25 to 44, cooks at home several times a week, and enjoys discovering authentic flavours from other cuisines.", loves: ["Diptyque", "Aesop", "Kinfolk", "Toast"],
    positioning: "Sell each blend as a taste of one Indonesian region, with a recipe card in English.", pitch: "Real bumbu, ground in Indonesia.", packaging: ["Recipe card on the back of each pack", "Resealable kraft pouches"],
    channels: ["Delis and food halls", "Recipe content on Instagram and TikTok", "Gift shops for seasonal sets"],
    cautions: ["Sample data: this brief shows a long market list for reviewing the layout.", "Food import rules differ by country, so check ITC Market Access Map."],
    next: ["Check spice demand on ITC Export Potential Map", "Register for UMKM BISA Ekspor business matching on InaExport", "Prepare food safety and halal documents"] },
  id: { headline: "Racikan bumbumu cocok untuk kota-kota pencinta kuliner yang suka memasak di rumah dan mencari bahan alami yang otentik.",
    markets: [
      ["Amsterdam", "Belanda", "Masakan Indonesia sudah akrab di sini, dan orang yang memasak di rumah mencari bumbu yang otentik.", ["Indonesian food", "Home cooking"]],
      ["London", "Inggris", "Budaya jajanan dan pasar membuat rasa baru mudah dicoba.", ["Street food", "Borough Market"]],
      ["Melbourne", "Australia", "Penikmat brunch dan kafe yang suka mencoba rasa Asia di rumah.", ["Brunch", "Plant-based"]],
      ["Singapore", "Singapura", "Food hall dan budaya hadiah premium cocok untuk set bumbu.", ["Food halls", "Premium gifting"]],
      ["Tokyo", "Jepang", "Bumbu kecil berkemasan cantik cocok untuk hadiah dan masakan musiman.", ["Gift wrapping", "Seasonal"]],
      ["Paris", "Prancis", "Pencinta gastronomi menghargai bahan satu asal seperti vanili dan lada Indonesia.", ["Gastronomy", "Artisanal"]],
      ["Berlin", "Jerman", "Audiens vegan yang butuh rasa kuat untuk masakan nabati.", ["Vegan", "Markthalle Neun"]],
      ["Dubai", "Uni Emirat Arab", "Audiens pencinta rempah dan produk halal dengan budaya hadiah yang kuat.", ["Halal", "Gifting"]],
      ["Copenhagen", "Denmark", "Juru masak New Nordic mencari bahan alami dengan cerita yang jelas.", ["New Nordic food", "Natural materials"]],
      ["Los Angeles", "Amerika Serikat", "Gaya hidup sehat dan masakan nabati menciptakan minat pada racikan kunyit dan jahe.", ["Wellness", "Plant-based"]],
    ],
    portrait: "Kelompok ini cenderung berusia 25 sampai 44 tahun, memasak di rumah beberapa kali seminggu, dan senang menemukan rasa otentik dari masakan lain.", loves: ["Diptyque", "Aesop", "Kinfolk", "Toast"],
    positioning: "Jual setiap racikan sebagai rasa dari satu daerah di Indonesia, lengkap dengan kartu resep berbahasa Inggris.", pitch: "Bumbu asli, digiling di Indonesia.", packaging: ["Kartu resep di balik setiap kemasan", "Kantong kraft yang bisa ditutup ulang"],
    channels: ["Toko deli dan food hall", "Konten resep di Instagram dan TikTok", "Toko hadiah untuk set musiman"],
    cautions: ["Data contoh: laporan ini menampilkan daftar pasar yang panjang untuk meninjau tampilan.", "Aturan impor makanan berbeda tiap negara, jadi cek ITC Market Access Map."],
    next: ["Cek permintaan rempah di ITC Export Potential Map", "Daftar business matching UMKM BISA Ekspor lewat InaExport", "Siapkan dokumen keamanan pangan dan halal"] },
};

const AGE_CURVES = {
  coffee: [["≤24", 62], ["25–29", 84], ["30–34", 96], ["35–44", 88], ["45–54", 71], ["55+", 54]],
  batik: [["≤24", 44], ["25–29", 58], ["30–34", 72], ["35–44", 89], ["45–54", 95], ["55+", 80]],
  rattan: [["≤24", 50], ["25–29", 76], ["30–34", 93], ["35–44", 90], ["45–54", 68], ["55+", 49]],
  spices: [["≤24", 58], ["25–29", 79], ["30–34", 91], ["35–44", 96], ["45–54", 82], ["55+", 66]],
  generic: [["≤24", 52], ["25–29", 70], ["30–34", 86], ["35–44", 95], ["45–54", 84], ["55+", 63]],
};

const AFFINITY = {
  coffee: [["Melbourne", 0.94], ["Seoul", 0.91], ["Copenhagen", 0.88], ["Tokyo", 0.86], ["Singapore", 0.84], ["London", 0.82], ["Berlin", 0.79], ["Dubai", 0.76]],
  batik: [["Kyoto", 0.93], ["Amsterdam", 0.89], ["Paris", 0.87], ["London", 0.85], ["Tokyo", 0.83], ["Copenhagen", 0.8], ["Melbourne", 0.77], ["Dubai", 0.74]],
  rattan: [["Los Angeles", 0.92], ["Copenhagen", 0.9], ["Singapore", 0.87], ["Melbourne", 0.85], ["Amsterdam", 0.82], ["Dubai", 0.79], ["Tokyo", 0.76]],
  spices: [["Amsterdam", 0.95], ["London", 0.93], ["Melbourne", 0.91], ["Singapore", 0.89], ["Tokyo", 0.86], ["Paris", 0.84], ["Berlin", 0.81], ["Dubai", 0.79], ["Copenhagen", 0.76], ["Los Angeles", 0.73]],
  generic: [["Kyoto", 0.9], ["Amsterdam", 0.87], ["Copenhagen", 0.84], ["Melbourne", 0.8]],
};
const NAMES = {
  coffee: { en: "Gayo Arabica coffee", id: "Kopi arabika Gayo" },
  batik: { en: "Batik tulis silk scarf", id: "Syal sutra batik tulis" },
  rattan: { en: "Rattan pendant lamp", id: "Lampu gantung rotan" },
  generic: { en: "Your product", id: "Produkmu" },
  spices: { en: "Indonesian spice blends", id: "Racikan bumbu Indonesia" },
};
const CATS = { coffee: "food", batik: "fashion", rattan: "craft", generic: "other", spices: "food" };


// ---- Sample official data (preview only, always labelled Sample) ----
const SAMPLE_FACTS = {
  Australia: [27.2e6, 64700], "South Korea": [51.7e6, 33100], Denmark: [5.95e6, 68300], Japan: [124e6, 32900], Singapore: [5.92e6, 84700],
  "United Kingdom": [68.3e6, 49500], Germany: [84.5e6, 52700], "United Arab Emirates": [10.2e6, 50300], Netherlands: [17.9e6, 62500],
  France: [68.2e6, 44400], "United States": [335e6, 81700], Jepang: [124e6, 32900],
};
const SAMPLE_HS = { coffee: ["0901", "Coffee"], batik: ["6214", "Shawls, scarves and veils"], rattan: ["9405", "Lamps and lighting fittings"], spices: ["0910", "Ginger, turmeric and other spices"], generic: ["4602", "Basketwork and wickerwork"] };
const SAMPLE_SUPPLIERS = {
  coffee: ["Brazil", "Viet Nam", "Colombia", "Indonesia", "Ethiopia"], batik: ["China", "India", "Italy", "Türkiye", "Indonesia"],
  rattan: ["China", "Viet Nam", "Poland", "Indonesia", "Germany"], spices: ["India", "China", "Viet Nam", "Indonesia", "Netherlands"],
  generic: ["China", "Viet Nam", "Indonesia", "India", "Philippines"],
};
const SAMPLE_SCALE = { coffee: 9e8, batik: 1.2e8, rattan: 6e8, spices: 1.5e8, generic: 9e7 };
function seed(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return () => ((h = Math.imul(h ^ (h >>> 13), 1274126177)) >>> 0) / 4294967296; }
function sampleTrade(key, country) {
  const r = seed(key + country);
  const base = SAMPLE_SCALE[key] * (0.3 + r() * 1.4);
  const g = -0.02 + r() * 0.12;
  const imports = [2021, 2022, 2023, 2024, 2025].map((year, i) => ({ year, value: Math.round(base * Math.pow(1 + g, i) * (0.95 + r() * 0.1)) }));
  const latest = imports[imports.length - 1];
  const growth = (Math.pow(latest.value / imports[0].value, 1 / 4) - 1) * 100;
  const shares = [34, 21, 12, 8, 5].map((v) => v * (0.8 + r() * 0.4));
  const names = SAMPLE_SUPPLIERS[key];
  const topSuppliers = names.map((name, i) => ({ name, share: shares[i], value: (shares[i] / 100) * latest.value })).sort((a, b) => b.share - a.share);
  const idIdx = topSuppliers.findIndex((x) => x.name === "Indonesia");
  const monthly = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(2024, 9 + i, 1);
    const season = 1 + 0.18 * Math.sin((i / 12) * Math.PI * 2);
    return { period: `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}`, value: Math.round((latest.value / 12) * season * (0.9 + r() * 0.2)) };
  });
  return {
    country, home: "Indonesia", hs: SAMPLE_HS[key][0], hsLabel: SAMPLE_HS[key][1], imports, monthly, latestYear: latest.year, latestValue: latest.value, growth, topSuppliers,
    indonesia: { value: topSuppliers[idIdx].value, share: topSuppliers[idIdx].share, rank: idIdx + 1, of: 40 + Math.round(r() * 30) }, source: "UN Comtrade",
  };
}

export function sampleKeyFor(text = "", { fallback = false } = {}) {
  const d = text.toLowerCase();
  const k = /kopi|coffee/.test(d) ? "coffee" : /batik/.test(d) ? "batik" : /rotan|rattan/.test(d) ? "rattan" : /bumbu|rempah|spice/.test(d) ? "spices" : null;
  return k || (fallback ? "generic" : null);
}

const EXTRA_POOL = ["London", "Paris", "Berlin", "Los Angeles", "Kyoto", "Dubai", "Amsterdam", "Tokyo", "Singapore"];
export function buildSampleResult(key, language) {
  const s = S[key]; const r = s[language] || s.en;
  const city = s.dest.split(",")[0];
  return {
    mocked: true,
    report: {
      headline: r.headline,
      markets: [
        ...r.markets.map(([name, country, why, signals]) => ({ name, country, why, signals, verified: true })),
        // Remaining Qloo matches, shown after the agent's picks
        ...EXTRA_POOL.filter((n) => !r.markets.some((m) => m[0] === n)).slice(0, 4).map((name) => ({
          name, country: ({ London: "United Kingdom", Paris: "France", Berlin: "Germany", "Los Angeles": "United States", Kyoto: "Japan", Dubai: "United Arab Emirates", Amsterdam: "Netherlands", Tokyo: "Japan", Singapore: "Singapore" })[name], why: "Qloo ranks this destination highly for your product’s taste signals.", signals: [], verified: true, extra: true,
        })),
      ],
      audience: { portrait: r.portrait, also_loves: r.loves },
      story: { positioning: r.positioning, pitch_line: r.pitch, name_and_packaging: r.packaging },
      channels: r.channels, cautions: r.cautions, next_steps: r.next,
    },
    signals: { tags: s.signals.map(([name, reason]) => ({ name, reason })), entities: [] },
    home: { code: "ID", name: "Indonesia" },
    qloo: {
      hs: { code: SAMPLE_HS[key][0], label: SAMPLE_HS[key][1] },
      trade: Object.fromEntries([...new Set(r.markets.map((m) => m[1]))].map((c) => [c, sampleTrade(key, c)])),
      facts: Object.fromEntries([...new Set(r.markets.map((m) => m[1]))].filter((c) => SAMPLE_FACTS[c]).map((c) => [c, { country: c, population: { value: SAMPLE_FACTS[c][0], year: 2024 }, gdpPerCapita: { value: SAMPLE_FACTS[c][1], year: 2024 }, source: "World Bank" }])),
      retrievedAt: Date.now(),
      audience: {
        age: (AGE_CURVES[key] || AGE_CURVES.generic).map(([label, value]) => ({ label, value })),
        gender: [{ label: "Women", value: key === "batik" ? 92 : key === "rattan" ? 78 : 74 }, { label: "Men", value: key === "batik" ? 48 : key === "rattan" ? 64 : 70 }],
      },
      destinations: [
        ...AFFINITY[key].map(([name, affinity]) => ({ name, affinity })),
        ...EXTRA_POOL.filter((n) => !AFFINITY[key].some((a) => a[0] === n)).slice(0, 4).map((name, i) => ({ name, affinity: 0.72 - i * 0.03 })),
      ],
      fit: Object.fromEntries(r.markets.map(([name], i) => {
        const d = Math.round(((AFFINITY[key].find((x) => x[0] === name) || [0, 0.75])[1]) * 100);
        const v = Math.max(50, Math.min(97, d + [6, -9, 3, -4, 8, -12, 1, -6, 4, -2][i % 10]));
        return [name, { destination: d, venues: v, venueCount: Math.max(1, Math.round((v - 55) / 7)), score: Math.round(d * 0.6 + v * 0.4) }];
      })),
    },
    trace: [
      { name: "Understand the product", tool: "AI", ok: true, detail: "product_summary, tag_queries, reference_entities" },
      ...s.queries.map((q) => ({ name: `Find Qloo tags for “${q}”`, tool: "Qloo /v2/tags", ok: true, detail: "Several candidates with different types" })),
      ...s.refs.map((q) => ({ name: `Find “${q}” in Qloo`, tool: "Qloo /search", ok: true, detail: `1 result: ${q}` })),
      { name: "Choose the right tag types", tool: "AI", ok: true, detail: "3 signals chosen, invalid IDs dropped" },
      { name: "Rank destinations by audience affinity", tool: "Qloo /v2/insights (destination)", ok: true, detail: s.dest },
      { name: "Brands this audience likes", tool: "Qloo /v2/insights (brand)", ok: true, detail: s.brands },
      { name: "Music this audience likes", tool: "Qloo /v2/insights (artist)", ok: true, detail: s.artists },
      { name: "Words that describe this taste", tool: "Qloo /v2/insights (tag)", ok: true, detail: s.taste },
      { name: "Age and gender tendencies", tool: "Qloo /v2/insights (demographics)", ok: true, detail: "Age bands with affinity" },
      { name: `Places in ${city} with the same audience`, tool: "Qloo /v2/insights (place)", ok: true, detail: s.places },
      { name: "Write the market brief", tool: "AI", ok: true, detail: "headline, markets, audience, story, channels" },
      { name: "Check markets against Qloo results", tool: "FindMarket", ok: true, detail: `${r.markets.length} of ${r.markets.length} markets found in Qloo destinations` },
    ],
  };
}

export function sampleBriefs(language) {
  const now = Date.now();
  return ["spices", "coffee", "batik", "rattan"].map((key, i) => {
    const res = buildSampleResult(key, language);
    return {
      id: `sample-${key}`,
      createdAt: now - i * 26 * 3600 * 1000,
      name: NAMES[key][language] || NAMES[key].en,
      category: CATS[key],
      language,
      description: res.report.story.positioning,
      thumb: null,
      ...res,
    };
  });
}
