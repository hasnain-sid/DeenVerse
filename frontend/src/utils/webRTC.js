// WebRTC utility functions for the Quran Learning video call functionality
import { useEffect, useRef, useState } from 'react';

// Configuration for STUN/TURN servers
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    // Add TURN servers in a production environment
    // { 
    //   urls: 'turn:your-turn-server.com:3478',
    //   username: 'username',
    //   credential: 'credential'
    // }
  ]
};

/**
 * Custom hook to manage WebRTC peer connections
 * @param {string} roomId - The ID of the room to join
 * @param {object} userInfo - Information about the current user
 * @returns {object} - WebRTC state and control functions
 */
export const useWebRTC = (roomId, userInfo) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for persistent data
  const peerConnections = useRef({});
  const localStreamRef = useRef(null);
  const screenShareStreamRef = useRef(null);
  const socketRef = useRef(null);
  
  // Mock socket/signaling setup (in a real app, this would connect to a server)
  useEffect(() => {
    if (!roomId) return;

    // Simulate a socket connection
    console.log(`Joining room: ${roomId}`);
    socketRef.current = {
      emit: (event, data) => {
        console.log(`Emitting ${event}:`, data);
      },
      on: (event, callback) => {
        console.log(`Listening for ${event}`);
      }
    };

    // Mock participants
    setParticipants([
      { id: 'teacher1', name: 'Sheikh Abdullah', isTeacher: true, micOn: true, videoOn: true },
      { id: 'student1', name: 'Student Ahmed', isTeacher: false, micOn: false, videoOn: true, handRaised: false },
      { id: 'student2', name: 'Student Fatima', isTeacher: false, micOn: false, videoOn: false, handRaised: true },
      { id: 'student3', name: 'Student Omar', isTeacher: false, micOn: true, videoOn: true, handRaised: false },
    ]);

    return () => {
      // Cleanup
      console.log('Leaving room, cleaning up WebRTC connections');
      Object.values(peerConnections.current).forEach(connection => {
        connection.close();
      });
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenShareStreamRef.current) {
        screenShareStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [roomId]);

  // Initialize local media
  const initializeLocalMedia = async (videoConstraints = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: videoConstraints
      });
      
      localStreamRef.current = stream;
      setLocalStream(stream);
      setIsConnected(true);
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError(`Could not access camera/microphone: ${err.message}`);
      return null;
    }
  };

  // Toggle microphone
  const toggleMicrophone = () => {
    if (!localStreamRef.current) return;
    
    const audioTracks = localStreamRef.current.getAudioTracks();
    if (audioTracks.length === 0) return;
    
    const enabled = !audioTracks[0].enabled;
    audioTracks.forEach(track => {
      track.enabled = enabled;
    });
    
    setIsMicEnabled(enabled);
    
    // In a real app: Notify other participants via signaling server
    socketRef.current?.emit('toggle-audio', { enabled, roomId });
  };

  // Toggle camera
  const toggleCamera = () => {
    if (!localStreamRef.current) return;
    
    const videoTracks = localStreamRef.current.getVideoTracks();
    if (videoTracks.length === 0) return;
    
    const enabled = !videoTracks[0].enabled;
    videoTracks.forEach(track => {
      track.enabled = enabled;
    });
    
    setIsVideoEnabled(enabled);
    
    // In a real app: Notify other participants via signaling server
    socketRef.current?.emit('toggle-video', { enabled, roomId });
  };

  // Toggle screen sharing
  const toggleScreenSharing = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        if (screenShareStreamRef.current) {
          screenShareStreamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Replace with camera stream again
        if (localStreamRef.current) {
          // In a real app: Replace tracks in all peer connections
          setLocalStream(localStreamRef.current);
        }
        
        setIsScreenSharing(false);
      } else {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        screenShareStreamRef.current = screenStream;
        
        // In a real app: Replace tracks in all peer connections
        setLocalStream(screenStream);
        setIsScreenSharing(true);
        
        // Handle the case when user stops screen sharing via the browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenSharing();
        };
      }
      
      // In a real app: Notify other participants via signaling server
      socketRef.current?.emit('toggle-screen-sharing', { enabled: !isScreenSharing, roomId });
    } catch (err) {
      console.error('Error toggling screen share:', err);
      setError(`Could not share screen: ${err.message}`);
    }
  };

  // Leave the room
  const leaveRoom = () => {
    // Stop all media tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenShareStreamRef.current) {
      screenShareStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach(connection => {
      connection.close();
    });
    
    peerConnections.current = {};
    setRemoteStreams({});
    setIsConnected(false);
    
    // In a real app: Notify the signaling server
    socketRef.current?.emit('leave-room', { roomId });
  };

  return {
    localStream,
    remoteStreams,
    participants,
    isConnected,
    isMicEnabled,
    isVideoEnabled,
    isScreenSharing,
    error,
    initializeLocalMedia,
    toggleMicrophone,
    toggleCamera,
    toggleScreenSharing,
    leaveRoom
  };
};
