import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { Button } from "../components/ui/button";
import API from "../services/api";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await API.post(
                "/auth/login",
                {
                    email: formData.email.trim(),
                    password: formData.password,
                }
            );

            if (
                !response.data ||
                !response.data.token
            ) {
                throw new Error(
                    "Token was not returned by backend"
                );
            }

            /*
             * Save JWT token
             */
            localStorage.setItem(
                "token",
                response.data.token
            );

            /*
             * Save email
             */
            localStorage.setItem(
                "email",
                response.data.email ||
                formData.email.trim()
            );

            /*
             * Save user role
             *
             * Backend may return:
             * response.data.role
             *
             * or:
             * response.data.user.role
             */
            const userRole =
                response.data.role ||
                response.data.user?.role ||
                "USER";

            localStorage.setItem(
                "role",
                userRole
            );

            /*
             * Redirect ADMIN users to Admin Panel.
             * Normal users go to Dashboard.
             */
            if (userRole === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/");
            }

        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );

            console.error(
                "STATUS:",
                error.response?.status
            );

            console.error(
                "SERVER RESPONSE:",
                error.response?.data
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Please check your credentials."
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <AuthShell mode="login">
            {error && (
                <div
                    className="mb-5 flex gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"
                    role="alert"
                >
                    <AlertCircle
                        aria-hidden="true"
                        className="mt-0.5 shrink-0"
                        size={17}
                    />
                    <span>{error}</span>
                </div>
            )}

            <form className="grid gap-5" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <label
                        className="text-sm font-semibold text-slate-700"
                        htmlFor="login-email"
                    >
                        Email address
                    </label>
                    <input
                        autoComplete="email"
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        id="login-email"
                        name="email"
                        onChange={handleChange}
                        placeholder="you@example.com"
                        required
                        type="email"
                        value={formData.email}
                    />
                </div>

                <div className="grid gap-2">
                    <label
                        className="text-sm font-semibold text-slate-700"
                        htmlFor="login-password"
                    >
                        Password
                    </label>
                    <input
                        autoComplete="current-password"
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        id="login-password"
                        name="password"
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        type="password"
                        value={formData.password}
                    />
                </div>

                <Button
                    className="mt-1 w-full"
                    disabled={loading}
                    type="submit"
                >
                    {loading ? "Signing in..." : "Sign in"}
                    {!loading && <ArrowRight aria-hidden="true" size={17} />}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                New to CodeNexus?{" "}
                <Link
                    className="font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
                    to="/register"
                >
                    Create an account
                </Link>
            </p>
        </AuthShell>
    );
}

export default Login;