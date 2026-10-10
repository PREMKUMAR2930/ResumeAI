import React, { useState, useEffect } from "react";
import { Send, Mic, MicOff, AlertCircle, Loader2, Sparkles, StopCircle } from "lucide-react";

interface AnswerInputProps {
  onSubmit: (answerText: string) => void;
  onEndInterview: () => void;
  isEvaluating: boolean;
  disabled: boolean;
}

export const AnswerInput: React.FC<AnswerInputProps> = ({
  onSubmit,
  onEndInterview,
  isEvaluating,
  disabled,
}) => {
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      setSpeechSupported(true);
      const recog = new SpeechRec();
      recog.continuous = true;
      recog.interimResults = true;
      recog.lang = "en-US";

      recog.onresult = (event: any) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      setRecognition(recog);
    }
  }, []);

  const toggleListening = () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim() || isEvaluating || disabled) return;
    if (isListening && recognition) {
      recognition.stop();
      setIsListening(false);
    }
    const textToSubmit = answer;
    setAnswer("");
    onSubmit(textToSubmit);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-600" /> Candidate Response
        </label>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">
            {wordCount} words | {answer.length} chars
          </span>

          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                isListening
                  ? "bg-red-50 text-red-600 border-red-200 animate-pulse"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
              title={isListening ? "Stop Voice Input" : "Speak your answer"}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-brand-600" />}
              {isListening ? "Listening..." : "Voice Dictate"}
            </button>
          )}
        </div>
      </div>

      <textarea
        rows={6}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || isEvaluating}
        placeholder="Type or dictate your technical response here. Include principles, practical examples, architecture decisions, and code snippets where relevant... (Press Ctrl + Enter to submit)"
        className="w-full text-xs sm:text-sm p-4 bg-slate-50/70 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:bg-white focus:outline-none transition-all disabled:opacity-60 resize-y font-mono leading-relaxed"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <button
          type="button"
          onClick={onEndInterview}
          disabled={isEvaluating}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent transition-all"
        >
          <StopCircle className="w-4 h-4" /> End Interview & View Report
        </button>

        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={!answer.trim() || isEvaluating || disabled}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 active:scale-95 text-white text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:shadow-none transition-all"
        >
          {isEvaluating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              AI Evaluating Answer...
            </>
          ) : (
            <>
              Submit Answer
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
