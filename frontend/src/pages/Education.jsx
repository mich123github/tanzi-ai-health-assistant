// frontend/src/pages/Education.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/**
 * Education.jsx
 * - Mobile-first responsive education page
 * - Videos + articles + downloads + newsletter + bookmarking
 *
 * Notes:
 * - Newsletter POST endpoint: POST /api/newsletter  { email }
 * - Downloads assume static files served from /assets/ or similar
 * - Bookmarks saved to localStorage under key "edu_bookmarks"
 */

const SAMPLE_ARTICLES = [
  {
    id: "art-01",
    title: "Managing Fever at Home — Simple Steps",
    summary:
      "Short guide to caring for fever in children and adults, including when to seek help.",
    tags: ["self-care", "fever", "children"],
    file: "/assets/articles/fever_guide.pdf",
    author: "Ministry of Health",
    date: "2024-10-05",
  },
  {
    id: "art-02",
    title: "Preventing Waterborne Diseases",
    summary:
      "Practical methods to keep drinking water safe in low-resource settings.",
    tags: ["prevention", "water", "hygiene"],
    file: "/assets/articles/water_safety.pdf",
    author: "Public Health Malawi",
    date: "2024-09-12",
  },
  {
    id: "art-03",
    title: "Healthy Eating on a Budget",
    summary:
      "Local foods that provide good nutrition without expensive imports — recipes included.",
    tags: ["nutrition", "diet"],
    file: "/assets/articles/healthy_eating.pdf",
    author: "Community Health",
    date: "2024-08-02",
  },
  // add more items as needed
];

const SAMPLE_VIDEOS = [
  {
    id: "vid-01",
    title: "How to use Oral Rehydration Salts (ORS)",
    ytId: "dQw4w9WgXcQ", // replace with real ids
    length: "04:12",
    topic: "rehydration",
  },
  {
    id: "vid-02",
    title: "Recognizing Malaria Symptoms",
    ytId: "9bZkp7q19f0",
    length: "06:30",
    topic: "malaria",
  },
  {
    id: "vid-03",
    title: "How to Check Your Child's Breathing",
    ytId: "3JZ_D3ELwOQ",
    length: "05:20",
    topic: "childcare",
  },
];

