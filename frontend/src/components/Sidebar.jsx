import { Brain, FileText, GraduationCap, HelpCircle, History, Image, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sidebar({ history = [], onHistoryClick, selectedMode, onModeChange,onNewChat }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { id: 'doubt', icon: Brain, label: 'Doubt Session' },
    { id: 'notes', icon: FileText, label: 'Generate Notes' },
    { id: 'questions', icon: HelpCircle, label: 'Generate Questions' },
    { id: 'image', icon: Image, label: 'Image Generation' },
  ];

  const latestHistory = [...history].reverse().slice(0, 10);

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="flex items-center gap-2 mb-15">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-3xl font-bold">
            <span className="text-gray-800">Study</span>
            <span className="text-blue-600">Fusion</span>
          </h1>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="mb-4 px-2">
        <button 
          className="new-chat-btn"
          onClick={() => onNewChat && onNewChat()}
        >
          + New Chat
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className={`nav-item ${selectedMode === item.id ? 'active' : ''}`}
              onClick={() => onModeChange && onModeChange(item.id)}
            >
              <Icon className="nav-icon" size={18} />
              <span className="nav-label">{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* History */}
      <div className="sidebar-section">
        <h3 className="section-title">HISTORY</h3>
        <div className="history-list">
          {latestHistory.length > 0 ? (
            latestHistory.map((item, index) => (
              <div
                key={index}
                className="history-item"
                onClick={() => onHistoryClick && onHistoryClick(item)}
              >
                <History size={16} />
                <span>{item.query?.substring(0, 30) || 'Untitled'}...</span>
              </div>
            ))
          ) : (
            <div className="history-item empty" style={{ opacity: 0.5 }}>
              <span>No history yet</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}