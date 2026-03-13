import React from 'react';
import { PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

export default function TriageBreakdownChart({ triageCounts }) {
  const data = Object.keys(triageCounts).map(key => ({
    name: key.toUpperCase(),
    value: triageCounts[key],
  }));

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Triage Severity Breakdown</h3>
      <PieChart width={400} height={300}>
        <Pie data={data} dataKey="value" label />
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
}