export default function Education() {
  // UI state
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [articlesToShow, setArticlesToShow] = useState(6);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("edu_bookmarks") || "[]");
    } catch {
      return [];
    }
  });

  // Newsletter
  const [email, setEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(null); // null | "loading" | "ok" | "error"

  // Videos: local expand state (which video is playing inline)
  const [activeVideo, setActiveVideo] = useState(null);

  // Derived lists
  const allTags = useMemo(() => {
    const s = new Set();
    SAMPLE_ARTICLES.forEach((a) => a.tags.forEach((t) => s.add(t)));
    return ["all", ...Array.from(s)];
  }, []);

  const filteredArticles = useMemo(() => {
    let list = SAMPLE_ARTICLES.slice();
    if (tagFilter !== "all") {
      list = list.filter((a) => a.tags.includes(tagFilter));
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.tags.join(" ").toLowerCase().includes(q)
      );
    }
    return list;
  }, [query, tagFilter]);

  useEffect(() => {
    // persist bookmarks
    localStorage.setItem("edu_bookmarks", JSON.stringify(bookmarks));
  }, [bookmarks]);

  function toggleBookmark(id) {
    setBookmarks((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      return [...prev, id];
    });
  }

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setNewsletterStatus("error");
      return;
    }
    setNewsletterStatus("loading");
    try {
      // replace with your API endpoint
      await axios.post("/api/newsletter", { email });
      setNewsletterStatus("ok");
      setEmail("");
    } catch (err) {
      console.error("Newsletter signup failed", err);
      setNewsletterStatus("error");
    }
  }

  function downloadFile(url) {
    // simple download link opener — ensures target path
    window.open(url, "_blank", "noopener");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
            Health Education Library
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Practical lessons, videos and downloadable resources for learners and
            community health workers.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Search, Newsletter, Tags */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
              <label htmlFor="edu-search" className="text-sm font-semibold block mb-2">
                Search lessons & articles
              </label>
              <div className="relative">
                <input
                  id="edu-search"
                  className="w-full pl-3 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-300 text-sm"
                  placeholder="e.g. ORS, malaria, fever"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                {query && (
                  <button
                    className="absolute right-2 top-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Tags filter */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Categories</p>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTagFilter(t)}
                      className={`text-sm px-3 py-1 rounded-full border transition
                        ${t === tagFilter ? "bg-teal-600 text-white border-teal-600" : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700"}`}
                      aria-pressed={t === tagFilter}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
              <h3 className="font-semibold">Join our newsletter</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Get new lessons and updates — weekly.
              </p>

              <form onSubmit={handleSubscribe} className="mt-3 flex gap-2" aria-label="subscribe form">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm"
                  aria-label="email"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm"
                >
                  {newsletterStatus === "loading" ? "Sending..." : "Subscribe"}
                </button>
              </form>

              {newsletterStatus === "ok" && (
                <div className="mt-3 text-sm text-green-600">Subscribed — check your inbox.</div>
              )}
              {newsletterStatus === "error" && (
                <div className="mt-3 text-sm text-red-600">Error — try a valid email.</div>
              )}
            </div>

            {/* Bookmarks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
              <h3 className="font-semibold">Bookmarks</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Saved resources for quick access.</p>
              <div className="mt-3 space-y-2">
                {bookmarks.length === 0 && <div className="text-sm text-gray-500">No bookmarks yet.</div>}
                {bookmarks.map((id) => {
                  const art = SAMPLE_ARTICLES.find((a) => a.id === id);
                  if (!art) return null;
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <div className="text-sm">{art.title}</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => downloadFile(art.file)} className="text-sm text-teal-600">
                          Download
                        </button>
                        <button onClick={() => toggleBookmark(id)} aria-label={`Remove bookmark ${art.title}`} className="text-sm text-gray-500">
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Center & Right: Videos + Articles */}
          <section className="lg:col-span-2 space-y-6">
            {/* Featured video / hero */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2">
                  <h2 className="text-xl font-semibold">Featured lesson</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Short course on emergency first response and ORS.</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setActiveVideo(SAMPLE_VIDEOS[0].ytId)} className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm">Watch video</button>
                    <a href="/assets/courses/ors_quick_guide.pdf" className="px-3 py-2 border rounded-lg text-sm">Download lesson</a>
                  </div>
                </div>

                <div className="md:w-1/2">
                  {/* Video preview */}
                  <div className="w-full aspect-video rounded-lg overflow-hidden border">
                    {activeVideo ? (
                      <iframe
                        title="Active video"
                        src={`https://youtu.be/XG8olDy4aaU?si=ZEVjj07uKVof0P52${activeVideo}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
                        <span>Preview video — click Watch</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Video library */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SAMPLE_VIDEOS.map((v) => (
                <article key={v.id} className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border dark:border-gray-700 hover:shadow-lg transition">
                  <div className="flex gap-3 items-center">
                    <div className="w-28 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
                      {/* Thumbnail via youtube img */}
                      <img src={`https://youtu.be/PdRG0k060HE?si=ZLZVAhXz9VqemMop${v.ytId}/hqdefault.jpg`} alt={v.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{v.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{v.length} • {v.topic}</p>
                      <div className="mt-2 flex gap-2">
                        <button onClick={() => setActiveVideo(v.ytId)} className="text-sm px-2 py-1 rounded bg-teal-600 text-white">Play</button>
                        <a target="_blank" rel="noreferrer" href={`https://youtu.be/PdRG0k060HE?si=ZLZVAhXz9VqemMop=${v.ytId}`} className="text-sm px-2 py-1 border rounded">Open</a>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Article list */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.slice(0, articlesToShow).map((a) => (
                <article key={a.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border dark:border-gray-700 hover:scale-[1.01] transition-transform">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{a.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{a.summary}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        {a.tags.map((t) => (
                          <span key={t} className="text-xs px-2 py-1 rounded-full bg-teal-50 dark:bg-teal-700 text-teal-700 dark:text-white">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-xs text-gray-500 dark:text-gray-400">{a.author}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{a.date}</div>

                      <div className="mt-3 flex gap-2">
                        <button onClick={() => downloadFile(a.file)} className="text-sm px-2 py-1 border rounded">Download</button>
                        <button onClick={() => toggleBookmark(a.id)} aria-pressed={bookmarks.includes(a.id)} className={`text-sm px-2 py-1 rounded ${bookmarks.includes(a.id) ? "bg-teal-600 text-white" : "border"}`}>
                          {bookmarks.includes(a.id) ? "Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredArticles.length > articlesToShow && (
              <div className="flex justify-center mt-4">
                <button onClick={() => setArticlesToShow((n) => n + 6)} className="px-4 py-2 rounded-lg border bg-white dark:bg-gray-800">Load more</button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
