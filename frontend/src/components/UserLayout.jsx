import { useEffect, useState } from "react";
import {
    ArrowLeft,
    Bell,
    Bot,
    BookOpenCheck,
    BookOpen,
    Code2,
    History,
    LayoutDashboard,
    LogOut,
    Trophy,
    UserRound,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import "./UserLayout.css";
import "./UserSections.css";

const navigationItems = [
    { label: "Overview", icon: LayoutDashboard, path: "/" },
    { label: "Problems", icon: BookOpenCheck, path: "/problems" },
    { label: "Leaderboard", icon: Trophy, path: "/leaderboard" },
    { label: "Submissions", icon: History, path: "/submissions" },
    { label: "Quizzes", icon: BookOpenCheck, path: "/quizzes" },
    { label: "Interview Prep", icon: BookOpen, path: "/interview-prep" },
    { label: "AI Interview", icon: Bot, path: "/ai-interview" },
    { label: "Notifications", icon: Bell, path: "/notifications" },
    { label: "Profile", icon: UserRound, path: "/profile" },
];

const pageTitles = {
    "/": "Dashboard Overview",
    "/problems": "Problem Library",
    "/leaderboard": "Leaderboard",
    "/submissions": "Submission History",
    "/quizzes": "Technical Quizzes",
    "/interview-prep": "Interview Preparation",
    "/ai-interview": "AI Interview",
    "/notifications": "Notifications",
    "/profile": "My Profile",
};

function UserLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const email = localStorage.getItem("email") || "CodeNexus User";
    const emailDisplayName = email
        .split("@")[0]
        .replace(/[._-]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
    const [displayName, setDisplayName] = useState(
        () => localStorage.getItem("name") || emailDisplayName
    );
    const pageTitle =
        pageTitles[location.pathname] ||
        (location.pathname.startsWith("/problems/")
            ? "Solve a Problem"
            : location.pathname.startsWith("/submissions/")
              ? "Submission Details"
              : "CodeNexus");

    useEffect(() => {
        const updateDisplayName = () => {
            setDisplayName(
                localStorage.getItem("name") || emailDisplayName
            );
        };

        window.addEventListener("profile-updated", updateDisplayName);
        return () =>
            window.removeEventListener("profile-updated", updateDisplayName);
    }, [emailDisplayName]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        navigate("/login");
    };

    const goBack = () => {
        const historyIndex = window.history.state?.idx;
        if (typeof historyIndex === "number" && historyIndex > 0) {
            navigate(-1);
            return;
        }

        navigate("/");
    };

    return (
        <div className="user-console">
            <aside className="user-console-sidebar">
                <div className="user-console-brand">
                    <div className="user-console-brand-mark">
                        <Code2 aria-hidden="true" size={21} />
                    </div>
                    <div>
                        <div className="user-console-brand-title">
                            CodeNexus
                        </div>
                        <div className="user-console-brand-subtitle">
                            CODER WORKSPACE
                        </div>
                    </div>
                </div>

                <div className="user-console-nav-label">WORKSPACE</div>
                <nav className="user-console-nav" aria-label="Main navigation">
                    {navigationItems.map((item) => {
                        const active =
                            item.path === "/"
                                ? location.pathname === "/"
                                : location.pathname === item.path ||
                                  location.pathname.startsWith(`${item.path}/`);

                        return (
                            <button
                                key={item.path}
                                type="button"
                                className={`user-console-nav-item${active ? " active" : ""}`}
                                aria-current={active ? "page" : undefined}
                                onClick={() => navigate(item.path)}
                            >
                                <item.icon aria-hidden="true" size={18} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="user-console-sidebar-bottom">
                    <div className="user-console-account">
                        <div className="user-console-avatar">
                            {email.charAt(0).toUpperCase()}
                        </div>
                        <div className="user-console-account-copy">
                            <strong>{displayName}</strong>
                            <span title={email}>{email}</span>
                        </div>
                    </div>
                    <button
                        type="button"
                        className="user-console-logout"
                        onClick={logout}
                    >
                        <LogOut aria-hidden="true" size={16} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="user-console-main">
                <header className="user-console-header">
                    <div className="user-console-heading">
                        <button
                            type="button"
                            className="user-console-back"
                            onClick={goBack}
                            aria-label="Go to previous page"
                        >
                            <ArrowLeft aria-hidden="true" size={14} />
                            Back
                        </button>
                        <div>
                            <div className="user-console-eyebrow">LEARNING SPACE</div>
                            <h1>{pageTitle}</h1>
                        </div>
                    </div>
                    <div className="user-console-header-actions">
                        <button
                            type="button"
                            className="user-console-header-user"
                            aria-label="Open profile"
                            title="Open profile"
                            onClick={() => navigate("/profile")}
                        >
                            <div className="user-console-avatar">
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <strong>{displayName}</strong>
                                <span>CodeNexus Member</span>
                            </div>
                        </button>
                        <button
                            type="button"
                            className="user-console-mobile-logout"
                            aria-label="Log out"
                            title="Log out"
                            onClick={logout}
                        >
                            <LogOut aria-hidden="true" size={17} />
                        </button>
                    </div>
                </header>
                <div className="user-console-content">{children}</div>
            </div>
        </div>
    );
}

export default UserLayout;
