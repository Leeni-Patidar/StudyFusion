import { Download } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8000';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [topic, setTopic] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedNoteType, setSelectedNoteType] = useState('detailed');
  const [selectedMode, setSelectedMode] = useState('notes');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);

  const loadHistory = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/history/${encodeURIComponent(userId)}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  // Check for user on mount
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHistory(user.email);
  }, [loadHistory, navigate, user]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setError('');
    setLoading(true);
    setOutputText('');
    setGeneratedImages([]);

    try {
      let endpoint = '/api/chat';
      let body = {
        user_id: user.email,
        message: topic,
        mode: selectedMode
      };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Generation failed');
      }

      if (selectedMode === 'image') {
        // Handle image generation
        const imgRes = await fetch(`${API_URL}/api/generate-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.email, prompt: topic, count: 5 }),
        });
        const imgData = await imgRes.json();
        if (imgData.success) {
          setGeneratedImages(imgData.images);
        }
      } else {
        setOutputText(data.result);
      }

      // Reload history
      loadHistory(user.email);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!outputText) return;

    try {
      const res = await fetch(`${API_URL}/api/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.email, message: outputText }),
      });
      const data = await res.json();
      if (data.success) {
        // Download the file
        const byteCharacters = atob(data.document);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'StudyFusion_Export.docx';
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      setError('Export failed: ' + err.message);
    }
  };

  const loadFromHistory = (item) => {
    setTopic(item.query);
    setOutputText(item.result);
  };

  const noteTypes = [
    { id: 'detailed', label: 'Detailed Notes', icon: '📄', desc: 'In-depth explanation' },
    { id: 'short', label: 'Short Notes', icon: '📋', desc: 'Concise summary' },
    { id: 'bullets', label: 'Bullet Points', icon: '🎯', desc: 'Key points only' },
  ];

  const questionTypes = [
  { id: 'mcq', label: 'MCQs', icon: '📝', desc: 'Multiple choice questions' },
  { id: 'short', label: 'Short Questions', icon: '✏️', desc: 'Brief answer questions' },
  { id: 'long', label: 'Long Questions', icon: '📚', desc: 'Detailed descriptive questions' },
];

  if (!user) return null;

  return (
    <div className="dashboard-container">
      <Sidebar
        history={history}
        onHistoryClick={loadFromHistory}
        selectedMode={selectedMode}
        onModeChange={setSelectedMode}
      />

      <div className="dashboard-main">
        <Topbar user={user} />

        <div className="dashboard-content">


          {/* Main Content */}
          <div className="main-section">
            {/* Generate Notes */}
            <div className="generate-card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">Generate Notes</h3>
                  <p className="card-desc">Enter a topic and get well-structured notes instantly.</p>
                </div>
              </div>


              {/* Sub-modes: show noteTypes or questionTypes based on selectedMode */}
              {selectedMode === 'notes' && (
                <div className="note-types">
                  {noteTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`note-type ${selectedNoteType === type.id ? 'selected' : ''}`}
                      onClick={() => setSelectedNoteType(type.id)}
                    >
                      <span className="note-type-icon">{type.icon}</span>
                      <div>
                        <div className="note-type-label">{type.label}</div>
                        <div className="note-type-desc">{type.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {selectedMode === 'questions' && (
                <div className="note-types">
                  {questionTypes.map((type) => (
                    <div
                      key={type.id}
                      className={`note-type ${selectedNoteType === type.id ? 'selected' : ''}`}
                      onClick={() => setSelectedNoteType(type.id)}
                    >
                      <span className="note-type-icon">{type.icon}</span>
                      <div>
                        <div className="note-type-label">{type.label}</div>
                        <div className="note-type-desc">{type.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Type your topic here..."
                className="topic-input"
                disabled={loading}
              />
              <div className="input-counter">{topic.length} / 500</div>

              {error && (
                <div className="error-message" style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>
                  {error}
                </div>
              )}

              <button 
                className="generate-btn" 
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <span>⏳ Generating...</span>
                ) : (
                  <span>✨ Generate {selectedMode === 'notes' ? 'Notes' : selectedMode === 'questions' ? 'Questions' : selectedMode === 'image' ? 'Images' : 'Response'}</span>
                )}
              </button>
            </div>

            {/* Output Section */}
            <div className="output-card">
              <div className="output-header">
                <h3 className="card-title">
                  {selectedMode === 'image' ? 'Generated Images' : 'Your Output'}
                </h3>
                {(outputText || generatedImages.length > 0) && (
                  <button className="download-btn" onClick={handleExport}>
                    <Download size={18} />
                    Download
                  </button>
                )}
              </div>

              {loading ? (
                <div className="output-empty">
                  <div className="empty-icon">⏳</div>
                  <div className="empty-title">Generating content...</div>
                  <div className="empty-subtitle">Please wait while AI processes your request.</div>
                </div>
              ) : outputText ? (
                <div className="output-content">
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{outputText}</pre>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="images-grid">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="generated-image">
                      <img src={`data:image/png;base64,${img}`} alt={`Generated ${idx + 1}`} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="output-empty">
                  <div className="empty-icon">📝</div>
                  <div className="empty-title">Your generated content will appear here</div>
                  <div className="empty-subtitle">Enter a topic and click "Generate" to get started.</div>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          height: 100vh;
          background-color: #f8f9fa;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .dashboard-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .dashboard-content {
          flex: 1;
          overflow-y: auto;
          padding: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .stat-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.12);
          transform: translateY(-2px);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 15px;
        }

        .stat-icon {
          font-size: 24px;
        }

        .stat-label {
          font-size: 13px;
          color: #666;
          font-weight: 500;
        }

        .stat-value {
          font-size: 32px;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .stat-change {
          font-size: 12px;
          color: #4caf50;
          font-weight: 500;
        }

        .modes-section {
          margin-bottom: 40px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 15px;
        }

        .modes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
        }

        .mode-btn {
          background: white;
          border: 2px solid #e0e0e0;
          padding: 16px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
          font-size: 14px;
          font-weight: 500;
        }

        .mode-btn:hover {
          border-color: #5b5bff;
          background: #f0f0ff;
        }

        .mode-btn.active {
          border-color: #5b5bff;
          background: #f0f0ff;
          color: #5b5bff;
        }

        .mode-icon {
          font-size: 20px;
        }

        .images-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .generated-image img {
          width: 100%;
          border-radius: 8px;
        }

        .main-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .generate-card,
        .output-card {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 5px 0;
        }

        .card-desc {
          font-size: 13px;
          color: #666;
          margin: 0;
        }

        .output-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .download-btn {
          background: #5b5bff;
          color: white;
          border: none;
          padding: 8px 14px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.3s ease;
        }

        .download-btn:hover {
          background: #4949dd;
        }

        .note-types {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .note-type {
          flex: 1;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s ease;
        }

        .note-type:hover {
          border-color: #5b5bff;
          background: #f0f0ff;
        }

        .note-type.selected {
          background: #e3e3ff;
          border-color: #5b5bff;
        }

        .note-type-icon {
          font-size: 18px;
        }

        .note-type-label {
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
        }

        .note-type-desc {
          font-size: 11px;
          color: #999;
        }

        .topic-input {
          width: 100%;
          padding: 14px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          min-height: 120px;
          transition: border-color 0.3s ease;
        }

        .topic-input:focus {
          outline: none;
          border-color: #5b5bff;
        }

        .input-counter {
          text-align: right;
          font-size: 12px;
          color: #999;
          margin-top: 8px;
          margin-bottom: 15px;
        }

        .generate-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #5b5bff 0%, #7373ff 100%);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .generate-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(91, 91, 255, 0.3);
        }

        .output-empty {
          text-align: center;
          padding: 40px 20px;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-title {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          margin-bottom: 8px;
        }

        .empty-subtitle {
          font-size: 13px;
          color: #999;
        }

        .output-content {
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
          line-height: 1.6;
          color: #333;
        }

        .chat-input-section {
          padding: 20px 0;
          border-top: 1px solid #e0e0e0;
        }

        .chat-input-wrapper {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 15px;
          transition: border-color 0.3s ease;
        }

        .chat-input-wrapper:focus-within {
          border-color: #5b5bff;
        }

        .chat-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: inherit;
        }

        .chat-actions {
          display: flex;
          gap: 8px;
        }

        .chat-action-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 6px;
          opacity: 0.6;
          transition: opacity 0.3s ease;
        }

        .chat-action-btn:hover {
          opacity: 1;
        }

        @media (max-width: 1200px) {
          .main-section {
            grid-template-columns: 1fr;
          }

          .dashboard-content {
            padding: 20px;
          }
        }
      `}</style>
    </div>
  );
}
