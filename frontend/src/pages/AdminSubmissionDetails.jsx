import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

function AdminSubmissionDetails() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [submission, setSubmission] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadSubmission = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await API.get(
                `/admin/submissions/${id}`
            );

            setSubmission(response.data);
        } catch (err) {
            console.error(
                "SUBMISSION DETAILS ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load submission details."
            );
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadSubmission();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadSubmission]);

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        try {
            return new Date(date).toLocaleString();
        } catch {
            return date;
        }
    };

    const getStatusClass = (status) => {
        if (!status) {
            return "default";
        }

        const normalized =
            status.toLowerCase();

        if (
            normalized.includes("accepted") ||
            normalized.includes("success")
        ) {
            return "success";
        }

        if (
            normalized.includes("wrong") ||
            normalized.includes("failed") ||
            normalized.includes("error")
        ) {
            return "danger";
        }

        if (
            normalized.includes("pending") ||
            normalized.includes("running")
        ) {
            return "warning";
        }

        return "default";
    };

    const copyCode = async () => {
        if (!submission?.sourceCode) {
            return;
        }

        try {
            await navigator.clipboard.writeText(
                submission.sourceCode
            );

            alert("Source code copied.");
        } catch {
            alert("Unable to copy source code.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("email");

        navigate("/login");
    };

    if (loading) {
        return (
            <div className="admin-submission-page">
                <style>{`
                    .admin-submission-page {
                        min-height: 100vh;
                        background:
                            radial-gradient(circle at top right, rgba(99,102,241,.16), transparent 32%),
                            radial-gradient(circle at bottom left, rgba(14,165,233,.10), transparent 30%),
                            #080b14;
                        color: #f8fafc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    }

                    .submission-loading-box {
                        text-align: center;
                    }

                    .submission-spinner {
                        width: 46px;
                        height: 46px;
                        border: 4px solid rgba(255,255,255,.12);
                        border-top-color: #6366f1;
                        border-radius: 50%;
                        animation: submissionSpin .8s linear infinite;
                        margin: 0 auto 20px;
                    }

                    @keyframes submissionSpin {
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    .submission-loading-box h2 {
                        margin: 0 0 8px;
                        font-size: 22px;
                    }

                    .submission-loading-box p {
                        margin: 0;
                        color: #94a3b8;
                    }
                `}</style>

                <div className="submission-loading-box">
                    <div className="submission-spinner"></div>
                    <h2>Loading Submission</h2>
                    <p>Please wait while the submission is loaded.</p>
                </div>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className="admin-submission-page">
                <style>{`
                    .admin-submission-page {
                        min-height: 100vh;
                        background:
                            radial-gradient(circle at top right, rgba(99,102,241,.16), transparent 32%),
                            #080b14;
                        color: #f8fafc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                        padding: 30px;
                    }

                    .submission-error-box {
                        width: min(520px, 100%);
                        background: #111827;
                        border: 1px solid rgba(255,255,255,.08);
                        border-radius: 18px;
                        padding: 35px;
                        text-align: center;
                        box-shadow: 0 20px 70px rgba(0,0,0,.35);
                    }

                    .submission-error-icon {
                        width: 60px;
                        height: 60px;
                        margin: 0 auto 18px;
                        border-radius: 50%;
                        background: rgba(239,68,68,.12);
                        color: #f87171;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 28px;
                    }

                    .submission-error-box h2 {
                        margin: 0 0 10px;
                    }

                    .submission-error-box p {
                        color: #94a3b8;
                        margin: 0 0 25px;
                    }

                    .submission-back-btn {
                        border: none;
                        border-radius: 10px;
                        padding: 12px 20px;
                        background: #6366f1;
                        color: white;
                        font-weight: 700;
                        cursor: pointer;
                    }
                `}</style>

                <div className="submission-error-box">
                    <div className="submission-error-icon">
                        !
                    </div>

                    <h2>
                        Submission Not Found
                    </h2>

                    <p>
                        {error ||
                            "The requested submission could not be loaded."}
                    </p>

                    <button
                        className="submission-back-btn"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Back to Admin Panel
                    </button>
                </div>
            </div>
        );
    }

    const statusClass =
        getStatusClass(submission.status);

    return (
        <div className="admin-submission-page">

            <style>{`
                * {
                    box-sizing: border-box;
                }

                .admin-submission-page {
                    min-height: 100vh;
                    background:
                        radial-gradient(circle at 85% 0%, rgba(99,102,241,.15), transparent 30%),
                        radial-gradient(circle at 0% 80%, rgba(14,165,233,.08), transparent 30%),
                        #080b14;
                    color: #f8fafc;
                    font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                }

                .submission-topbar {
                    height: 72px;
                    border-bottom: 1px solid rgba(255,255,255,.07);
                    background: rgba(8,11,20,.86);
                    backdrop-filter: blur(16px);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 34px;
                    position: sticky;
                    top: 0;
                    z-index: 20;
                }

                .submission-brand {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 800;
                    font-size: 19px;
                }

                .submission-brand-logo {
                    width: 38px;
                    height: 38px;
                    border-radius: 11px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 900;
                    box-shadow: 0 8px 30px rgba(99,102,241,.3);
                }

                .submission-brand span {
                    color: #94a3b8;
                    font-size: 11px;
                    letter-spacing: 1.4px;
                    margin-left: 2px;
                }

                .submission-top-actions {
                    display: flex;
                    gap: 10px;
                }

                .top-action-btn {
                    border: 1px solid rgba(255,255,255,.09);
                    background: rgba(255,255,255,.04);
                    color: #e2e8f0;
                    border-radius: 10px;
                    padding: 10px 15px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: .2s ease;
                }

                .top-action-btn:hover {
                    background: rgba(255,255,255,.08);
                    transform: translateY(-1px);
                }

                .logout-btn:hover {
                    border-color: rgba(239,68,68,.4);
                    color: #fca5a5;
                }

                .submission-container {
                    width: min(1500px, calc(100% - 50px));
                    margin: 0 auto;
                    padding: 34px 0 70px;
                }

                .submission-heading {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 25px;
                    margin-bottom: 25px;
                }

                .submission-heading-left {
                    display: flex;
                    align-items: flex-start;
                    gap: 18px;
                }

                .submission-id-icon {
                    width: 54px;
                    height: 54px;
                    border-radius: 15px;
                    background: linear-gradient(
                        135deg,
                        rgba(99,102,241,.24),
                        rgba(139,92,246,.12)
                    );
                    border: 1px solid rgba(129,140,248,.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 23px;
                }

                .submission-heading h1 {
                    margin: 0 0 7px;
                    font-size: clamp(25px, 3vw, 36px);
                    letter-spacing: -.7px;
                }

                .submission-heading p {
                    margin: 0;
                    color: #94a3b8;
                }

                .submission-heading-right {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .status-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    padding: 9px 14px;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: .4px;
                    border: 1px solid transparent;
                }

                .status-pill.success {
                    color: #86efac;
                    background: rgba(34,197,94,.1);
                    border-color: rgba(34,197,94,.22);
                }

                .status-pill.danger {
                    color: #fca5a5;
                    background: rgba(239,68,68,.1);
                    border-color: rgba(239,68,68,.22);
                }

                .status-pill.warning {
                    color: #fde68a;
                    background: rgba(245,158,11,.1);
                    border-color: rgba(245,158,11,.22);
                }

                .status-pill.default {
                    color: #cbd5e1;
                    background: rgba(148,163,184,.1);
                    border-color: rgba(148,163,184,.2);
                }

                .submission-meta {
                    display: grid;
                    grid-template-columns: repeat(7, minmax(0, 1fr));
                    gap: 12px;
                    margin-bottom: 22px;
                }

                .meta-card {
                    background: rgba(17,24,39,.72);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 14px;
                    padding: 16px;
                    min-width: 0;
                }

                .meta-label {
                    display: block;
                    color: #64748b;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: .9px;
                    font-weight: 800;
                    margin-bottom: 8px;
                }

                .meta-value {
                    display: block;
                    color: #f1f5f9;
                    font-size: 14px;
                    font-weight: 750;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .meta-subvalue {
                    display: block;
                    color: #64748b;
                    font-size: 11px;
                    margin-top: 4px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .submission-grid {
                    display: grid;
                    grid-template-columns: minmax(0, 1.6fr) minmax(320px, .8fr);
                    gap: 20px;
                    align-items: start;
                }

                .panel {
                    background: rgba(15,23,42,.78);
                    border: 1px solid rgba(255,255,255,.07);
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 18px 55px rgba(0,0,0,.18);
                }

                .panel-header {
                    min-height: 58px;
                    padding: 14px 18px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    border-bottom: 1px solid rgba(255,255,255,.06);
                    background: rgba(255,255,255,.015);
                }

                .panel-header-left {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .panel-header h2 {
                    font-size: 14px;
                    margin: 0;
                    letter-spacing: .1px;
                }

                .panel-tag {
                    color: #818cf8;
                    background: rgba(99,102,241,.1);
                    border: 1px solid rgba(99,102,241,.18);
                    padding: 5px 9px;
                    border-radius: 7px;
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                }

                .copy-code-btn {
                    border: 1px solid rgba(255,255,255,.08);
                    background: rgba(255,255,255,.04);
                    color: #cbd5e1;
                    border-radius: 8px;
                    padding: 7px 11px;
                    font-size: 11px;
                    font-weight: 700;
                    cursor: pointer;
                }

                .copy-code-btn:hover {
                    background: rgba(255,255,255,.08);
                }

                .source-code {
                    margin: 0;
                    padding: 22px;
                    min-height: 470px;
                    max-height: 700px;
                    overflow: auto;
                    background: #070a11;
                    color: #dbeafe;
                    font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
                    font-size: 13px;
                    line-height: 1.65;
                    tab-size: 4;
                    white-space: pre;
                }

                .side-stack {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .result-content {
                    padding: 18px;
                }

                .output-box,
                .error-box {
                    margin: 0;
                    padding: 16px;
                    border-radius: 11px;
                    min-height: 130px;
                    max-height: 300px;
                    overflow: auto;
                    white-space: pre-wrap;
                    word-break: break-word;
                    font-family: "Cascadia Code", "Fira Code", Consolas, monospace;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .output-box {
                    background: #070a11;
                    border: 1px solid rgba(255,255,255,.06);
                    color: #cbd5e1;
                }

                .error-box {
                    background: rgba(127,29,29,.12);
                    border: 1px solid rgba(239,68,68,.18);
                    color: #fca5a5;
                }

                .empty-output {
                    color: #64748b;
                    font-style: italic;
                }

                .result-label {
                    font-size: 11px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: .9px;
                    font-weight: 800;
                    margin-bottom: 9px;
                    display: block;
                }

                .error-panel {
                    border-color: rgba(239,68,68,.15);
                }

                .error-panel .panel-header {
                    color: #fca5a5;
                }

                .admin-note {
                    margin-top: 20px;
                    padding: 15px 17px;
                    border-radius: 12px;
                    background: rgba(245,158,11,.06);
                    border: 1px solid rgba(245,158,11,.12);
                    color: #cbd5e1;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .admin-note strong {
                    color: #fcd34d;
                }

                @media (max-width: 1200px) {
                    .submission-meta {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }

                    .submission-grid {
                        grid-template-columns: 1fr;
                    }
                }

                @media (max-width: 750px) {
                    .submission-topbar {
                        padding: 0 16px;
                    }

                    .submission-brand span {
                        display: none;
                    }

                    .submission-container {
                        width: min(100% - 24px, 1500px);
                        padding-top: 22px;
                    }

                    .submission-heading {
                        flex-direction: column;
                    }

                    .submission-heading-right {
                        width: 100%;
                    }

                    .submission-meta {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }

                    .meta-card {
                        padding: 13px;
                    }

                    .source-code {
                        min-height: 350px;
                        font-size: 12px;
                    }
                }

                @media (max-width: 480px) {
                    .submission-meta {
                        grid-template-columns: 1fr;
                    }

                    .top-action-btn {
                        padding: 8px 10px;
                        font-size: 11px;
                    }

                    .submission-heading h1 {
                        font-size: 25px;
                    }
                }
            `}</style>

            <header className="submission-topbar">

                <div className="submission-brand">
                    <div className="submission-brand-logo">
                        C
                    </div>

                    <div>
                        CodeNexus{" "}
                        <span>
                            ADMIN
                        </span>
                    </div>
                </div>

                <div className="submission-top-actions">

                    <button
                        className="top-action-btn"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Admin Panel
                    </button>

                    <button
                        className="top-action-btn logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </header>

            <main className="submission-container">

                <div className="submission-heading">

                    <div className="submission-heading-left">

                        <div className="submission-id-icon">
                            📄
                        </div>

                        <div>
                            <h1>
                                Submission #
                                {submission.id}
                            </h1>

                            <p>
                                Full submission details and execution result
                            </p>
                        </div>

                    </div>

                    <div className="submission-heading-right">

                        <span
                            className={`status-pill ${statusClass}`}
                        >
                            <span>●</span>
                            {submission.status ||
                                "UNKNOWN"}
                        </span>

                    </div>

                </div>

                <section className="submission-meta">

                    <div className="meta-card">
                        <span className="meta-label">
                            User
                        </span>

                        <span className="meta-value">
                            {submission.userName ||
                                "Unknown"}
                        </span>

                        <span className="meta-subvalue">
                            {submission.userEmail ||
                                "—"}
                        </span>
                    </div>

                    <div className="meta-card">
                        <span className="meta-label">
                            Problem
                        </span>

                        <span className="meta-value">
                            {submission.problemTitle ||
                                "Unknown"}
                        </span>

                        <span className="meta-subvalue">
                            #
                            {submission.problemId ??
                                "—"}
                        </span>
                    </div>

                    <div className="meta-card">
                        <span className="meta-label">
                            Language
                        </span>

                        <span className="meta-value">
                            {submission.language ||
                                "—"}
                        </span>
                    </div>

                    <div className="meta-card">
                        <span className="meta-label">
                            Status
                        </span>

                        <span className="meta-value">
                            {submission.status ||
                                "—"}
                        </span>
                    </div>

                    <div className="meta-card">
                        <span className="meta-label">
                            Execution Time
                        </span>

                        <span className="meta-value">
                            {submission.executionTime !=
                            null
                                ? `${submission.executionTime} ms`
                                : "—"}
                        </span>
                    </div>

                    <div className="meta-card">
                        <span className="meta-label">
                            Memory
                        </span>

                        <span className="meta-value">
                            {submission.memoryUsed !=
                            null
                                ? `${submission.memoryUsed} KB`
                                : "Not available"}
                        </span>
                    </div>

                    <div className="meta-card">
                        <span className="meta-label">
                            Submitted
                        </span>

                        <span className="meta-value">
                            {formatDate(
                                submission.submittedAt
                            )}
                        </span>
                    </div>

                </section>

                <div className="submission-grid">

                    <section className="panel">

                        <div className="panel-header">

                            <div className="panel-header-left">

                                <h2>
                                    Source Code
                                </h2>

                                <span className="panel-tag">
                                    {submission.language ||
                                        "CODE"}
                                </span>

                            </div>

                            <button
                                className="copy-code-btn"
                                onClick={copyCode}
                            >
                                Copy Code
                            </button>

                        </div>

                        <pre className="source-code">
                            {submission.sourceCode ||
                                "No source code available."}
                        </pre>

                    </section>

                    <div className="side-stack">

                        <section className="panel">

                            <div className="panel-header">

                                <div className="panel-header-left">
                                    <h2>
                                        Program Output
                                    </h2>
                                </div>

                            </div>

                            <div className="result-content">

                                <span className="result-label">
                                    Output
                                </span>

                                <pre className="output-box">
                                    {submission.output ||
                                        <span className="empty-output">
                                            No output returned.
                                        </span>}
                                </pre>

                            </div>

                        </section>

                        {submission.errorMessage && (
                            <section className="panel error-panel">

                                <div className="panel-header">

                                    <div className="panel-header-left">
                                        <h2>
                                            Judge Error
                                        </h2>
                                    </div>

                                </div>

                                <div className="result-content">

                                    <span className="result-label">
                                        Error / Judge Message
                                    </span>

                                    <pre className="error-box">
                                        {submission.errorMessage}
                                    </pre>

                                </div>

                            </section>
                        )}

                        <section className="panel">

                            <div className="panel-header">

                                <div className="panel-header-left">
                                    <h2>
                                        Submission Information
                                    </h2>
                                </div>

                            </div>

                            <div className="result-content">

                                <span className="result-label">
                                    Submission ID
                                </span>

                                <div
                                    style={{
                                        color: "#e2e8f0",
                                        fontWeight: 700,
                                        marginBottom: "18px",
                                    }}
                                >
                                    #{submission.id}
                                </div>

                                <span className="result-label">
                                    User ID
                                </span>

                                <div
                                    style={{
                                        color: "#cbd5e1",
                                        marginBottom: "18px",
                                    }}
                                >
                                    {submission.userId ??
                                        "—"}
                                </div>

                                <span className="result-label">
                                    Problem ID
                                </span>

                                <div
                                    style={{
                                        color: "#cbd5e1",
                                    }}
                                >
                                    {submission.problemId ??
                                        "—"}
                                </div>

                            </div>

                        </section>

                    </div>

                </div>

                {submission.errorMessage && (
                    <div className="admin-note">
                        <strong>
                            Judge feedback:
                        </strong>{" "}
                        The submission was processed by the CodeNexus judge.
                        Review the source code, output and error message above
                        to understand why the submission received its current
                        status.
                    </div>
                )}

            </main>
        </div>
    );
}

export default AdminSubmissionDetails;