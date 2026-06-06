// Car AI assistant knowledge engine.
// CARS_DATA holds the marketing + headline specs; CAR_EXTRA below adds the
// hard technical facts the assistant is most often asked about (tyres,
// transmission, drivetrain, engine, fuel, range, brakes). The intent matcher
// turns a free-text question into a focused, full-sentence answer.

// Per-car technical specs keyed by the same id used in CARS_DATA.
export const CAR_EXTRA = {
  "toyota-camry":           { engine: "2.5L naturally aspirated inline-4", transmission: "8-speed automatic", drivetrain: "Front-wheel drive (AWD optional)", tyres: "235/45 R18", fuel: "Gasoline", range: "~580 mi / tank", brakes: "Ventilated front discs, solid rear discs" },
  "honda-accord":           { engine: "2.0L Atkinson-cycle inline-4 two-motor hybrid", transmission: "e-CVT (electronic continuously variable)", drivetrain: "Front-wheel drive", tyres: "235/40 R19", fuel: "Hybrid (petrol-electric)", range: "~600 mi / tank", brakes: "4-wheel discs with regenerative braking" },
  "bmw-3-series":           { engine: "2.0L TwinPower turbo inline-4", transmission: "8-speed Steptronic automatic", drivetrain: "Rear-wheel drive (xDrive AWD optional)", tyres: "225/45 R18 front / 255/40 R18 rear", fuel: "Gasoline", range: "~480 mi / tank", brakes: "4-wheel ventilated discs" },
  "mercedes-benz-c-class":  { engine: "2.0L turbo inline-4 with 48V mild hybrid", transmission: "9-speed 9G-TRONIC automatic", drivetrain: "Rear-wheel drive (4MATIC AWD optional)", tyres: "225/45 R18 front / 245/40 R18 rear", fuel: "Mild-hybrid petrol", range: "~500 mi / tank", brakes: "4-wheel ventilated discs" },
  "hyundai-sonata":         { engine: "2.5L inline-4", transmission: "8-speed automatic", drivetrain: "Front-wheel drive", tyres: "235/45 R18", fuel: "Gasoline", range: "~570 mi / tank", brakes: "4-wheel discs" },
  "kia-k5":                 { engine: "1.6L turbo inline-4 (2.5L optional)", transmission: "8-speed automatic", drivetrain: "Front-wheel drive (AWD optional)", tyres: "235/45 R18", fuel: "Gasoline", range: "~560 mi / tank", brakes: "4-wheel discs" },
  "nissan-altima":          { engine: "2.5L inline-4", transmission: "Xtronic CVT", drivetrain: "Front-wheel drive (AWD optional)", tyres: "235/40 R19", fuel: "Gasoline", range: "~550 mi / tank", brakes: "4-wheel discs" },
  "audi-a4":                { engine: "2.0L TFSI turbo inline-4", transmission: "7-speed S tronic dual-clutch", drivetrain: "quattro all-wheel drive", tyres: "245/40 R18", fuel: "Gasoline", range: "~500 mi / tank", brakes: "4-wheel ventilated discs" },
  "lexus-es":               { engine: "2.5L inline-4 (hybrid available)", transmission: "8-speed automatic", drivetrain: "Front-wheel drive", tyres: "235/45 R18", fuel: "Gasoline / Hybrid", range: "~600 mi / tank", brakes: "4-wheel discs" },
  "genesis-g70":            { engine: "2.5L turbo inline-4", transmission: "8-speed automatic", drivetrain: "Rear-wheel drive (AWD optional)", tyres: "225/40 R19 front / 255/35 R19 rear", fuel: "Gasoline", range: "~430 mi / tank", brakes: "Brembo 4-piston front calipers" },
  "toyota-rav4":            { engine: "2.5L inline-4 plug-in hybrid", transmission: "e-CVT", drivetrain: "Electronic on-demand all-wheel drive", tyres: "235/55 R19", fuel: "Plug-in hybrid", range: "42 mi electric + ~600 mi hybrid", brakes: "4-wheel discs with regen" },
  "ford-explorer":          { engine: "2.3L EcoBoost turbo inline-4", transmission: "10-speed automatic", drivetrain: "Rear-wheel drive (4WD optional)", tyres: "255/65 R18", fuel: "Gasoline", range: "~500 mi / tank", brakes: "4-wheel ventilated discs" },
  "tesla-model-x":          { engine: "Dual electric motors", transmission: "Single-speed fixed gear", drivetrain: "All-wheel drive", tyres: "265/45 R20 (22-in optional)", fuel: "Battery electric", range: "348 mi EPA", brakes: "4-wheel discs with regenerative braking" },
  "porsche-cayenne":        { engine: "3.0L turbocharged V6", transmission: "8-speed Tiptronic S automatic", drivetrain: "All-wheel drive", tyres: "255/55 R19", fuel: "Gasoline", range: "~480 mi / tank", brakes: "6-piston front / 4-piston rear discs" },
  "porsche-911-carrera":    { engine: "3.0L twin-turbo flat-6 (boxer)", transmission: "8-speed PDK dual-clutch", drivetrain: "Rear-wheel drive", tyres: "235/40 R19 front / 295/35 R20 rear (staggered)", fuel: "Gasoline", range: "~400 mi / tank", brakes: "330mm front / 350mm rear discs" },
  "chevrolet-corvette-c8":  { engine: "6.2L LT2 V8 (naturally aspirated)", transmission: "8-speed dual-clutch", drivetrain: "Rear-wheel drive (mid-engine)", tyres: "245/35 R19 front / 305/30 R20 rear (staggered)", fuel: "Gasoline", range: "~400 mi / tank", brakes: "Brembo 4-wheel discs" },
  "ferrari-296-gtb":        { engine: "3.0L twin-turbo V6 plug-in hybrid", transmission: "8-speed F1 dual-clutch", drivetrain: "Rear-wheel drive", tyres: "245/35 R20 front / 305/35 R20 rear (staggered)", fuel: "Plug-in hybrid", range: "25 km (15 mi) electric-only", brakes: "Carbon-ceramic discs" },
  "ford-mustang-dark-horse":{ engine: "5.0L Coyote V8 (naturally aspirated)", transmission: "6-speed manual or 10-speed automatic", drivetrain: "Rear-wheel drive", tyres: "255/40 R19 front / 275/40 R19 rear", fuel: "Gasoline", range: "~380 mi / tank", brakes: "Brembo 6-piston front calipers" },
  "tesla-model-3":          { engine: "Single rear electric motor (dual-motor optional)", transmission: "Single-speed fixed gear", drivetrain: "Rear-wheel drive (AWD optional)", tyres: "235/45 R18 (19-in optional)", fuel: "Battery electric", range: "272 mi EPA", brakes: "4-wheel discs with regenerative braking" },
  "tesla-model-s-plaid":    { engine: "Tri-motor electric (carbon-sleeved rotors)", transmission: "Single-speed fixed gear", drivetrain: "All-wheel drive", tyres: "255/45 R19 front / 285/40 R19 rear", fuel: "Battery electric", range: "348 mi EPA", brakes: "4-wheel discs (carbon-ceramic optional)" },
  "lucid-air-pure":         { engine: "Single rear electric motor", transmission: "Single-speed fixed gear", drivetrain: "Rear-wheel drive", tyres: "245/45 R19", fuel: "Battery electric", range: "410 mi EPA", brakes: "4-wheel discs with regenerative braking" },
  "rivian-r1t":             { engine: "Quad electric motors (one per wheel)", transmission: "Single-speed fixed gear", drivetrain: "All-wheel drive", tyres: "275/65 R20 all-terrain", fuel: "Battery electric", range: "328 mi EPA", brakes: "4-wheel discs with regenerative braking" },
  "hyundai-ioniq-6":        { engine: "Single rear electric motor (dual-motor optional)", transmission: "Single-speed fixed gear", drivetrain: "Rear-wheel drive (AWD optional)", tyres: "225/55 R18 (20-in optional)", fuel: "Battery electric (800V architecture)", range: "361 mi EPA", brakes: "4-wheel discs with regenerative braking" },
  "bmw-i7":                 { engine: "Dual electric motors", transmission: "Single-speed fixed gear", drivetrain: "xDrive all-wheel drive", tyres: "255/45 R19 (21-in optional)", fuel: "Battery electric", range: "318 mi EPA", brakes: "4-wheel discs with regenerative braking" },
};

