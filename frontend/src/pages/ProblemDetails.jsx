import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import { MessageCircle } from "lucide-react";
import API from "../services/api";

const LANGUAGES = [
    { value: "java", label: "Java", editor: "java" },
    { value: "c", label: "C", editor: "c" },
    { value: "cpp", label: "C++", editor: "cpp" },
    { value: "python", label: "Python 3", editor: "python" },
    { value: "javascript", label: "JavaScript", editor: "javascript" },
];

function normalizeOutput(value) {
    return String(value || "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .split("\n")
        .map((line) => line.trim())
        .join("\n")
        .trim();
}

function ProblemDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [problem, setProblem] = useState(null);

    const [language, setLanguage] = useState("java");
    const [codeByLanguage, setCodeByLanguage] = useState({});
    const code = codeByLanguage[language] ?? "";

    const [status, setStatus] = useState("");
    const [output, setOutput] = useState("");
    const [errorOutput, setErrorOutput] = useState("");
    const [runMetrics, setRunMetrics] = useState(null);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [copied, setCopied] = useState(false);
    const [showAiChatNotice, setShowAiChatNotice] = useState(false);


    const fetchProblem = useCallback(async () => {

        try {

            const response =
                await API.get(`/problems/${id}`);

            setProblem(response.data);

        } catch (error) {

            console.error(
                "Failed to load problem:",
                error
            );

            setStatus("ERROR");

            setErrorOutput(
                error.response?.data?.message ||
                "Failed to load problem."
            );
        }
    }, [id]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void fetchProblem();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [fetchProblem]);


    /*
     * ============================
     * RUN CODE
     * ============================
     */

    const runCode = async () => {

        setLoading(true);

        setStatus("");
        setOutput("");
        setErrorOutput("");
        setRunMetrics(null);

        const currentCode =
            String(code || "");

        try {

            if (!currentCode.trim()) {

                setStatus("ERROR");

                setErrorOutput(
                    "Source code cannot be empty."
                );

                return;
            }

            const response =
                await API.post(
                    "/code/run",
                    {
                        sourceCode: currentCode,
                        language,
                        input: "",
                        problemId: Number(id),
                    }
                );

            const result =
                response.data;

            setStatus(
                result.status ||
                "EXECUTED"
            );
            setRunMetrics({
                executionTime: result.executionTime,
                memoryUsed: result.memoryUsed,
                expectedOutput: result.expectedOutput ?? null,
            });

            setOutput(
                result.output !== null &&
                result.output !== undefined
                    ? String(result.output)
                    : ""
            );

            setErrorOutput(
                result.error !== null &&
                result.error !== undefined
                    ? String(result.error)
                    : ""
            );

        } catch (error) {

            console.error(
                "Run Code Error:",
                error
            );

            setStatus("ERROR");

            setErrorOutput(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Code execution failed."
            );
            setRunMetrics(null);

        } finally {

            setLoading(false);
        }
    };


    /*
     * ============================
     * SUBMIT CODE
     * ============================
     */

    const submitCode = async () => {

        setSubmitting(true);

        setStatus("SUBMITTING");

        setOutput("");
        setErrorOutput("");
        setRunMetrics(null);

        const currentCode =
            String(code || "");

        try {

            if (!currentCode.trim()) {

                setStatus("ERROR");

                setErrorOutput(
                    "Source code cannot be empty."
                );

                return;
            }


            /*
             * Get ONLY the currently
             * authenticated user.
             *
             * We no longer call:
             *
             * GET /users
             *
             * and search through all users.
             */

            const meResponse =
                await API.get(
                    "/auth/me"
                );

            const currentUser =
                meResponse.data;


            if (!currentUser?.id) {

                setStatus("ERROR");

                setErrorOutput(
                    "Logged-in user could not be identified. Please login again."
                );

                return;
            }


            /*
             * Create submission
             */

            const submissionResponse =
                await API.post(
                    `/submissions?userId=${currentUser.id}&problemId=${id}`,
                    {
                        sourceCode: currentCode,
                        language: language.toUpperCase(),
                        status: "PENDING"
                    }
                );


            const submission =
                submissionResponse.data;


            if (!submission?.id) {

                throw new Error(
                    "Submission ID was not returned by backend."
                );
            }


            /*
             * Judge submission
             */

            const judgeResponse =
                await API.post(
                    `/judge/${submission.id}`
                );


            const result =
                judgeResponse.data;


            /*
             * Open submission details
             */

            if (result?.id) {

                navigate(
                    `/submissions/${result.id}`
                );

                return;
            }


            setStatus(
                result.status
                    ? String(result.status)
                    : "UNKNOWN"
            );

            setOutput(
                result.output !== null &&
                result.output !== undefined
                    ? String(result.output)
                    : ""
            );

            setErrorOutput(
                result.errorMessage !== null &&
                result.errorMessage !== undefined
                    ? String(result.errorMessage)
                    : ""
            );

        } catch (error) {

            console.error(
                "Submit Error:",
                error
            );

            if (
                error.response?.status === 401 ||
                error.response?.status === 403
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "email"
                );

                localStorage.removeItem(
                    "role"
                );

                navigate("/login");

                return;
            }

            setStatus("ERROR");

            setOutput("");

            setErrorOutput(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Submission failed."
            );

        } finally {

            setSubmitting(false);
        }
    };


    /*
     * ============================
     * COPY CODE
     * ============================
     */

    const copyCode = async () => {

        try {

            await navigator.clipboard.writeText(
                code
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1800);

        } catch (error) {

            console.error(
                "Copy failed:",
                error
            );
        }
    };


    /*
     * ============================
     * RESET CODE
     * ============================
     */

    const resetCode = () => {
        setCodeByLanguage((previous) => ({
            ...previous,
            [language]: "",
        }));
        setStatus("");
        setOutput("");
        setErrorOutput("");
        setRunMetrics(null);
    };

    const hasExpectedOutput =
        runMetrics?.expectedOutput != null;
    const expectedOutputMatches =
        hasExpectedOutput &&
        normalizeOutput(output) ===
            normalizeOutput(runMetrics.expectedOutput);


    if (!problem) {

        return (

            <div className="problem-page">

                <style>{styles}</style>

                <div className="page-loading">

                    <div className="spinner"></div>

                    <h2>
                        Loading problem...
                    </h2>

                    <p>
                        Preparing your coding environment.
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div className="problem-page">

            <style>{styles}</style>


            <header className="problem-topbar">

                <button
                    className="back-link"
                    onClick={() =>
                        navigate("/problems")
                    }
                >
                    ← Problems
                </button>


                <div className="topbar-title">

                    CodeNexus

                    <span>
                        /
                    </span>

                    Problem

                </div>


                <button
                    className="history-button"
                    onClick={() =>
                        navigate("/submissions")
                    }
                >
                    Submission History
                </button>

            </header>


            <main className="problem-layout">


                <section className="problem-panel">

                    <div className="problem-heading">

                        <div>

                            <div className="problem-kicker">
                                CODING CHALLENGE
                            </div>

                            <h1>
                                {problem.title}
                            </h1>

                        </div>


                        <div className="problem-badges">

                            <span
                                className={
                                    "difficulty " +
                                    String(
                                        problem.difficulty ||
                                        ""
                                    ).toLowerCase()
                                }
                            >
                                {problem.difficulty}
                            </span>


                            <span className="topic">
                                {problem.topic}
                            </span>

                        </div>

                    </div>


                    <div className="problem-block">

                        <h2>
                            Description
                        </h2>

                        <p className="description">
                            {problem.description}
                        </p>

                    </div>


                    {problem.constraints && (

                        <div className="problem-block">

                            <h2>
                                Constraints
                            </h2>

                            <div className="info-box">
                                {problem.constraints}
                            </div>

                        </div>

                    )}


                    {problem.inputFormat && (

                        <div className="problem-block">

                            <h2>
                                Input Format
                            </h2>

                            <p className="description">
                                {problem.inputFormat}
                            </p>

                        </div>

                    )}


                    {problem.outputFormat && (

                        <div className="problem-block">

                            <h2>
                                Output Format
                            </h2>

                            <p className="description">
                                {problem.outputFormat}
                            </p>

                        </div>

                    )}


                    {[
                        {
                            label: "Example 1",
                            input: problem.sampleInput,
                            output: problem.sampleOutput,
                        },
                        {
                            label: "Example 2",
                            input: problem.sampleInput2,
                            output: problem.sampleOutput2,
                        },
                    ].some((example) => example.input || example.output) && (

                        <div className="problem-block">

                            <h2>
                                Examples
                            </h2>


                            <div className="example-grid">
                                {[
                                    {
                                        label: "Example 1",
                                        input: problem.sampleInput,
                                        output: problem.sampleOutput,
                                    },
                                    {
                                        label: "Example 2",
                                        input: problem.sampleInput2,
                                        output: problem.sampleOutput2,
                                    },
                                ]
                                    .filter((example) => example.input || example.output)
                                    .map((example) => (
                                        <div className="example-card" key={example.label}>
                                            <div className="example-label">
                                                {example.label}
                                            </div>
                                            <div className="example-value-label">
                                                Input
                                            </div>
                                            <pre>{example.input || "No input"}</pre>
                                            <div className="example-value-label">
                                                Output
                                            </div>
                                            <pre>{example.output || "No output"}</pre>
                                        </div>
                                    ))}
                            </div>

                        </div>

                    )}


                    <div className="judge-info">

                        <div className="judge-info-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                Multi-test-case judging
                            </strong>

                            <p>
                                Your submission will be
                                compiled once and tested
                                against all configured
                                test cases.
                            </p>

                        </div>

                    </div>

                </section>


                <section className="editor-panel">

                    <div className="editor-card">


                        <div className="editor-header">

                            <div className="editor-language">

                                <select
                                    aria-label="Programming language"
                                    className="language-select"
                                    value={language}
                                    onChange={(event) =>
                                        setLanguage(event.target.value)
                                    }
                                >
                                    {LANGUAGES.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                            </div>


                            <div className="editor-actions">

                                <button
                                    type="button"
                                    className="ai-chat-button"
                                    aria-expanded={showAiChatNotice}
                                    aria-controls="problem-ai-chat-notice"
                                    onClick={() =>
                                        setShowAiChatNotice((visible) => !visible)
                                    }
                                >
                                    <MessageCircle aria-hidden="true" size={13} />
                                    AI Chat
                                </button>

                                <button
                                    type="button"
                                    onClick={resetCode}
                                >
                                    Reset
                                </button>

                                <button
                                    type="button"
                                    onClick={copyCode}
                                >
                                    {copied
                                        ? "✓ Copied"
                                        : "Copy"}
                                </button>

                                {showAiChatNotice && (
                                    <div
                                        className="ai-chat-notice"
                                        id="problem-ai-chat-notice"
                                        role="status"
                                    >
                                        <strong>AI Chat</strong>
                                        <span>
                                            Chat is not connected yet. An AI provider
                                            must be configured to get help with this
                                            problem.
                                        </span>
                                    </div>
                                )}

                            </div>

                        </div>


                        <div
                            className="code-editor"
                            aria-label={`${LANGUAGES.find((item) => item.value === language)?.label ?? "Code"} code editor`}
                        >
                            <Editor
                                height="100%"
                                language={
                                    LANGUAGES.find((item) => item.value === language)?.editor
                                }
                                theme="vs-dark"
                                value={code}
                                onChange={(value) =>
                                    setCodeByLanguage((previous) => ({
                                        ...previous,
                                        [language]: value ?? "",
                                    }))
                                }
                                options={{
                                    automaticLayout: true,
                                    fontSize: 13,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    tabSize: 4,
                                    wordWrap: "off",
                                }}
                            />

                        </div>


                        <div className="editor-footer">

                            <button
                                className="run-button"
                                onClick={runCode}
                                disabled={
                                    loading ||
                                    submitting
                                }
                            >
                                {loading
                                    ? (
                                        <>
                                            <span className="mini-spinner"></span>
                                            Running...
                                        </>
                                    )
                                    : (
                                        <>
                                            ▶ Run Code
                                        </>
                                    )}
                            </button>


                            <button
                                className="submit-button"
                                onClick={submitCode}
                                disabled={
                                    loading ||
                                    submitting
                                }
                            >
                                {submitting
                                    ? (
                                        <>
                                            <span className="mini-spinner light"></span>
                                            Judging...
                                        </>
                                    )
                                    : (
                                        <>
                                            ✓ Submit
                                        </>
                                    )}
                            </button>

                        </div>


                        {status &&
                            status !== "SUBMITTING" && (

                            <div className="run-result">

                                <div className="run-result-header">

                                    <div>

                                        <span className="input-kicker">
                                            EXECUTION RESULT
                                        </span>

                                        <h3>
                                            {status}
                                        </h3>

                                    </div>


                                    <span
                                        className={
                                            status ===
                                            "EXECUTED"
                                                ? "result-dot success"
                                                : status ===
                                                  "ERROR"
                                                    ? "result-dot error"
                                                    : "result-dot"
                                        }
                                    ></span>

                                </div>


                                {runMetrics && (
                                    <div className="run-metrics">
                                        <span>
                                            Runtime:{" "}
                                            {runMetrics.executionTime != null
                                                ? `${runMetrics.executionTime} ms`
                                                : "Not available"}
                                        </span>
                                        <span>
                                            Peak memory:{" "}
                                            {runMetrics.memoryUsed != null
                                                ? `${runMetrics.memoryUsed} KB`
                                                : "Not available"}
                                        </span>
                                    </div>
                                )}

                                {hasExpectedOutput && (
                                    <div className="run-comparison">
                                        <div className="result-block">
                                            <div className="result-label">
                                                Expected output (visible test)
                                            </div>
                                            <pre>
                                                {runMetrics.expectedOutput || "No output"}
                                            </pre>
                                        </div>
                                        <div className="result-block">
                                            <div className="result-label">
                                                Your actual output
                                            </div>
                                            <pre>
                                                {output || "No output"}
                                            </pre>
                                        </div>
                                        {status === "EXECUTED" && (
                                            <strong className={
                                                expectedOutputMatches
                                                    ? "comparison-match"
                                                    : "comparison-mismatch"
                                            }>
                                                {expectedOutputMatches
                                                    ? "Matches expected output"
                                                        : "Does not match expected output"}
                                            </strong>
                                        )}
                                    </div>
                                )}

                                {!hasExpectedOutput && status === "EXECUTED" && (
                                    <div className="result-block">
                                        <div className="result-label">Your actual output</div>
                                        <pre>{output || "No output"}</pre>
                                        <p className="comparison-note">
                                            No public test case matches this input. Submit your
                                            solution to compare it against the full test suite.
                                        </p>
                                    </div>
                                )}


                                {errorOutput && (

                                    <div className="result-block error-block">

                                        <div className="result-label">
                                            Error
                                        </div>

                                        <pre>
                                            {errorOutput}
                                        </pre>

                                    </div>

                                )}

                            </div>

                        )}

                    </div>

                </section>

            </main>

        </div>
    );
}


const styles = `

* {
    box-sizing: border-box;
}

.problem-page {
    min-height: 100vh;
    background: #f6f7fb;
    color: #171a2b;
    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}

.problem-topbar {
    height: 66px;
    padding: 0 5%;
    background: rgba(255,255,255,0.96);
    border-bottom: 1px solid #e6e8ef;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: sticky;
    top: 0;
    z-index: 20;
    backdrop-filter: blur(12px);
}

.back-link,
.history-button {
    border: none;
    background: transparent;
    cursor: pointer;
    font-weight: 700;
    font-size: 13px;
}

.back-link {
    color: #4f46e5;
}

.history-button {
    color: #606679;
    padding: 9px 13px;
    border-radius: 9px;
}

.history-button:hover {
    background: #f0f1ff;
    color: #4f46e5;
}

.topbar-title {
    font-weight: 850;
    font-size: 15px;
    letter-spacing: -0.02em;
}

.topbar-title span {
    color: #a1a5b2;
    padding: 0 5px;
}

.problem-layout {
    width: min(1500px, 94%);
    margin: 0 auto;
    padding: 30px 0 50px;
    display: grid;
    grid-template-columns:
        minmax(0, 0.92fr)
        minmax(560px, 1.08fr);
    gap: 24px;
    align-items: start;
}

.problem-panel,
.editor-card {
    background: white;
    border: 1px solid #e5e7ef;
    border-radius: 18px;
    box-shadow:
        0 10px 35px rgba(26,31,55,0.055);
}

.problem-panel {
    padding: 28px;
}

.problem-heading {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 20px;
    padding-bottom: 22px;
    border-bottom: 1px solid #eceef3;
}

.problem-kicker,
.input-kicker {
    color: #6366f1;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.14em;
}

.problem-heading h1 {
    margin: 7px 0 0;
    font-size: 29px;
    letter-spacing: -0.045em;
    line-height: 1.15;
}

.problem-badges {
    display: flex;
    gap: 7px;
    flex-wrap: wrap;
    justify-content: flex-end;
}

.difficulty,
.topic {
    padding: 7px 10px;
    border-radius: 8px;
    font-size: 10px;
    font-weight: 850;
    text-transform: uppercase;
}

.difficulty.easy {
    background: #dcfce7;
    color: #15803d;
}

.difficulty.medium {
    background: #fef3c7;
    color: #b45309;
}

.difficulty.hard {
    background: #fee2e2;
    color: #dc2626;
}

.topic {
    background: #eef0ff;
    color: #4f46e5;
}

.problem-block {
    padding: 23px 0;
    border-bottom: 1px solid #eceef3;
}

.problem-block h2 {
    margin: 0 0 12px;
    font-size: 16px;
    letter-spacing: -0.015em;
}

.description {
    margin: 0;
    color: #5e6476;
    font-size: 13px;
    line-height: 1.8;
    white-space: pre-wrap;
}

.info-box {
    background: #f7f8fc;
    border: 1px solid #e6e8ef;
    padding: 14px;
    border-radius: 10px;
    color: #555b6c;
    font-size: 12px;
    line-height: 1.65;
    white-space: pre-wrap;
}

.example-grid {
    display: grid;
    grid-template-columns:
        repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.example-card {
    overflow: hidden;
    border-radius: 11px;
    border: 1px solid #e4e7ef;
    background: #f8f9fc;
}

.example-label {
    padding: 9px 12px;
    background: #f0f1f5;
    color: #656b7b;
    font-size: 10px;
    font-weight: 850;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.example-value-label {
    padding: 8px 12px 0;
    color: #656b7b;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

.example-card pre {
    margin: 0;
    padding: 14px;
    min-height: 80px;
    overflow-x: auto;
    color: #34394b;
    font-family: Consolas, monospace;
    font-size: 12px;
    line-height: 1.6;
    white-space: pre-wrap;
}

.judge-info {
    margin-top: 22px;
    padding: 15px;
    border-radius: 12px;
    background: #f1f2ff;
    border: 1px solid #dfe1ff;
    display: flex;
    gap: 12px;
    align-items: flex-start;
}

.judge-info-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: #e0e2ff;
    color: #4f46e5;
    font-weight: 900;
}

.judge-info strong {
    display: block;
    font-size: 12px;
    margin-bottom: 3px;
}

.judge-info p {
    margin: 0;
    color: #6b7081;
    font-size: 11px;
    line-height: 1.55;
}

.editor-card {
    overflow: hidden;
    background: #171a24;
    border-color: #292d3a;
}

.editor-header {
    height: 52px;
    padding: 0 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #202430;
    border-bottom: 1px solid #2d3140;
}

.editor-language {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #e5e7ed;
    font-size: 12px;
    font-weight: 800;
}

.language-select {
    min-width: 130px;
    border: 1px solid #3a3f4f;
    border-radius: 7px;
    padding: 7px 10px;
    background: #292e3b;
    color: #e5e7ed;
    font-size: 12px;
    font-weight: 750;
    cursor: pointer;
}

.language-select:focus-visible {
    outline: 2px solid #818cf8;
    outline-offset: 2px;
}

.editor-actions {
    display: flex;
    position: relative;
    gap: 6px;
}

.editor-actions button {
    border: 1px solid #3a3f4f;
    background: #292e3b;
    color: #aeb4c2;
    border-radius: 7px;
    padding: 6px 10px;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
}

.editor-actions button:hover {
    background: #343a49;
    color: white;
}

.editor-actions .ai-chat-button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    border-color: #5148a9;
    color: #c7c4ff;
}

.editor-actions .ai-chat-button:hover {
    border-color: #7770dc;
    background: #38345f;
    color: white;
}

.ai-chat-notice {
    position: absolute;
    z-index: 10;
    top: calc(100% + 8px);
    right: 0;
    display: grid;
    width: min(280px, calc(100vw - 40px));
    gap: 6px;
    padding: 12px 14px;
    border: 1px solid #3a3f4f;
    border-radius: 10px;
    background: #202430;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.28);
    color: #e5e7ed;
    font-size: 12px;
    line-height: 1.5;
}

.ai-chat-notice span {
    color: #aeb4c2;
}

.code-editor {
    height: 490px;
    overflow: hidden;
    background: #171a24;
}

.editor-footer {
    padding: 13px 15px;
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    background: #202430;
    border-top: 1px solid #292d3a;
}

.run-button,
.submit-button {
    border: none;
    border-radius: 9px;
    padding: 11px 17px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.run-button {
    background: #303544;
    color: #e1e4eb;
}

.run-button:hover:not(:disabled) {
    background: #3b4150;
}

.submit-button {
    background: #4f46e5;
    color: white;
    box-shadow:
        0 8px 18px rgba(79,70,229,0.25);
}

.submit-button:hover:not(:disabled) {
    background: #4338ca;
}

.run-button:disabled,
.submit-button:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.mini-spinner {
    width: 13px;
    height: 13px;
    border: 2px solid #73798a;
    border-top-color: #e5e7eb;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

.mini-spinner.light {
    border-color: rgba(255,255,255,0.35);
    border-top-color: white;
}

.run-result {
    border-top: 1px solid #303441;
    background: #141720;
    padding: 18px;
}

.run-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    color: #aeb4c2;
    font-size: 12px;
}

.run-comparison {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 12px;
}

.comparison-match,
.comparison-mismatch,
.comparison-note {
    grid-column: 1 / -1;
    margin: 0;
    font-size: 12px;
}

.comparison-match {
    color: #4ade80;
}

.comparison-mismatch {
    color: #f87171;
}

.comparison-note {
    color: #aeb4c2;
}

.run-result-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 14px;
}

.run-result-header h3 {
    margin: 4px 0 0;
    color: #e7e9ef;
    font-size: 14px;
    text-transform: capitalize;
}

.result-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #f59e0b;
}

.result-dot.success {
    background: #22c55e;
}

.result-dot.error {
    background: #ef4444;
}

.result-block {
    margin-top: 10px;
}

.result-label {
    color: #7f8698;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 6px;
}

.result-block pre {
    margin: 0;
    padding: 13px;
    max-height: 190px;
    overflow: auto;
    border-radius: 8px;
    background: #1d212d;
    border: 1px solid #2b3040;
    color: #d5dae5;
    font-family: Consolas, monospace;
    font-size: 11px;
    line-height: 1.6;
    white-space: pre-wrap;
}

.error-block pre {
    color: #fca5a5;
    border-color: #4a2c34;
}

.page-loading {
    min-height: 80vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.page-loading h2 {
    margin: 17px 0 5px;
    font-size: 20px;
}

.page-loading p {
    margin: 0;
    color: #7b8192;
    font-size: 13px;
}

.spinner {
    width: 42px;
    height: 42px;
    border: 4px solid #e1e4ef;
    border-top-color: #4f46e5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 1100px) {

    .problem-layout {
        grid-template-columns: 1fr;
    }

    .problem-panel {
        order: 1;
    }

    .editor-panel {
        order: 2;
    }

    .code-editor {
        height: 430px;
    }
}

@media (max-width: 650px) {

    .problem-topbar {
        padding: 0 15px;
    }

    .topbar-title {
        display: none;
    }

    .problem-layout {
        width: 100%;
        padding: 15px 10px 30px;
    }

    .problem-panel {
        padding: 20px;
        border-radius: 14px;
    }

    .problem-heading {
        flex-direction: column;
    }

    .problem-badges {
        justify-content: flex-start;
    }

    .example-grid {
        grid-template-columns: 1fr;
    }

    .editor-card {
        border-radius: 14px;
    }

    .code-editor {
        height: 400px;
    }

    .editor-footer {
        flex-direction: column;
    }

    .run-button,
    .submit-button {
        width: 100%;
    }
}

`;

export default ProblemDetails;