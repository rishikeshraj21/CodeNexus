import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Problems() {

    const navigate = useNavigate();

    const [problems, setProblems] = useState([]);
    const [progress, setProgress] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");

    useEffect(() => {

        const fetchProblems = async () => {

            try {

                const response =
                    await API.get("/problems");

                setProblems(response.data);

            } catch (error) {

                console.error(
                    "Problems API error:",
                    error
                );

                if (error.response?.status === 401) {

                    localStorage.clear();
                    navigate("/login");
                    return;
                }

                setError(
                    error.response?.data?.message ||
                    "Unable to load problems."
                );

            } finally {

                setLoading(false);
            }
        };

        fetchProblems();

    }, [navigate]);


    useEffect(() => {

        const fetchProgress = async () => {

            try {

                const email =
                    localStorage.getItem("email");

                if (!email) {
                    return;
                }

                const userResponse =
                    await API.get("/auth/me");

                const currentUser = userResponse.data;

                if (!currentUser) {
                    return;
                }

                const submissionsResponse =
                    await API.get(
                        `/submissions/user/${currentUser.id}`
                    );

                const submissions =
                    submissionsResponse.data || [];

                const progressMap = {};

                submissions.forEach(
                    (submission) => {

                        const problemId =
                            submission.problem?.id;

                        if (!problemId) {
                            return;
                        }

                        const status =
                            String(
                                submission.status || ""
                            ).toUpperCase();

                        if (status === "ACCEPTED") {

                            progressMap[problemId] =
                                "SOLVED";

                        } else if (
                            progressMap[problemId] !==
                            "SOLVED"
                        ) {

                            progressMap[problemId] =
                                "ATTEMPTED";
                        }
                    }
                );

                setProgress(progressMap);

            } catch (error) {

                console.error(
                    "Progress API error:",
                    error
                );

                setProgress({});
            }

        };

        fetchProgress();

    }, []);


    const logout = () => {

        localStorage.removeItem("token");
        localStorage.removeItem("email");

        navigate("/login");
    };


    const solvedCount =
        problems.filter(
            (problem) =>
                progress[problem.id] === "SOLVED"
        ).length;

    const attemptedCount =
        problems.filter(
            (problem) =>
                progress[problem.id] === "ATTEMPTED"
        ).length;

    const unsolvedCount =
        problems.length -
        solvedCount -
        attemptedCount;


    // ========================================
    // FILTER PROBLEMS
    // ========================================

    const filteredProblems = useMemo(() => {

        if (filter === "ALL") {
            return problems;
        }

        return problems.filter(
            (problem) =>
                (
                    progress[problem.id] ||
                    "UNSOLVED"
                ) === filter
        );

    }, [problems, progress, filter]);


    if (loading) {

        return (
            <div className="page-center">

                <div className="loading-box">

                    <div className="spinner"></div>

                    <p>
                        Loading problems...
                    </p>

                </div>

            </div>
        );
    }


    return (

        <div className="problems-page">

            {/* NAVBAR */}

            <nav className="navbar">

                <div
                    className="logo"
                    onClick={() => navigate("/")}
                >
                    CodeNexus
                </div>

                <div className="nav-right">

                    <button
                        className="nav-home-btn"
                        onClick={() => navigate("/")}
                    >
                        Dashboard
                    </button>

                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>

            </nav>


            {/* MAIN */}

            <main className="problems-container">

                <div className="problems-header">

                    <div>

                        <p className="dashboard-label">
                            PRACTICE
                        </p>

                        <h1>
                            Coding Problems
                        </h1>

                        <p>
                            Choose a problem and start coding.
                        </p>

                    </div>

                    <div className="problem-count">

                        <strong>
                            {problems.length}
                        </strong>

                        <span>
                            Problems
                        </span>

                    </div>

                </div>


                {/* PROGRESS CARDS */}

                <div className="problem-progress">

                    <div
                        className={`progress-card solved-progress ${
                            filter === "SOLVED"
                                ? "progress-active"
                                : ""
                        }`}
                        onClick={() =>
                            setFilter("SOLVED")
                        }
                    >

                        <div className="progress-icon">
                            ✓
                        </div>

                        <div>

                            <strong>
                                {solvedCount}
                            </strong>

                            <span>
                                Solved
                            </span>

                        </div>

                    </div>


                    <div
                        className={`progress-card attempted-progress ${
                            filter === "ATTEMPTED"
                                ? "progress-active"
                                : ""
                        }`}
                        onClick={() =>
                            setFilter("ATTEMPTED")
                        }
                    >

                        <div className="progress-icon">
                            ◐
                        </div>

                        <div>

                            <strong>
                                {attemptedCount}
                            </strong>

                            <span>
                                Attempted
                            </span>

                        </div>

                    </div>


                    <div
                        className={`progress-card unsolved-progress ${
                            filter === "UNSOLVED"
                                ? "progress-active"
                                : ""
                        }`}
                        onClick={() =>
                            setFilter("UNSOLVED")
                        }
                    >

                        <div className="progress-icon">
                            ○
                        </div>

                        <div>

                            <strong>
                                {unsolvedCount}
                            </strong>

                            <span>
                                Unsolved
                            </span>

                        </div>

                    </div>

                </div>


                {/* FILTER BUTTONS */}

                <div className="problem-filters">

                    <button
                        className={
                            filter === "ALL"
                                ? "problem-filter active"
                                : "problem-filter"
                        }
                        onClick={() =>
                            setFilter("ALL")
                        }
                    >
                        All ({problems.length})
                    </button>

                    <button
                        className={
                            filter === "SOLVED"
                                ? "problem-filter active"
                                : "problem-filter"
                        }
                        onClick={() =>
                            setFilter("SOLVED")
                        }
                    >
                        Solved ({solvedCount})
                    </button>

                    <button
                        className={
                            filter === "ATTEMPTED"
                                ? "problem-filter active"
                                : "problem-filter"
                        }
                        onClick={() =>
                            setFilter("ATTEMPTED")
                        }
                    >
                        Attempted ({attemptedCount})
                    </button>

                    <button
                        className={
                            filter === "UNSOLVED"
                                ? "problem-filter active"
                                : "problem-filter"
                        }
                        onClick={() =>
                            setFilter("UNSOLVED")
                        }
                    >
                        Unsolved ({unsolvedCount})
                    </button>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="error-message">
                        {error}
                    </div>

                )}


                {/* EMPTY */}

                {!error &&
                    filteredProblems.length === 0 && (

                        <div className="empty-state">

                            <h2>
                                No problems found
                            </h2>

                            <p>
                                There are no problems in
                                this category.
                            </p>

                        </div>

                    )}


                {/* PROBLEM LIST */}

                <div className="problem-list">

                    {filteredProblems.map(
                        (problem) => {

                            const status =
                                progress[problem.id] ||
                                "UNSOLVED";

                            return (

                                <div
                                    className="problem-card"
                                    key={problem.id}
                                    onClick={() =>
                                        navigate(
                                            `/problems/${problem.id}`
                                        )
                                    }
                                >

                                    <div className="problem-main">

                                        <div className="problem-number">
                                            #{problem.id}
                                        </div>

                                        <div>

                                            <h2>
                                                {problem.title}
                                            </h2>

                                            <p>
                                                {problem.description}
                                            </p>

                                        </div>

                                    </div>


                                    <div className="problem-meta">

                                        <span
                                            className={`difficulty ${String(
                                                problem.difficulty || ""
                                            ).toLowerCase()}`}
                                        >
                                            {problem.difficulty}
                                        </span>

                                        <span className="topic">
                                            {problem.topic}
                                        </span>

                                        <span
                                            className={`problem-status ${status.toLowerCase()}`}
                                        >
                                            {status === "SOLVED" &&
                                                "✓ Solved"}

                                            {status === "ATTEMPTED" &&
                                                "◐ Attempted"}

                                            {status === "UNSOLVED" &&
                                                "○ Unsolved"}
                                        </span>

                                        <span className="arrow">
                                            →
                                        </span>

                                    </div>

                                </div>

                            );
                        }
                    )}

                </div>

            </main>

        </div>
    );
}

export default Problems;