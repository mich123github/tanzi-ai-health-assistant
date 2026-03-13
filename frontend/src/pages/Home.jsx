import React from "react";
import { Link } from "react-router-dom";
import { 
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  MapPinIcon,
  ChartBarIcon,
} from "@heroicons/react/24/solid";

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-6 bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* HERO SECTION */}
      <section className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
          AI Health Portal
        </h1>

        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Your intelligent assistant for symptoms, health education, and care guidance.
        </p>

        <Link
          to="/symptom-checker"
          className="inline-block mt-5 bg-teal-600 hover:bg-teal-700 
          text-white px-6 py-2 rounded-xl transition-all duration-200"
        >
          Start Symptom Check
        </Link>
      </section>

      {/* FEATURE GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* SYMPTOM CHECKER */}
        <FeatureCard 
          title="Symptom Checker"
          desc="AI-driven health insights based on your symptoms."
          link="/symptom-checker"
          Icon={MagnifyingGlassIcon}
        />

        {/* CHATBOT */}
        <FeatureCard 
          title="Health Chatbot"
          desc="Talk to an AI assistant in English or Chichewa."
          link="/chat"
          Icon={ChatBubbleLeftRightIcon}
        />

        {/* EDUCATION */}
        <FeatureCard 
          title="Education Library"
          desc="Access articles, videos, and downloadable lessons."
          link="/education"
          Icon={BookOpenIcon}
        />

        {/* FACILITY LOCATOR */}
        <FeatureCard 
          title="Facility Locator"
          desc="Find clinics, hospitals, and pharmacies near you."
          link="/locator"
          Icon={MapPinIcon}
        />

        {/* DASHBOARD */}
        <FeatureCard 
          title="Dashboard"
          desc="View your history, analytics, and triage outcomes."
          link="/dashboard"
          Icon={ChartBarIcon}
        />

      </section>

      {/* FOOTER */}
      <footer className="text-center mt-10 text-xs text-gray-500 dark:text-gray-400">
        © 2025 AI Health Portal — v1.0
      </footer>
    </div>
  );
}

// COMPONENT FOR FEATURE CARD
function FeatureCard({ title, desc, link, Icon }) {
  return (
    <Link
      to={link}
      className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-5 
      flex justify-between items-center hover:shadow-lg 
      transition-all duration-300 group"
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {title}
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-sm mt-1">
          {desc}
        </p>
      </div>

      <Icon className="w-10 h-10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
    </Link>
  );
}
