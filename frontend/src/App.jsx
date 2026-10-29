import { lazy, Suspense } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useParams
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import UserLayout from "./components/UserLayout";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Problems = lazy(() => import("./pages/Problems"));
const ProblemDetails = lazy(() => import("./pages/ProblemDetails"));
const Submissions = lazy(() => import("./pages/Submissions"));
const SubmissionDetails = lazy(() => import("./pages/SubmissionDetails"));
const Profile = lazy(() => import("./pages/Profile"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Quizzes = lazy(() => import("./pages/Quizzes"));
const InterviewPrep = lazy(() => import("./pages/InterviewPrep"));
const AIInterview = lazy(() => import("./pages/AIInterview"));
const Notifications = lazy(() => import("./pages/Notifications"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminSubmissionDetails = lazy(
    () => import("./pages/AdminSubmissionDetails")
);


function UserRoute({ children }) {
    return (
        <ProtectedRoute>
            <UserLayout>{children}</UserLayout>
        </ProtectedRoute>
    );
}

function ProblemDetailsRoute() {
    const { id } = useParams();
    return <ProblemDetails key={id} />;
}


function AdminRoute({ children }) {

    const role = localStorage.getItem("role");

    if (role !== "ADMIN") {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    return children;
}


function App() {

    return (
        <BrowserRouter>
            <Suspense
                fallback={
                    <main
                        aria-live="polite"
                        className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-500"
                    >
                        Loading CodeNexus...
                    </main>
                }
            >
                <Routes>

                {/* =========================
                    AUTH ROUTES
                ========================= */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* =========================
                    USER DASHBOARD
                ========================= */}

                <Route
                    path="/"
                    element={
                        <UserRoute>
                            <Dashboard />
                        </UserRoute>
                    }
                />


                {/* =========================
                    PROBLEMS
                ========================= */}

                <Route
                    path="/problems"
                    element={
                        <UserRoute>
                            <Problems />
                        </UserRoute>
                    }
                />

                <Route
                    path="/problems/:id"
                    element={
                        <UserRoute>
                            <ProblemDetailsRoute />
                        </UserRoute>
                    }
                />


                {/* =========================
                    USER SUBMISSIONS
                ========================= */}

                <Route
                    path="/submissions"
                    element={
                        <UserRoute>
                            <Submissions />
                        </UserRoute>
                    }
                />

                <Route
                    path="/submissions/:id"
                    element={
                        <UserRoute>
                            <SubmissionDetails />
                        </UserRoute>
                    }
                />


                {/* =========================
                    PROFILE
                ========================= */}

                <Route
                    path="/profile"
                    element={
                        <UserRoute>
                            <Profile />
                        </UserRoute>
                    }
                />


                {/* =========================
                    LEADERBOARD
                ========================= */}

                <Route
                    path="/leaderboard"
                    element={
                        <UserRoute>
                            <Leaderboard />
                        </UserRoute>
                    }
                />

                <Route
                    path="/quizzes"
                    element={
                        <UserRoute>
                            <Quizzes />
                        </UserRoute>
                    }
                />

                <Route
                    path="/interview-prep"
                    element={
                        <UserRoute>
                            <InterviewPrep />
                        </UserRoute>
                    }
                />

                <Route
                    path="/ai-interview"
                    element={
                        <UserRoute>
                            <AIInterview />
                        </UserRoute>
                    }
                />

                <Route
                    path="/notifications"
                    element={
                        <UserRoute>
                            <Notifications />
                        </UserRoute>
                    }
                />

                {/* =========================
                    ADMIN DASHBOARD
                ========================= */}

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    ADMIN SUBMISSION DETAILS
                ========================= */}

                <Route
                    path="/admin/submissions/:id"
                    element={
                        <ProtectedRoute>
                            <AdminRoute>
                                <AdminSubmissionDetails />
                            </AdminRoute>
                        </ProtectedRoute>
                    }
                />


                {/* =========================
                    FALLBACK
                ========================= */}

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/"
                            replace
                        />
                    }
                />

                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}

export default App;