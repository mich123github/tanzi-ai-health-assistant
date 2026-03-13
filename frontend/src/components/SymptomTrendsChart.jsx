import React from 'react';
import { LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, Legend } from 'recharts';

export default function SymptomTrendsChart({ trendData }) {
  const dates = new Set();
  const data = [];

  // Flatten data
  Object.keys(trendData).forEach(symptom => {
    Object.keys(trendData[symptom]).forEach(date => dates.add(date));
  });

  Array.from(dates).sort().forEach(date => {
    const entry = { date };
    Object.keys(trendData).forEach(symptom => {
      entry[symptom] = trendData[symptom][date] || 0;
    });
    data.push(entry);
  });

  return (
    <div className="mb-6">
      <h3 className="font-semibold mb-2">Symptom Trends Over Time</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {Object.keys(trendData).map((symptom, idx) => (
          <Line key={symptom} type="monotone" dataKey={symptom} stroke="#82ca9d" />
        ))}
      </LineChart>
    </div>
  );
}
