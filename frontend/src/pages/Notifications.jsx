import { useCallback, useEffect, useState } from "react";
import API from "../services/api";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadNotifications = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const response = await API.get("/notifications");
            setNotifications(response.data || []);
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Unable to load notifications."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeoutId = window.setTimeout(
            () => void loadNotifications(),
            0
        );
        return () => window.clearTimeout(timeoutId);
    }, [loadNotifications]);

    const markRead = async (id) => {
        try {
            await API.patch(`/notifications/${id}/read`);
            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (requestError) {
            setError(
                requestError.response?.data?.message ||
                    "Unable to update this notification."
            );
        }
    };

    return (
        <main className="learning-page">
            <header className="learning-header">
                <div>
                    <span className="dashboard-label">ACCOUNT UPDATES</span>
                    <h1>Notifications</h1>
                    <p>Submission outcomes and important learning activity.</p>
                </div>
                <button
                    className="learning-secondary-button"
                    onClick={() => void loadNotifications()}
                    type="button"
                >
                    Refresh
                </button>
            </header>
            {error && <p className="learning-error" role="alert">{error}</p>}
            <section className="learning-panel notification-list" aria-live="polite">
                {loading ? (
                    <p>Loading notifications…</p>
                ) : notifications.length === 0 ? (
                    <p>You’re all caught up. New accepted submissions will appear here.</p>
                ) : notifications.map((notification) => (
                    <article
                        className={notification.read ? "" : "unread"}
                        key={notification.id}
                    >
                        <div>
                            <h2>{notification.title}</h2>
                            <p>{notification.message}</p>
                            <time dateTime={notification.createdAt}>
                                {new Date(notification.createdAt).toLocaleString()}
                            </time>
                        </div>
                        {!notification.read && (
                            <button
                                className="learning-secondary-button"
                                onClick={() => void markRead(notification.id)}
                                type="button"
                            >
                                Mark read
                            </button>
                        )}
                    </article>
                ))}
            </section>
        </main>
    );
}

export default Notifications;
