//temporaria só pra ver como fica
import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./sidebar.css"; // criaremos um estilo simples também

function SidebarSessions({ currentSession, onSelect }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await axios.get("http://localhost:3001/active-sessions");
        setSessions(res.data.sessions);
      } catch (err) {
        console.error("Erro ao buscar sessões ativas:", err);
      }
    };

    fetchSessions();

    const interval = setInterval(fetchSessions, 5000); // atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sidebar-sessions">
      <h4>Sessões ativas</h4>
      {sessions.length === 0 && <p>Nenhuma sessão ativa</p>}
      <ul>
        {sessions.map((sess) => (
          <li
            key={sess}
            className={sess === currentSession ? "active" : ""}
            onClick={() => onSelect(sess)}
          >
            {sess}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SidebarSessions;
