// Generates agent/car_data.json from the frontend's single source of truth
// (src/data/cars.js + carChat.js) so the Python agent never hand-maintains a
// duplicate catalog. Run automatically before `npm run build` (prebuild hook).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const { CARS_DATA } = await import(resolve(root, 'src/data/cars.js'));
const { getCarFacts } = await import(resolve(root, 'src/data/carChat.js'));

// Parse a price string like "$26,420" into an integer (26420); null if absent.
const priceNum = (p) => {
  if (!p) return null;
  const n = parseInt(String(p).replace(/[^0-9]/g, ''), 10);
  return Number.isNaN(n) ? null : n;
};

const cars = CARS_DATA.map((car) => ({
  id: car.id,
  ...getCarFacts(car),
  priceNum: priceNum(car.price),
}));

const outPath = resolve(root, 'agent/car_data.json');
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(cars, null, 2) + '\n');
console.log(`Wrote ${cars.length} cars to agent/car_data.json`);
