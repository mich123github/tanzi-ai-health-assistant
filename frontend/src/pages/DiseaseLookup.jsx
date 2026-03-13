import React, { useState } from "react";
import diseases from "../data/diseases.json";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function DiseaseLookup() {
  const [q, setQ] = useState("");

  const results = diseases.filter((d) =>
    d.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto pt-4 pb-10 px-4">
      {/* Page Title */}
      <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
        Disease Lookup
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Search diseases and view symptoms with culturally relevant explanations.
      </p>

      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-3 text-gray-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for a disease..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border dark:border-gray-700 bg-white 
                     dark:bg-gray-800 text-gray-900 dark:text-gray-100 
                     focus:ring-2 focus:ring-teal-500 outline-none"
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center mt-10">
            No diseases found.
          </p>
        )}

        {results.map((d) => (
          <div
            key={d.id}
            className="p-5 rounded-xl shadow-md border bg-white dark:bg-gray-900 
                       dark:border-gray-700 transition hover:shadow-lg"
          >
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              {d.name}
            </h3>

            {/* Symptoms */}
            <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Symptoms:
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {d.symptoms.map((s, index) => (
                <span
                  key={index}
                  className="bg-teal-100 dark:bg-teal-700 text-teal-800 
                             dark:text-white px-3 py-1 text-sm rounded-full"
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Treatment / Advice */}
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Advice:</span> {d.treatment}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
