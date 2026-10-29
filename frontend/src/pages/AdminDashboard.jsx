import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
    const navigate = useNavigate();

    const [activeSection, setActiveSection] =
        useState("overview");

    const [users, setUsers] = useState([]);
    const [problems, setProblems] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [quizAttempts, setQuizAttempts] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [dailyChallengeForm, setDailyChallengeForm] = useState({
        date: "",
        problemId: "",
    });
    const [quizForm, setQuizForm] = useState({
        category: "JAVA",
        prompt: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctOption: "A",
        explanation: "",
        active: true,
    });
    const [editingQuizId, setEditingQuizId] = useState(null);
    const [announcementForm, setAnnouncementForm] = useState({
        title: "",
        message: "",
    });
    const [learningMessage, setLearningMessage] = useState("");
    const [savingLearning, setSavingLearning] = useState(false);
    const [adminProfile, setAdminProfile] = useState(null);
    const [editingAdminName, setEditingAdminName] = useState(false);
    const [adminNameDraft, setAdminNameDraft] = useState("");
    const [savingAdminName, setSavingAdminName] = useState(false);
    const [adminNameMessage, setAdminNameMessage] = useState("");

    const [search, setSearch] = useState("");
    const [userSearch, setUserSearch] = useState("");

    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [difficultyFilter, setDifficultyFilter] =
        useState("ALL");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showProblemModal, setShowProblemModal] =
        useState(false);

    const [showTestCaseModal, setShowTestCaseModal] =
        useState(false);

    const [editingProblem, setEditingProblem] =
        useState(null);

    const [selectedProblem, setSelectedProblem] =
        useState(null);

    const [saving, setSaving] = useState(false);

    const [updatingUserId, setUpdatingUserId] =
        useState(null);

    const [deletingUserId, setDeletingUserId] =
        useState(null);

    const [problemForm, setProblemForm] = useState({
        title: "",
        description: "",
        difficulty: "EASY",
        topic: "",
        category: "",
        tagsText: "",
        constraints: "",
        inputFormat: "",
        outputFormat: "",
        sampleInput: "",
        sampleOutput: "",
        sampleInput2: "",
        sampleOutput2: "",
    });

    const [testCaseForm, setTestCaseForm] = useState({
        input: "",
        expectedOutput: "",
        hidden: false,
    });

    const loadAdminData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [
                usersResponse,
                problemsResponse,
                submissionsResponse,
                profileResponse,
            ] = await Promise.all([
                API.get("/admin/users"),
                API.get("/problems"),
                API.get("/admin/submissions"),
                API.get("/auth/me"),
            ]);

            setUsers(
                Array.isArray(usersResponse.data)
                    ? usersResponse.data
                    : []
            );

            setProblems(
                Array.isArray(problemsResponse.data)
                    ? problemsResponse.data
                    : []
            );

            setSubmissions(
                Array.isArray(submissionsResponse.data)
                    ? submissionsResponse.data
                    : []
            );
            setAdminProfile(profileResponse.data || null);
            setAdminNameDraft(profileResponse.data?.name || "");
        } catch (err) {
            console.error(
                "ADMIN DATA ERROR:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load admin data."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadAdminData();
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [loadAdminData]);

    const loadLearningAdminData = useCallback(async () => {
        try {
            const [
                questionsResponse,
                attemptsResponse,
                announcementsResponse,
            ] = await Promise.all([
                API.get("/admin/quiz-questions"),
                API.get("/admin/quiz-attempts"),
                API.get("/admin/announcements"),
            ]);
            setQuizQuestions(questionsResponse.data || []);
            setQuizAttempts(attemptsResponse.data || []);
            setAnnouncements(announcementsResponse.data || []);
            setLearningMessage("");

            try {
                const dailyChallengeResponse =
                    await API.get("/problems/daily");
                setDailyChallengeForm({
                    date: dailyChallengeResponse.data?.date || "",
                    problemId: String(
                        dailyChallengeResponse.data?.problem?.id || ""
                    ),
                });
            } catch (err) {
                console.error("ADMIN DAILY CHALLENGE ERROR:", err);
                setDailyChallengeForm({ date: "", problemId: "" });
                setLearningMessage(
                    err.response?.data?.message ||
                        "Daily challenge is unavailable until a problem exists."
                );
            }
        } catch (err) {
            console.error("ADMIN LEARNING DATA ERROR:", err);
            setLearningMessage(
                err.response?.data?.message ||
                    "Unable to load learning content management."
            );
        }
    }, []);

    useEffect(() => {
        if (activeSection !== "learning") {
            return undefined;
        }

        const timeoutId = window.setTimeout(() => {
            void loadLearningAdminData();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [activeSection, loadLearningAdminData]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        navigate("/login");
    };

    const stats = useMemo(() => {
        const totalUsers = users.length;

        const totalProblems = problems.length;

        const totalSubmissions =
            submissions.length;

        const acceptedSubmissions =
            submissions.filter(
                (submission) =>
                    String(
                        submission.status || ""
                    ).toUpperCase() === "ACCEPTED"
            ).length;

        const rejectedSubmissions =
            submissions.filter(
                (submission) =>
                    String(
                        submission.status || ""
                    ).toUpperCase() !== "ACCEPTED"
            ).length;

        return {
            totalUsers,
            totalProblems,
            totalSubmissions,
            acceptedSubmissions,
            rejectedSubmissions,
        };
    }, [
        users,
        problems,
        submissions,
    ]);

    const orderedUsers = useMemo(
        () =>
            [...users].sort((first, second) => {
                const firstIsAdmin =
                    String(first.role || "").toUpperCase() === "ADMIN";
                const secondIsAdmin =
                    String(second.role || "").toUpperCase() === "ADMIN";

                if (firstIsAdmin !== secondIsAdmin) {
                    return firstIsAdmin ? -1 : 1;
                }

                return Number(first.id) - Number(second.id);
            }),
        [users]
    );

    const filteredUsers = useMemo(() => {
        const value =
            userSearch
                .trim()
                .toLowerCase();

        if (!value) {
            return orderedUsers;
        }

        return orderedUsers.filter((user) => {
            return (
                String(user.name || "")
                    .toLowerCase()
                    .includes(value) ||
                String(user.email || "")
                    .toLowerCase()
                    .includes(value) ||
                String(user.role || "")
                    .toLowerCase()
                    .includes(value)
            );
        });
    }, [orderedUsers, userSearch]);

    const filteredProblems = useMemo(() => {
        const value =
            search
                .trim()
                .toLowerCase();

        return problems.filter((problem) => {
            const matchesSearch =
                !value ||
                String(problem.title || "")
                    .toLowerCase()
                    .includes(value) ||
                String(problem.topic || "")
                    .toLowerCase()
                    .includes(value);

            const matchesDifficulty =
                difficultyFilter === "ALL" ||
                String(
                    problem.difficulty || ""
                ).toUpperCase() ===
                    difficultyFilter;

            return (
                matchesSearch &&
                matchesDifficulty
            );
        });
    }, [
        problems,
        search,
        difficultyFilter,
    ]);

    const filteredSubmissions =
        useMemo(() => {
            const value =
                search
                    .trim()
                    .toLowerCase();

            return submissions.filter(
                (submission) => {
                    const matchesSearch =
                        !value ||
                        String(
                            submission.userName || ""
                        )
                            .toLowerCase()
                            .includes(value) ||
                        String(
                            submission.userEmail || ""
                        )
                            .toLowerCase()
                            .includes(value) ||
                        String(
                            submission.problemTitle || ""
                        )
                            .toLowerCase()
                            .includes(value) ||
                        String(
                            submission.language || ""
                        )
                            .toLowerCase()
                            .includes(value);

                    const matchesStatus =
                        statusFilter === "ALL" ||
                        String(
                            submission.status || ""
                        ).toUpperCase() ===
                            statusFilter;

                    return (
                        matchesSearch &&
                        matchesStatus
                    );
                }
            );
        }, [
            submissions,
            search,
            statusFilter,
        ]);

    const resetProblemForm = () => {
        setProblemForm({
            title: "",
            description: "",
            difficulty: "EASY",
            topic: "",
            category: "",
            tagsText: "",
            constraints: "",
            inputFormat: "",
            outputFormat: "",
            sampleInput: "",
            sampleOutput: "",
            sampleInput2: "",
            sampleOutput2: "",
        });
    };

    const openCreateProblem = () => {
        setEditingProblem(null);
        resetProblemForm();
        setShowProblemModal(true);
    };

    const openEditProblem = (problem) => {
        setEditingProblem(problem);

        setProblemForm({
            title: problem.title || "",
            description:
                problem.description || "",
            difficulty:
                problem.difficulty || "EASY",
            topic: problem.topic || "",
            category: problem.category || problem.topic || "",
            tagsText: Array.isArray(problem.tags)
                ? problem.tags.join(", ")
                : "",
            constraints:
                problem.constraints || "",
            inputFormat:
                problem.inputFormat || "",
            outputFormat:
                problem.outputFormat || "",
            sampleInput:
                problem.sampleInput || "",
            sampleOutput:
                problem.sampleOutput || "",
            sampleInput2:
                problem.sampleInput2 || "",
            sampleOutput2:
                problem.sampleOutput2 || "",
        });

        setShowProblemModal(true);
    };

    const closeProblemModal = () => {
        if (saving) {
            return;
        }

        setShowProblemModal(false);
        setEditingProblem(null);
        resetProblemForm();
    };

    const handleProblemChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setProblemForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const saveProblem = async (event) => {
        event.preventDefault();

        setSaving(true);

        try {
            const payload = {
                ...problemForm,
                topic: problemForm.category.trim(),
                category: problemForm.category.trim(),
                tags: problemForm.tagsText
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            };
            delete payload.tagsText;

            if (editingProblem) {
                const response =
                    await API.put(
                        `/problems/${editingProblem.id}`,
                        payload
                    );

                setProblems((previous) =>
                    previous.map((problem) =>
                        problem.id ===
                        editingProblem.id
                            ? response.data
                            : problem
                    )
                );
            } else {
                const response =
                    await API.post(
                        "/problems",
                        payload
                    );

                setProblems((previous) => [
                    ...previous,
                    response.data,
                ]);
            }

            closeProblemModal();
        } catch (err) {
            console.error(
                "SAVE PROBLEM ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to save problem."
            );
        } finally {
            setSaving(false);
        }
    };

    const deleteProblem = async (problem) => {
        const confirmed =
            window.confirm(
                `Delete "${problem.title}"?`
            );

        if (!confirmed) {
            return;
        }

        try {
            await API.delete(
                `/problems/${problem.id}`
            );

            setProblems((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== problem.id
                )
            );
        } catch (err) {
            console.error(
                "DELETE PROBLEM ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to delete problem."
            );
        }
    };

    const openTestCaseModal = (problem) => {
        setSelectedProblem(problem);

        setTestCaseForm({
            input: "",
            expectedOutput: "",
            hidden: false,
        });

        setShowTestCaseModal(true);
    };

    const closeTestCaseModal = () => {
        setShowTestCaseModal(false);
        setSelectedProblem(null);

        setTestCaseForm({
            input: "",
            expectedOutput: "",
            hidden: false,
        });
    };

    const handleTestCaseChange = (
        event
    ) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setTestCaseForm((previous) => ({
            ...previous,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const createTestCase = async (
        event
    ) => {
        event.preventDefault();

        if (!selectedProblem) {
            return;
        }

        setSaving(true);

        try {
            await API.post(
                `/problems/${selectedProblem.id}/test-cases`,
                testCaseForm
            );

            alert(
                "Test case created successfully."
            );

            closeTestCaseModal();
        } catch (err) {
            console.error(
                "CREATE TEST CASE ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to create test case."
            );
        } finally {
            setSaving(false);
        }
    };

    const updateUserRole = async (
        userId,
        role
    ) => {
        setUpdatingUserId(userId);

        try {
            const response =
                await API.put(
                    `/admin/users/${userId}/role`,
                    {
                        role,
                    }
                );

            setUsers((previous) =>
                previous.map((user) =>
                    user.id === userId
                        ? response.data
                        : user
                )
            );
        } catch (err) {
            console.error(
                "UPDATE ROLE ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to update user role."
            );
        } finally {
            setUpdatingUserId(null);
        }
    };

    const deleteUser = async (user) => {
        if (
            String(user.role || "")
                .toUpperCase() === "ADMIN"
        ) {
            alert(
                "Admin users cannot be deleted from this panel."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Delete user "${user.name}"?`
            );

        if (!confirmed) {
            return;
        }

        setDeletingUserId(user.id);

        try {
            await API.delete(
                `/admin/users/${user.id}`
            );

            setUsers((previous) =>
                previous.filter(
                    (item) =>
                        item.id !== user.id
                )
            );
        } catch (err) {
            console.error(
                "DELETE USER ERROR:",
                err
            );

            alert(
                err.response?.data?.message ||
                "Failed to delete user."
            );
        } finally {
            setDeletingUserId(null);
        }
    };

    const openSubmissionDetails = (
        submissionId
    ) => {
        navigate(
            `/admin/submissions/${submissionId}`
        );
    };

    const setSection = (section) => {
        setActiveSection(section);

        if (
            section === "users" ||
            section === "problems" ||
            section === "submissions"
        ) {
            setSearch("");
        }
        setLearningMessage("");
    };

    const editQuizQuestion = (question) => {
        setEditingQuizId(question.id);
        setQuizForm({
            category: question.category || "JAVA",
            prompt: question.prompt || "",
            optionA: question.optionA || "",
            optionB: question.optionB || "",
            optionC: question.optionC || "",
            optionD: question.optionD || "",
            correctOption: question.correctOption || "A",
            explanation: question.explanation || "",
            active: Boolean(question.active),
        });
        setLearningMessage("");
    };

    const resetQuizForm = () => {
        setEditingQuizId(null);
        setQuizForm({
            category: "JAVA",
            prompt: "",
            optionA: "",
            optionB: "",
            optionC: "",
            optionD: "",
            correctOption: "A",
            explanation: "",
            active: true,
        });
    };

    const saveQuizQuestion = async (event) => {
        event.preventDefault();
        setSavingLearning(true);
        setLearningMessage("");
        try {
            const response = editingQuizId
                ? await API.put(
                    `/admin/quiz-questions/${editingQuizId}`,
                    quizForm
                )
                : await API.post("/admin/quiz-questions", quizForm);
            setQuizQuestions((current) => {
                if (editingQuizId) {
                    return current.map((question) =>
                        question.id === editingQuizId
                            ? response.data
                            : question
                    );
                }
                return [...current, response.data].sort(
                    (first, second) =>
                        first.category.localeCompare(second.category) ||
                        first.id - second.id
                );
            });
            resetQuizForm();
            setLearningMessage("Quiz question saved.");
        } catch (err) {
            setLearningMessage(
                err.response?.data?.message ||
                    "Failed to save quiz question."
            );
        } finally {
            setSavingLearning(false);
        }
    };

    const deleteQuizQuestion = async (question) => {
        if (!window.confirm(`Delete quiz question #${question.id}?`)) {
            return;
        }
        try {
            await API.delete(`/admin/quiz-questions/${question.id}`);
            setQuizQuestions((current) =>
                current.filter((item) => item.id !== question.id)
            );
            setLearningMessage("Quiz question deleted.");
        } catch (err) {
            setLearningMessage(
                err.response?.data?.message ||
                    "Failed to delete quiz question."
            );
        }
    };

    const sendAnnouncement = async (event) => {
        event.preventDefault();
        setSavingLearning(true);
        setLearningMessage("");
        try {
            const response = await API.post(
                "/admin/announcements",
                announcementForm
            );
            setAnnouncementForm({ title: "", message: "" });
            setLearningMessage(
                `${response.data.recipients} users received the announcement.`
            );
            await loadLearningAdminData();
        } catch (err) {
            setLearningMessage(
                err.response?.data?.message ||
                    "Failed to send announcement."
            );
        } finally {
            setSavingLearning(false);
        }
    };

    const deleteAnnouncement = async (notification) => {
        if (!window.confirm(`Delete announcement "${notification.title}"?`)) {
            return;
        }
        try {
            await API.delete(`/admin/announcements/${notification.id}`);
            setAnnouncements((current) =>
                current.filter((item) => item.id !== notification.id)
            );
            setLearningMessage("Announcement deleted.");
        } catch (err) {
            setLearningMessage(
                err.response?.data?.message ||
                    "Failed to delete announcement."
            );
        }
    };

    const saveDailyChallenge = async (event) => {
        event.preventDefault();
        setSavingLearning(true);
        setLearningMessage("");
        try {
            const response = await API.put("/admin/daily-challenge", {
                date: dailyChallengeForm.date,
                problemId: Number(dailyChallengeForm.problemId),
            });
            setDailyChallengeForm({
                date: response.data.date,
                problemId: String(response.data.problem.id),
            });
            setLearningMessage(
                `Daily challenge set to "${response.data.problem.title}" for ${response.data.date}.`
            );
        } catch (err) {
            setLearningMessage(
                err.response?.data?.message ||
                    "Failed to set the daily challenge."
            );
        } finally {
            setSavingLearning(false);
        }
    };

    const saveAdminName = async (event) => {
        event.preventDefault();
        setSavingAdminName(true);
        setAdminNameMessage("");

        try {
            const response = await API.put("/auth/me", {
                name: adminNameDraft,
            });
            setAdminProfile(response.data);
            setAdminNameDraft(response.data.name);
            setEditingAdminName(false);
            setAdminNameMessage("Name updated.");
        } catch (err) {
            console.error("UPDATE ADMIN PROFILE ERROR:", err);
            setAdminNameMessage(
                err.response?.data?.message ||
                "Failed to update name."
            );
        } finally {
            setSavingAdminName(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-page">
                <style>{adminStyles}</style>

                <div className="admin-loading">
                    <div className="loading-spinner"></div>
                    <h2>Loading Admin Panel</h2>
                    <p>
                        Fetching users, problems
                        and submissions...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page">
                <style>{adminStyles}</style>

                <div className="admin-error">
                    <div className="error-icon">
                        !
                    </div>

                    <h2>
                        Unable to Load
                        Admin Panel
                    </h2>

                    <p>{error}</p>

                    <div className="error-actions">
                        <button
                            className="primary-btn"
                            onClick={
                                loadAdminData
                            }
                        >
                            Try Again
                        </button>

                        <button
                            className="secondary-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <style>{adminStyles}</style>

            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="brand-mark">
                        CN
                    </div>

                    <div>
                        <div className="brand-title">
                            CodeNexus
                        </div>

                        <div className="brand-subtitle">
                            ADMIN CONSOLE
                        </div>
                    </div>
                </div>

                <nav className="admin-nav">
                    <button
                        className={
                            activeSection ===
                            "overview"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setSection(
                                "overview"
                            )
                        }
                    >
                        <span>▦</span>
                        Overview
                    </button>

                    <button
                        className={
                            activeSection ===
                            "users"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setSection("users")
                        }
                    >
                        <span>♙</span>
                        Users
                        <b>
                            {users.length}
                        </b>
                    </button>

                    <button
                        className={
                            activeSection ===
                            "problems"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setSection(
                                "problems"
                            )
                        }
                    >
                        <span>◇</span>
                        Problems
                        <b>
                            {problems.length}
                        </b>
                    </button>

                    <button
                        className={
                            activeSection ===
                            "submissions"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setSection(
                                "submissions"
                            )
                        }
                    >
                        <span>⌁</span>
                        Submissions
                        <b>
                            {submissions.length}
                        </b>
                    </button>

                    <button
                        className={
                            activeSection === "learning"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() => setSection("learning")}
                    >
                        <span>✎</span>
                        Learning & Notices
                    </button>

                    <button
                        className={
                            activeSection === "profile"
                                ? "nav-item active"
                                : "nav-item"
                        }
                        onClick={() =>
                            setSection("profile")
                        }
                    >
                        <span>♙</span>
                        Profile
                    </button>
                </nav>

                <div className="sidebar-bottom">
                    <button
                        className="logout-btn"
                        onClick={logout}
                    >
                        <span>↪</span>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div>
                        <div className="header-eyebrow">
                            ADMINISTRATION
                        </div>

                        <h1>
                            {activeSection ===
                                "overview" &&
                                "Dashboard Overview"}

                            {activeSection ===
                                "users" &&
                                "User Management"}

                            {activeSection ===
                                "problems" &&
                                "Problem Management"}

                            {activeSection ===
                                "submissions" &&
                                "Submission Management"}

                            {activeSection === "learning" &&
                                "Learning Content & Announcements"}

                            {activeSection ===
                                "profile" &&
                                "Admin Profile"}
                        </h1>
                    </div>

                    <div className="header-right">
                        <button
                            type="button"
                            className="admin-profile"
                            aria-label="Open admin profile"
                            title="Open admin profile"
                            onClick={() => setSection("profile")}
                        >
                            <div className="admin-avatar">
                                {String(
                                    adminProfile?.name ||
                                    adminProfile?.email ||
                                    "A"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>

                            <div>
                                <strong>
                                    {adminProfile?.name || "Administrator"}
                                </strong>

                                <span>
                                    {adminProfile?.role || "ADMIN"}
                                </span>
                            </div>
                        </button>
                    </div>
                </header>

                {activeSection ===
                    "overview" && (
                    <section className="content-section">
                        <div className="welcome-card">
                            <div>
                                <span className="welcome-label">
                                    CONTROL CENTER
                                </span>

                                <h2>
                                    Welcome to
                                    CodeNexus
                                    Admin
                                </h2>

                                <p>
                                    Manage your
                                    coding
                                    platform,
                                    users,
                                    problems and
                                    submissions
                                    from one
                                    place.
                                </p>
                            </div>

                            <div className="welcome-symbol">
                                {"</>"}
                            </div>
                        </div>

                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon users-icon">
                                    ♙
                                </div>

                                <div>
                                    <span>
                                        Total Users
                                    </span>

                                    <strong>
                                        {
                                            stats.totalUsers
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon problems-icon">
                                    ◇
                                </div>

                                <div>
                                    <span>
                                        Total
                                        Problems
                                    </span>

                                    <strong>
                                        {
                                            stats.totalProblems
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon submissions-icon">
                                    ⌁
                                </div>

                                <div>
                                    <span>
                                        Total
                                        Submissions
                                    </span>

                                    <strong>
                                        {
                                            stats.totalSubmissions
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon accepted-icon">
                                    ✓
                                </div>

                                <div>
                                    <span>
                                        Accepted
                                    </span>

                                    <strong>
                                        {
                                            stats.acceptedSubmissions
                                        }
                                    </strong>
                                </div>
                            </div>
                        </div>

                        <div className="overview-grid">
                            <div className="panel-card">
                                <div className="panel-header">
                                    <div>
                                        <span className="panel-kicker">
                                            ACTIVITY
                                        </span>

                                        <h3>
                                            Submission
                                            Summary
                                        </h3>
                                    </div>

                                    <button
                                        className="text-btn"
                                        onClick={() =>
                                            setSection(
                                                "submissions"
                                            )
                                        }
                                    >
                                        View all →
                                    </button>
                                </div>

                                <div className="summary-row">
                                    <div className="summary-number">
                                        {
                                            stats.acceptedSubmissions
                                        }
                                    </div>

                                    <div>
                                        <strong>
                                            Accepted
                                            submissions
                                        </strong>

                                        <p>
                                            Successful
                                            solutions
                                            submitted
                                            by users.
                                        </p>
                                    </div>
                                </div>

                                <div className="summary-row">
                                    <div className="summary-number muted">
                                        {
                                            stats.rejectedSubmissions
                                        }
                                    </div>

                                    <div>
                                        <strong>
                                            Other
                                            results
                                        </strong>

                                        <p>
                                            Wrong
                                            answers and
                                            other
                                            submission
                                            statuses.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="panel-card">
                                <div className="panel-header">
                                    <div>
                                        <span className="panel-kicker">
                                            QUICK ACTIONS
                                        </span>

                                        <h3>
                                            Manage
                                            Platform
                                        </h3>
                                    </div>
                                </div>

                                <div className="quick-actions">
                                    <button
                                        onClick={() =>
                                            setSection(
                                                "users"
                                            )
                                        }
                                    >
                                        <span>
                                            ♙
                                        </span>
                                        <div>
                                            <strong>
                                                Manage
                                                Users
                                            </strong>
                                            <small>
                                                Roles
                                                and
                                                accounts
                                            </small>
                                        </div>
                                    </button>

                                    <button
                                        onClick={
                                            openCreateProblem
                                        }
                                    >
                                        <span>
                                            +
                                        </span>
                                        <div>
                                            <strong>
                                                Add
                                                Problem
                                            </strong>
                                            <small>
                                                Create
                                                coding
                                                challenge
                                            </small>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() =>
                                            setSection(
                                                "submissions"
                                            )
                                        }
                                    >
                                        <span>
                                            ⌁
                                        </span>
                                        <div>
                                            <strong>
                                                Review
                                                Submissions
                                            </strong>
                                            <small>
                                                Inspect
                                                code and
                                                results
                                            </small>
                                        </div>
                                    </button>

                                    <button
                                        className="quick-action-delete-user"
                                        onClick={() =>
                                            setSection(
                                                "users"
                                            )
                                        }
                                    >
                                        <span aria-hidden="true">
                                            ×
                                        </span>
                                        <div>
                                            <strong>
                                                Delete
                                                User
                                            </strong>
                                            <small>
                                                Open registered
                                                users
                                            </small>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {activeSection ===
                    "users" && (
                    <section className="content-section">
                        <div className="section-toolbar">
                            <div>
                                <span className="panel-kicker">
                                    ACCOUNTS
                                </span>

                                <h2>
                                    Registered
                                    Users
                                </h2>
                            </div>

                            <div className="toolbar-search">
                                <span>⌕</span>

                                <input
                                    type="text"
                                    placeholder="Search users..."
                                    value={
                                        userSearch
                                    }
                                    onChange={(event) =>
                                        setUserSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </div>
                        </div>

                        <div className="table-card">
                            <div className="table-topline">
                                <span>
                                    {
                                        filteredUsers.length
                                    }{" "}
                                    users
                                </span>
                            </div>

                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                User
                                            </th>
                                            <th>
                                                Email
                                            </th>
                                            <th>
                                                Role
                                            </th>
                                            <th>
                                                ID
                                            </th>
                                            <th>
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredUsers.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan="5"
                                                    className="empty-cell"
                                                >
                                                    No
                                                    users
                                                    found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => {
                                                const isAdmin =
                                                    String(user.role || "")
                                                        .toUpperCase() === "ADMIN";

                                                return (
                                                    <tr
                                                        key={
                                                            user.id
                                                        }
                                                    >
                                                        <td>
                                                            <div className="user-cell">
                                                                <div className="table-avatar">
                                                                    {String(
                                                                        user.name ||
                                                                            "U"
                                                                    )
                                                                        .charAt(
                                                                            0
                                                                        )
                                                                        .toUpperCase()}
                                                                </div>

                                                                <strong>
                                                                    {
                                                                        user.name
                                                                    }
                                                                </strong>
                                                            </div>
                                                        </td>

                                                        <td className="muted-text">
                                                            {
                                                                user.email
                                                            }
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={
                                                                    String(
                                                                        user.role ||
                                                                            ""
                                                                    ).toUpperCase() ===
                                                                    "ADMIN"
                                                                        ? "role-badge admin-role"
                                                                        : "role-badge user-role"
                                                                }
                                                            >
                                                                {
                                                                    user.role
                                                                }
                                                            </span>
                                                        </td>

                                                        <td className="muted-text">
                                                            #
                                                            {orderedUsers.findIndex(
                                                                (item) =>
                                                                    item.id ===
                                                                    user.id
                                                            ) + 1}
                                                        </td>

                                                        <td>
                                                            <div className="action-group">
                                                                <select
                                                                    value={
                                                                        user.role ||
                                                                        "USER"
                                                                    }
                                                                    disabled={
                                                                        updatingUserId ===
                                                                        user.id
                                                                    }
                                                                    onChange={(
                                                                        event
                                                                    ) =>
                                                                        updateUserRole(
                                                                            user.id,
                                                                            event
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                >
                                                                    <option value="USER">
                                                                        USER
                                                                    </option>

                                                                    <option value="ADMIN">
                                                                        ADMIN
                                                                    </option>
                                                                </select>

                                                                <button
                                                                    className="danger-btn"
                                                                    disabled={
                                                                        isAdmin ||
                                                                        deletingUserId ===
                                                                        user.id
                                                                    }
                                                                    title={
                                                                        isAdmin
                                                                            ? "Admin accounts cannot be deleted"
                                                                            : "Delete user"
                                                                    }
                                                                    onClick={() =>
                                                                        deleteUser(
                                                                            user
                                                                        )
                                                                    }
                                                                >
                                                                    {deletingUserId ===
                                                                    user.id
                                                                        ? "..."
                                                                        : isAdmin
                                                                          ? "Protected"
                                                                          : "Delete"}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {activeSection ===
                    "problems" && (
                    <section className="content-section">
                        <div className="section-toolbar">
                            <div>
                                <span className="panel-kicker">
                                    CHALLENGES
                                </span>

                                <h2>
                                    Problem Library
                                </h2>
                            </div>

                            <button
                                className="primary-btn"
                                onClick={
                                    openCreateProblem
                                }
                            >
                                + Add Problem
                            </button>
                        </div>

                        <div className="filter-bar">
                            <div className="toolbar-search">
                                <span>⌕</span>

                                <input
                                    type="text"
                                    placeholder="Search problems or topics..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <select
                                value={
                                    difficultyFilter
                                }
                                onChange={(event) =>
                                    setDifficultyFilter(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="ALL">
                                    All Difficulties
                                </option>

                                <option value="EASY">
                                    Easy
                                </option>

                                <option value="MEDIUM">
                                    Medium
                                </option>

                                <option value="HARD">
                                    Hard
                                </option>
                            </select>
                        </div>

                        <div className="problem-grid">
                            {filteredProblems.length ===
                            0 ? (
                                <div className="empty-panel">
                                    <div>
                                        ◇
                                    </div>

                                    <h3>
                                        No problems
                                        found
                                    </h3>

                                    <p>
                                        Create a new
                                        coding
                                        problem to
                                        get started.
                                    </p>

                                    <button
                                        className="primary-btn"
                                        onClick={
                                            openCreateProblem
                                        }
                                    >
                                        Add Problem
                                    </button>
                                </div>
                            ) : (
                                filteredProblems.map(
                                    (
                                        problem
                                    ) => {
                                        const problemNumber =
                                            problems.findIndex(
                                                (item) =>
                                                    item.id ===
                                                    problem.id
                                            ) + 1;

                                        return (
                                        <div
                                            className="problem-card"
                                            key={
                                                problem.id
                                            }
                                        >
                                            <div className="problem-card-top">
                                                <span className="problem-number">
                                                    #
                                                    {
                                                        problemNumber
                                                    }
                                                </span>

                                                <span
                                                    className={`difficulty-badge ${String(
                                                        problem.difficulty ||
                                                            ""
                                                    ).toLowerCase()}`}
                                                >
                                                    {
                                                        problem.difficulty
                                                    }
                                                </span>
                                            </div>

                                            <h3>
                                                {
                                                    problem.title
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    problem.description
                                                }
                                            </p>

                                            <div className="topic-pill">
                                                {
                                                    problem.topic ||
                                                    "General"
                                                }
                                            </div>

                                            <div className="problem-actions">
                                                <button
                                                    className="secondary-btn"
                                                    onClick={() =>
                                                        openEditProblem(
                                                            problem
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    className="secondary-btn"
                                                    onClick={() =>
                                                        openTestCaseModal(
                                                            problem
                                                        )
                                                    }
                                                >
                                                    + Test Case
                                                </button>

                                                <button
                                                    className="danger-outline-btn"
                                                    onClick={() =>
                                                        deleteProblem(
                                                            problem
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                        );
                                    }
                                )
                            )}
                        </div>
                    </section>
                )}

                {activeSection === "learning" && (
                    <section className="content-section admin-learning-section">
                        {learningMessage && (
                            <p className="admin-learning-message" role="status">
                                {learningMessage}
                            </p>
                        )}

                        <div className="section-toolbar">
                            <div>
                                <span className="panel-kicker">
                                    USER-FACING CONTENT
                                </span>
                                <h2>Quiz Question Management</h2>
                                <p>
                                    Create, edit, activate, and remove quiz content used by learners.
                                </p>
                            </div>
                            <button
                                className="secondary-btn"
                                onClick={() => void loadLearningAdminData()}
                                type="button"
                            >
                                Refresh data
                            </button>
                        </div>

                        <form
                            className="admin-learning-form"
                            onSubmit={saveDailyChallenge}
                        >
                            <h3>Set daily challenge</h3>
                            <div className="admin-learning-fields">
                                <label>
                                    Challenge date (UTC)
                                    <input
                                        onChange={(event) =>
                                            setDailyChallengeForm((current) => ({
                                                ...current,
                                                date: event.target.value,
                                            }))
                                        }
                                        required
                                        type="date"
                                        value={dailyChallengeForm.date}
                                    />
                                </label>
                                <label>
                                    Problem for this date
                                    <select
                                        onChange={(event) =>
                                            setDailyChallengeForm((current) => ({
                                                ...current,
                                                problemId: event.target.value,
                                            }))
                                        }
                                        required
                                        value={dailyChallengeForm.problemId}
                                    >
                                        <option value="">Select a problem</option>
                                        {problems.map((problem) => (
                                            <option key={problem.id} value={problem.id}>
                                                {problem.title} ({problem.difficulty})
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                            <button
                                className="primary-btn"
                                disabled={savingLearning || problems.length === 0}
                                type="submit"
                            >
                                Set challenge
                            </button>
                            <p>
                                Challenge assignments can be scheduled for today or a future UTC date.
                            </p>
                        </form>

                        <form className="admin-learning-form" onSubmit={saveQuizQuestion}>
                            <h3>{editingQuizId ? `Edit question #${editingQuizId}` : "Add a quiz question"}</h3>
                            <div className="admin-learning-fields">
                                <label>
                                    Subject
                                    <select
                                        onChange={(event) =>
                                            setQuizForm((current) => ({
                                                ...current,
                                                category: event.target.value,
                                            }))
                                        }
                                        value={quizForm.category}
                                    >
                                        {["JAVA", "DSA", "DBMS", "OS", "CN"].map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="admin-learning-wide">
                                    Question
                                    <textarea
                                        maxLength={5000}
                                        onChange={(event) =>
                                            setQuizForm((current) => ({
                                                ...current,
                                                prompt: event.target.value,
                                            }))
                                        }
                                        required
                                        value={quizForm.prompt}
                                    />
                                </label>
                                {["A", "B", "C", "D"].map((option) => (
                                    <label key={option}>
                                        Option {option}
                                        <textarea
                                            maxLength={2000}
                                            onChange={(event) =>
                                                setQuizForm((current) => ({
                                                    ...current,
                                                    [`option${option}`]: event.target.value,
                                                }))
                                            }
                                            required
                                            value={quizForm[`option${option}`]}
                                        />
                                    </label>
                                ))}
                                <label>
                                    Correct option
                                    <select
                                        onChange={(event) =>
                                            setQuizForm((current) => ({
                                                ...current,
                                                correctOption: event.target.value,
                                            }))
                                        }
                                        value={quizForm.correctOption}
                                    >
                                        {["A", "B", "C", "D"].map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </label>
                                <label className="admin-learning-wide">
                                    Explanation shown after submission
                                    <textarea
                                        maxLength={5000}
                                        onChange={(event) =>
                                            setQuizForm((current) => ({
                                                ...current,
                                                explanation: event.target.value,
                                            }))
                                        }
                                        required
                                        value={quizForm.explanation}
                                    />
                                </label>
                                <label className="admin-learning-checkbox">
                                    <input
                                        checked={quizForm.active}
                                        onChange={(event) =>
                                            setQuizForm((current) => ({
                                                ...current,
                                                active: event.target.checked,
                                            }))
                                        }
                                        type="checkbox"
                                    />
                                    Active in learner quizzes
                                </label>
                            </div>
                            <div className="admin-learning-actions">
                                <button
                                    className="primary-btn"
                                    disabled={savingLearning}
                                    type="submit"
                                >
                                    {savingLearning
                                        ? "Saving..."
                                        : editingQuizId
                                          ? "Save question"
                                          : "Create question"}
                                </button>
                                {editingQuizId && (
                                    <button
                                        className="secondary-btn"
                                        disabled={savingLearning}
                                        onClick={resetQuizForm}
                                        type="button"
                                    >
                                        Cancel edit
                                    </button>
                                )}
                            </div>
                        </form>

                        <div className="admin-learning-question-list">
                            {quizQuestions.map((question) => (
                                <article className="admin-learning-question" key={question.id}>
                                    <div>
                                        <span className="panel-kicker">
                                            {question.category} · #{question.id}
                                            {question.active ? " · ACTIVE" : " · INACTIVE"}
                                        </span>
                                        <h3>{question.prompt}</h3>
                                        <p>
                                            Answer: {question.correctOption} · {question.explanation}
                                        </p>
                                    </div>
                                    <div className="admin-learning-actions">
                                        <button
                                            className="secondary-btn"
                                            onClick={() => editQuizQuestion(question)}
                                            type="button"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="danger-outline-btn"
                                            onClick={() => void deleteQuizQuestion(question)}
                                            type="button"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </article>
                            ))}
                            {quizQuestions.length === 0 && (
                                <div className="empty-panel">
                                    <h3>No quiz questions yet</h3>
                                    <p>Add questions above to enable subject quizzes.</p>
                                </div>
                            )}
                        </div>

                        <div className="section-toolbar admin-learning-subheading">
                            <div>
                                <span className="panel-kicker">PLATFORM COMMUNICATIONS</span>
                                <h2>Announcements & Notifications</h2>
                                <p>Send a platform-wide message to registered accounts.</p>
                            </div>
                        </div>
                        <form className="admin-learning-form" onSubmit={sendAnnouncement}>
                            <label>
                                Announcement title
                                <input
                                    maxLength={120}
                                    onChange={(event) =>
                                        setAnnouncementForm((current) => ({
                                            ...current,
                                            title: event.target.value,
                                        }))
                                    }
                                    required
                                    value={announcementForm.title}
                                />
                            </label>
                            <label>
                                Message
                                <textarea
                                    maxLength={4000}
                                    onChange={(event) =>
                                        setAnnouncementForm((current) => ({
                                            ...current,
                                            message: event.target.value,
                                        }))
                                    }
                                    required
                                    value={announcementForm.message}
                                />
                            </label>
                            <button
                                className="primary-btn"
                                disabled={savingLearning}
                                type="submit"
                            >
                                {savingLearning ? "Sending..." : "Send to all users"}
                            </button>
                        </form>

                        <div className="admin-learning-question-list">
                            {announcements.map((announcement) => (
                                <article className="admin-learning-question" key={announcement.id}>
                                    <div>
                                        <span className="panel-kicker">
                                            {new Date(announcement.createdAt).toLocaleString()}
                                        </span>
                                        <h3>{announcement.title}</h3>
                                        <p>{announcement.message}</p>
                                    </div>
                                    <button
                                        className="danger-outline-btn"
                                        onClick={() => void deleteAnnouncement(announcement)}
                                        type="button"
                                    >
                                        Delete
                                    </button>
                                </article>
                            ))}
                        </div>

                        <div className="section-toolbar admin-learning-subheading">
                            <div>
                                <span className="panel-kicker">LEARNER ANALYTICS</span>
                                <h2>Quiz Attempts ({quizAttempts.length})</h2>
                                <p>Review subject scores and activity across the platform.</p>
                            </div>
                        </div>
                        <div className="admin-learning-attempts">
                            <div className="admin-learning-attempt-row heading">
                                <span>Learner</span>
                                <span>Subject</span>
                                <span>Score</span>
                                <span>Submitted</span>
                            </div>
                            {quizAttempts.slice(0, 50).map((attempt) => (
                                <div className="admin-learning-attempt-row" key={attempt.attemptId}>
                                    <span>{attempt.userName} · {attempt.userEmail}</span>
                                    <span>{attempt.category}</span>
                                    <span>
                                        {attempt.correctAnswers}/{attempt.totalQuestions} ({attempt.scorePercent}%)
                                    </span>
                                    <time dateTime={attempt.submittedAt}>
                                        {new Date(attempt.submittedAt).toLocaleString()}
                                    </time>
                                </div>
                            ))}
                            {quizAttempts.length === 0 && (
                                <p className="empty-panel">No quiz attempts submitted yet.</p>
                            )}
                        </div>
                    </section>
                )}

                {activeSection ===
                    "submissions" && (
                    <section className="content-section">
                        <div className="section-toolbar">
                            <div>
                                <span className="panel-kicker">
                                    JUDGE ACTIVITY
                                </span>

                                <h2>
                                    All Submissions
                                </h2>
                            </div>

                            <button
                                className="secondary-btn"
                                onClick={
                                    loadAdminData
                                }
                            >
                                ↻ Refresh
                            </button>
                        </div>

                        <div className="filter-bar">
                            <div className="toolbar-search wide-search">
                                <span>⌕</span>

                                <input
                                    type="text"
                                    placeholder="Search user, email, problem or language..."
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(event) =>
                                    setStatusFilter(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="ALL">
                                    All Statuses
                                </option>

                                <option value="ACCEPTED">
                                    Accepted
                                </option>

                                <option value="WRONG_ANSWER">
                                    Wrong Answer
                                </option>

                                <option value="RUNTIME_ERROR">
                                    Runtime Error
                                </option>

                                <option value="COMPILE_ERROR">
                                    Compile Error
                                </option>

                                <option value="TIME_LIMIT_EXCEEDED">
                                    Time Limit
                                </option>
                            </select>
                        </div>

                        <div className="table-card">
                            <div className="table-topline">
                                <span>
                                    {
                                        filteredSubmissions.length
                                    }{" "}
                                    submissions
                                </span>

                                <span className="table-hint">
                                    Click View to
                                    inspect full
                                    submission
                                </span>
                            </div>

                            <div className="table-wrapper">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                ID
                                            </th>
                                            <th>
                                                User
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
                                                Time
                                            </th>
                                            <th>
                                                Submitted
                                            </th>
                                            <th>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {filteredSubmissions.length ===
                                        0 ? (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="empty-cell"
                                                >
                                                    No
                                                    submissions
                                                    found.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredSubmissions.map(
                                                (
                                                    submission
                                                ) => (
                                                    <tr
                                                        key={
                                                            submission.id
                                                        }
                                                    >
                                                        <td className="submission-id">
                                                            #
                                                            {
                                                                submission.id
                                                            }
                                                        </td>

                                                        <td>
                                                            <div className="submission-user">
                                                                <strong>
                                                                    {
                                                                        submission.userName
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    {
                                                                        submission.userEmail
                                                                    }
                                                                </small>
                                                            </div>
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    submission.problemTitle
                                                                }
                                                            </strong>

                                                            <small className="table-subtext">
                                                                Problem #
                                                                {
                                                                    submission.problemId
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            <span className="language-badge">
                                                                {
                                                                    submission.language
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`status-badge ${String(
                                                                    submission.status ||
                                                                        ""
                                                                ).toLowerCase()}`}
                                                            >
                                                                {String(
                                                                    submission.status ||
                                                                        "UNKNOWN"
                                                                ).replace(
                                                                    /_/g,
                                                                    " "
                                                                )}
                                                            </span>
                                                        </td>

                                                        <td className="muted-text">
                                                            {submission.executionTime !=
                                                            null
                                                                ? `${submission.executionTime} ms`
                                                                : "—"}
                                                        </td>

                                                        <td className="muted-text">
                                                            {submission.submittedAt
                                                                ? new Date(
                                                                      submission.submittedAt
                                                                  ).toLocaleString()
                                                                : "—"}
                                                        </td>

                                                        <td>
                                                            <button
                                                                className="view-btn"
                                                                onClick={() =>
                                                                    openSubmissionDetails(
                                                                        submission.id
                                                                    )
                                                                }
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {activeSection === "profile" && (
                    <section className="content-section admin-profile-section">
                        <div className="admin-profile-card">
                            <div className="admin-profile-avatar">
                                {String(
                                    adminProfile?.name ||
                                    adminProfile?.email ||
                                    "A"
                                )
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div className="admin-profile-identity">
                                <span className="panel-kicker">
                                    ADMINISTRATOR ACCOUNT
                                </span>
                                {editingAdminName ? (
                                    <form
                                        className="admin-profile-name-form"
                                        onSubmit={saveAdminName}
                                    >
                                        <label htmlFor="admin-profile-name">
                                            Display name
                                        </label>
                                        <input
                                            id="admin-profile-name"
                                            value={adminNameDraft}
                                            maxLength={100}
                                            onChange={(event) =>
                                                setAdminNameDraft(event.target.value)
                                            }
                                            autoFocus
                                        />
                                        <div>
                                            <button
                                                type="submit"
                                                disabled={savingAdminName}
                                            >
                                                {savingAdminName
                                                    ? "Saving..."
                                                    : "Save"}
                                            </button>
                                            <button
                                                type="button"
                                                className="admin-profile-name-cancel"
                                                disabled={savingAdminName}
                                                onClick={() => {
                                                    setAdminNameDraft(
                                                        adminProfile?.name || ""
                                                    );
                                                    setEditingAdminName(false);
                                                    setAdminNameMessage("");
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="admin-profile-name-display">
                                        <h2>
                                            {adminProfile?.name ||
                                                "Administrator"}
                                        </h2>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAdminNameDraft(
                                                    adminProfile?.name || ""
                                                );
                                                setEditingAdminName(true);
                                                setAdminNameMessage("");
                                            }}
                                        >
                                            Edit name
                                        </button>
                                    </div>
                                )}
                                {adminNameMessage && (
                                    <p
                                        className={`admin-profile-name-message${adminNameMessage === "Name updated." ? "" : " error"}`}
                                        role="status"
                                        aria-live="polite"
                                    >
                                        {adminNameMessage}
                                    </p>
                                )}
                                <p>
                                    {adminProfile?.email ||
                                        "Admin email unavailable"}
                                </p>
                                <span className="role-badge admin-role">
                                    {adminProfile?.role || "ADMIN"}
                                </span>
                            </div>
                            <div className="admin-profile-trust">
                                <span aria-hidden="true">✓</span>
                                <div>
                                    <strong>Admin access</strong>
                                    <small>
                                        Manage the CodeNexus platform
                                    </small>
                                </div>
                            </div>
                        </div>

                        <div className="admin-profile-details-grid">
                            <article className="admin-profile-detail-card">
                                <span className="panel-kicker">
                                    ACCOUNT DETAILS
                                </span>
                                <dl>
                                    <div>
                                        <dt>Name</dt>
                                        <dd>
                                            {adminProfile?.name ||
                                                "Administrator"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Email</dt>
                                        <dd>
                                            {adminProfile?.email ||
                                                "Unavailable"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Role</dt>
                                        <dd>
                                            {adminProfile?.role ||
                                                "ADMIN"}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Account ID</dt>
                                        <dd>
                                            {adminProfile?.id
                                                ? `#${adminProfile.id}`
                                                : "Unavailable"}
                                        </dd>
                                    </div>
                                </dl>
                            </article>

                            <article className="admin-profile-detail-card">
                                <span className="panel-kicker">
                                    PLATFORM OVERVIEW
                                </span>
                                <div className="admin-profile-metrics">
                                    <div>
                                        <strong>
                                            {stats.totalUsers}
                                        </strong>
                                        <span>Users</span>
                                    </div>
                                    <div>
                                        <strong>
                                            {stats.totalProblems}
                                        </strong>
                                        <span>Problems</span>
                                    </div>
                                    <div>
                                        <strong>
                                            {stats.totalSubmissions}
                                        </strong>
                                        <span>Submissions</span>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>
                )}
            </main>

            {showProblemModal && (
                <div className="modal-backdrop">
                    <div className="modal-card problem-modal">
                        <div className="modal-header">
                            <div>
                                <span className="panel-kicker">
                                    {editingProblem
                                        ? "EDIT CHALLENGE"
                                        : "NEW CHALLENGE"}
                                </span>

                                <h2>
                                    {editingProblem
                                        ? "Edit Problem"
                                        : "Create Problem"}
                                </h2>
                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeProblemModal
                                }
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={
                                saveProblem
                            }
                        >
                            <div className="form-grid">
                                <div className="form-field full">
                                    <label>
                                        Title
                                    </label>

                                    <input
                                        name="title"
                                        value={
                                            problemForm.title
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        required
                                        placeholder="e.g. Two Sum"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Difficulty
                                    </label>

                                    <select
                                        name="difficulty"
                                        value={
                                            problemForm.difficulty
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                    >
                                        <option value="EASY">
                                            EASY
                                        </option>

                                        <option value="MEDIUM">
                                            MEDIUM
                                        </option>

                                        <option value="HARD">
                                            HARD
                                        </option>
                                    </select>
                                </div>

                                <div className="form-field">
                                    <label>
                                        Category
                                    </label>

                                    <input
                                        name="category"
                                        value={
                                            problemForm.category
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        placeholder="e.g. Arrays, Trees, Graph"
                                        required
                                    />
                                </div>

                                <div className="form-field full">
                                    <label>
                                        Tags
                                    </label>

                                    <input
                                        name="tagsText"
                                        value={problemForm.tagsText}
                                        onChange={handleProblemChange}
                                        placeholder="Comma-separated, e.g. HashMap, Two Pointer"
                                    />
                                </div>

                                <div className="form-field full">
                                    <label>
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={
                                            problemForm.description
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        rows="6"
                                        required
                                        placeholder="Describe the problem..."
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Constraints
                                    </label>

                                    <textarea
                                        name="constraints"
                                        value={
                                            problemForm.constraints
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        rows="4"
                                        placeholder="1 ≤ n ≤ 10^5"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Input Format
                                    </label>

                                    <textarea
                                        name="inputFormat"
                                        value={
                                            problemForm.inputFormat
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        rows="4"
                                        placeholder="Describe input..."
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Output Format
                                    </label>

                                    <textarea
                                        name="outputFormat"
                                        value={
                                            problemForm.outputFormat
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        rows="4"
                                        placeholder="Describe output..."
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Sample Input
                                    </label>

                                    <textarea
                                        name="sampleInput"
                                        value={
                                            problemForm.sampleInput
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        rows="4"
                                        placeholder="2 7 11 15 9"
                                    />
                                </div>

                                <div className="form-field full">
                                    <label>
                                        Sample Output
                                    </label>

                                    <textarea
                                        name="sampleOutput"
                                        value={
                                            problemForm.sampleOutput
                                        }
                                        onChange={
                                            handleProblemChange
                                        }
                                        rows="3"
                                        placeholder="[0,1]"
                                    />
                                </div>

                                <div className="form-field">
                                    <label>
                                        Example 2 Input
                                    </label>

                                    <textarea
                                        name="sampleInput2"
                                        value={problemForm.sampleInput2}
                                        onChange={handleProblemChange}
                                        rows="4"
                                    />
                                </div>

                                <div className="form-field full">
                                    <label>
                                        Example 2 Output
                                    </label>

                                    <textarea
                                        name="sampleOutput2"
                                        value={problemForm.sampleOutput2}
                                        onChange={handleProblemChange}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={
                                        closeProblemModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingProblem
                                        ? "Update Problem"
                                        : "Create Problem"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTestCaseModal && (
                <div className="modal-backdrop">
                    <div className="modal-card testcase-modal">
                        <div className="modal-header">
                            <div>
                                <span className="panel-kicker">
                                    TEST DATA
                                </span>

                                <h2>
                                    Add Test Case
                                </h2>

                                <p className="modal-description">
                                    Problem:{" "}
                                    <strong>
                                        {
                                            selectedProblem?.title
                                        }
                                    </strong>
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeTestCaseModal
                                }
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={
                                createTestCase
                            }
                        >
                            <div className="form-field">
                                <label>
                                    Input
                                </label>

                                <textarea
                                    name="input"
                                    value={
                                        testCaseForm.input
                                    }
                                    onChange={
                                        handleTestCaseChange
                                    }
                                    rows="6"
                                    required
                                    placeholder="Enter test input..."
                                />
                            </div>

                            <div className="form-field">
                                <label>
                                    Expected Output
                                </label>

                                <textarea
                                    name="expectedOutput"
                                    value={
                                        testCaseForm.expectedOutput
                                    }
                                    onChange={
                                        handleTestCaseChange
                                    }
                                    rows="5"
                                    required
                                    placeholder="Enter expected output..."
                                />
                            </div>

                            <label className="checkbox-field">
                                <input
                                    type="checkbox"
                                    name="hidden"
                                    checked={
                                        testCaseForm.hidden
                                    }
                                    onChange={
                                        handleTestCaseChange
                                    }
                                />

                                <span>
                                    Hidden test case
                                </span>
                            </label>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={
                                        closeTestCaseModal
                                    }
                                    disabled={saving}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="primary-btn"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Creating..."
                                        : "Create Test Case"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const adminStyles = `
* {
    box-sizing: border-box;
}

.admin-page {
    min-height: 100vh;
    background:
        radial-gradient(
            circle at top right,
            rgba(99, 102, 241, 0.10),
            transparent 30%
        ),
        #f6f7fb;
    color: #111827;
    display: flex;
    font-family:
        Inter,
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
}

.admin-sidebar {
    width: 260px;
    min-height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    background: #111827;
    color: white;
    padding: 26px 18px;
    display: flex;
    flex-direction: column;
    z-index: 20;
}

.admin-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 4px 10px 28px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
}

.brand-mark {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    background: linear-gradient(
        135deg,
        #6366f1,
        #8b5cf6
    );
    box-shadow:
        0 10px 24px rgba(99,102,241,0.30);
}

.brand-title {
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.3px;
}

.brand-subtitle {
    font-size: 9px;
    letter-spacing: 1.7px;
    color: #9ca3af;
    margin-top: 2px;
}

.admin-nav {
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.nav-item {
    width: 100%;
    border: none;
    background: transparent;
    color: #9ca3af;
    padding: 13px 14px;
    border-radius: 11px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 14px;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
}

.nav-item:hover {
    color: white;
    background: rgba(255,255,255,0.06);
}

.nav-item.active {
    color: white;
    background:
        linear-gradient(
            135deg,
            rgba(99,102,241,0.95),
            rgba(124,58,237,0.90)
        );
    box-shadow:
        0 8px 22px rgba(79,70,229,0.25);
}

.nav-item span {
    width: 20px;
    text-align: center;
    font-size: 17px;
}

.nav-item b {
    margin-left: auto;
    font-size: 11px;
    color: #c7d2fe;
    background: rgba(255,255,255,0.10);
    padding: 3px 7px;
    border-radius: 999px;
}

.sidebar-bottom {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.back-user-btn,
.logout-btn {
    border: 1px solid rgba(255,255,255,0.08);
    background: rgba(255,255,255,0.04);
    color: #d1d5db;
    padding: 11px 13px;
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    transition: 0.2s ease;
}

.back-user-btn:hover,
.logout-btn:hover {
    background: rgba(255,255,255,0.09);
    color: white;
}

.logout-btn {
    display: flex;
    gap: 9px;
    align-items: center;
}

.admin-main {
    margin-left: 260px;
    width: calc(100% - 260px);
    min-height: 100vh;
}

.admin-header {
    height: 88px;
    padding: 0 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(18px);
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    z-index: 10;
}

.header-eyebrow,
.panel-kicker,
.welcome-label {
    font-size: 10px;
    letter-spacing: 1.7px;
    font-weight: 800;
    color: #6366f1;
}

.admin-header h1 {
    margin: 4px 0 0;
    font-size: 25px;
    letter-spacing: -0.7px;
}

.header-right {
    display: flex;
    align-items: center;
}

.admin-profile {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border: 0;
    border-radius: 12px;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: left;
    cursor: pointer;
    transition: background-color 160ms ease, transform 160ms ease;
}

.admin-profile:hover {
    background: #f3f4f6;
}

.admin-profile:active {
    transform: scale(0.98);
}

.admin-profile:focus-visible {
    outline: 3px solid #a78bfa;
    outline-offset: 3px;
}

.admin-profile > div:last-child {
    display: flex;
    flex-direction: column;
}

.admin-profile strong {
    font-size: 13px;
}

.admin-profile span {
    color: #6b7280;
    font-size: 11px;
    margin-top: 2px;
}

.admin-avatar,
.table-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    border-radius: 50%;
}

.admin-avatar {
    width: 38px;
    height: 38px;
    background: #ede9fe;
    color: #6d28d9;
}

.content-section {
    padding: 34px 42px 50px;
    max-width: 1600px;
    margin: 0 auto;
}

.welcome-card {
    border-radius: 20px;
    padding: 30px;
    color: white;
    display: flex;
    justify-content: space-between;
    align-items: center;
    overflow: hidden;
    background:
        linear-gradient(
            120deg,
            #111827,
            #312e81 55%,
            #4f46e5
        );
    box-shadow:
        0 18px 45px rgba(31,41,55,0.16);
}

.welcome-card h2 {
    margin: 7px 0 8px;
    font-size: 29px;
    letter-spacing: -1px;
}

.welcome-card p {
    margin: 0;
    color: #c7d2fe;
    max-width: 600px;
    line-height: 1.6;
}

.welcome-symbol {
    font-size: 58px;
    font-weight: 900;
    color: rgba(255,255,255,0.13);
    transform: rotate(-7deg);
    margin-right: 30px;
}

.stats-grid {
    margin-top: 22px;
    display: grid;
    grid-template-columns:
        repeat(4, minmax(0, 1fr));
    gap: 16px;
}

.stat-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    padding: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    box-shadow:
        0 5px 20px rgba(15,23,42,0.04);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 21px;
}

.users-icon {
    background: #eef2ff;
    color: #4f46e5;
}

.problems-icon {
    background: #ecfeff;
    color: #0891b2;
}

.submissions-icon {
    background: #f5f3ff;
    color: #7c3aed;
}

.accepted-icon {
    background: #ecfdf5;
    color: #059669;
}

.stat-card span {
    display: block;
    font-size: 11px;
    color: #6b7280;
    margin-bottom: 4px;
}

.stat-card strong {
    font-size: 25px;
    letter-spacing: -0.5px;
}

.overview-grid {
    margin-top: 22px;
    display: grid;
    grid-template-columns:
        minmax(0, 1.35fr)
        minmax(0, 0.65fr);
    gap: 18px;
}

.panel-card,
.table-card,
.problem-card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 16px;
    box-shadow:
        0 5px 20px rgba(15,23,42,0.04);
}

.panel-card {
    padding: 23px;
}

.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 22px;
}

.panel-header h3 {
    margin: 5px 0 0;
    font-size: 18px;
}

.text-btn {
    border: none;
    background: none;
    color: #4f46e5;
    font-weight: 700;
    cursor: pointer;
}

.summary-row {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 15px 0;
    border-top: 1px solid #f1f5f9;
}

.summary-number {
    min-width: 58px;
    font-size: 25px;
    font-weight: 900;
    color: #059669;
}

.summary-number.muted {
    color: #6b7280;
}

.summary-row strong {
    font-size: 14px;
}

.summary-row p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #6b7280;
}

.quick-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.quick-actions button {
    display: flex;
    gap: 13px;
    align-items: center;
    border: 1px solid #eef2f7;
    background: #f8fafc;
    border-radius: 12px;
    padding: 13px;
    cursor: pointer;
    text-align: left;
}

.quick-actions button:hover {
    border-color: #c7d2fe;
    background: #eef2ff;
}

.quick-actions button.quick-action-delete-user:hover {
    border-color: #fecaca;
    background: #fff1f2;
}

.quick-actions button.quick-action-delete-user > span {
    color: #dc2626;
    background: #fff;
}

.quick-actions button > span {
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #4f46e5;
    font-weight: 900;
}

.quick-actions strong,
.quick-actions small {
    display: block;
}

.quick-actions strong {
    font-size: 13px;
}

.quick-actions small {
    color: #6b7280;
    margin-top: 3px;
}

.section-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 20px;
    margin-bottom: 20px;
}

.section-toolbar h2 {
    margin: 5px 0 0;
    font-size: 24px;
    letter-spacing: -0.6px;
}

.admin-learning-section {
    display: grid;
    gap: 20px;
}

.admin-learning-message {
    margin: 0;
    padding: 12px 14px;
    border: 1px solid #c7d2fe;
    border-radius: 10px;
    background: #eef2ff;
    color: #3730a3;
}

.admin-learning-form {
    display: grid;
    gap: 14px;
    padding: 20px;
    border: 1px solid #e5e7eb;
    border-radius: 14px;
    background: #fff;
}

.admin-learning-form h3 {
    margin: 0;
    font-size: 17px;
}

.admin-learning-fields {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.admin-learning-form label {
    display: grid;
    gap: 6px;
    color: #374151;
    font-size: 12px;
    font-weight: 700;
}

.admin-learning-form input:not([type="checkbox"]),
.admin-learning-form textarea,
.admin-learning-form select {
    width: 100%;
    min-width: 0;
    padding: 10px 11px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    background: #fff;
    color: #111827;
    font: inherit;
}

.admin-learning-form textarea {
    min-height: 70px;
    resize: vertical;
}

.admin-learning-wide {
    grid-column: 1 / -1;
}

.admin-learning-checkbox {
    display: flex !important;
    align-items: center;
    flex-direction: row;
    gap: 8px !important;
}

.admin-learning-checkbox input {
    width: 16px;
    height: 16px;
}

.admin-learning-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.admin-learning-question-list {
    display: grid;
    gap: 10px;
}

.admin-learning-question {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 14px;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
}

.admin-learning-question h3 {
    margin: 7px 0;
    font-size: 15px;
}

.admin-learning-question p {
    margin: 0;
    color: #6b7280;
    font-size: 13px;
}

.admin-learning-subheading {
    margin: 12px 0 0;
}

.admin-learning-form + .admin-learning-question-list {
    margin-top: 2px;
}

.admin-learning-attempts {
    overflow-x: auto;
    padding: 0 14px;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
}

.admin-learning-attempt-row {
    display: grid;
    grid-template-columns: minmax(180px, 1.6fr) minmax(80px, 0.6fr) minmax(130px, 0.8fr) minmax(170px, 1fr);
    gap: 12px;
    align-items: center;
    min-width: 650px;
    padding: 12px 0;
    border-bottom: 1px solid #eef0f4;
    color: #4b5563;
    font-size: 12px;
}

.admin-learning-attempt-row.heading {
    color: #111827;
    font-weight: 800;
}

.primary-btn,
.secondary-btn,
.danger-btn,
.danger-outline-btn,
.view-btn {
    border-radius: 9px;
    padding: 10px 14px;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition: 0.2s ease;
}

.primary-btn {
    border: 1px solid #4f46e5;
    color: white;
    background: #4f46e5;
    box-shadow:
        0 7px 17px rgba(79,70,229,0.18);
}

.primary-btn:hover {
    background: #4338ca;
}

.primary-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.secondary-btn {
    border: 1px solid #dbe1ea;
    background: white;
    color: #374151;
}

.secondary-btn:hover {
    background: #f8fafc;
    border-color: #c7d2fe;
}

.danger-btn,
.danger-outline-btn {
    border: 1px solid #fecaca;
    background: #fff1f2;
    color: #be123c;
}

.danger-btn:hover,
.danger-outline-btn:hover {
    background: #ffe4e6;
}

.view-btn {
    border: 1px solid #c7d2fe;
    background: #eef2ff;
    color: #4338ca;
}

.view-btn:hover {
    background: #e0e7ff;
}

.filter-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
}

.toolbar-search {
    height: 42px;
    width: 330px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    background: white;
    border: 1px solid #dfe3ea;
    border-radius: 10px;
}

.toolbar-search.wide-search {
    width: 480px;
}

.toolbar-search span {
    color: #9ca3af;
    font-size: 18px;
}

.toolbar-search input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    font-size: 13px;
}

.filter-bar select,
.action-group select,
.form-field select {
    height: 42px;
    border: 1px solid #dfe3ea;
    border-radius: 10px;
    padding: 0 12px;
    background: white;
    color: #374151;
    outline: none;
}

.table-card {
    overflow: hidden;
}

.table-topline {
    min-height: 48px;
    padding: 13px 18px;
    border-bottom: 1px solid #eef2f7;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #6b7280;
    font-size: 12px;
}

.table-hint {
    color: #9ca3af;
}

.table-wrapper {
    width: 100%;
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    min-width: 950px;
}

th {
    text-align: left;
    padding: 12px 18px;
    background: #f8fafc;
    color: #6b7280;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

td {
    padding: 14px 18px;
    border-top: 1px solid #f1f5f9;
    font-size: 12px;
    vertical-align: middle;
}

tbody tr:hover {
    background: #fafbff;
}

.user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.table-avatar {
    width: 34px;
    height: 34px;
    background: #eef2ff;
    color: #4f46e5;
    font-size: 12px;
}

.muted-text {
    color: #6b7280;
}

.role-badge,
.status-badge,
.language-badge,
.difficulty-badge,
.topic-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    font-size: 10px;
    font-weight: 800;
}

.role-badge {
    padding: 5px 9px;
}

.admin-role {
    color: #6d28d9;
    background: #f3e8ff;
}

.user-role {
    color: #0369a1;
    background: #e0f2fe;
}

.action-group {
    display: flex;
    align-items: center;
    gap: 7px;
}

.action-group select {
    height: 34px;
    font-size: 11px;
}

.danger-btn {
    padding: 8px 10px;
}

.problem-grid {
    display: grid;
    grid-template-columns:
        repeat(3, minmax(0, 1fr));
    gap: 16px;
}

.problem-card {
    padding: 20px;
}

.problem-card-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.problem-number {
    color: #9ca3af;
    font-size: 11px;
    font-weight: 700;
}

.difficulty-badge {
    padding: 5px 9px;
}

.difficulty-badge.easy {
    color: #047857;
    background: #d1fae5;
}

.difficulty-badge.medium {
    color: #b45309;
    background: #fef3c7;
}

.difficulty-badge.hard {
    color: #be123c;
    background: #ffe4e6;
}

.problem-card h3 {
    margin: 16px 0 7px;
    font-size: 17px;
}

.problem-card p {
    height: 64px;
    overflow: hidden;
    margin: 0;
    color: #6b7280;
    font-size: 12px;
    line-height: 1.55;
}

.topic-pill {
    margin-top: 13px;
    padding: 5px 9px;
    background: #f1f5f9;
    color: #475569;
    width: fit-content;
}

.problem-actions {
    display: flex;
    gap: 7px;
    margin-top: 18px;
    flex-wrap: wrap;
}

.problem-actions button {
    flex: 1;
    min-width: 70px;
}

.submission-id {
    color: #4f46e5;
    font-weight: 800;
}

.submission-user strong,
.submission-user small,
.table-subtext {
    display: block;
}

.submission-user small,
.table-subtext {
    color: #9ca3af;
    margin-top: 3px;
    font-size: 10px;
}

.language-badge {
    padding: 5px 9px;
    background: #f1f5f9;
    color: #475569;
}

.status-badge {
    padding: 5px 9px;
    text-transform: uppercase;
}

.status-badge.accepted {
    background: #d1fae5;
    color: #047857;
}

.status-badge.wrong_answer {
    background: #fee2e2;
    color: #b91c1c;
}

.status-badge.runtime_error {
    background: #ffedd5;
    color: #c2410c;
}

.status-badge.compile_error {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.time_limit_exceeded {
    background: #ede9fe;
    color: #6d28d9;
}

.status-badge.pending,
.status-badge.running {
    background: #e0f2fe;
    color: #0369a1;
}

.empty-cell {
    text-align: center;
    padding: 45px;
    color: #9ca3af;
}

.empty-panel {
    grid-column: 1 / -1;
    background: white;
    border: 1px dashed #d1d5db;
    border-radius: 16px;
    text-align: center;
    padding: 55px 20px;
}

.empty-panel > div {
    font-size: 35px;
    color: #6366f1;
}

.empty-panel h3 {
    margin: 12px 0 6px;
}

.empty-panel p {
    color: #6b7280;
    margin-bottom: 20px;
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(15,23,42,0.62);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 25px;
}

.modal-card {
    width: min(900px, 100%);
    max-height: 92vh;
    overflow-y: auto;
    background: white;
    border-radius: 18px;
    box-shadow:
        0 30px 80px rgba(15,23,42,0.28);
    padding: 25px;
}

.testcase-modal {
    width: min(650px, 100%);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 22px;
}

.modal-header h2 {
    margin: 5px 0 0;
    font-size: 22px;
}

.modal-description {
    color: #6b7280;
    font-size: 12px;
    margin: 6px 0 0;
}

.modal-close {
    width: 34px;
    height: 34px;
    border: none;
    background: #f1f5f9;
    color: #475569;
    border-radius: 9px;
    font-size: 22px;
    cursor: pointer;
}

.form-grid {
    display: grid;
    grid-template-columns:
        repeat(2, minmax(0, 1fr));
    gap: 15px;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 7px;
    margin-bottom: 15px;
}

.form-field.full {
    grid-column: 1 / -1;
}

.form-field label {
    color: #374151;
    font-size: 11px;
    font-weight: 800;
}

.form-field input,
.form-field textarea,
.form-field select {
    width: 100%;
    border: 1px solid #dbe1ea;
    border-radius: 9px;
    padding: 10px 12px;
    outline: none;
    font: inherit;
    font-size: 12px;
    resize: vertical;
    background: #fbfcfe;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
    border-color: #818cf8;
    box-shadow:
        0 0 0 3px rgba(99,102,241,0.10);
}

.checkbox-field {
    display: flex;
    align-items: center;
    gap: 9px;
    font-size: 12px;
    margin: 5px 0 18px;
    color: #374151;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 9px;
    padding-top: 10px;
    border-top: 1px solid #eef2f7;
}

.admin-loading,
.admin-error {
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 25px;
}

.loading-spinner {
    width: 44px;
    height: 44px;
    border: 4px solid #e5e7eb;
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 18px;
}

.admin-loading h2,
.admin-error h2 {
    margin: 0 0 7px;
}

.admin-loading p,
.admin-error p {
    color: #6b7280;
}

.error-icon {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fee2e2;
    color: #b91c1c;
    font-size: 24px;
    font-weight: 900;
    margin-bottom: 15px;
}

.error-actions {
    display: flex;
    gap: 9px;
    margin-top: 12px;
}

.admin-profile-section {
    display: grid;
    gap: 18px;
}

.admin-profile-card {
    position: relative;
    display: flex;
    min-height: 190px;
    align-items: center;
    gap: 22px;
    overflow: hidden;
    padding: 28px;
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 18px;
    color: white;
    background:
        radial-gradient(circle at 88% 18%, rgba(139, 92, 246, 0.24), transparent 30%),
        linear-gradient(120deg, #111827, #202b43 68%, #312e81);
    box-shadow: 0 14px 35px rgba(17, 24, 39, 0.12);
}

.admin-profile-avatar {
    display: flex;
    width: 82px;
    height: 82px;
    flex: 0 0 82px;
    align-items: center;
    justify-content: center;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    box-shadow: 0 9px 25px rgba(0, 0, 0, 0.22);
    font-size: 30px;
    font-weight: 800;
}

.admin-profile-identity {
    min-width: 0;
}

.admin-profile-identity .panel-kicker {
    color: #c7d2fe;
}

.admin-profile-identity h2 {
    margin: 7px 0 5px;
    color: white;
    font-size: clamp(23px, 3vw, 30px);
    letter-spacing: -0.04em;
    overflow-wrap: anywhere;
}

.admin-profile-name-display {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}

.admin-profile-name-display h2 {
    margin: 7px 0 5px;
}

.admin-profile-name-display button,
.admin-profile-name-form button {
    min-height: 32px;
    padding: 0 11px;
    border: 1px solid rgba(199, 210, 254, 0.42);
    border-radius: 8px;
    color: white;
    background: rgba(99, 102, 241, 0.28);
    font: inherit;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
}

.admin-profile-name-display button:hover,
.admin-profile-name-form button:hover:not(:disabled) {
    background: rgba(99, 102, 241, 0.48);
}

.admin-profile-name-form {
    display: grid;
    max-width: 360px;
    gap: 7px;
    margin: 7px 0 9px;
}

.admin-profile-name-form label {
    color: #dbeafe;
    font-size: 11px;
    font-weight: 700;
}

.admin-profile-name-form input {
    width: min(100%, 340px);
    min-height: 38px;
    padding: 0 10px;
    border: 1px solid rgba(199, 210, 254, 0.5);
    border-radius: 8px;
    color: #111827;
    background: white;
    font: inherit;
    font-size: 13px;
}

.admin-profile-name-form input:focus-visible {
    outline: 3px solid rgba(196, 181, 253, 0.75);
    outline-offset: 2px;
}

.admin-profile-name-form > div {
    display: flex;
    gap: 8px;
}

.admin-profile-name-form button:disabled {
    cursor: wait;
    opacity: 0.7;
}

.admin-profile-name-form .admin-profile-name-cancel {
    color: #e5e7eb;
    background: transparent;
}

.admin-profile-identity .admin-profile-name-message {
    margin: 4px 0 0;
    color: #d1fae5;
    font-size: 11px;
}

.admin-profile-identity .admin-profile-name-message.error {
    color: #fecaca;
}

.admin-profile-identity p {
    margin: 0 0 12px;
    color: #cbd5e1;
    font-size: 13px;
    overflow-wrap: anywhere;
}

.admin-profile-trust {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    padding: 12px 15px;
    border: 1px solid rgba(167, 243, 208, 0.2);
    border-radius: 12px;
    background: rgba(16, 185, 129, 0.12);
}

.admin-profile-trust > span {
    display: flex;
    width: 30px;
    height: 30px;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #a7f3d0;
    background: rgba(16, 185, 129, 0.2);
    font-weight: 900;
}

.admin-profile-trust strong,
.admin-profile-trust small {
    display: block;
}

.admin-profile-trust strong {
    color: #ecfdf5;
    font-size: 12px;
}

.admin-profile-trust small {
    margin-top: 4px;
    color: #cbd5e1;
    font-size: 10px;
}

.admin-profile-details-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
    gap: 16px;
}

.admin-profile-detail-card {
    padding: 22px;
    border: 1px solid #e5e6eb;
    border-radius: 16px;
    background: white;
    box-shadow: 0 8px 26px rgba(20, 25, 40, 0.04);
}

.admin-profile-detail-card dl {
    display: grid;
    gap: 0;
    margin: 15px 0 0;
}

.admin-profile-detail-card dl > div {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    padding: 12px 0;
    border-top: 1px solid #f0f1f5;
}

.admin-profile-detail-card dt {
    color: #737785;
    font-size: 12px;
}

.admin-profile-detail-card dd {
    margin: 0;
    color: #252b3a;
    font-size: 12px;
    font-weight: 700;
    text-align: right;
    overflow-wrap: anywhere;
}

.admin-profile-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin-top: 16px;
}

.admin-profile-metrics > div {
    display: grid;
    gap: 6px;
    padding: 14px 10px;
    border: 1px solid #eef0f5;
    border-radius: 11px;
    background: #f8f9fc;
    text-align: center;
}

.admin-profile-metrics strong {
    color: #4f46e5;
    font-size: 22px;
    letter-spacing: -0.04em;
}

.admin-profile-metrics span {
    color: #6b7280;
    font-size: 10px;
    font-weight: 700;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 1150px) {
    .stats-grid {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }

    .problem-grid {
        grid-template-columns:
            repeat(2, minmax(0, 1fr));
    }

    .overview-grid {
        grid-template-columns: 1fr;
    }

    .admin-profile-details-grid {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 850px) {
    .admin-sidebar {
        width: 76px;
        padding: 20px 10px;
    }

    .admin-brand > div:last-child,
    .nav-item:not(.active) b,
    .nav-item b,
    .nav-item {
        font-size: 0;
    }

    .nav-item {
        justify-content: center;
        padding: 13px 8px;
    }

    .nav-item span {
        font-size: 17px;
    }

    .sidebar-bottom button {
        font-size: 0;
        text-align: center;
    }

    .sidebar-bottom button:first-child {
        display: none;
    }

    .logout-btn {
        justify-content: center;
    }

    .admin-main {
        margin-left: 76px;
        width: calc(100% - 76px);
    }

    .admin-header {
        padding: 0 22px;
    }

    .content-section {
        padding: 25px 22px 40px;
    }

    .header-right {
        display: none;
    }

    .toolbar-search,
    .toolbar-search.wide-search {
        width: 100%;
    }

    .filter-bar {
        flex-direction: column;
        align-items: stretch;
    }
}

@media (max-width: 620px) {
    .stats-grid,
    .problem-grid,
    .form-grid {
        grid-template-columns: 1fr;
    }

    .section-toolbar {
        align-items: stretch;
        flex-direction: column;
    }

    .welcome-card {
        padding: 22px;
    }

    .welcome-symbol {
        display: none;
    }

    .admin-header h1 {
        font-size: 20px;
    }

    .content-section {
        padding: 20px 14px 35px;
    }

    .admin-header {
        padding: 0 14px;
    }

    .admin-profile-card {
        align-items: flex-start;
        flex-wrap: wrap;
        gap: 15px;
        padding: 20px;
    }

    .admin-profile-avatar {
        width: 64px;
        height: 64px;
        flex-basis: 64px;
        font-size: 24px;
    }

    .admin-profile-trust {
        width: 100%;
        margin-left: 0;
    }

    .admin-profile-detail-card {
        padding: 17px;
    }
}
`;

export default AdminDashboard;