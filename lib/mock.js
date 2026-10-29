// Sample data used when MOCK_MODE=true or when keys are missing.
// It lets you try the whole interface before your Qloo key arrives.
// The real demo for judges must run with real keys.

export const mockPlan = {
  product_summary: "Single-origin natural-process Arabica coffee from Gayo, Aceh, sold in compostable packaging.",
  tag_queries: ["specialty coffee", "third wave coffee", "sustainable", "single origin"],
  reference_entities: [
    { name: "Blue Bottle Coffee", type: "brand" },
    { name: "Patagonia", type: "brand" },
  ],
};

export const mockTagCandidates = {
  "specialty coffee": [
    { id: "urn:tag:genre:place:specialty_coffee", name: "Specialty Coffee", type: "urn:tag:genre:place" },
    { id: "urn:tag:keyword:media:coffee", name: "Coffee", type: "urn:tag:keyword:media" },
  ],
  "third wave coffee": [{ id: "urn:tag:genre:place:third_wave_coffee", name: "Third Wave Coffee", type: "urn:tag:genre:place" }],
  sustainable: [
    { id: "urn:tag:audience:sustainability", name: "Sustainability", type: "urn:tag:audience" },
    { id: "urn:tag:keyword:media:sustainable", name: "Sustainable", type: "urn:tag:keyword:media" },
  ],
  "single origin": [{ id: "urn:tag:keyword:place:single_origin", name: "Single Origin", type: "urn:tag:keyword:place" }],
};

export const mockEntityCandidates = [
  { id: "mock-blue-bottle", name: "Blue Bottle Coffee", type: "urn:entity:brand" },
  { id: "mock-patagonia", name: "Patagonia", type: "urn:entity:brand" },
];

export const mockChoice = {
  tags: [
    { id: "urn:tag:genre:place:specialty_coffee", reason: "The place-genre tag matches people who seek out coffee shops, not films about coffee." },
    { id: "urn:tag:genre:place:third_wave_coffee", reason: "Signals buyers who care about origin and brewing method." },
    { id: "urn:tag:audience:sustainability", reason: "Fits the compostable packaging story." },
  ],
  entities: [
    { id: "mock-blue-bottle", reason: "Its fans already pay a premium for traceable beans." },
    { id: "mock-patagonia", reason: "Shares the environmental values behind the packaging." },
  ],
};

export const mockInsights = {
  destinations: [
    { id: "d1", name: "Melbourne", country: "AU", affinity: 0.94 },
    { id: "d2", name: "Seoul", country: "KR", affinity: 0.91 },
    { id: "d3", name: "Portland", country: "US", affinity: 0.9 },
    { id: "d4", name: "Copenhagen", country: "DK", affinity: 0.88 },
    { id: "d5", name: "Berlin", country: "DE", affinity: 0.86 },
    { id: "d6", name: "Bali", country: "ID", affinity: 0.85 },
  ],
  brands: [
    { id: "b1", name: "Aesop" }, { id: "b2", name: "Kinfolk" }, { id: "b3", name: "Fellow" },
    { id: "b4", name: "Muji" }, { id: "b5", name: "Allbirds" },
  ],
  artists: [{ id: "a1", name: "Khruangbin" }, { id: "a2", name: "Nujabes" }, { id: "a3", name: "Bon Iver" }],
  tags: [
    { id: "t1", name: "Minimalist" }, { id: "t2", name: "Craftsmanship" }, { id: "t3", name: "Slow living" },
    { id: "t4", name: "Indie" }, { id: "t5", name: "Eco-conscious" },
  ],
  demographics: [{ age: "25-34", tendency: "strong" }, { age: "35-44", tendency: "moderate" }],
  places: [{ id: "p1", name: "Market Lane Coffee" }, { id: "p2", name: "Seven Seeds" }, { id: "p3", name: "Proud Mary" }],
};

export function mockReport(language) {
  const id = language === "id";
  return {
    headline: id
      ? "Kopi Gayo kamu paling cocok untuk kota-kota dengan budaya kafe specialty yang kuat dan audiens yang peduli lingkungan."
      : "Your Gayo coffee fits cities with a deep specialty café culture and an audience that cares about sustainability.",
    markets: [
      {
        name: "Melbourne", country: "Australia",
        why: id ? "Afinitas tertinggi terhadap sinyal kopi specialty dan keberlanjutan. Audiensnya juga menyukai merek seperti Aesop dan Fellow." : "Highest affinity for the specialty coffee and sustainability signals. The same audience leans toward brands like Aesop and Fellow.",
        signals: ["Specialty Coffee", "Aesop", "Fellow"],
      },
      {
        name: "Seoul", country: "South Korea",
        why: id ? "Audiens dengan selera minimalis dan kerajinan yang kuat, cocok untuk cerita asal-usul biji kopi." : "An audience with strong minimalist and craftsmanship leanings that suits a bean-origin story.",
        signals: ["Minimalist", "Craftsmanship", "Muji"],
      },
      {
        name: "Copenhagen", country: "Denmark",
        why: id ? "Budaya slow living dan kemasan ramah lingkungan menjadi nilai tambah di sini." : "Slow-living culture makes compostable packaging a selling point rather than a footnote.",
        signals: ["Slow living", "Eco-conscious"],
      },
    ],
    audience: {
      portrait: id
        ? "Kelompok ini cenderung berusia 25 sampai 44 tahun, menghargai produk dengan cerita asal-usul yang jelas, dan memilih merek yang tenang dan minimalis daripada yang mencolok."
        : "This group tends to be 25 to 44, values products with a clear origin story, and leans toward calm, minimalist brands over loud ones.",
      also_loves: ["Aesop", "Kinfolk", "Khruangbin", "Nujabes"],
    },
    story: {
      positioning: id ? "Jual kopi ini sebagai hasil kerja petani dataran tinggi Gayo, bukan sekadar 'kopi Indonesia'." : "Sell it as the work of Gayo highland farmers, not just 'Indonesian coffee'.",
      name_and_packaging: id ? ["Tampilkan nama desa dan ketinggian kebun", "Desain kemasan polos dengan satu warna tanah"] : ["Print the village name and farm altitude", "Plain packaging with a single earth tone"],
      pitch_line: id ? "Ditanam di ketinggian 1.400 meter, diproses di bawah matahari Gayo." : "Grown at 1,400 metres, dried under the Gayo sun.",
    },
    channels: id
      ? ["Tawarkan ke roaster dan kafe seperti Market Lane Coffee di Melbourne", "Buka toko di platform yang menjual merek seperti Fellow", "Kolaborasi dengan konten bertema slow living"]
      : ["Pitch roasters and cafés like Market Lane Coffee in Melbourne", "List on stores that already carry brands like Fellow", "Partner with slow-living content creators"],
    cautions: id
      ? ["Hasil Qloo menggambarkan kecenderungan kelompok, bukan perilaku setiap orang.", "Periksa tarif dan aturan impor di ITC Market Access Map sebelum mengirim barang."]
      : ["Qloo results describe group tendencies, not what any one person will do.", "Check tariffs and import rules on ITC Market Access Map before shipping."],
    next_steps: id
      ? ["Cek permintaan kopi untuk negara ini di ITC Export Potential Map", "Daftar business matching UMKM BISA Ekspor lewat InaExport", "Siapkan sampel dan profil produk berbahasa Inggris"]
      : ["Check coffee demand for these countries on ITC Export Potential Map", "Register for UMKM BISA Ekspor business matching on InaExport", "Prepare samples and an English product profile"],
  };
}