// Flatten a car + its extra specs into a single fact lookup object.
export function getCarFacts(car) {
  const extra = CAR_EXTRA[car.id] || {};
  const s = car.specs || {};
  return {
    name: `${car.make} ${car.model}`,
    make: car.make,
    model: car.model,
    year: car.year,
    price: car.price,
    passengers: s.passengers,
    doors: s.doors,
    bootSpace: s.bootSpace,
    headlights: s.headlights,
    autonomousTech: s.autonomousTech,
    autonomyLevel: s.autonomous?.level,
    autonomyCapabilities: s.autonomous?.capabilities,
    hp: s.performance?.hp,
    zeroToSixty: s.performance?.zeroToSixty,
    topSpeed: s.performance?.topSpeed,
    engine: extra.engine,
    transmission: extra.transmission,
    drivetrain: extra.drivetrain,
    tyres: extra.tyres,
    fuel: extra.fuel,
    range: extra.range,
    brakes: extra.brakes,
    paragraphs: car.paragraphs || [],
  };
}

// Suggested starter questions shown in the pop-up.
export const SUGGESTED_QUESTIONS = [
  "What tyre size does it use?",
  "What transmission and drivetrain does it have?",
  "What headlight technology does it use?",
  "Does it have ADAS / self-driving?",
  "What engine and how much power?",
  "How fast is 0–60 and top speed?",
  "How big is the boot / cargo space?",
  "What's the price and fuel type?",
];

