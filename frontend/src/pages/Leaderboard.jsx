import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Leaderboard() {

    const navigate = useNavigate();

    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    const loadLeaderboard = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            const response =
                await api.get("/leaderboard");

            setLeaderboard(response.data || []);

        } catch (err) {

            console.error(
                "Failed to load leaderboard:",
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
                "Failed to load leaderboard."
            );

        } finally {

            setLoading(false);

        }

    }, [navigate]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadLeaderboard();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadLeaderboard]);


    const getRankClass = (index) => {

        if (index === 0) {
            return "rank gold";
        }

        if (index === 1) {
            return "rank silver";
        }

        if (index === 2) {
            return "rank bronze";
        }

        return "rank";

    };


    const getInitial = (name) => {

        return (
            name ||
            "U"
        )
            .charAt(0)
            .toUpperCase();

    };


    return (

        <div className="leaderboard-page">
            {/* =========================
                INFO
            ========================== */}

            <div className="leaderboard-info">

                <div>
                    🏆
                </div>

                <div>

                    <h2>
                        Top Coders
                    </h2>

                    <p>
                        Rankings are based primarily
                        on unique problems solved.
                    </p>

                </div>

            </div>


            {/* =========================
                LOADING
            ========================== */}

            {loading && (

                <div className="submission-message">
                    Loading leaderboard...
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
                leaderboard.length === 0 && (

                <div className="submission-message">
                    No users found.
                </div>

            )}


            {/* =========================
                LEADERBOARD
            ========================== */}

            {!loading &&
                !error &&
                leaderboard.length > 0 && (

                <div className="leaderboard-container">

                    <table className="leaderboard-table">

                        <thead>

                            <tr>

                                <th>
                                    Rank
                                </th>

                                <th>
                                    User
                                </th>

                                <th>
                                    Problems Solved
                                </th>

                                <th>
                                    Accepted
                                </th>

                                <th>
                                    Submissions
                                </th>

                                <th>
                                    Acceptance Rate
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {leaderboard.map(
                                (user, index) => (

                                <tr
                                    key={user.id}
                                >

                                    <td>

                                        <span
                                            className={
                                                getRankClass(
                                                    index
                                                )
                                            }
                                        >

                                            {index === 0
                                                ? "🥇"
                                                : index === 1
                                                ? "🥈"
                                                : index === 2
                                                ? "🥉"
                                                : `#${index + 1}`}

                                        </span>

                                    </td>


                                    <td>

                                        <div className="leaderboard-user">

                                            <div className="leaderboard-avatar">

                                                {getInitial(
                                                    user.name
                                                )}

                                            </div>


                                            <div>

                                                <strong>
                                                    {user.name}
                                                </strong>

                                            </div>

                                        </div>

                                    </td>


                                    <td>

                                        <strong className="solved-number">
                                            {
                                                user.solvedProblems
                                            }
                                        </strong>

                                    </td>


                                    <td>
                                        {
                                            user.acceptedSubmissions
                                        }
                                    </td>


                                    <td>
                                        {
                                            user.totalSubmissions
                                        }
                                    </td>


                                    <td>

                                        <span className="acceptance-rate">
                                            {
                                                user.acceptanceRate
                                            }%
                                        </span>

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

export default Leaderboard;