import { useState } from "react";
import { Bot, BrainCircuit, Clock3, MessageSquareText, Sparkles } from "lucide-react";

const INTERVIEW_TYPES = [
    {
        name: "Technical",
        description: "Data structures, algorithms, and coding decisions",
    },
    {
        name: "Behavioral",
        description: "Communication, teamwork, and past experiences",
    },
    {
        name: "System design",
        description: "Architecture, scale, and engineering trade-offs",
    },
];

const LEVELS = ["Entry level", "Intermediate", "Advanced"];

function AIInterview() {
    const [interviewType, setInterviewType] = useState("Technical");
    const [level, setLevel] = useState("Entry level");

    return (
        <main className="learning-page ai-interview-page">
            <header className="learning-header">
                <div>
                    <span className="dashboard-label">PRACTICE WITH AI</span>
                    <h1>AI Interview</h1>
                    <p>
                        Prepare for your next interview with a practice session
                        tailored to your goals.
                    </p>
                </div>
                <div className="ai-interview-mark" aria-hidden="true">
                    <Bot size={26} />
                </div>
            </header>

            <section className="ai-interview-grid" aria-label="Interview setup">
                <div className="learning-panel ai-interview-setup">
                    <div className="ai-interview-section-title">
                        <div>
                            <span className="ai-interview-step">STEP 1</span>
                            <h2>Choose your interview</h2>
                        </div>
                        <Sparkles aria-hidden="true" size={20} />
                    </div>

                    <div className="ai-interview-type-list">
                        {INTERVIEW_TYPES.map((type) => (
                            <button
                                className={`ai-interview-type${interviewType === type.name ? " selected" : ""}`}
                                key={type.name}
                                onClick={() => setInterviewType(type.name)}
                                type="button"
                                aria-pressed={interviewType === type.name}
                            >
                                <strong>{type.name}</strong>
                                <span>{type.description}</span>
                            </button>
                        ))}
                    </div>

                    <div className="ai-interview-options">
                        <label className="learning-subject-select">
                            Experience level
                            <select
                                value={level}
                                onChange={(event) => setLevel(event.target.value)}
                            >
                                {LEVELS.map((item) => (
                                    <option key={item} value={item}>{item}</option>
                                ))}
                            </select>
                        </label>
                        <div className="ai-interview-duration">
                            <Clock3 aria-hidden="true" size={17} />
                            <span>About 20 minutes</span>
                        </div>
                    </div>

                    <button className="learning-primary-button ai-interview-start" disabled type="button">
                        <Bot aria-hidden="true" size={17} />
                        Start AI interview
                    </button>
                    <p className="ai-interview-notice" role="status">
                        The interview setup is ready. Connect an AI provider to
                        enable live questions and personalized feedback.
                    </p>
                </div>

                <aside className="learning-panel ai-interview-guide">
                    <span className="ai-interview-step">YOUR SESSION</span>
                    <h2>{interviewType} interview</h2>
                    <p>
                        A practice session tailored for candidates at the{" "}
                        {level.toLowerCase()} stage.
                    </p>
                    <div className="ai-interview-feature">
                        <MessageSquareText aria-hidden="true" size={18} />
                        <span>Answer questions at your own pace</span>
                    </div>
                    <div className="ai-interview-feature">
                        <BrainCircuit aria-hidden="true" size={18} />
                        <span>Get feedback on clarity and reasoning</span>
                    </div>
                    <div className="ai-interview-feature">
                        <Clock3 aria-hidden="true" size={18} />
                        <span>Build confidence with focused practice</span>
                    </div>
                </aside>
            </section>
        </main>
    );
}

export default AIInterview;
