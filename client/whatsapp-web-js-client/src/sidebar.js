// src/SidebarNav.jsx
import "./sidebar.css";

const SidebarNav = ({ currentView, setCurrentView }) => {
  return (
    <div className="sidebar-nav">
      <button
        className={currentView === "connections" ? "active" : ""}
        onClick={() => setCurrentView("connections")}
      >
        Conexões
      </button>
      <button
        className={currentView === "chats" ? "active" : ""}
        onClick={() => setCurrentView("chats")}
      >
        Chats
      </button>
    </div>
  );
};

export default SidebarNav;
