import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function SubmissionDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [submission, setSubmission] = useState(null);
    const [testResults, setTestResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSubmission = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const [
                submissionResponse,
                testResultsResponse
            ] = await Promise.all([
                api.get(`/submissions/${id}`),
                api.get(`/submissions/${id}/test-results`)
            ]);

            setSubmission(
                submissionResponse.data
            );

            setTestResults(
                testResultsResponse.data || []
            );

        } catch (err) {

            console.error(
                "Failed to load submission:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("email");
                localStorage.removeItem("role");

                navigate("/login");

                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load submission."
            );

        } finally {

            setLoading(false);

        }
    }, [id, navigate]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadSubmission();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadSubmission]);

    const getStatusClass = (status) => {

        switch (status) {

            case "ACCEPTED":
            case "PASSED":
                return "accepted";

            case "WRONG_ANSWER":
            case "FAILED":
            case "RUNTIME_ERROR":
            case "TIME_LIMIT_EXCEEDED":
            case "COMPILATION_ERROR":
                return "failed";

            default:
                return "default";
        }
    };

    const getStatusLabel = (status) => {

        switch (status) {

            case "ACCEPTED":
                return "Accepted";

            case "WRONG_ANSWER":
                return "Wrong Answer";

            case "COMPILATION_ERROR":
                return "Compilation Error";

            case "RUNTIME_ERROR":
                return "Runtime Error";

            case "TIME_LIMIT_EXCEEDED":
                return "Time Limit Exceeded";

            case "PASSED":
                return "Passed";

            case "FAILED":
                return "Failed";

            default:
                return status || "Unknown";
        }
    };

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString();
    };

    const passedCount =
        submission?.passedTestCases ??
        testResults.filter(
            result => result.status === "PASSED"
        ).length;

    const totalCount =
        submission?.totalTestCases ??
        testResults.length;

    if (loading) {

        return (
            <>
                <style>{pageStyles}</style>

                <div className="submission-page">

                    <div className="loading-card">

                        <div className="loading-spinner"></div>

                        <h2>
                            Loading Submission
                        </h2>

                        <p>
                            Fetching your submission details...
                        </p>

                    </div>

                </div>
            </>
        );
    }

    if (error) {

        return (
            <>
                <style>{pageStyles}</style>

                <div className="submission-page">

                    <div className="error-card">

                        <div className="error-icon">
                            !
                        </div>

                        <h2>
                            Unable to Load Submission
                        </h2>

                        <p>
                            {error}
                        </p>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/submissions"
                                )
                            }
                        >
                            ← Back to Submissions
                        </button>

                    </div>

                </div>
            </>
        );
    }

    if (!submission) {

        return (
            <>
                <style>{pageStyles}</style>

                <div className="submission-page">

                    <div className="error-card">

                        <h2>
                            Submission Not Found
                        </h2>

                        <button
                            className="primary-button"
                            onClick={() =>
                                navigate(
                                    "/submissions"
                                )
                            }
                        >
                            ← Back to Submissions
                        </button>

                    </div>

                </div>
            </>
        );
    }

    return (
        <>
            <style>{pageStyles}</style>

            <div className="submission-page">

                {/* HEADER */}

                <div className="submission-header">

                    <div>

                        <div className="eyebrow">
                            CODENEXUS SUBMISSION
                        </div>

                        <h1>
                            Submission #{submission.id}
                        </h1>

                        <p className="header-problem">
                            {submission.problem?.title ||
                                "Unknown Problem"}
                        </p>

                    </div>

                    <button
                        className="back-button"
                        onClick={() =>
                            navigate(
                                "/submissions"
                            )
                        }
                    >
                        ← Back
                    </button>

                </div>


                {/* OVERVIEW */}

                <div className="overview-card">

                    <div className="main-status">

                        <div
                            className={
                                `status-circle ${
                                    getStatusClass(
                                        submission.status
                                    )
                                }`
                            }
                        >
                            {submission.status ===
                            "ACCEPTED"
                                ? "✓"
                                : "!"}
                        </div>

                        <div>

                            <div className="status-label">
                                Submission Status
                            </div>

                            <div
                                className={
                                    `big-status ${
                                        getStatusClass(
                                            submission.status
                                        )
                                    }`
                                }
                            >
                                {getStatusLabel(
                                    submission.status
                                )}
                            </div>

                        </div>

                    </div>

                    <div className="overview-divider"></div>

                    <div className="overview-stat">

                        <span>
                            Language
                        </span>

                        <strong>
                            {submission.language ||
                                "-"}
                        </strong>

                    </div>

                    <div className="overview-stat">

                        <span>
                            Execution Time
                        </span>

                        <strong>
                            {submission.executionTime !==
                            null &&
                            submission.executionTime !==
                            undefined
                                ? `${submission.executionTime} ms`
                                : "-"}
                        </strong>

                    </div>

                    <div className="overview-stat">

                        <span>
                            Peak Memory
                        </span>

                        <strong>
                            {submission.memoryUsed != null
                                ? `${submission.memoryUsed} KB`
                                : "Not available"}
                        </strong>

                    </div>

                    <div className="overview-stat">

                        <span>
                            Submitted
                        </span>

                        <strong>
                            {formatDate(
                                submission.submittedAt
                            )}
                        </strong>

                    </div>

                </div>


                {/* TEST SUMMARY */}

                {totalCount > 0 && (

                    <div className="test-summary">

                        <div className="summary-left">

                            <div className="summary-icon">
                                ✓
                            </div>

                            <div>

                                <h2>
                                    Test Cases
                                </h2>

                                <p>
                                    {passedCount} of{" "}
                                    {totalCount} test cases passed
                                </p>

                            </div>

                        </div>

                        <div className="summary-score">

                            <strong>
                                {passedCount}
                            </strong>

                            <span>
                                /
                                {totalCount}
                            </span>

                        </div>

                    </div>

                )}


                {/* REAL TEST CASE RESULTS */}

                {testResults.length > 0 && (

                    <section className="section">

                        <div className="section-heading">

                            <div>

                                <div className="section-kicker">
                                    JUDGE RESULTS
                                </div>

                                <h2>
                                    Test Case Results
                                </h2>

                            </div>

                            <span className="test-count">
                                {testResults.length} Tests
                            </span>

                        </div>


                        <div className="test-results-list">

                            {testResults.map(
                                (test) => {

                                    const passed =
                                        test.status ===
                                        "PASSED";

                                    return (
                                        <div
                                            className={
                                                `test-result-card ${
                                                    passed
                                                        ? "passed-card"
                                                        : "failed-card"
                                                }`
                                            }
                                            key={
                                                test.id
                                            }
                                        >

                                            <div className="test-result-header">

                                                <div className="test-title">

                                                    <div
                                                        className={
                                                            `test-icon ${
                                                                passed
                                                                    ? "passed-icon"
                                                                    : "failed-icon"
                                                            }`
                                                        }
                                                    >
                                                        {passed
                                                            ? "✓"
                                                            : "✕"}
                                                    </div>

                                                    <div>

                                                        <span>
                                                            Test Case
                                                        </span>

                                                        <strong>
                                                            #{test.testCaseNumber}
                                                        </strong>

                                                    </div>

                                                </div>


                                                <div
                                                    className={
                                                        `test-status ${
                                                            passed
                                                                ? "passed-status"
                                                                : "failed-status"
                                                        }`
                                                    }
                                                >
                                                    {getStatusLabel(
                                                        test.status
                                                    )}
                                                </div>

                                            </div>


                                            <div className="test-result-body">

                                                {test.hidden ? (
                                                    <p>
                                                        Hidden test details are protected.
                                                    </p>
                                                ) : (
                                                    <>
                                                        <div className="result-column">

                                                            <div className="result-label">
                                                                Input
                                                            </div>

                                                            <pre>
                                                                {test.input ||
                                                                    "No input"}
                                                            </pre>

                                                        </div>


                                                        <div className="result-column">

                                                            <div className="result-label">
                                                                Expected Output
                                                            </div>

                                                            <pre>
                                                                {test.expectedOutput ||
                                                                    "No expected output"}
                                                            </pre>

                                                        </div>


                                                        <div className="result-column">

                                                            <div className="result-label">
                                                                Actual Output
                                                            </div>

                                                            <pre>
                                                                {test.actualOutput ||
                                                                    "No output"}
                                                            </pre>

                                                        </div>
                                                    </>
                                                )}

                                            </div>


                                            <div className="test-result-footer">

                                                <span>
                                                    Execution Time
                                                </span>

                                                <strong>
                                                    {test.executionTime !==
                                                    null &&
                                                    test.executionTime !==
                                                    undefined
                                                        ? `${test.executionTime} ms`
                                                        : "-"}
                                                </strong>

                                            </div>


                                            {test.errorMessage && (

                                                <div className="test-error">

                                                    <strong>
                                                        Error
                                                    </strong>

                                                    <pre>
                                                        {
                                                            test.errorMessage
                                                        }
                                                    </pre>

                                                </div>

                                            )}

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </section>

                )}


                {/* PROBLEM */}

                <section className="section">

                    <div className="section-heading">

                        <div>

                            <div className="section-kicker">
                                CHALLENGE
                            </div>

                            <h2>
                                Problem
                            </h2>

                        </div>

                    </div>

                    <div className="problem-card">

                        <div className="problem-title-row">

                            <h3>
                                {submission.problem?.title ||
                                    "Unknown Problem"}
                            </h3>

                            <div className="problem-tags">

                                {submission.problem?.difficulty && (

                                    <span className="tag">
                                        {
                                            submission
                                                .problem
                                                .difficulty
                                        }
                                    </span>

                                )}

                                {submission.problem?.topic && (

                                    <span className="tag">
                                        {
                                            submission
                                                .problem
                                                .topic
                                        }
                                    </span>

                                )}

                            </div>

                        </div>

                        <p>
                            {submission.problem?.description ||
                                "No problem description available."}
                        </p>

                    </div>

                </section>


                {/* SOURCE CODE */}

                <section className="section">

                    <div className="section-heading">

                        <div>

                            <div className="section-kicker">
                                YOUR SOLUTION
                            </div>

                            <h2>
                                Source Code
                            </h2>

                        </div>

                        <span className="language-badge">
                            {submission.language ||
                                "JAVA"}
                        </span>

                    </div>

                    <div className="code-wrapper">

                        <div className="code-header">

                            <div className="code-dot red"></div>
                            <div className="code-dot yellow"></div>
                            <div className="code-dot green"></div>

                            <span>
                                Solution.java
                            </span>

                        </div>

                        <pre className="source-code">
                            {submission.sourceCode ||
                                "No source code available."}
                        </pre>

                    </div>

                </section>


                {/* JUDGE INFORMATION */}

                {submission.errorMessage && (

                    <section className="section">

                        <div className="section-heading">

                            <div>

                                <div className="section-kicker">
                                    JUDGE INFORMATION
                                </div>

                                <h2>
                                    Result
                                </h2>

                            </div>

                        </div>

                        <div
                            className={
                                submission.status ===
                                "ACCEPTED"
                                    ? "result-message success"
                                    : "result-message failure"
                            }
                        >

                            <div className="result-icon">

                                {submission.status ===
                                "ACCEPTED"
                                    ? "✓"
                                    : "!"}

                            </div>

                            <div>

                                <strong>
                                    {submission.status ===
                                    "ACCEPTED"
                                        ? "All test cases passed"
                                        : getStatusLabel(
                                              submission.status
                                          )}
                                </strong>

                                <p>
                                    {
                                        submission.errorMessage
                                    }
                                </p>

                            </div>

                        </div>

                    </section>

                )}

            </div>
        </>
    );
}

const pageStyles = `

* {
    box-sizing: border-box;
}

.submission-page {
    min-height: 100vh;
    padding: 42px 7%;
    background:
        radial-gradient(
            circle at top right,
            rgba(99, 102, 241, 0.12),
            transparent 35%
        ),
        #0b1020;
    color: #f8fafc;
    font-family:
        Inter,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}

.submission-header {
    max-width: 1250px;
    margin: 0 auto 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
}

.eyebrow,
.section-kicker {
    color: #818cf8;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 1.8px;
    margin-bottom: 8px;
}

.submission-header h1 {
    margin: 0;
    font-size: 36px;
    font-weight: 800;
}

.header-problem {
    margin: 8px 0 0;
    color: #94a3b8;
}

.back-button,
.primary-button {
    border: 1px solid #334155;
    background: #111827;
    color: #f8fafc;
    padding: 11px 18px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 700;
}

.back-button:hover {
    background: #1e293b;
    border-color: #6366f1;
}

.overview-card {
    max-width: 1250px;
    margin: 0 auto 24px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 28px;
    background: rgba(15, 23, 42, 0.9);
    border: 1px solid #1e293b;
    border-radius: 18px;
}

.main-status {
    display: flex;
    align-items: center;
    gap: 14px;
    min-width: 220px;
}

.status-circle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
    font-weight: 900;
}

.status-circle.accepted {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
}

.status-circle.failed {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
}

.status-label {
    color: #64748b;
    font-size: 12px;
    margin-bottom: 3px;
}

.big-status {
    font-size: 17px;
    font-weight: 800;
}

.big-status.accepted {
    color: #4ade80;
}

.big-status.failed {
    color: #f87171;
}

.overview-divider {
    width: 1px;
    height: 48px;
    background: #263247;
}

.overview-stat {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 150px;
}

.overview-stat span {
    color: #64748b;
    font-size: 12px;
}

.overview-stat strong {
    color: #e2e8f0;
    font-size: 14px;
}

.test-summary {
    max-width: 1250px;
    margin: 0 auto 30px;
    padding: 22px 26px;
    border: 1px solid #1e293b;
    border-radius: 18px;
    background: #0f172a;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.summary-left {
    display: flex;
    align-items: center;
    gap: 15px;
}

.summary-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
    font-weight: 900;
}

.test-summary h2 {
    margin: 0 0 4px;
    font-size: 18px;
}

.test-summary p {
    margin: 0;
    color: #94a3b8;
    font-size: 14px;
}

.summary-score {
    display: flex;
    align-items: baseline;
    gap: 3px;
}

.summary-score strong {
    font-size: 34px;
}

.summary-score span {
    color: #64748b;
    font-size: 18px;
}

.section {
    max-width: 1250px;
    margin: 0 auto 34px;
}

.section-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
}

.section-heading h2 {
    margin: 0;
    font-size: 21px;
}

.test-count,
.language-badge {
    padding: 6px 10px;
    border-radius: 8px;
    background: #172033;
    border: 1px solid #29364b;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
}

.test-results-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.test-result-card {
    overflow: hidden;
    border-radius: 16px;
    background: #0f172a;
    border: 1px solid #263247;
}

.passed-card {
    border-left: 3px solid #22c55e;
}

.failed-card {
    border-left: 3px solid #ef4444;
}

.test-result-header {
    padding: 18px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #1e293b;
}

.test-title {
    display: flex;
    align-items: center;
    gap: 12px;
}

.test-title span {
    display: block;
    color: #64748b;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.test-title strong {
    display: block;
    margin-top: 2px;
    font-size: 18px;
}

.test-icon {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 900;
}

.passed-icon {
    background: rgba(34, 197, 94, 0.12);
    color: #4ade80;
}

.failed-icon {
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
}

.test-status {
    padding: 7px 11px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 800;
}

.passed-status {
    background: rgba(34, 197, 94, 0.1);
    color: #4ade80;
}

.failed-status {
    background: rgba(239, 68, 68, 0.1);
    color: #f87171;
}

.test-result-body {
    padding: 18px 20px;
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 14px;
}

.result-column {
    min-width: 0;
}

.result-label {
    margin-bottom: 8px;
    color: #64748b;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.result-column pre {
    margin: 0;
    min-height: 70px;
    padding: 13px;
    overflow-x: auto;
    border-radius: 9px;
    background: #080d18;
    border: 1px solid #1e293b;
    color: #cbd5e1;
    font-family:
        "JetBrains Mono",
        Consolas,
        monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
}

.test-result-footer {
    padding: 11px 20px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #1e293b;
    color: #64748b;
    font-size: 12px;
}

.test-result-footer strong {
    color: #cbd5e1;
}

.test-error {
    padding: 16px 20px;
    border-top: 1px solid rgba(239, 68, 68, 0.2);
    background: rgba(239, 68, 68, 0.04);
}

.test-error strong {
    color: #f87171;
    font-size: 12px;
}

.test-error pre {
    margin: 8px 0 0;
    color: #fca5a5;
    white-space: pre-wrap;
    font-family: Consolas, monospace;
    font-size: 12px;
}

.problem-card {
    padding: 24px;
    border: 1px solid #1e293b;
    border-radius: 16px;
    background: #0f172a;
}

.problem-title-row {
    display: flex;
    justify-content: space-between;
    gap: 20px;
}

.problem-card h3 {
    margin: 0;
    font-size: 20px;
}

.problem-card p {
    margin: 15px 0 0;
    color: #94a3b8;
    line-height: 1.7;
}

.problem-tags {
    display: flex;
    gap: 7px;
}

.tag {
    padding: 5px 9px;
    border-radius: 7px;
    background: #172033;
    color: #94a3b8;
    border: 1px solid #29364b;
    font-size: 11px;
    font-weight: 700;
}

.code-wrapper {
    overflow: hidden;
    border: 1px solid #1e293b;
    border-radius: 15px;
    background: #080d18;
}

.code-header {
    height: 42px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    gap: 7px;
    border-bottom: 1px solid #1e293b;
    color: #64748b;
    font-size: 12px;
}

.code-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
}

.code-dot.red {
    background: #ef4444;
}

.code-dot.yellow {
    background: #eab308;
}

.code-dot.green {
    background: #22c55e;
}

.code-header span {
    margin-left: 6px;
}

.source-code {
    margin: 0;
    padding: 22px;
    overflow-x: auto;
    color: #dbeafe;
    font-family:
        "JetBrains Mono",
        Consolas,
        monospace;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre;
}

.result-message {
    padding: 20px;
    border-radius: 14px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
}

.result-message.success {
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.25);
}

.result-message.failure {
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.25);
}

.result-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 9px;
    font-weight: 900;
}

.success .result-icon {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
}

.failure .result-icon {
    background: rgba(239, 68, 68, 0.15);
    color: #f87171;
}

.result-message strong {
    display: block;
    margin-bottom: 7px;
}

.result-message p {
    margin: 0;
    color: #94a3b8;
    white-space: pre-wrap;
    line-height: 1.6;
}

.loading-card,
.error-card {
    max-width: 500px;
    margin: 100px auto;
    padding: 45px;
    text-align: center;
    border-radius: 20px;
    border: 1px solid #1e293b;
    background: #0f172a;
}

.loading-card h2,
.error-card h2 {
    margin: 15px 0 8px;
}

.loading-card p,
.error-card p {
    color: #94a3b8;
}

.loading-spinner {
    width: 42px;
    height: 42px;
    margin: 0 auto;
    border: 4px solid #1e293b;
    border-top-color: #818cf8;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

.error-icon {
    width: 50px;
    height: 50px;
    margin: 0 auto;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(239, 68, 68, 0.12);
    color: #f87171;
    font-size: 25px;
    font-weight: 900;
}

.primary-button {
    margin-top: 18px;
    background: #4f46e5;
    border-color: #6366f1;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 850px) {

    .submission-page {
        padding: 28px 18px;
    }

    .submission-header {
        align-items: flex-start;
    }

    .overview-card {
        flex-wrap: wrap;
    }

    .overview-divider {
        display: none;
    }

    .test-result-body {
        grid-template-columns: 1fr;
    }

    .problem-title-row {
        flex-direction: column;
    }
}

@media (max-width: 600px) {

    .submission-header {
        flex-direction: column;
    }

    .back-button {
        width: 100%;
    }

    .overview-card {
        flex-direction: column;
        align-items: flex-start;
    }

    .test-summary {
        padding: 18px;
    }

    .test-result-header {
        align-items: flex-start;
        gap: 12px;
        flex-direction: column;
    }
}

`;

export default SubmissionDetails;