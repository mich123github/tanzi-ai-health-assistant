import React from 'react';

export default function LanguageSelector({ language, setLanguage }) {
  return (
    <div className="mb-2">
      <label className="mr-2">Language:</label>
      <select
        value={language}
        onChange={e => setLanguage(e.target.value)}
        className="border p-1 rounded"
      >
        <option value="en">English</option>
        <option value="chy">Chichewa</option>
      </select>
    </div>
  );
}
