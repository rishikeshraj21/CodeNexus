import { useState } from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import { Button } from "../components/ui/button";
import API from "../services/api";

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]:
                event.target.value,
        });

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            await API.post(
                "/auth/register",
                formData
            );

            navigate("/login");

        } catch (error) {

            console.error(error);

            setError(
                error.response?.data?.message ||
                "Registration failed."
            );

        } finally {

            setLoading(false);

        }
    };

    return (
        <AuthShell mode="register">
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

            <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <label
                        className="text-sm font-semibold text-slate-700"
                        htmlFor="register-name"
                    >
                        Full name
                    </label>
                    <input
                        autoComplete="name"
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        id="register-name"
                        name="name"
                        onChange={handleChange}
                        placeholder="Your name"
                        required
                        type="text"
                        value={formData.name}
                    />
                </div>

                <div className="grid gap-2">
                    <label
                        className="text-sm font-semibold text-slate-700"
                        htmlFor="register-email"
                    >
                        Email address
                    </label>
                    <input
                        autoComplete="email"
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        id="register-email"
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
                        htmlFor="register-password"
                    >
                        Password
                    </label>
                    <input
                        autoComplete="new-password"
                        className="h-11 rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                        id="register-password"
                        name="password"
                        onChange={handleChange}
                        placeholder="Create a password"
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
                    {loading ? "Creating account..." : "Create account"}
                    {!loading && <ArrowRight aria-hidden="true" size={17} />}
                </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                    className="font-semibold text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
                    to="/login"
                >
                    Sign in
                </Link>
            </p>
        </AuthShell>
    );
}

export default Register;