// Intent table: first matching intent wins. Each `answer(f)` returns a full
// sentence string built from the car facts `f`.
const INTENTS = [
  {
    // Combined question — handle "transmission and drivetrain" in one answer.
    match: (q) =>
      /transmission|gearbox|gears/.test(q) &&
      /drivetrain|drive train|drive-train|\bdrive\b|awd|rwd|fwd|wheel drive/.test(q),
    answer: (f) => `The ${f.name} uses a ${f.transmission}, sending power through ${f.drivetrain}.`,
  },
  {
    keys: ["tyre", "tire", "wheel size", "rim", "rims", "tyres", "tires"],
    answer: (f) =>
      f.tyres
        ? `The ${f.name} runs on ${f.tyres} tyres${f.tyres.includes("staggered") ? " — a staggered setup with wider rubber at the rear for grip" : ""}.`
        : `Tyre data isn't listed for the ${f.name}, but cars in this class typically use 18–20 inch performance tyres.`,
  },
  {
    keys: ["transmission", "gearbox", "gear box", "gears", "automatic", "manual", "dual-clutch", "dual clutch", "pdk", "cvt", "shift"],
    answer: (f) => `The ${f.name} uses a ${f.transmission}.`,
  },
  {
    keys: ["drivetrain", "drive train", "drive-train", "awd", "rwd", "fwd", "4wd", "four-wheel", "all-wheel", "all wheel", "rear-wheel", "front-wheel", "wheel drive", "quattro", "xdrive", "4matic"],
    answer: (f) => `The ${f.name} sends power through ${f.drivetrain}.`,
  },
  {
    keys: ["headlight", "headlamp", "head light", "lighting", "led", "matrix light", "drl", "lights"],
    answer: (f) => `The ${f.name} is fitted with ${f.headlights} headlights.`,
  },
  {
    keys: ["adas", "autonom", "self driving", "self-driving", "driver assist", "driver-assist", "autopilot", "lane", "cruise", "fsd", "level 2", "level 3", "safety system", "pilot"],
    answer: (f) =>
      `The ${f.name} comes with ${f.autonomousTech} — rated ${f.autonomyLevel} autonomy. ${f.autonomyCapabilities}`,
  },
  {
    keys: ["engine", "motor", "powertrain", "cylinder", "v8", "v6", "flat-6", "displacement", "battery", "electric motor"],
    answer: (f) => `The ${f.name} is powered by a ${f.engine}${f.hp ? `, making ${f.hp}` : ""}.`,
  },
  {
    keys: ["horsepower", "power", "bhp", "hp", "torque", "output"],
    answer: (f) => `The ${f.name} produces ${f.hp} from its ${f.engine}.`,
  },
  {
    keys: ["0-60", "0 to 60", "zero to", "acceleration", "accelerate", "how fast", "how quick", "sprint", "launch"],
    answer: (f) => `The ${f.name} accelerates from 0–60 mph in ${f.zeroToSixty}, on its way to a top speed of ${f.topSpeed}.`,
  },
  {
    keys: ["top speed", "fastest", "max speed", "vmax", "v-max"],
    answer: (f) => `The ${f.name} has a top speed of ${f.topSpeed}.`,
  },
  {
    keys: ["range", "how far", "miles per charge", "mileage", "battery range", "electric range"],
    answer: (f) =>
      f.range
        ? `The ${f.name} offers a range of ${f.range}.`
        : `Range/economy isn't listed for the ${f.name}.`,
  },
  {
    keys: ["fuel", "gas", "petrol", "diesel", "hybrid", "electric", "charge", "ev"],
    answer: (f) => `The ${f.name} is a ${f.fuel} vehicle${f.range ? `, with a range of ${f.range}` : ""}.`,
  },
  {
    keys: ["price", "cost", "how much", "msrp", "value", "expensive", "afford"],
    answer: (f) => `The ${f.name} starts at ${f.price} (base market value).`,
  },
  {
    keys: ["boot", "trunk", "cargo", "luggage", "storage", "space", "frunk"],
    answer: (f) => `The ${f.name} offers ${f.bootSpace} of cargo / boot space.`,
  },
  {
    keys: ["seat", "passenger", "people", "capacity", "how many people"],
    answer: (f) => `The ${f.name} seats ${f.passengers} passengers.`,
  },
  {
    keys: ["door", "doors"],
    answer: (f) => `The ${f.name} is a ${f.doors}-door ${f.doors <= 2 ? "coupe / sports car" : "model"}.`,
  },
  {
    keys: ["brake", "braking", "caliper", "rotor", "disc"],
    answer: (f) =>
      f.brakes
        ? `The ${f.name} uses ${f.brakes}.`
        : `Brake details aren't listed for the ${f.name}.`,
  },
  {
    keys: ["year", "model year", "how old", "new"],
    answer: (f) => `The reference model year for the ${f.name} is ${f.year}.`,
  },
  {
    keys: ["overview", "about", "tell me about", "summary", "describe", "what is", "intro"],
    answer: (f) => f.paragraphs[0] || `The ${f.name} is part of the AutoHub technical encyclopedia.`,
  },
];

// Main entry: returns a string answer for a free-text question about `car`.
export function answerQuestion(car, rawQuery) {
  const f = getCarFacts(car);
  const q = (rawQuery || "").toLowerCase().trim();
  if (!q) return `Ask me anything about the ${f.name} — tyres, transmission, drivetrain, ADAS, power, and more.`;

  for (const intent of INTENTS) {
    const hit = intent.match ? intent.match(q) : intent.keys.some((k) => q.includes(k));
    if (hit) {
      return intent.answer(f);
    }
  }

  // Fallback: surface the most relevant engineering paragraph by word overlap.
  const words = q.split(/\W+/).filter((w) => w.length > 3);
  let best = null;
  let bestScore = 0;
  for (const p of f.paragraphs) {
    const lower = p.toLowerCase();
    const score = words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  if (best && bestScore > 0) return best;

  return `I don't have that exact spec for the ${f.name}, but I can tell you about its tyres, transmission, drivetrain, headlights, ADAS, engine, power, 0–60, top speed, range, price, or cargo space — just ask.`;
}
