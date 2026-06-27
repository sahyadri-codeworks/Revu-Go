"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check } from "lucide-react";

interface MCQChipsProps {
  questions: { question: string; options: string[] }[];
  currentStep: number;
  answers: Record<string, string>;
  notes: Record<string, string>;
  onAnswer: (question: string, answer: string) => void;
  onNote: (question: string, note: string) => void;
  onNext: () => void;
}

export function MCQChips({ questions, currentStep, answers, notes, onAnswer, onNote, onNext }: MCQChipsProps) {
  const q = questions[currentStep];
  if (!q) return null;

  const currentAnswer = answers[q.question];
  const progress = ((currentStep + 1) / questions.length) * 100;
  const isLast = currentStep === questions.length - 1;

  return (
    <div className="flex flex-col flex-1 px-5 pt-4 pb-5">
      {/* Progress */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] text-[#8B9A7E] font-medium">
            Question {currentStep + 1} of {questions.length}
          </span>
          <span className="text-[11px] text-[#166534] font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#E8E2D6] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#166534] to-[#15803D] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex-1 pt-4"
        >
          <h2 className="text-[20px] font-extrabold text-[#1A1A2E] leading-tight mb-1.5">
            {q.question}
          </h2>
          <p className="text-[13px] text-[#8B9A7E] mb-7">
            Select the best match
          </p>

          {/* Chip options */}
          <div className="flex flex-wrap gap-2.5">
            {q.options.map((option, i) => {
              const isSelected = currentAnswer === option;
              return (
                <motion.button
                  key={option}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onAnswer(q.question, option)}
                  className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[14px] font-medium transition-all duration-250 ${
                    isSelected
                      ? "bg-[#166534] text-white shadow-lg shadow-[#166534]/20 scale-[1.02]"
                      : "bg-white text-[#374151] border border-[#E8E2D6] hover:border-[#166534]/25 shadow-sm hover:shadow-md"
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                  {option}
                </motion.button>
              );
            })}
          </div>

          {/* Optional note */}
          <div className="mt-8">
            <p className="text-[12px] text-[#8B9A7E] mb-2 font-medium">
              Anything else?
              <span className="text-[#C4BBA8] ml-1">(Optional)</span>
            </p>
            <textarea
              value={notes[q.question] || ""}
              onChange={(e) => onNote(q.question, e.target.value)}
              placeholder="Share more details..."
              maxLength={200}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-[#E8E2D6] text-[#1A1A2E] text-sm placeholder:text-[#C4BBA8] focus:outline-none focus:border-[#166534]/30 focus:ring-3 focus:ring-[#166534]/8 transition-all resize-none h-20 shadow-sm"
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <div className="mt-auto pt-5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          disabled={!currentAnswer && !notes[q.question]?.trim()}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl bg-gradient-to-r from-[#166534] to-[#15803D] text-white text-[15px] font-bold disabled:opacity-20 disabled:cursor-not-allowed active:from-[#14532D] transition-all shadow-lg shadow-[#166534]/25"
        >
          {isLast ? (
            <>
              <Sparkles className="w-4.5 h-4.5" />
              Generate My Review
            </>
          ) : (
            "Continue"
          )}
        </motion.button>
        {isLast && (
          <p className="text-[11px] text-[#8B9A7E] text-center mt-2.5 font-medium">AI generates in ~2 seconds</p>
        )}
      </div>
    </div>
  );
}
