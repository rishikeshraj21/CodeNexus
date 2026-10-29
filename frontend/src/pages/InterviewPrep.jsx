const TRACKS = [
    {
        title: "Data Structures & Algorithms",
        topics: ["Arrays and hashing", "Two pointers and sliding window", "Stacks, queues, and linked lists", "Trees, graphs, and traversals", "Dynamic programming and greedy strategies"],
        practice: "Solve problems by pattern; explain time and space complexity before coding.",
    },
    {
        title: "Java",
        topics: ["OOP and composition", "Collections and generics", "Exceptions and immutability", "Streams and lambdas", "JVM memory and garbage collection"],
        practice: "Implement a small example, then explain trade-offs and edge cases.",
    },
    {
        title: "DBMS",
        topics: ["Keys and normalization", "Joins and query plans", "Transactions and ACID", "Indexes and isolation levels"],
        practice: "Write SQL for the scenario and discuss correctness and indexing.",
    },
    {
        title: "Operating Systems",
        topics: ["Processes and threads", "Scheduling and synchronization", "Deadlocks", "Virtual memory and paging"],
        practice: "Compare approaches and describe the failure modes each one prevents.",
    },
    {
        title: "Computer Networks",
        topics: ["OSI and TCP/IP models", "TCP vs UDP", "DNS, HTTP, and TLS", "Routing and congestion control"],
        practice: "Trace one request from name resolution through the server response.",
    },
];

function InterviewPrep() {
    return (
        <main className="learning-page">
            <header className="learning-header">
                <div>
                    <span className="dashboard-label">PLACEMENT PREPARATION</span>
                    <h1>Interview Preparation</h1>
                    <p>Structured revision tracks for core computer science and coding interviews.</p>
                </div>
            </header>
            <section className="interview-track-grid">
                {TRACKS.map((track) => (
                    <article className="learning-panel interview-track" key={track.title}>
                        <h2>{track.title}</h2>
                        <ul>
                            {track.topics.map((topic) => <li key={topic}>{topic}</li>)}
                        </ul>
                        <p><strong>Practice tip:</strong> {track.practice}</p>
                    </article>
                ))}
            </section>
        </main>
    );
}

export default InterviewPrep;
