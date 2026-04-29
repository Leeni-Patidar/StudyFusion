import { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles.css";

const API_URL = "http://localhost:8000";

export default function Dashboard() {
    const navigate = useNavigate();

    const [user] = useState(() => {
        const storedUser = localStorage.getItem("user");
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [topic, setTopic] = useState("");
    const [followUp, setFollowUp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [selectedMode, setSelectedMode] = useState("notes");
    const [selectedNoteType, setSelectedNoteType] = useState("detailed");

    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);

    const noteTypes = [
        {
            id: "detailed",
            label: "Detailed Notes",
            icon: "📄",
            desc: "In-depth explanation",
        },
        {
            id: "short",
            label: "Short Notes",
            icon: "📋",
            desc: "Concise summary",
        },
        {
            id: "bullets",
            label: "Bullet Points",
            icon: "🎯",
            desc: "Key points only",
        },
    ];

    const questionTypes = [
        {
            id: "mcq",
            label: "MCQs",
            icon: "📝",
            desc: "Multiple choice questions",
        },
        {
            id: "short",
            label: "Short Questions",
            icon: "✏️",
            desc: "Brief answer questions",
        },
        {
            id: "long",
            label: "Long Questions",
            icon: "📚",
            desc: "Detailed descriptive questions",
        },
    ];

    const modes = [
        { id: "chat", label: "Doubt Session" },
        { id: "notes", label: "Generate Notes" },
        { id: "questions", label: "Generate Questions" },
        { id: "image", label: "Image Generation" },
    ];

    const currentModeLabel =
        modes.find((item) => item.id === selectedMode)?.label ||
        "Generate Notes";

    const loadHistory = useCallback(async (userId) => {
        try {
            const res = await fetch(
                `${API_URL}/api/history/${encodeURIComponent(userId)}`
            );
            const data = await res.json();

            if (data.success) {
                setHistory(data.history || []);
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        if (!user) {
            navigate("/");
            return;
        }

        loadHistory(user.email);
    }, [user, navigate, loadHistory]);

    useEffect(() => {
        setTopic("");
        setFollowUp("");
        setMessages([]);
        setError("");

        if (selectedMode === "notes") {
            setSelectedNoteType("detailed");
        }

        if (selectedMode === "questions") {
            setSelectedNoteType("mcq");
        }

    }, [selectedMode]);

    const buildPrompt = (prompt) => {
        let enhancedPrompt = prompt;

        if (selectedMode === "notes") {
            if (selectedNoteType === "detailed") {
                enhancedPrompt = `Generate well structured detailed notes with headings, examples and explanation on:\n${prompt}`;
            }

            if (selectedNoteType === "short") {
                enhancedPrompt = `Generate concise revision notes on:\n${prompt}`;
            }

            if (selectedNoteType === "bullets") {
                enhancedPrompt = `Generate only bullet point notes on:\n${prompt}`;
            }
        }

        if (selectedMode === "questions") {
            if (selectedNoteType === "mcq") {
                enhancedPrompt = `Generate MCQ questions with answers on:\n${prompt}`;
            }

            if (selectedNoteType === "short") {
                enhancedPrompt = `Generate short answer questions with answers on:\n${prompt}`;
            }

            if (selectedNoteType === "long") {
                enhancedPrompt = `Generate long descriptive questions with answers on:\n${prompt}`;
            }
        }

        return enhancedPrompt;
    };

    const handleGenerate = async (continueChat = false) => {
        const prompt = continueChat ? followUp : topic;

        if (!prompt.trim()) {
            setError("Please enter a topic");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await fetch(`${API_URL}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    user_id: user.email,
                    message: buildPrompt(prompt),
                    mode: selectedMode,
                    subtype: selectedNoteType,
                    history: messages,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Generation failed");
            }

            const updated = [
                ...messages,
                {
                    role: "user",
                    text: prompt,
                },
                {
                    role: "assistant",
                    text: data.result,
                },
            ];

            setMessages(updated);

            if (continueChat) {
                setFollowUp("");
            } else {
                setTopic("");
            }

            loadHistory(user.email);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNewChat = () => {
        setTopic("");
        setFollowUp("");
        setMessages([]);
        setError("");
    };

    const loadFromHistory = (item) => {
        setMessages([
            {
                role: "user",
                text: item.query,
            },
            {
                role: "assistant",
                text: item.result,
            },
        ]);
    };

    const handleExport = async () => {
        const lastAI = [...messages].reverse().find(
            (m) => m.role === "assistant"
        );

        if (!lastAI) return;

        try {
            const res = await fetch(`${API_URL}/api/export`, {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    user_id: user.email,
                    message: lastAI.text,
                }),
            });

            const data = await res.json();

            if (data.success) {
                const byteCharacters = atob(data.document);
                const byteNumbers = [];

                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers.push(
                        byteCharacters.charCodeAt(i)
                    );
                }

                const byteArray = new Uint8Array(byteNumbers);

                const blob = new Blob(
                    [byteArray],
                    {
                        type:
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    }
                );

                const url = URL.createObjectURL(blob);

                const a = document.createElement("a");
                a.href = url;
                a.download = "StudyFusion_Export.docx";
                a.click();

                URL.revokeObjectURL(url);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const formatResponse = (text) => {
        return text.split("\n").map((line, index) => {

            if (line.startsWith("# ")) {
                return (
                    <h2 key={index}>
                        {line.replace("# ", "")}
                    </h2>
                );
            }

            if (line.startsWith("## ")) {
                return (
                    <h3 key={index}>
                        {line.replace("## ", "")}
                    </h3>
                );
            }

            if (
                line.startsWith("- ") ||
                line.startsWith("• ")
            ) {
                return (
                    <li key={index}>
                        {line.replace(/^[-•]\s/, "")}
                    </li>
                );
            }

            return line.trim() ? (
                <p key={index}>{line}</p>
            ) : (
                <br key={index} />
            );
        });
    };

    if (!user) return null;

    return (
        <div className="dashboard-container">
            <Sidebar
                history={history}
                onHistoryClick={loadFromHistory}
                selectedMode={selectedMode}
                onModeChange={setSelectedMode}
                onNewChat={handleNewChat}
            />

            <div className="dashboard-main">
                <Topbar user={user} />

                <div className="dashboard-content">
                    <div className="generate-card">
                        <div className="card-header">
                            <div>
                                <h3 className="card-title">
                                    {currentModeLabel}
                                </h3>

                                <p className="card-desc">
                                    {selectedMode === "chat" &&
                                        "Ask doubts and get AI assistance instantly."}

                                    {selectedMode === "notes" &&
                                        "Enter a topic and get well-structured notes instantly."}

                                    {selectedMode === "questions" &&
                                        "Generate practice questions automatically."}

                                    {selectedMode === "image" &&
                                        "Create educational images from prompts."}
                                </p>
                            </div>

                            {messages.length > 0 && (
                                <button
                                    className="download-btn"
                                    onClick={handleExport}
                                >
                                    <Download size={18} />
                                    Download
                                </button>
                            )}
                        </div>

                        {selectedMode === "notes" && (
                            <div className="note-types">
                                {noteTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className={`note-type ${selectedNoteType === type.id
                                            ? "selected"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            setSelectedNoteType(type.id)
                                        }
                                    >
                                        <span>{type.icon}</span>

                                        <div>
                                            <div className="note-type-label">
                                                {type.label}
                                            </div>

                                            <div className="note-type-desc">
                                                {type.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {selectedMode === "questions" && (
                            <div className="note-types">
                                {questionTypes.map((type) => (
                                    <div
                                        key={type.id}
                                        className={`note-type ${selectedNoteType === type.id
                                            ? "selected"
                                            : ""
                                            }`}
                                        onClick={() =>
                                            setSelectedNoteType(type.id)
                                        }
                                    >
                                        <span>{type.icon}</span>

                                        <div>
                                            <div className="note-type-label">
                                                {type.label}
                                            </div>

                                            <div className="note-type-desc">
                                                {type.desc}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <textarea
                            value={topic}
                            onChange={(e) =>
                                setTopic(e.target.value)
                            }
                            maxLength={500}
                            placeholder="Type your topic here..."
                            className="topic-input"
                        />

                        <div className="input-counter">
                            {topic.length}/500
                        </div>

                        {error && (
                            <div className="error-message">
                                {error}
                            </div>
                        )}

                        <button
                            className="generate-btn"
                            onClick={() =>
                                handleGenerate(false)
                            }
                            disabled={loading}
                        >
                            {loading
                                ? "Generating..."
                                : "✨ Generate"}
                        </button>

                        {messages.length > 0 && (
                            <div className="chat-output">
                                {messages.map((msg, index) => (
                                    <div
                                        key={index}
                                        className={`chat-bubble ${msg.role}`}
                                    >
                                        <strong>
                                            {msg.role === "user"
                                                ? "You"
                                                : "AI"}
                                        </strong>

                                        <div className="formatted-output">
                                            {formatResponse(msg.text)}
                                        </div>
                                    </div>
                                ))}

                                <div className="continue-box">
                                    <textarea
                                        value={followUp}
                                        onChange={(e) =>
                                            setFollowUp(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ask follow-up or continue generation..."
                                        className="topic-input"
                                    />

                                    <button
                                        className="generate-btn"
                                        onClick={() =>
                                            handleGenerate(true)
                                        }
                                        disabled={loading}
                                    >
                                        {loading
                                            ? "Generating..."
                                            : "Continue Generate"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}