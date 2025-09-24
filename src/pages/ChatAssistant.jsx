import React, { useState } from "react";
import axios from "axios";

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  // const API_BASE = "http://localhost:5000/api/ai"; 
  const API_BASE = "https://sih-project-backend-7l8d.onrender.com//api/ai";

  const addMessage = (role, content) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleStart = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/start`, {
        symptoms: input.trim(),
      });
      const data = res.data.data[0];
      setSessionId(data.session_id);

      addMessage("user", input.trim());
      addMessage("model", data.response.next_question);

      setInput("");
    } catch (err) {
      console.error(err);
      alert("Error starting conversation");
    }
    setLoading(false);
  };

  const handleFollowUp = async () => {
    if (!input.trim() || !sessionId) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/follow-up`, {
        session_id: sessionId,
        answer: input.trim(),
      });
      const data = res.data.data[0];

      addMessage("user", input.trim());
      addMessage("model", data.response.next_queston || data.response.next_question);

      // If conversation ended
      if (data.response.isConversationEnded && data.response.finalize) {
        addMessage("model", `✅ Final Diagnosis: ${data.response.finalize}`);
      }

      // If emergency flagged
      if (data.response.isEmergency && data.response.clarification) {
        addMessage("model", `🚨 Emergency Note: ${data.response.clarification}`);
      }

      setInput("");
    } catch (err) {
      console.error(err);
      alert("Error in follow-up");
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sessionId) {
      handleStart();
    } else {
      handleFollowUp();
    }
  };

  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">AI Health Assistant</h1>

      <div className="w-full h-96 overflow-y-auto border rounded-lg p-3 bg-gray-50 mb-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`my-2 p-2 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end ml-auto"
                : "bg-gray-200 text-black self-start mr-auto"
            }`}
          >
            {msg.content}
          </div>
        ))}
        {loading && <div className="text-sm text-gray-500">Thinking...</div>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex w-full items-center space-x-2"
      >
        <input
          type="text"
          className="flex-1 border p-2 rounded-lg"
          placeholder={
            sessionId ? "Type your answer..." : "Describe your symptoms..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          disabled={loading}
        >
          {sessionId ? "Send" : "Start"}
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
