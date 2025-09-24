// frontend/src/pages/DoctorConsultationVideo.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { getCurrentIdentity } from "../utils/auth";

const PC_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function DoctorConsultationVideo() {
  const { id: consultationId } = useParams();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(false);
  const [inCall, setInCall] = useState(false);

  useEffect(() => {
    const identity = getCurrentIdentity();
    if (!identity || !identity._id) {
      console.error("[Doctor] no identity");
      return;
    }

    // const socket = io("http://localhost:5000");
       const socket = io("https://sih-project-backend-7l8d.onrender.com");
    socketRef.current = socket;

    socket.on("connect", () => console.log("[Doctor] socket connected", socket.id));
    socket.on("connect_error", (err) => console.error("[Doctor] connect_error", err));

    socket.emit("joinRoom", { consultationId, userId: identity._id, role: identity.role });
    console.log("[Doctor] emitted joinRoom");

    // patient asked to start -> show incoming call UI
    socket.on("call-request", () => {
      console.log("[Doctor] Received call-request -> show incoming UI");
      setIncomingCall(true);
    });

    socket.on("offer", async (offer) => {
      console.log("[Doctor] Received offer from patient");
      try {
        if (!pcRef.current) {
          await createPeerConnection();
        }
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("answer", { consultationId, answer });
        setInCall(true);
        setIncomingCall(false);
      } catch (err) {
        console.error("[Doctor] error handling offer:", err);
      }
    });

    socket.on("answer", async (answer) => {
      console.log("[Doctor] Received unexpected answer (doctor normally answers).");
      try {
        if (pcRef.current) await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setInCall(true);
      } catch (err) {
        console.error("[Doctor] error on answer:", err);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (!candidate) return;
      try {
        if (pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.warn("[Doctor] ICE candidate received but pc not ready yet");
        }
      } catch (err) {
        console.error("[Doctor] addIceCandidate error:", err);
      }
    });

    socket.on("end-call", () => {
      console.log("[Doctor] Received end-call (server) -> silent cleanup");
      _endCall(true);
    });

    return () => {
      console.log("[Doctor] cleanup");
      socket.off("call-request");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("end-call");
      socket.disconnect();
      _endCall(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [consultationId]);

  const createPeerConnection = async () => {
    if (pcRef.current) return;
    console.log("[Doctor] createPeerConnection");
    pcRef.current = new RTCPeerConnection(PC_CONFIG);

    pcRef.current.ontrack = (ev) => {
      console.log("[Doctor] ontrack", ev.streams);
      if (remoteRef.current) remoteRef.current.srcObject = ev.streams[0];
      setInCall(true);
    };

    pcRef.current.onicecandidate = (ev) => {
      if (ev.candidate) {
        socketRef.current.emit("ice-candidate", { consultationId, candidate: ev.candidate });
        console.log("[Doctor] emitted ice-candidate");
      }
    };

    pcRef.current.onconnectionstatechange = () => {
      console.log("[Doctor] pc state:", pcRef.current.connectionState);
    };
  };

  const startLocalStreamAndAttach = async () => {
    if (localStreamRef.current) {
      if (localRef.current) localRef.current.srcObject = localStreamRef.current;
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localRef.current) localRef.current.srcObject = stream;
    // add tracks to pc if pc available
    if (pcRef.current) stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
  };

  const acceptCall = async () => {
    try {
      setIncomingCall(false);
      await createPeerConnection();
      await startLocalStreamAndAttach();
      // now notify patient that doctor accepted -> patient will create offer
      socketRef.current.emit("call-accepted", { consultationId });
      console.log("[Doctor] emitted call-accepted (doctor ready)");
      setInCall(true);
    } catch (err) {
      console.error("[Doctor] error accepting call:", err);
    }
  };

  const declineCall = () => {
    setIncomingCall(false);
    // optionally notify patient of decline (server can forward as a "call-declined" event)
    socketRef.current.emit("call-declined", { consultationId });
  };

  const _endCall = (silent = false) => {
    console.log("[Doctor] _endCall silent:", silent);
    try {
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (localRef.current?.srcObject) localRef.current.srcObject = null;
      if (remoteRef.current?.srcObject) remoteRef.current.srcObject = null;
    } catch (err) {
      console.error("[Doctor] error cleaning up", err);
    } finally {
      setInCall(false);
      if (!silent && socketRef.current?.connected) {
        socketRef.current.emit("end-call", { consultationId });
        console.log("[Doctor] emitted end-call (user clicked)");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Doctor Consultation Video</h2>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <div className="text-sm mb-2 font-medium">Your camera</div>
            <video ref={localRef} autoPlay playsInline muted className="w-full rounded-xl bg-black shadow-md" />
          </div>

          <div>
            <div className="text-sm mb-2 font-medium">Patient / Remote</div>
            <video ref={remoteRef} autoPlay playsInline className="w-full rounded-xl bg-black shadow-md" />
          </div>
        </div>

        {incomingCall && (
          <div className="max-w-lg mx-auto bg-yellow-50 border p-4 rounded-md mt-6">
            <div className="font-medium mb-3">Incoming call</div>
            <div className="flex gap-3">
              <button onClick={acceptCall} className="px-4 py-2 bg-green-600 text-white rounded">Accept</button>
              <button onClick={declineCall} className="px-4 py-2 bg-red-600 text-white rounded">Decline</button>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-6">
          {inCall ? (
            <button onClick={() => _endCall(false)} className="px-6 py-2 bg-red-600 text-white rounded-lg">
              End Call
            </button>
          ) : (
            <div className="text-sm text-gray-600">Waiting for patient to start the call…</div>
          )}
        </div>
      </div>
    </div>
  );
}
