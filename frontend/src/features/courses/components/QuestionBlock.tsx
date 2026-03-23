import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import type { QuizQuestion } from '../useCourses';

interface QuestionBlockProps {
  question: QuizQuestion;
  questionIndex: number;
  userAnswer: string;
  onChange: (value: string) => void;
  containerRef?: (element: HTMLDivElement | null) => void;
}

function MultipleChoiceOptions({
  question,
  questionIndex,
  userAnswer,
  onChange,
}: Pick<QuestionBlockProps, 'question' | 'questionIndex' | 'userAnswer' | 'onChange'>) {
  return (
    <div className="space-y-3">
      {question.options?.map((option, optionIndex) => {
        const value = String(optionIndex);
        const isSelected = userAnswer === value;

        return (
          <label
            key={optionIndex}
            className={[
              'flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all',
              isSelected
                ? 'border-indigo-600 bg-indigo-50/30 text-indigo-800'
                : 'border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30',
            ].join(' ')}
          >
            <input
              type="radio"
              name={`q_${questionIndex}`}
              value={value}
              checked={isSelected}
              onChange={(event) => onChange(event.target.value)}
              className="mt-0.5 h-4 w-4 flex-shrink-0 border-gray-300 text-indigo-600"
            />
            <span className="font-medium leading-relaxed">{option.text}</span>
          </label>
        );
      })}
    </div>
  );
}

function TrueFalseOptions({
  questionIndex,
  userAnswer,
  onChange,
}: Pick<QuestionBlockProps, 'questionIndex' | 'userAnswer' | 'onChange'>) {
  return (
    <div className="flex gap-4">
      {['True', 'False'].map((option) => {
        const isSelected = userAnswer === option;

        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              'flex-1 rounded-xl border-2 p-4 text-center font-medium transition-all',
              isSelected
                ? 'border-indigo-600 bg-indigo-50/50 font-bold text-indigo-700'
                : 'border-slate-200 text-slate-600 hover:border-indigo-300',
            ].join(' ')}
            data-question-index={questionIndex}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TextAnswer({ userAnswer, onChange }: Pick<QuestionBlockProps, 'userAnswer' | 'onChange'>) {
  return (
    <textarea
      value={userAnswer}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Type your answer here..."
      rows={4}
      className="w-full resize-y rounded-xl border-2 border-slate-200 p-4 text-slate-700 outline-none transition-all focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100"
    />
  );
}

export function QuestionBlock({
  question,
  questionIndex,
  userAnswer,
  onChange,
  containerRef,
}: QuestionBlockProps) {
  const isAnswered = userAnswer.trim() !== '';

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-indigo-100 sm:p-8"
    >
      <div className="flex gap-4">
        <div
          className={[
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold',
            isAnswered ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600',
          ].join(' ')}
        >
          {questionIndex + 1}
        </div>
        <div className="flex-1 space-y-5">
          <div className="space-y-2">
            <h3 className="text-base font-semibold leading-snug text-slate-900 sm:text-lg">
              {question.text}
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              <FileText className="h-3.5 w-3.5" />
              <span>{question.type.replace('-', ' ')}</span>
            </div>
          </div>

          {(question.type === 'mcq' || question.type === 'quran-recitation') && (
            <MultipleChoiceOptions
              question={question}
              questionIndex={questionIndex}
              userAnswer={userAnswer}
              onChange={onChange}
            />
          )}

          {question.type === 'true-false' && (
            <TrueFalseOptions
              questionIndex={questionIndex}
              userAnswer={userAnswer}
              onChange={onChange}
            />
          )}

          {(question.type === 'short-answer' || question.type === 'essay') && (
            <TextAnswer userAnswer={userAnswer} onChange={onChange} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
