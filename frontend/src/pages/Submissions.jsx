import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Submissions() {

    const navigate = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");


    const loadSubmissions = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const userResponse =
                await api.get("/auth/me");

            const currentUser = userResponse.data;

            if (!currentUser) {

                setError(
                    "User not found."
                );

                return;
            }

            const response =
                await api.get(
                    `/submissions/user/${currentUser.id}`
                );

            setSubmissions(
                response.data || []
            );

        } catch (err) {

            console.error(
                "Failed to load submissions:",
                err
            );

            if (
                err.response?.status === 401 ||
                err.response?.status === 403
            ) {

                localStorage.removeItem("token");
                localStorage.removeItem("email");

                navigate("/login");

                return;
            }

            setError(
                err.response?.data?.message ||
                "Failed to load submission history."
            );

        } finally {

            setLoading(false);

        }
    }, [navigate]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadSubmissions();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadSubmissions]);


    /* =========================
       STATISTICS
    ========================== */

    const totalSubmissions =
        submissions.length;

    const acceptedSubmissions =
        submissions.filter(
            (submission) =>
                submission.status === "ACCEPTED"
        ).length;

    const wrongAnswers =
        submissions.filter(
            (submission) =>
                submission.status === "WRONG_ANSWER"
        ).length;

    const successRate =
        totalSubmissions > 0
            ? Math.round(
                (acceptedSubmissions /
                    totalSubmissions) *
                100
            )
            : 0;


    /* =========================
       FILTER
    ========================== */

    const filteredSubmissions =
        useMemo(() => {

            if (filter === "ALL") {
                return submissions;
            }

            return submissions.filter(
                (submission) =>
                    submission.status === filter
            );

        }, [submissions, filter]);


    /* =========================
       STATUS CLASS
    ========================== */

    const getStatusClass = (status) => {

        switch (status) {

            case "ACCEPTED":
                return "status accepted";

            case "WRONG_ANSWER":
                return "status wrong";

            case "COMPILATION_ERROR":
                return "status compilation";

            case "RUNTIME_ERROR":
                return "status runtime";

            case "TIME_LIMIT_EXCEEDED":
                return "status time";

            default:
                return "status";
        }
    };


    /* =========================
       DATE FORMAT
    ========================== */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleString();
    };


    return (

        <div className="submissions-page">
            {/* =========================
                STATISTICS
            ========================== */}

            {!loading && !error && (

                <div className="submission-stats">


                    <div className="submission-stat-card">

                        <span className="stat-icon">
                            📊
                        </span>

                        <div>

                            <span className="stat-label">
                                Total
                            </span>

                            <strong>
                                {totalSubmissions}
                            </strong>

                        </div>

                    </div>


                    <div className="submission-stat-card">

                        <span className="stat-icon">
                            ✅
                        </span>

                        <div>

                            <span className="stat-label">
                                Accepted
                            </span>

                            <strong>
                                {acceptedSubmissions}
                            </strong>

                        </div>

                    </div>


                    <div className="submission-stat-card">

                        <span className="stat-icon">
                            ❌
                        </span>

                        <div>

                            <span className="stat-label">
                                Wrong Answer
                            </span>

                            <strong>
                                {wrongAnswers}
                            </strong>

                        </div>

                    </div>


                    <div className="submission-stat-card">

                        <span className="stat-icon">
                            🎯
                        </span>

                        <div>

                            <span className="stat-label">
                                Success Rate
                            </span>

                            <strong>
                                {successRate}%
                            </strong>

                        </div>

                    </div>

                </div>

            )}


            {/* =========================
                FILTER
            ========================== */}

            {!loading && !error &&
                submissions.length > 0 && (

                <div className="submission-filters">

                    <button
                        className={
                            filter === "ALL"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setFilter("ALL")
                        }
                    >
                        All
                    </button>


                    <button
                        className={
                            filter === "ACCEPTED"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setFilter("ACCEPTED")
                        }
                    >
                        Accepted
                    </button>


                    <button
                        className={
                            filter === "WRONG_ANSWER"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setFilter("WRONG_ANSWER")
                        }
                    >
                        Wrong Answer
                    </button>


                    <button
                        className={
                            filter === "COMPILATION_ERROR"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setFilter(
                                "COMPILATION_ERROR"
                            )
                        }
                    >
                        Compilation Error
                    </button>


                    <button
                        className={
                            filter === "RUNTIME_ERROR"
                                ? "filter-button active"
                                : "filter-button"
                        }
                        onClick={() =>
                            setFilter(
                                "RUNTIME_ERROR"
                            )
                        }
                    >
                        Runtime Error
                    </button>

                </div>

            )}


            {/* =========================
                LOADING
            ========================== */}

            {loading && (

                <div className="submission-message">
                    Loading submissions...
                </div>

            )}


            {/* =========================
                ERROR
            ========================== */}

            {!loading && error && (

                <div className="submission-error">
                    {error}
                </div>

            )}


            {/* =========================
                EMPTY
            ========================== */}

            {!loading &&
                !error &&
                submissions.length === 0 && (

                <div className="submission-message">

                    No submissions found.

                </div>

            )}


            {/* =========================
                FILTER EMPTY
            ========================== */}

            {!loading &&
                !error &&
                submissions.length > 0 &&
                filteredSubmissions.length === 0 && (

                <div className="submission-message">

                    No submissions found
                    for this filter.

                </div>

            )}


            {/* =========================
                TABLE
            ========================== */}

            {!loading &&
                !error &&
                filteredSubmissions.length > 0 && (

                <div className="submissions-table-container">

                    <table className="submissions-table">

                        <thead>

                            <tr>

                                <th>
                                    ID
                                </th>

                                <th>
                                    Problem
                                </th>

                                <th>
                                    Language
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Execution Time
                                </th>

                                <th>
                                    Submitted At
                                </th>

                                <th>
                                    Action
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {filteredSubmissions.map(
                                (submission, index) => (

                                <tr
                                    key={
                                        submission.id
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/submissions/${submission.id}`
                                        )
                                    }
                                    style={{
                                        cursor:
                                            "pointer"
                                    }}
                                >

                                    <td>
                                        <strong>
                                            #
                                            {index + 1}
                                        </strong>
                                    </td>


                                    <td>

                                        {
                                            submission
                                                .problem
                                                ?.title ||
                                            "Unknown Problem"
                                        }

                                    </td>


                                    <td>

                                        {
                                            submission
                                                .language ||
                                            "-"
                                        }

                                    </td>


                                    <td>

                                        <span
                                            className={
                                                getStatusClass(
                                                    submission.status
                                                )
                                            }
                                        >
                                            {
                                                submission.status
                                            }
                                        </span>

                                    </td>


                                    <td>

                                        {
                                            submission
                                                .executionTime
                                                ? `${submission.executionTime} ms`
                                                : "-"
                                        }

                                    </td>


                                    <td>

                                        {
                                            formatDate(
                                                submission
                                                    .submittedAt
                                            )
                                        }

                                    </td>


                                    <td>

                                        <button
                                            className="view-submission-button"
                                            onClick={(event) => {

                                                event.stopPropagation();

                                                navigate(
                                                    `/submissions/${submission.id}`
                                                );

                                            }}
                                        >
                                            View
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

export default Submissions;