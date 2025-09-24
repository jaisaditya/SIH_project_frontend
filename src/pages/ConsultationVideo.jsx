// frontend/src/pages/ConsultationVideo.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import { getCurrentIdentity } from "../utils/auth";

const PC_CONFIG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

export default function ConsultationVideo() {
  const { id: consultationId } = useParams();
  const localRef = useRef(null);
  const remoteRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);

  const [inCall, setInCall] = useState(false);
  const [started, setStarted] = useState(false);
  const [incomingAccepted, setIncomingAccepted] = useState(false); // patient doesn't need this but keep for clarity
  const [waitingForAnswer, setWaitingForAnswer] = useState(false);

  useEffect(() => {
    const identity = getCurrentIdentity();
    if (!identity || !identity._id) {
      console.error("[Patient] no identity found");
      return;
    }

    // create socket connection for this component only
    // const socket = io("http://localhost:5000");
      const socket = io("https://sih-project-backend-7l8d.onrender.com");
    socketRef.current = socket;
    

    socket.on("connect", () => console.log("[Patient] socket connected", socket.id));
    socket.on("connect_error", (err) => console.error("[Patient] socket connect_error", err));

    // join room
    socket.emit("joinRoom", { consultationId, userId: identity._id, role: identity.role });
    console.log("[Patient] emitted joinRoom");

    // signaling handlers
    socket.on("call-accepted", async () => {
      console.log("[Patient] call accepted by doctor -> will create offer now");
      try {
        // doctor is ready; create pc, get stream and send offer
        await createPeerConnection();
        await startLocalStreamAndAttach();
        const offer = await pcRef.current.createOffer();
        await pcRef.current.setLocalDescription(offer);
        socket.emit("offer", { consultationId, offer });
        setWaitingForAnswer(true);
        setInCall(true);
        setStarted(true);
      } catch (err) {
        console.error("[Patient] after call-accepted error", err);
      }
    });

    socket.on("offer", async (offer) => {
      console.log("[Patient] Received offer (unexpected - patient usually initiates), handling nevertheless");
      try {
        if (!pcRef.current) await createPeerConnection();
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        await startLocalStreamAndAttach();
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        socket.emit("answer", { consultationId, answer });
        setInCall(true);
      } catch (err) {
        console.error("[Patient] offer handling error:", err);
      }
    });

    socket.on("answer", async (answer) => {
      console.log("[Patient] Received answer");
      try {
        if (!pcRef.current) return console.warn("[Patient] no pc when answer arrived");
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        setWaitingForAnswer(false);
        setInCall(true);
      } catch (err) {
        console.error("[Patient] setRemoteDescription(answer) error:", err);
      }
    });

    socket.on("ice-candidate", async (candidate) => {
      if (!candidate) return;
      try {
        if (pcRef.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.warn("[Patient] received ICE candidate but pc missing");
        }
      } catch (err) {
        console.error("[Patient] addIceCandidate error:", err);
      }
    });

    // IMPORTANT: when server broadcasts end-call, do silent cleanup (don't re-emit)
    socket.on("end-call", () => {
      console.log("[Patient] Received end-call (server) -> perform silent cleanup");
      _endCall(true);
    });

    // clean up on unmount
    return () => {
      console.log("[Patient] cleanup");
      socket.off("call-accepted");
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
    console.log("[Patient] createPeerConnection()");
    pcRef.current = new RTCPeerConnection(PC_CONFIG);

    pcRef.current.ontrack = (ev) => {
      console.log("[Patient] ontrack", ev.streams);
      if (remoteRef.current) remoteRef.current.srcObject = ev.streams[0];
      setInCall(true);
    };

    pcRef.current.onicecandidate = (ev) => {
      if (ev.candidate) {
        socketRef.current.emit("ice-candidate", { consultationId, candidate: ev.candidate });
        console.log("[Patient] emitted ice-candidate");
      }
    };

    pcRef.current.onconnectionstatechange = () => {
      console.log("[Patient] pc connectionState", pcRef.current.connectionState);
    };
  };

  const startLocalStreamAndAttach = async () => {
    if (localStreamRef.current) {
      // already started
      if (localRef.current) localRef.current.srcObject = localStreamRef.current;
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localRef.current) localRef.current.srcObject = stream;
    // add tracks to pc
    stream.getTracks().forEach((t) => pcRef.current.addTrack(t, stream));
    console.log("[Patient] local stream attached to pc");
  };

  const startCall = async () => {
    // Start call-request flow. Patient will ask doctor to accept first.
    try {
      if (started) return;
      setStarted(true);
      socketRef.current.emit("call-request", { consultationId });
      console.log("[Patient] emitted call-request, waiting for doctor to accept...");
    } catch (err) {
      console.error("[Patient] startCall error:", err);
      setStarted(false);
    }
  };

  const _endCall = (silent = false) => {
    console.log("[Patient] _endCall silent:", silent);
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
      console.error("[Patient] error cleaning up:", err);
    } finally {
      setInCall(false);
      setStarted(false);
      setWaitingForAnswer(false);
      if (!silent && socketRef.current?.connected) {
        socketRef.current.emit("end-call", { consultationId });
        console.log("[Patient] emitted end-call (user action)");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Patient Consultation Video</h2>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <div className="text-sm mb-2 font-medium">Your camera</div>
            <video ref={localRef} autoPlay playsInline muted className="w-full rounded-xl bg-black shadow-md" />
          </div>

          <div>
            <div className="text-sm mb-2 font-medium">Doctor / Remote</div>
            <video ref={remoteRef} autoPlay playsInline className="w-full rounded-xl bg-black shadow-md" />
          </div>
        </div>

        <div className="flex justify-center mt-6 gap-4">
          {!inCall ? (
            <button
              onClick={startCall}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Start Call
            </button>
          ) : (
            <button
              onClick={() => _endCall(false)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg shadow hover:bg-red-700"
            >
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
