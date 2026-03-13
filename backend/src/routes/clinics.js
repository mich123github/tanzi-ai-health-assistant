import express from 'express';
//import clinicsData from '../../data/clinics.geojson' assert { type: 'json' };
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clinicsData = JSON.parse(
  readFileSync(path.join(__dirname, '../../data/clinics.geojson'), 'utf8')
);

const router = express.Router();

// Return all clinics (small dataset in data/clinics.geojson)
router.get('/', (req, res) => res.json(clinicsData));

// Simple "nearby" by bounding box (very basic)
router.get('/nearby', (req, res) => {
  const { lat, lng, radiusKm = 10 } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: 'Provide lat & lng' });

  // naive filter: compute approximate distance via Pythagoras on lat/lng (OK for small radii)
  const latNum = parseFloat(lat), lngNum = parseFloat(lng), r = parseFloat(radiusKm);
  const results = clinicsData.features.filter(f => {
    const [fx, fy] = f.geometry.coordinates;
    const dLat = (fx - lngNum) * 111; // degrees->km approx (lol simple)
    const dLng = (fy - latNum) * 111;
    const dist = Math.sqrt(dLat*dLat + dLng*dLng);
    return dist <= r;
  });
  res.json({ count: results.length, clinics: results });
});

export default router;
