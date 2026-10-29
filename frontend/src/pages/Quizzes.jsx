import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

const SUBJECTS = ["JAVA", "DSA", "DBMS", "OS", "CN"];

function Quizzes() {
    const [category, setCategory] = useState("JAVA");
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [history, setHistory] = useState([]);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const loadQuiz = useCallback(async () => {
        setLoading(true);
        setError("");
        setResult(null);
        setAnswers({});
        try {
            const [questionsResponse, historyResponse] = await Promise.all([
                API.get("/quizzes/questions", { params: { category } }),
                API.get("/quizzes/attempts/me"),
            ]);
            setQuestions(questionsResponse.data || []);
            setHistory(historyResponse.data || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Unable to load the quiz. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => void loadQuiz(), 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadQuiz]);

    const submitQuiz = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            const response = await API.post("/quizzes/attempts", {
                category,
                answers,
            });
            setResult(response.data);
            const historyResponse = await API.get("/quizzes/attempts/me");
            setHistory(historyResponse.data || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Unable to submit your quiz."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="learning-page">
            <header className="learning-header">
                <div>
                    <span className="dashboard-label">KNOWLEDGE CHECK</span>
                    <h1>Technical Quizzes</h1>
                    <p>Practice Java, DSA, DBMS, operating systems, and computer networks.</p>
                </div>
                <label className="learning-subject-select">
                    Subject
                    <select
                        onChange={(event) => setCategory(event.target.value)}
                        value={category}
                    >
                        {SUBJECTS.map((subject) => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
                </label>
            </header>

            {error && <p className="learning-error" role="alert">{error}</p>}

            {loading ? (
                <div className="learning-panel" aria-live="polite">Loading quiz…</div>
            ) : questions.length === 0 ? (
                <div className="learning-panel">No questions are available for this subject yet.</div>
            ) : (
                <form className="learning-panel quiz-form" onSubmit={submitQuiz}>
                    {questions.map((question, index) => {
                        const questionResult = result?.questions?.find(
                            (item) => item.questionId === question.id
                        );
                        return (
                            <fieldset className="quiz-question" key={question.id}>
                                <legend>
                                    <span>Question {index + 1}</span>
                                    {question.prompt}
                                </legend>
                                <div className="quiz-options">
                                    {question.options.map((option) => (
                                        <label
                                            className={`quiz-option${
                                                questionResult?.correctOption === option.key
                                                    ? " correct"
                                                    : questionResult?.selectedOption === option.key
                                                      ? " incorrect"
                                                      : ""
                                            }`}
                                            key={option.key}
                                        >
                                            <input
                                                checked={answers[question.id] === option.key}
                                                disabled={Boolean(result)}
                                                name={`question-${question.id}`}
                                                onChange={() =>
                                                    setAnswers((current) => ({
                                                        ...current,
                                                        [question.id]: option.key,
                                                    }))
                                                }
                                                type="radio"
                                                value={option.key}
                                            />
                                            <span>{option.key}. {option.text}</span>
                                        </label>
                                    ))}
                                </div>
                                {questionResult && (
                                    <p className="quiz-explanation">
                                        {questionResult.explanation}
                                    </p>
                                )}
                            </fieldset>
                        );
                    })}

                    {result && (
                        <div className="quiz-result" role="status">
                            <strong>
                                {result.correctAnswers}/{result.totalQuestions} correct ·{" "}
                                {result.scorePercent}%
                            </strong>
                            <span>Your attempt has been saved to quiz history.</span>
                        </div>
                    )}

                    {!result && (
                        <button
                            className="learning-primary-button"
                            disabled={
                                submitting ||
                                Object.keys(answers).length !== questions.length
                            }
                            type="submit"
                        >
                            {submitting ? "Submitting…" : "Submit quiz"}
                        </button>
                    )}
                </form>
            )}

            <section className="learning-panel quiz-history">
                <div className="learning-section-heading">
                    <div>
                        <h2>Your quiz analytics</h2>
                        <p>Recent saved attempts across all subjects</p>
                    </div>
                </div>
                {history.length === 0 ? (
                    <p>No quiz attempts yet. Complete a quiz to see your results.</p>
                ) : (
                    <div className="quiz-history-list">
                        {history.slice(0, 8).map((attempt) => (
                            <article key={attempt.attemptId}>
                                <strong>{attempt.category}</strong>
                                <span>
                                    {attempt.correctAnswers}/{attempt.totalQuestions} correct
                                </span>
                                <b>{attempt.scorePercent}%</b>
                                <time dateTime={attempt.submittedAt}>
                                    {new Date(attempt.submittedAt).toLocaleDateString()}
                                </time>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Quizzes;
