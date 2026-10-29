import { Code2, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "./ui/card";

function AuthShell({ children, mode }) {
    const isRegister = mode === "register";

    return (
        <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
            <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col">
                <div className="absolute -right-44 -top-36 size-[34rem] rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute -bottom-64 -left-48 size-[36rem] rounded-full bg-cyan-400/10 blur-3xl" />

                <Link
                    className="relative z-10 inline-flex w-fit items-center gap-3 text-white no-underline"
                    to="/login"
                >
                    <span className="grid size-11 place-items-center rounded-xl bg-indigo-500 shadow-lg shadow-indigo-950/40">
                        <Code2 aria-hidden="true" size={22} />
                    </span>
                    <span className="text-lg font-bold tracking-tight">
                        CodeNexus
                    </span>
                </Link>

                <div className="relative z-10 my-auto max-w-xl py-16">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-indigo-200">
                        <Sparkles aria-hidden="true" size={14} />
                        Your next opportunity starts with practice
                    </div>
                    <h1 className="text-5xl font-bold leading-[1.08] tracking-[-0.045em] xl:text-6xl">
                        Build the skills.
                        <br />
                        <span className="bg-gradient-to-r from-indigo-300 to-cyan-200 bg-clip-text text-transparent">
                            Earn the confidence.
                        </span>
                    </h1>
                    <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                        A focused workspace for coding practice, interview
                        preparation, and tracking your progress—one problem at
                        a time.
                    </p>

                    <div className="mt-10 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                            <Code2
                                aria-hidden="true"
                                className="text-cyan-200"
                                size={19}
                            />
                            <h2 className="mt-3 text-sm font-semibold">
                                Practice with purpose
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                Find challenges by topic and difficulty.
                            </p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                            <Trophy
                                aria-hidden="true"
                                className="text-amber-200"
                                size={19}
                            />
                            <h2 className="mt-3 text-sm font-semibold">
                                See your progress
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-slate-400">
                                Keep submissions and achievements in view.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-xs text-slate-400">
                    <ShieldCheck aria-hidden="true" size={15} />
                    A secure, personal coding workspace
                </div>
            </section>

            <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
                <div className="w-full max-w-[440px]">
                    <Link
                        className="mb-10 inline-flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 no-underline lg:hidden"
                        to="/login"
                    >
                        <span className="grid size-9 place-items-center rounded-lg bg-indigo-600 text-white">
                            <Code2 aria-hidden="true" size={19} />
                        </span>
                        CodeNexus
                    </Link>

                    <div className="mb-7">
                        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
                            {isRegister ? "Get started" : "Welcome back"}
                        </p>
                        <h2 className="text-3xl font-bold tracking-[-0.04em] text-slate-950">
                            {isRegister
                                ? "Create your account"
                                : "Sign in to CodeNexus"}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {isRegister
                                ? "Set up your workspace and start building your coding habit."
                                : "Pick up where you left off and keep making progress."}
                        </p>
                    </div>

                    <Card className="border-slate-200/80 shadow-[0_20px_60px_-28px_rgba(15,23,42,0.18)]">
                        <CardContent className="p-6 sm:p-7">
                            {children}
                        </CardContent>
                    </Card>
                </div>
            </section>
        </main>
    );
}

export default AuthShell;
