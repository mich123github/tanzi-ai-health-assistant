import React, { useState, useEffect, useRef } from 'react';
import API from '../services/api';
import { FiMic } from 'react-icons/fi';

export default function Chatbot() {
  const [msg, setMsg] = useState('');
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('chy');
  const [showEmotions, setShowEmotions] = useState(true);
  const [recognizing, setRecognizing] = useState(false);

  const chatEndRef = useRef(null);

  const EMOTIONS = {
    sad: { chy: 'Ndikumva chisoni', en: 'I am feeling sad' },
    stressed: { chy: 'Ndikumva kupsinjika', en: 'I feel stressed' },
    worried: { chy: 'Ndikumva nkhawa', en: 'I feel worried' },
    angry: { chy: 'Ndikumva mkwiyo', en: 'I feel angry' },
    okay: { chy: 'Ndili bwino koma sindikupeza mtendere', en: 'I am okay but not fully fine' },
    happy: { chy: 'Ndikumva bwino lero', en: 'I feel good today' }
  };

  useEffect(() => {
    setLog([
      {
        from: 'bot',
        text:
          language === 'chy'
            ? 'Moni! Muli bwanji lero? Mungandiuze momwe mukumvera.'
            : 'Hello! How are you today? You can tell me how you’re feeling.'
      },
    ]);
    setShowEmotions(true);
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log, loading]);

  async function send(e, forcedText = null) {
    e?.preventDefault();

    const textToSend = forcedText || msg;
    if (!textToSend.trim()) return;

    setShowEmotions(false);

    setLog(l => [...l, { from: 'user', text: textToSend }]);
    setLoading(true);

    try {
      const res = await API.post('/chat', {
        message: textToSend,
        language,
        useGemini: true
      });

      setLog(l => [...l, { from: 'bot', text: res.data.reply }]);
    } catch (err) {
      setLog(l => [
        ...l,
        {
          from: 'bot',
          text:
            language === 'chy'
              ? 'Pepani, vutoli lalowa. Tiyese kachiwiri.'
              : 'Sorry, something went wrong. Let’s try again.',
        },
      ]);
    }

    setMsg('');
    setLoading(false);
  }

  function startVoice() {
    if (!('webkitSpeechRecognition' in window)) {
      alert(
        language === 'chy'
          ? 'Chipangizochi sichitha kuzindikira mawu.'
          : 'Your device does not support voice input.'
      );
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = language === 'chy' ? 'ny-MW' : 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => setRecognizing(true);
    rec.onend = () => setRecognizing(false);
    rec.onerror = () => setRecognizing(false);

    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMsg(transcript);
      send(null, transcript);
    };

    rec.start();
  }

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <header className="p-4 w-full bg-teal-600 text-white flex justify-between items-center dark:bg-teal-700">
        <div>
          <h2 className="text-lg font-semibold">Tanzi Chatbot</h2>
          <p className="text-sm opacity-80">
            {language === 'chy'
              ? 'Zothandiza mwachidule komanso mofatsa'
              : 'Warm, simple emotional support'}
          </p>
        </div>

        <button
          onClick={() => setLanguage(language === 'chy' ? 'en' : 'chy')}
          className="px-3 py-1 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition text-sm dark:bg-gray-800 dark:text-white"
        >
          {language === 'chy' ? 'English' : 'Chichewa'}
        </button>
      </header>

      {/* Chat Section */}
      <main className="flex-1 p-4 space-y-3 w-full max-w-full overflow-x-hidden">

        {showEmotions && (
          <div className="flex flex-wrap gap-2 mb-2 w-full">
            {Object.keys(EMOTIONS).map(key => (
              <button
                key={key}
                onClick={(e) => send(e, EMOTIONS[key][language])}
                className="px-3 py-1 bg-white border border-teal-500 text-teal-700 rounded-lg text-sm hover:bg-teal-50 dark:bg-gray-800 dark:text-gray-100"
              >
                {EMOTIONS[key][language]}
              </button>
            ))}
          </div>
        )}

        {log.map((m, i) => (
          <div
            key={i}
            className={`flex w-full ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-xl text-sm break-words ${
                m.from === 'user'
                  ? 'bg-teal-500 text-white max-w-[85%]'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100 max-w-[85%]'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left text-gray-500 text-sm animate-pulse dark:text-gray-400">
            {language === 'chy' ? 'Akulemba...' : 'Typing...'}
          </div>
        )}

        <div ref={chatEndRef} />
      </main>

      {/* Input Section */}
      <form
        onSubmit={send}
        className="sticky bottom-0 p-4 flex gap-2 w-full bg-gray-50 dark:bg-gray-900"
      >
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          className="flex-1 p-3 rounded-xl w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white dark:bg-gray-800 dark:text-gray-100"
          placeholder={language === 'chy' ? 'Lembani uthenga...' : 'Type a message...'}
        />

        <button
          type="button"
          onClick={startVoice}
          className={`px-4 py-3 rounded-xl border flex items-center justify-center ${
            recognizing
              ? 'bg-red-500 text-white border-red-600'
              : 'bg-white text-teal-600 border-teal-600 dark:bg-gray-800 dark:text-white'
          }`}
        >
          <FiMic size={20} />
        </button>

        <button className="px-5 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 dark:bg-teal-700">
          {language === 'chy' ? 'Tumiza' : 'Send'}
        </button>
      </form>
    </div>
  );
}
