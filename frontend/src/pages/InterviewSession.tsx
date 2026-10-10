import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle, RefreshCw } from "lucide-react";
import { QuestionCard } from "../components/QuestionCard";
import { AnswerInput } from "../components/AnswerInput";
import { ProgressIndicator } from "../components/ProgressIndicator";
import { FeedbackCard } from "../components/FeedbackCard";
import { LoadingState } from "../components/LoadingState";
import { apiService } from "../services/api";
import {
  InterviewSessionData,
  InterviewQuestion,
  AnswerEvaluation,
  FollowUpDecision
} from "../types";

export const InterviewSession: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<InterviewSessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion | null>(null);
  const [latestEvaluation, setLatestEvaluation] = useState<AnswerEvaluation | null>(null);
  const [latestDecision, setLatestDecision] = useState<FollowUpDecision | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      setError(null);
      const data = await apiService.getInterviewSession(sessionId);
      setSession(data);
      if (data.state === "COMPLETED") {
        navigate(`/results/${sessionId}`);
        return;
      }
      setCurrentQuestion(data.current_question || null);
      setIsLoading(false);
    } catch (err: any) {
      setIsLoading(false);
      setError(err.response?.data?.detail || "Failed to load interview session.");
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  const handleAnswerSubmit = async (answerText: string) => {
    if (!sessionId || !currentQuestion || isEvaluating) return;

    setIsEvaluating(true);
    try {
      const response = await apiService.submitAnswer(sessionId, {
        question_id: currentQuestion.question_id,
        answer_text: answerText,
      });

      setLatestEvaluation(response.evaluation);
      setLatestDecision(response.follow_up_decision);

      // In Mock Mode (or when completed), navigate or advance automatically
      if (session?.config?.feedback_mode === "mock") {
        if (response.is_completed) {
          navigate(`/results/${sessionId}`);
        } else if (response.next_question) {
          setCurrentQuestion(response.next_question);
          fetchSession();
        }
      } else {
        // In Coaching Mode, feedback card is displayed, user will click 'Next Question'
        if (response.next_question) {
          // Keep staged
        }
      }

      setIsEvaluating(false);
    } catch (err: any) {
      setIsEvaluating(false);
      setError(err.response?.data?.detail || "Failed to evaluate answer.");
    }
  };

  const handleNextQuestion = async () => {
    if (!sessionId) return;
    setLatestEvaluation(null);
    setLatestDecision(null);
    setIsLoading(true);

    try {
      const nextQ = await apiService.advanceNextQuestion(sessionId);
      if (!nextQ) {
        // Concluded
        navigate(`/results/${sessionId}`);
      } else {
        setCurrentQuestion(nextQ);
        fetchSession();
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      navigate(`/results/${sessionId}`);
    }
  };

  const handleEndInterviewEarly = async () => {
    if (!sessionId) return;
    const confirmEnd = window.confirm("Are you sure you want to end the interview now and view your report?");
    if (!confirmEnd) return;

    setIsLoading(true);
    try {
      await apiService.finishInterview(sessionId);
      navigate(`/results/${sessionId}`);
    } catch (err) {
      navigate(`/results/${sessionId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingState
          title="Interview Session Initializing"
          subtitle="Loading question stream and establishing agent connection..."
        />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Session Notice</h2>
        <p className="text-xs text-slate-500">{error || "Interview session not found or has expired."}</p>
        <button
          type="button"
          onClick={() => navigate("/setup")}
          className="px-6 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold shadow-sm hover:bg-brand-700"
        >
          Create New Interview
        </button>
      </div>
    );
  }

  const totalPlanned = session.question_plan.length;
  const currentNum = currentQuestion ? currentQuestion.question_number : session.current_question_index + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Progress & Live Timer */}
      <ProgressIndicator
        currentIndex={session.qa_history.length}
        totalQuestions={totalPlanned}
        qaHistory={session.qa_history}
        feedbackMode={session.config?.feedback_mode || "coaching"}
      />

      {/* Active Question Card */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          currentNumber={currentNum}
          totalPlanned={totalPlanned}
        />
      )}

      {/* Answer Input or Coaching Feedback */}
      {session.config?.feedback_mode === "coaching" && latestEvaluation ? (
        <FeedbackCard
          evaluation={latestEvaluation}
          onNext={handleNextQuestion}
          isCompleted={session.qa_history.length >= totalPlanned}
        />
      ) : (
        <AnswerInput
          onSubmit={handleAnswerSubmit}
          onEndInterview={handleEndInterviewEarly}
          isEvaluating={isEvaluating}
          disabled={!currentQuestion}
        />
      )}
    </div>
  );
};
