import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Profile.css";

function Profile() {

    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingName, setEditingName] = useState(false);
    const [nameDraft, setNameDraft] = useState("");
    const [savingName, setSavingName] = useState(false);
    const [nameMessage, setNameMessage] = useState("");


    const loadProfile = useCallback(async () => {

        try {

            setLoading(true);
            setError("");

            /* Get current user */

            const userResponse =
                await api.get("/auth/me");

            const currentUser = userResponse.data;


            if (!currentUser) {

                setError(
                    "User not found."
                );

                return;
            }


            setUser(currentUser);
            setNameDraft(currentUser.name || "");


            /* Get submissions */

            const submissionsResponse =
                await api.get(
                    `/submissions/user/${currentUser.id}`
                );

            setSubmissions(
                submissionsResponse.data || []
            );

        } catch (err) {

            console.error(
                "Failed to load profile:",
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
                "Failed to load profile."
            );

        } finally {

            setLoading(false);

        }
    }, [navigate]);

    const saveName = async (event) => {
        event.preventDefault();
        setSavingName(true);
        setNameMessage("");

        try {
            const response = await api.put("/auth/me", {
                name: nameDraft,
            });
            setUser(response.data);
            setNameDraft(response.data.name);
            setEditingName(false);
            setNameMessage("Name updated.");
            localStorage.setItem("name", response.data.name);
            window.dispatchEvent(new Event("profile-updated"));
        } catch (err) {
            setNameMessage(
                err.response?.data?.message ||
                "Failed to update name."
            );
        } finally {
            setSavingName(false);
        }
    };

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadProfile();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadProfile]);


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


    const wrongSubmissions =
        submissions.filter(
            (submission) =>
                submission.status === "WRONG_ANSWER"
        ).length;


    const solvedProblems =
        new Set(
            submissions
                .filter(
                    (submission) =>
                        submission.status ===
                        "ACCEPTED"
                )
                .map(
                    (submission) =>
                        submission.problem?.id
                )
                .filter(Boolean)
        ).size;


    const acceptanceRate =
        totalSubmissions > 0
            ? Math.round(
                (acceptedSubmissions /
                    totalSubmissions) *
                100
            )
            : 0;


    /* =========================
       DATE
    ========================== */

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(
            date
        ).toLocaleString();

    };


    /* =========================
       STATUS
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
       LOADING
    ========================== */

    if (loading) {

        return (

            <div className="profile-page">

                <div className="submission-message">

                    Loading profile...

                </div>

            </div>

        );

    }


    /* =========================
       ERROR
    ========================== */

    if (error) {

        return (

            <div className="profile-page">

                <div className="submission-error">

                    {error}

                </div>

                <button
                    className="back-button"
                    onClick={() =>
                        navigate("/")
                    }
                >
                    Back to Dashboard
                </button>

            </div>

        );

    }


    return (

        <div className="profile-page">


            {/* =========================
                HEADER
            ========================== */}

            <div className="profile-user-card">

                <div className="profile-avatar">

                    {(
                        user?.name ||
                        user?.email ||
                        "U"
                    )
                        .charAt(0)
                        .toUpperCase()}

                </div>


                <div className="profile-user-info">

                    <span className="profile-card-eyebrow">
                        YOUR CODENEXUS ACCOUNT
                    </span>

                    {editingName ? (
                        <form
                            className="profile-name-form"
                            onSubmit={saveName}
                        >
                            <label htmlFor="profile-name">
                                Display name
                            </label>
                            <input
                                id="profile-name"
                                value={nameDraft}
                                maxLength={100}
                                onChange={(event) =>
                                    setNameDraft(event.target.value)
                                }
                                autoFocus
                            />
                            <div>
                                <button
                                    type="submit"
                                    disabled={savingName}
                                >
                                    {savingName ? "Saving..." : "Save"}
                                </button>
                                <button
                                    type="button"
                                    className="profile-name-cancel"
                                    disabled={savingName}
                                    onClick={() => {
                                        setNameDraft(user?.name || "");
                                        setEditingName(false);
                                        setNameMessage("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-name-display">
                            <h2>{user?.name || "CodeNexus User"}</h2>
                            <button
                                type="button"
                                aria-label="Change profile name"
                                onClick={() => {
                                    setNameDraft(user?.name || "");
                                    setEditingName(true);
                                    setNameMessage("");
                                }}
                            >
                                Edit name
                            </button>
                        </div>
                    )}
                    {nameMessage && (
                        <p
                            className={`profile-name-message${nameMessage === "Name updated." ? "" : " error"}`}
                            role="status"
                            aria-live="polite"
                        >
                            {nameMessage}
                        </p>
                    )}

                    <p>
                        {user?.email}
                    </p>

                    <span className="profile-role">
                        {user?.role || "USER"}
                    </span>

                </div>

                <div className="profile-card-note">
                    <span aria-hidden="true">✦</span>
                    <span>Every submission is progress. Keep building your streak.</span>
                </div>

            </div>


            {/* =========================
                STATISTICS
            ========================== */}

            <div className="profile-stats">


                <div className="profile-stat-card">

                    <span>
                        📊
                    </span>

                    <div>

                        <small>
                            Total Submissions
                        </small>

                        <strong>
                            {totalSubmissions}
                        </strong>

                    </div>

                </div>


                <div className="profile-stat-card">

                    <span>
                        ✅
                    </span>

                    <div>

                        <small>
                            Accepted
                        </small>

                        <strong>
                            {acceptedSubmissions}
                        </strong>

                    </div>

                </div>


                <div className="profile-stat-card">

                    <span>
                        ❌
                    </span>

                    <div>

                        <small>
                            Wrong Answer
                        </small>

                        <strong>
                            {wrongSubmissions}
                        </strong>

                    </div>

                </div>


                <div className="profile-stat-card">

                    <span>
                        🧩
                    </span>

                    <div>

                        <small>
                            Problems Solved
                        </small>

                        <strong>
                            {solvedProblems}
                        </strong>

                    </div>

                </div>


                <div className="profile-stat-card">

                    <span>
                        🎯
                    </span>

                    <div>

                        <small>
                            Acceptance Rate
                        </small>

                        <strong>
                            {acceptanceRate}%
                        </strong>

                    </div>

                </div>

            </div>

            <section
                className="profile-section profile-account-details"
                aria-labelledby="profile-account-details-title"
            >
                <div className="profile-section-header">
                    <div>
                        <h2 id="profile-account-details-title">
                            Account Details
                        </h2>
                        <p>Your CodeNexus account information.</p>
                    </div>
                </div>
                <dl className="profile-account-details-list">
                    <div>
                        <dt>Full name</dt>
                        <dd>{user?.name || "Not provided"}</dd>
                    </div>
                    <div>
                        <dt>Email address</dt>
                        <dd>{user?.email || "Unavailable"}</dd>
                    </div>
                    <div>
                        <dt>Account role</dt>
                        <dd>{user?.role || "USER"}</dd>
                    </div>
                    <div>
                        <dt>Account ID</dt>
                        <dd>{user?.id ? `#${user.id}` : "Unavailable"}</dd>
                    </div>
                </dl>
            </section>


            {/* =========================
                RECENT SUBMISSIONS
            ========================== */}

            <div className="profile-section">

                <div className="profile-section-header">

                    <div>

                        <h2>
                            Recent Submissions
                        </h2>

                        <p>
                            Your latest coding activity.
                        </p>

                    </div>


                    <button
                        className="profile-view-all"
                        onClick={() =>
                            navigate("/submissions")
                        }
                    >
                        View All
                    </button>

                </div>


                {submissions.length === 0 ? (

                    <div className="submission-message">

                        No submissions yet.

                    </div>

                ) : (

                    <div className="profile-submissions">

                        {submissions
                            .slice(0, 5)
                            .map(
                                (submission) => (

                                <div
                                    className="profile-submission-row"
                                    key={
                                        submission.id
                                    }
                                    onClick={() =>
                                        navigate(
                                            `/submissions/${submission.id}`
                                        )
                                    }
                                >

                                    <div>

                                        <strong>
                                            #{submission.id}
                                        </strong>

                                        <span>
                                            {
                                                submission
                                                    .problem
                                                    ?.title ||
                                                "Unknown Problem"
                                            }
                                        </span>

                                    </div>


                                    <div>

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

                                    </div>


                                    <div className="profile-submission-date">

                                        {
                                            formatDate(
                                                submission
                                                    .submittedAt
                                            )
                                        }

                                    </div>

                                </div>

                            ))}

                    </div>

                )}

            </div>


            {/* =========================
                QUICK ACTIONS
            ========================== */}

            <div className="profile-actions">

                <button
                    type="button"
                    className="profile-action-primary"
                    onClick={() =>
                        navigate("/problems")
                    }
                >
                    <span aria-hidden="true">◇</span>
                    Solve Problems
                    <span aria-hidden="true">→</span>
                </button>


                <button
                    type="button"
                    className="profile-action-secondary"
                    onClick={() =>
                        navigate("/submissions")
                    }
                >
                    <span aria-hidden="true">⌁</span>
                    View Submissions
                    <span aria-hidden="true">→</span>
                </button>

            </div>

        </div>

    );
}

export default Profile;