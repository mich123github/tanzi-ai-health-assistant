import React, { useState } from "react";
import {
  PlayCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

export default function Quizzes() {
  const quizzes = [
    {
      id: 1,
      title: "Basic Health Knowledge",
      description: "Test your understanding of everyday health essentials.",
      questions: [
        {
          q: "What is the normal human body temperature?",
          options: ["34°C", "37°C", "40°C"],
          answer: "37°C",
        },
        {
          q: "Which nutrient is most essential for muscle growth?",
          options: ["Protein", "Fat", "Carbohydrates"],
          answer: "Protein",
        },
      ],
    },
    {
      id: 2,
      title: "First Aid Essentials",
      description: "Learn how to respond to emergency situations.",
      questions: [
        {
          q: "What should you do first when someone collapses?",
          options: ["Check breathing", "Check phone", "Give water"],
          answer: "Check breathing",
        },
        {
          q: "What is the first step in treating a minor burn?",
          options: ["Apply ice", "Run cool water", "Cover with oil"],
          answer: "Run cool water",
        },
      ],
    },
  ];

  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOption, setSelectedOption] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const quiz = quizzes.find((q) => q.id === selectedQuiz);

  const submitAnswer = () => {
    if (!selectedOption) return;

    if (selectedOption === quiz.questions[currentQ].answer) {
      setScore(score + 1);
    }

    if (currentQ + 1 === quiz.questions.length) {
      setCompleted(true);
    } else {
      setCurrentQ(currentQ + 1);
      setSelectedOption("");
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQ(0);
    setSelectedOption("");
    setScore(0);
    setCompleted(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20 animate-fadeIn">
      <h1 className="text-3xl font-bold mb-5 text-center dark:text-white">
        Health Quizzes
      </h1>

      {/* ─────────────────────────────────────────────────────────────
          QUIZ LIST — DISPLAYED BEFORE QUIZ STARTS
      ───────────────────────────────────────────────────────────── */}
      {!selectedQuiz && (
        <div className="space-y-4">
          {quizzes.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedQuiz(q.id)}
            >
              <h2 className="text-xl font-semibold dark:text-white">{q.title}</h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{q.description}</p>
              <button className="mt-3 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                Start Quiz <PlayCircleIcon className="w-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          QUIZ QUESTIONS
      ───────────────────────────────────────────────────────────── */}
      {selectedQuiz && !completed && (
        <div className="mt-6 animate-slideUp">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-full rounded-full transition-all"
              style={{
                width:
                  ((currentQ + 1) / quiz.questions.length) * 100 + "%",
              }}
            ></div>
          </div>

          <h2 className="text-xl font-bold dark:text-white">
            {quiz.questions[currentQ].q}
          </h2>

          <div className="mt-4 space-y-3">
            {quiz.questions[currentQ].options.map((opt, i) => (
              <div
                key={i}
                className={`border rounded-lg p-3 cursor-pointer transition bg-white dark:bg-gray-800 
                  ${selectedOption === opt ? "border-blue-600" : "border-gray-300"}
                `}
                onClick={() => setSelectedOption(opt)}
              >
                {opt}
              </div>
            ))}
          </div>

          <button
            onClick={submitAnswer}
            className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg flex items-center justify-center gap-2"
          >
            Next <ArrowRightIcon className="w-5" />
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          QUIZ COMPLETED — SCORE SCREEN
      ───────────────────────────────────────────────────────────── */}
      {completed && (
        <div className="mt-10 p-6 bg-white dark:bg-gray-800 rounded-xl shadow animate-bounceIn">
          <h2 className="text-2xl font-bold text-center dark:text-white">Quiz Completed!</h2>

          <p className="text-center mt-3 text-gray-700 dark:text-gray-300">
            You scored:
          </p>

          <p className="text-center text-5xl font-extrabold my-4 text-blue-600">
            {score}/{quiz.questions.length}
          </p>

          {/* Score Icon */}
          <div className="flex justify-center mb-6">
            {score === quiz.questions.length ? (
              <CheckCircleIcon className="w-20 text-green-600" />
            ) : (
              <XCircleIcon className="w-20 text-red-600" />
            )}
          </div>

          <button
            onClick={resetQuiz}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            Try Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}
