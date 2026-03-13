// maps keywords (English + basic Chichewa) to symptom keys
const MAP = {
  fever: ['fever','hot','high temperature','kutentha'],
  cough: ['cough','coughing','kukhutitsidwa','kukhutsa'],
  chest_pain: ['chest pain','pain in chest','mtima','chifuwa'],
  bleeding: ['bleeding','blood','kutupa','magazi'],
  headache: ['headache','migraine','mutu']
};

export function normalizeSymptoms(text) {
  if (!text) return [];
  const s = text.toLowerCase();
  const found = new Set();
  for (const [key, terms] of Object.entries(MAP)) {
    for (const t of terms) {
      if (s.includes(t)) {
        found.add(key);
        break;
      }
    }
  }
  return Array.from(found);
}

export function triage(normalized, age) {
  // emergency if chest pain or bleeding
  if (normalized.includes('chest_pain') || normalized.includes('bleeding')) {
    return { level: 3, label: 'Emergency', advice: 'Go to the nearest emergency department immediately.' };
  }
  // urgent if young child with fever
  if (normalized.includes('fever') && age && age < 2) {
    return { level: 2, label: 'Urgent', advice: 'Young children with fever should see a clinician right away.' };
  }
  if (normalized.includes('fever') || normalized.includes('cough') || normalized.includes('headache')) {
    return { level: 1, label: 'Clinic', advice: 'Visit a clinic if symptoms persist for >48 hours or worsen.' };
  }
  return { level: 0, label: 'Self-care', advice: 'Rest, hydrate, and monitor your symptoms.' };
}
