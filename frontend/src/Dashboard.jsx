import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Dashboard() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [problems, setProblems] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadDashboard = useCallback(async () => {
        try {
            setLoading(true);

            const [userResponse, problemsResponse] =
                await Promise.all([
                    API.get("/auth/me"),
                    API.get("/problems")
                ]);

            const currentUser = userResponse.data;

            setUser(currentUser || null);
            setProblems(problemsResponse.data || []);

            if (currentUser) {
                const submissionsResponse =
                    await API.get(
                        `/submissions/user/${currentUser.id}`
                    );

                setSubmissions(
                    submissionsResponse.data || []
                );
            }

        } catch (error) {
            console.error(
                "Dashboard loading error:",
                error
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadDashboard();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadDashboard]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");

        navigate("/login");
    };

    /* =====================================
       CALCULATE USER PROGRESS
    ===================================== */

    const solvedProblemIds = new Set();
    const attemptedProblemIds = new Set();

    submissions.forEach((submission) => {
        const problemId =
            submission.problem?.id;

        if (!problemId) {
            return;
        }

        if (submission.status === "ACCEPTED") {
            solvedProblemIds.add(problemId);
        } else {
            attemptedProblemIds.add(problemId);
        }
    });

    solvedProblemIds.forEach((id) => {
        attemptedProblemIds.delete(id);
    });

    const solvedCount =
        solvedProblemIds.size;

    const attemptedCount =
        attemptedProblemIds.size;

    const totalProblems =
        problems.length;

    const unsolvedCount = Math.max(
        0,
        totalProblems -
            solvedCount -
            attemptedCount
    );

    const progressPercentage =
        totalProblems > 0
            ? Math.round(
                  (solvedCount /
                      totalProblems) *
                      100
              )
            : 0;

    const acceptedSubmissions =
        submissions.filter(
            (submission) =>
                submission.status ===
                "ACCEPTED"
        ).length;

    /* =====================================
       RECENT SUBMISSIONS
    ===================================== */

    const recentSubmissions =
        [...submissions]
            .sort(
                (a, b) =>
                    new Date(
                        b.submittedAt
                    ) -
                    new Date(
                        a.submittedAt
                    )
            )
            .slice(0, 5);

    const getStatusClass = (status) => {
        switch (status) {
            case "ACCEPTED":
                return "dashboard-status accepted";

            case "WRONG_ANSWER":
                return "dashboard-status wrong";

            case "RUNTIME_ERROR":
                return "dashboard-status runtime";

            case "COMPILATION_ERROR":
                return "dashboard-status compile";

            case "TIME_LIMIT_EXCEEDED":
                return "dashboard-status timeout";

            default:
                return "dashboard-status";
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case "ACCEPTED":
                return "Accepted";

            case "WRONG_ANSWER":
                return "Wrong Answer";

            case "RUNTIME_ERROR":
                return "Runtime Error";

            case "COMPILATION_ERROR":
                return "Compilation Error";

            case "TIME_LIMIT_EXCEEDED":
                return "Time Limit";

            default:
                return status;
        }
    };

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
    };

    /* =====================================
       LOADING
    ===================================== */

    if (loading) {
        return (
            <div className="dashboard-loading-page">

                <div className="dashboard-loader">

                    <div className="loader-circle"></div>

                    <h2>
                        Loading CodeNexus
                    </h2>

                    <p>
                        Preparing your dashboard...
                    </p>

                </div>

            </div>
        );
    }

    return (
        <div className="dashboard-page">

            {/* =================================
                NAVBAR
            ================================= */}

            <nav className="dashboard-navbar">

                <div
                    className="dashboard-logo"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    <div className="logo-symbol">
                        &lt;/&gt;
                    </div>

                    <span>
                        CodeNexus
                    </span>
                </div>

                <div className="dashboard-nav-right">

                    <button
                        type="button"
                        className="dashboard-nav-link"
                        onClick={() =>
                            navigate("/problems")
                        }
                    >
                        Problems
                    </button>

                    <button
                        type="button"
                        className="dashboard-nav-link"
                        onClick={() =>
                            navigate("/leaderboard")
                        }
                    >
                        Leaderboard
                    </button>

                    <button
                        type="button"
                        className="dashboard-nav-link"
                        onClick={() =>
                            navigate("/submissions")
                        }
                    >
                        Submissions
                    </button>

                    <button
                        type="button"
                        className="dashboard-profile-button"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        <span className="profile-mini-icon">
                            {(user?.name ||
                                "U")
                                .charAt(0)
                                .toUpperCase()}
                        </span>

                        <span>
                            {user?.name ||
                                "User"}
                        </span>
                    </button>

                    <button
                        type="button"
                        className="dashboard-logout"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* =================================
                MAIN CONTENT
            ================================= */}

            <main className="dashboard-main">

                {/* =================================
                    HERO
                ================================= */}

                <section className="dashboard-hero">

                    <div className="hero-content">

                        <div className="hero-badge">
                            <span className="hero-badge-dot"></span>

                            Keep coding, keep growing
                        </div>

                        <h1>
                            Welcome back,
                            <br />

                            <span>
                                {user?.name ||
                                    "Coder"}
                            </span>
                            👋
                        </h1>

                        <p>
                            Sharpen your problem-solving
                            skills, solve challenging
                            problems and climb the
                            CodeNexus leaderboard.
                        </p>

                        <div className="hero-buttons">

                            <button
                                type="button"
                                className="hero-primary-button"
                                onClick={() =>
                                    navigate(
                                        "/problems"
                                    )
                                }
                            >
                                Start Solving
                                <span>→</span>
                            </button>

                            <button
                                type="button"
                                className="hero-secondary-button"
                                onClick={() =>
                                    navigate(
                                        "/profile"
                                    )
                                }
                            >
                                View Profile
                            </button>

                        </div>

                    </div>

                    {/* Progress Circle */}

                    <div className="hero-progress-card">

                        <div className="hero-progress-title">
                            <span>
                                Your Progress
                            </span>

                            <span>
                                {solvedCount}/
                                {totalProblems}
                            </span>
                        </div>

                        <div
                            className="progress-ring"
                            style={{
                                "--progress":
                                    `${progressPercentage * 3.6}deg`
                            }}
                        >
                            <div className="progress-ring-inner">

                                <strong>
                                    {progressPercentage}%
                                </strong>

                                <span>
                                    Completed
                                </span>

                            </div>
                        </div>

                        <p className="hero-progress-text">
                            Keep solving to reach
                            your next milestone.
                        </p>

                    </div>

                </section>

                {/* =================================
                    STATISTICS
                ================================= */}

                <section className="dashboard-statistics">

                    <div className="dashboard-stat-box">

                        <div className="stat-box-icon problems-icon">
                            ◈
                        </div>

                        <div>
                            <span>
                                Total Problems
                            </span>

                            <strong>
                                {totalProblems}
                            </strong>
                        </div>

                    </div>

                    <div className="dashboard-stat-box">

                        <div className="stat-box-icon solved-icon">
                            ✓
                        </div>

                        <div>
                            <span>
                                Problems Solved
                            </span>

                            <strong>
                                {solvedCount}
                            </strong>
                        </div>

                    </div>

                    <div className="dashboard-stat-box">

                        <div className="stat-box-icon submission-icon">
                            ≡
                        </div>

                        <div>
                            <span>
                                Submissions
                            </span>

                            <strong>
                                {submissions.length}
                            </strong>
                        </div>

                    </div>

                    <div className="dashboard-stat-box">

                        <div className="stat-box-icon accepted-icon">
                            ★
                        </div>

                        <div>
                            <span>
                                Accepted
                            </span>

                            <strong>
                                {acceptedSubmissions}
                            </strong>
                        </div>

                    </div>

                </section>

                {/* =================================
                    MAIN GRID
                ================================= */}

                <section className="dashboard-content-grid">

                    {/* LEFT */}

                    <div className="dashboard-left-column">

                        {/* Progress Breakdown */}

                        <div className="dashboard-panel">

                            <div className="panel-heading">

                                <div>
                                    <h2>
                                        Problem Progress
                                    </h2>

                                    <p>
                                        Your current
                                        problem-solving
                                        status
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/problems"
                                        )
                                    }
                                >
                                    View All →
                                </button>

                            </div>

                            <div className="progress-breakdown">

                                <div className="breakdown-row">

                                    <div className="breakdown-label">
                                        <span className="breakdown-dot solved-dot"></span>

                                        <span>
                                            Solved
                                        </span>
                                    </div>

                                    <strong>
                                        {solvedCount}
                                    </strong>

                                </div>

                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill solved-fill"
                                        style={{
                                            width:
                                                totalProblems >
                                                0
                                                    ? `${
                                                          (solvedCount /
                                                              totalProblems) *
                                                          100
                                                      }%`
                                                    : "0%"
                                        }}
                                    ></div>
                                </div>

                                <div className="breakdown-row">

                                    <div className="breakdown-label">
                                        <span className="breakdown-dot attempted-dot"></span>

                                        <span>
                                            Attempted
                                        </span>
                                    </div>

                                    <strong>
                                        {attemptedCount}
                                    </strong>

                                </div>

                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill attempted-fill"
                                        style={{
                                            width:
                                                totalProblems >
                                                0
                                                    ? `${
                                                          (attemptedCount /
                                                              totalProblems) *
                                                          100
                                                      }%`
                                                    : "0%"
                                        }}
                                    ></div>
                                </div>

                                <div className="breakdown-row">

                                    <div className="breakdown-label">
                                        <span className="breakdown-dot unsolved-dot"></span>

                                        <span>
                                            Unsolved
                                        </span>
                                    </div>

                                    <strong>
                                        {unsolvedCount}
                                    </strong>

                                </div>

                                <div className="breakdown-bar">
                                    <div
                                        className="breakdown-fill unsolved-fill"
                                        style={{
                                            width:
                                                totalProblems >
                                                0
                                                    ? `${
                                                          (unsolvedCount /
                                                              totalProblems) *
                                                          100
                                                      }%`
                                                    : "0%"
                                        }}
                                    ></div>
                                </div>

                            </div>

                        </div>

                        {/* Quick Actions */}

                        <div className="dashboard-panel">

                            <div className="panel-heading">

                                <div>
                                    <h2>
                                        Quick Actions
                                    </h2>

                                    <p>
                                        Jump directly
                                        where you need
                                        to go
                                    </p>
                                </div>

                            </div>

                            <div className="quick-actions">

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/problems"
                                        )
                                    }
                                >
                                    <span>
                                        💻
                                    </span>

                                    <div>
                                        <strong>
                                            Practice
                                        </strong>

                                        <small>
                                            Solve problems
                                        </small>
                                    </div>

                                    <b>→</b>

                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/submissions"
                                        )
                                    }
                                >
                                    <span>
                                        📋
                                    </span>

                                    <div>
                                        <strong>
                                            Submissions
                                        </strong>

                                        <small>
                                            View history
                                        </small>
                                    </div>

                                    <b>→</b>

                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/leaderboard"
                                        )
                                    }
                                >
                                    <span>
                                        🏆
                                    </span>

                                    <div>
                                        <strong>
                                            Leaderboard
                                        </strong>

                                        <small>
                                            Check rankings
                                        </small>
                                    </div>

                                    <b>→</b>

                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/profile"
                                        )
                                    }
                                >
                                    <span>
                                        👤
                                    </span>

                                    <div>
                                        <strong>
                                            Profile
                                        </strong>

                                        <small>
                                            Your statistics
                                        </small>
                                    </div>

                                    <b>→</b>

                                </button>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div className="dashboard-right-column">

                        {/* Recent Activity */}

                        <div className="dashboard-panel recent-panel">

                            <div className="panel-heading">

                                <div>
                                    <h2>
                                        Recent Activity
                                    </h2>

                                    <p>
                                        Your latest
                                        submissions
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate(
                                            "/submissions"
                                        )
                                    }
                                >
                                    All →
                                </button>

                            </div>

                            {recentSubmissions.length ===
                            0 ? (

                                <div className="no-activity">

                                    <div>
                                        📝
                                    </div>

                                    <h3>
                                        No submissions yet
                                    </h3>

                                    <p>
                                        Start solving
                                        problems to see
                                        your activity
                                        here.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            navigate(
                                                "/problems"
                                            )
                                        }
                                    >
                                        Solve a Problem
                                    </button>

                                </div>

                            ) : (

                                <div className="recent-submissions">

                                    {recentSubmissions.map(
                                        (submission) => (

                                            <div
                                                className="recent-submission"
                                                key={
                                                    submission.id
                                                }
                                                onClick={() =>
                                                    navigate(
                                                        `/submissions/${submission.id}`
                                                    )
                                                }
                                            >

                                                <div className="recent-submission-icon">
                                                    {submission.status ===
                                                    "ACCEPTED"
                                                        ? "✓"
                                                        : "!"}
                                                </div>

                                                <div className="recent-submission-info">

                                                    <strong>
                                                        {submission
                                                            .problem
                                                            ?.title ||
                                                            "Problem"}
                                                    </strong>

                                                    <span>
                                                        {
                                                            submission.language
                                                        }
                                                        {" • "}
                                                        {formatDate(
                                                            submission.submittedAt
                                                        )}
                                                    </span>

                                                </div>

                                                <span
                                                    className={getStatusClass(
                                                        submission.status
                                                    )}
                                                >
                                                    {getStatusText(
                                                        submission.status
                                                    )}
                                                </span>

                                            </div>

                                        )
                                    )}

                                </div>

                            )}

                        </div>

                        {/* Coding Tip */}

                        <div className="coding-tip">

                            <div className="tip-icon">
                                💡
                            </div>

                            <div>

                                <span>
                                    CODING TIP
                                </span>

                                <p>
                                    "First make it
                                    work, then make
                                    it better."
                                </p>

                                <small>
                                    Consistency beats
                                    perfection.
                                </small>

                            </div>

                        </div>

                    </div>

                </section>

                {/* =================================
                    FOOTER
                ================================= */}

                <footer className="dashboard-footer">

                    <div>
                        <strong>
                            CodeNexus
                        </strong>

                        <span>
                            Practice. Solve. Grow.
                        </span>
                    </div>

                    <span>
                        Keep coding 🚀
                    </span>

                </footer>

            </main>

        </div>
    );
}

export default Dashboard;