import {
    useCallback,
    useDeferredValue,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const PAGE_SIZE = 20;
const DSA_CATEGORIES = [
    "Arrays",
    "Strings",
    "Linked List",
    "Stack",
    "Queue",
    "Trees",
    "Binary Search Tree",
    "Graph",
    "Dynamic Programming",
    "Greedy",
    "Recursion",
    "Backtracking",
    "Sorting",
    "Searching",
    "Hashing",
    "Mathematics",
];

function Problems() {
    const navigate = useNavigate();

    const [problems, setProblems] = useState([]);
    const [progress, setProgress] = useState({});
    const [bookmarks, setBookmarks] = useState(new Set());
    const [bookmarkUpdating, setBookmarkUpdating] = useState(null);
    const [filter, setFilter] = useState("ALL");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState("newest");
    const [pageIndex, setPageIndex] = useState(0);
    const [pageInfo, setPageInfo] = useState({
        page: 0,
        size: PAGE_SIZE,
        totalElements: 0,
        totalPages: 0,
    });
    const [searchInput, setSearchInput] = useState("");
    const searchTerm = useDeferredValue(searchInput.trim());
    const [difficultyFilter, setDifficultyFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [bookmarkError, setBookmarkError] = useState("");

    const loadProblems = useCallback(async () => {
        try {
            setLoading(true);

            const response = await API.get("/problems", {
                params: {
                    search: searchTerm || undefined,
                    category:
                        categoryFilter === "ALL"
                            ? undefined
                            : categoryFilter,
                    difficulty:
                        difficultyFilter === "ALL"
                            ? undefined
                            : difficultyFilter,
                    progress: filter.toLowerCase(),
                    page: pageIndex,
                    size: PAGE_SIZE,
                    sort: sortBy,
                    direction: sortBy === "newest" ? "desc" : "asc",
                },
            });

            const page = response.data;
            setProblems(
                Array.isArray(page?.content)
                    ? page.content
                    : Array.isArray(page)
                      ? page
                      : []
            );
            if (Array.isArray(page?.content)) {
                setPageInfo({
                    page: page.page ?? pageIndex,
                    size: page.size ?? PAGE_SIZE,
                    totalElements: page.totalElements ?? page.content.length,
                    totalPages: page.totalPages ?? 1,
                });
            } else {
                setPageInfo({
                    page: 0,
                    size: PAGE_SIZE,
                    totalElements: page?.length ?? 0,
                    totalPages: 1,
                });
            }
            setError("");
        } catch (err) {
            console.error("Problems loading error:", err);
            setError(
                err.response?.data?.message ||
                    "Unable to load problems. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }, [
        categoryFilter,
        difficultyFilter,
        filter,
        pageIndex,
        searchTerm,
        sortBy,
    ]);

    const loadProgress = useCallback(async () => {
        try {
            const userResponse = await API.get("/auth/me");
            const currentUser = userResponse.data;

            if (!currentUser) {
                setProgress({});
                return;
            }

            const submissionsResponse =
                await API.get(
                    `/submissions/user/${currentUser.id}`
                );

            const submissions =
                submissionsResponse.data || [];

            const progressMap = {};

            submissions.forEach((submission) => {
                const problemId =
                    submission.problem?.id;

                if (!problemId) {
                    return;
                }

                if (submission.status === "ACCEPTED") {
                    progressMap[problemId] = "SOLVED";
                } else if (
                    progressMap[problemId] !== "SOLVED"
                ) {
                    progressMap[problemId] = "ATTEMPTED";
                }
            });

            setProgress(progressMap);

        } catch (err) {
            console.error(
                "Progress loading error:",
                err
            );

            setProgress({});
        }
    }, []);

    const loadBookmarks = useCallback(async () => {
        try {
            const response = await API.get("/bookmarks");
            setBookmarks(
                new Set((response.data || []).map((problem) => problem.id))
            );
            setBookmarkError("");
        } catch (err) {
            console.error("Bookmarks loading error:", err);
            setBookmarkError(
                err.response?.data?.message ||
                    "Saved problems could not be loaded."
            );
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadProblems();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadProblems]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadProgress();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadProgress]);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            void loadBookmarks();
        }, 0);
        return () => window.clearTimeout(timeoutId);
    }, [loadBookmarks]);

    const toggleBookmark = async (problemId) => {
        setBookmarkUpdating(problemId);
        setBookmarkError("");
        try {
            if (bookmarks.has(problemId)) {
                await API.delete(`/bookmarks/${problemId}`);
                setBookmarks((current) => {
                    const next = new Set(current);
                    next.delete(problemId);
                    return next;
                });
            } else {
                await API.put(`/bookmarks/${problemId}`);
                setBookmarks((current) => new Set(current).add(problemId));
            }
        } catch (err) {
            setBookmarkError(
                err.response?.data?.message ||
                    "Unable to update saved problems. Please try again."
            );
        } finally {
            setBookmarkUpdating(null);
        }
    };

    const solvedCount = problems.filter(
        (problem) =>
            progress[problem.id] === "SOLVED"
    ).length;

    const attemptedCount = problems.filter(
        (problem) =>
            progress[problem.id] === "ATTEMPTED"
    ).length;

    const unsolvedCount =
        problems.length -
        solvedCount -
        attemptedCount;

    const filteredProblems = problems;
    const categoryOptions = useMemo(
        () =>
            [...new Set([
                ...DSA_CATEGORIES,
                ...problems
                    .map((problem) => problem.category || problem.topic)
                    .filter(Boolean),
            ])].sort((first, second) => first.localeCompare(second)),
        [problems]
    );

    const updateFilter = (nextFilter) => {
        setFilter(nextFilter);
        setPageIndex(0);
    };

    const openProblem = (problemId) => {
        console.log("Opening problem:", problemId);

        navigate(`/problems/${problemId}`);
    };

    if (loading) {
        return (
            <div className="page-container">
                <h2>Loading Problems...</h2>
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

                <div className="nav-actions">

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/profile")
                        }
                    >
                        Profile
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            localStorage.removeItem("token");
                            localStorage.removeItem("email");
                            navigate("/login");
                        }}
                    >
                        Logout
                    </button>

                </div>

            </nav>

            {/* MAIN */}

            <main className="problems-container">

                <div className="problems-header">

                    <div>
                        <h1>Problems</h1>

                        <p>
                            Practice coding problems
                            and improve your skills.
                        </p>
                    </div>

                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                {bookmarkError && (
                    <div className="error-message" role="alert">
                        {bookmarkError}
                    </div>
                )}

                {/* PROGRESS */}

                <div className="problem-progress">

                    <button
                        type="button"
                        className={`progress-card solved-progress ${
                            filter === "SOLVED"
                                ? "progress-active"
                                : ""
                        }`}
                        onClick={() => updateFilter("SOLVED")}
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
                    </button>

                    <button
                        type="button"
                        className={`progress-card attempted-progress ${
                            filter === "ATTEMPTED"
                                ? "progress-active"
                                : ""
                        }`}
                        onClick={() => updateFilter("ATTEMPTED")}
                    >
                        <div className="progress-icon">
                            !
                        </div>

                        <div>
                            <strong>
                                {attemptedCount}
                            </strong>

                            <span>
                                Attempted
                            </span>
                        </div>
                    </button>

                    <button
                        type="button"
                        className={`progress-card unsolved-progress ${
                            filter === "UNSOLVED"
                                ? "progress-active"
                                : ""
                        }`}
                        onClick={() => updateFilter("UNSOLVED")}
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
                    </button>

                </div>

                <div className="problem-discovery-tools">
                    <label className="problem-search" htmlFor="problem-search">
                        <Search aria-hidden="true" size={18} />
                        <span className="sr-only">Search problems</span>
                        <input
                            autoComplete="off"
                            id="problem-search"
                            onChange={(event) => {
                                setSearchInput(event.target.value);
                                setPageIndex(0);
                            }}
                            placeholder="Search by problem, topic, or keyword"
                            type="search"
                            value={searchInput}
                        />
                        {searchTerm && (
                            <button
                                aria-label="Clear problem search"
                                onClick={() => {
                                    setSearchInput("");
                                    setPageIndex(0);
                                }}
                                type="button"
                            >
                                <X aria-hidden="true" size={16} />
                            </button>
                        )}
                    </label>

                    <label
                        className="problem-difficulty-select"
                        htmlFor="problem-difficulty"
                    >
                        <SlidersHorizontal aria-hidden="true" size={16} />
                        <span>Difficulty</span>
                        <select
                            id="problem-difficulty"
                            onChange={(event) => {
                                setDifficultyFilter(event.target.value);
                                setPageIndex(0);
                            }}
                            value={difficultyFilter}
                        >
                            <option value="ALL">All levels</option>
                            <option value="EASY">Easy</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HARD">Hard</option>
                        </select>
                    </label>

                    <label
                        className="problem-difficulty-select"
                        htmlFor="problem-category"
                    >
                        <span>Category</span>
                        <select
                            id="problem-category"
                            onChange={(event) => {
                                setCategoryFilter(event.target.value);
                                setPageIndex(0);
                            }}
                            value={categoryFilter}
                        >
                            <option value="ALL">All categories</option>
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label
                        className="problem-difficulty-select"
                        htmlFor="problem-sort"
                    >
                        <span>Sort by</span>
                        <select
                            id="problem-sort"
                            onChange={(event) => {
                                setSortBy(event.target.value);
                                setPageIndex(0);
                            }}
                            value={sortBy}
                        >
                            <option value="newest">Newest</option>
                            <option value="difficulty">Difficulty</option>
                            <option value="popular">Popularity</option>
                            <option value="solved_percentage">
                                Solved percentage
                            </option>
                            <option value="title">Title</option>
                        </select>
                    </label>
                </div>

                {/* FILTER BUTTONS */}

                <div className="problem-filters">

                    <button
                        type="button"
                        className={`problem-filter ${
                            filter === "ALL"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => updateFilter("ALL")}
                    >
                        All ({pageInfo.totalElements})
                    </button>

                    <button
                        type="button"
                        className={`problem-filter ${
                            filter === "SOLVED"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => updateFilter("SOLVED")}
                    >
                        Solved ({solvedCount})
                    </button>

                    <button
                        type="button"
                        className={`problem-filter ${
                            filter === "ATTEMPTED"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => updateFilter("ATTEMPTED")}
                    >
                        Attempted ({attemptedCount})
                    </button>

                    <button
                        type="button"
                        className={`problem-filter ${
                            filter === "UNSOLVED"
                                ? "active"
                                : ""
                        }`}
                        onClick={() => updateFilter("UNSOLVED")}
                    >
                        Unsolved ({unsolvedCount})
                    </button>

                </div>

                {/* PROBLEMS */}

                {filteredProblems.length === 0 ? (

                    <div className="empty-state">
                        <h3>No problems found</h3>

                        <p>
                            Try a different keyword or adjust your filters.
                        </p>
                        {(searchTerm ||
                            categoryFilter !== "ALL" ||
                            difficultyFilter !== "ALL" ||
                            filter !== "ALL") && (
                            <button
                                className="problem-filter-reset"
                                onClick={() => {
                                    setSearchInput("");
                                    setDifficultyFilter("ALL");
                                    setCategoryFilter("ALL");
                                    setSortBy("newest");
                                    updateFilter("ALL");
                                    setPageIndex(0);
                                }}
                                type="button"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>

                ) : (

                    <div className="problems-list">

                        {filteredProblems.map(
                            (problem, index) => {

                                const status =
                                    progress[
                                        problem.id
                                    ] ||
                                    "UNSOLVED";
                                const problemNumber =
                                    pageIndex * PAGE_SIZE + index + 1;

                                return (
                                    <article
                                        key={problem.id}
                                        className="problem-card"
                                    >

                                        <div className="problem-card-main">

                                            <span className="problem-number">
                                                #{problemNumber}
                                            </span>

                                            <h3>
                                                <button
                                                    className="problem-title-link"
                                                    onClick={() =>
                                                        openProblem(problem.id)
                                                    }
                                                    type="button"
                                                >
                                                    {problem.title}
                                                </button>
                                            </h3>

                                            <p>
                                                {problem.description}
                                            </p>

                                            <div className="problem-meta">

                                                <span
                                                    className={`difficulty ${String(
                                                        problem.difficulty ||
                                                            ""
                                                    ).toLowerCase()}`}
                                                >
                                                    {
                                                        problem.difficulty
                                                    }
                                                </span>

                                                <span>
                                                    {problem.category ||
                                                        problem.topic}
                                                </span>

                                            </div>

                                            {Array.isArray(problem.tags) &&
                                                problem.tags.length > 0 && (
                                                    <div className="problem-tags">
                                                        {problem.tags.map((tag) => (
                                                            <span key={tag}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                        </div>

                                        <div className="problem-card-right">

                                            <button
                                                type="button"
                                                className="bookmark-button"
                                                aria-pressed={bookmarks.has(problem.id)}
                                                aria-label={
                                                    bookmarks.has(problem.id)
                                                        ? `Remove ${problem.title} from saved problems`
                                                        : `Save ${problem.title}`
                                                }
                                                disabled={bookmarkUpdating === problem.id}
                                                onClick={() => toggleBookmark(problem.id)}
                                            >
                                                {bookmarks.has(problem.id) ? "★ Saved" : "☆ Save"}
                                            </button>

                                            <span
                                                className={`problem-status ${status.toLowerCase()}`}
                                            >
                                                {status}
                                            </span>

                                            <button
                                                type="button"
                                                className="solve-problem-button"
                                                onClick={() =>
                                                    openProblem(problem.id)
                                                }
                                            >
                                                Solve →
                                            </button>

                                        </div>

                                    </article>
                                );
                            }
                        )}

                    </div>

                )}

                <div className="problem-pagination">
                    <span>
                        {pageInfo.totalElements === 0
                            ? "No problems"
                            : `Page ${pageIndex + 1} of ${Math.max(
                                  1,
                                  pageInfo.totalPages
                              )} · ${pageInfo.totalElements} problems`}
                    </span>
                    <div>
                        <button
                            aria-label="Previous page"
                            disabled={pageIndex === 0 || loading}
                            onClick={() =>
                                setPageIndex((currentPage) =>
                                    Math.max(0, currentPage - 1)
                                )
                            }
                            type="button"
                        >
                            <ChevronLeft aria-hidden="true" size={17} />
                            Previous
                        </button>
                        <button
                            aria-label="Next page"
                            disabled={
                                loading ||
                                pageIndex + 1 >= pageInfo.totalPages
                            }
                            onClick={() =>
                                setPageIndex((currentPage) => currentPage + 1)
                            }
                            type="button"
                        >
                            Next
                            <ChevronRight aria-hidden="true" size={17} />
                        </button>
                    </div>
                </div>

            </main>

        </div>
    );
}

export default Problems;