import React from 'react';

export default function InsightsWidget({ insights }) {
  return (
    <div className="bg-white p-4 border rounded mb-6">
      <h3 className="font-semibold mb-2">Health Insights</h3>
      {insights.length > 0 ? (
        <ul className="list-disc pl-5">
          {insights.map((tip, idx) => <li key={idx}>{tip}</li>)}
        </ul>
      ) : (
        <p>No significant insights yet. Keep tracking your health!</p>
      )}
    </div>
  );
}
