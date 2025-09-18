// frontend/pages/ConsultationChat.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../socket";
import { getMessages } from "../services/api";
import { getCurrentIdentity } from "../utils/auth";

export default function ConsultationChat() {
  const { id: consultationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const identity = getCurrentIdentity();
  const userId = identity?._id;
  const role = identity?.role;

  // Load old messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const { data } = await getMessages(consultationId);
        setMessages(data);
      } catch (err) {
        console.error("❌ Error loading messages:", err);
      }
    };
    loadMessages();
  }, [consultationId]);

  // Join room + listen for new messages
  useEffect(() => {
    if (consultationId && userId) {
      socket.emit("joinRoom", { consultationId, userId, role });

      socket.on("receiveMessage", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      return () => socket.off("receiveMessage");
    }
  }, [consultationId, userId, role]);

  // Send message (patient)
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const msg = {
      sender: "patient",
      message: newMessage,
      consultationId,
      userId,
    };

    socket.emit("sendMessage", msg);
    setNewMessage("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Chat with Doctor</h2>

      {/* Messages */}
      <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`mb-2 p-2 rounded-lg max-w-xs ${
                m.sender === "patient"
                  ? "bg-blue-500 text-white ml-auto"
                  : "bg-gray-200 text-black"
              }`}
            >
              {m.message}
              <div className="text-xs opacity-70 mt-1">
                {new Date(m.timestamp || Date.now()).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
