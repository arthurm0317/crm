import React from 'react';

const SidebarSessions = ({ sessions, selected, onSelect }) => {
  return (
    <div className="w-64 bg-gray-100 border-r p-4">
      <h2 className="font-bold mb-4">Sessões</h2>
      <ul>
        {sessions.map((s) => (
          <li
            key={s.sessionName}
            className={`p-2 cursor-pointer rounded ${
              selected === s.sessionName ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
            onClick={() => onSelect(s.sessionName)}
          >
            {s.sessionName}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SidebarSessions;
