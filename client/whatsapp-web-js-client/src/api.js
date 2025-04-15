// src/api.js
export const getAllSessions = async () => {
  const res = await fetch('/evo/instance');
  return res.json(); // <- IMPORTANTE
};

export const startSession = async (sessionName) => {
  const res = await fetch(`/evo/start-session/${sessionName}`, {
    method: 'POST',
  });
  return res.json(); // <- IMPORTANTE
};
