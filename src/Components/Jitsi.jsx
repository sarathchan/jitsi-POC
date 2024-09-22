import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

const CollaborativeCodingWithVideo = ({ roomName, displayName, isInterviewer }) => {
  const jitsiContainerRef = useRef(null);
  const [showEditor, setShowEditor] = useState(false); // Toggle for code editor
  const [joined, setJoined] = useState(false); // Tracks if the participant has joined
  const [code, setCode] = useState('// Write your code here...');
  const [output, setOutput] = useState('');
  const ws = useRef(null); // WebSocket reference

  useEffect(() => {
    // Initialize WebSocket connection
    ws.current = new WebSocket('ws://localhost:8080'); // Use your WebSocket server URL
    ws.current.onopen = () => console.log('WebSocket connection established');

    ws.current.onmessage = (message) => {
      const receivedData = JSON.parse(message.data);
      if (receivedData.roomName === roomName && !isInterviewer) {
        setCode(receivedData.code); // Only update for interviewer
      }
    };

    return () => {
      ws.current.close(); // Clean up WebSocket connection on component unmount
    };
  }, [roomName, isInterviewer]);

  useEffect(() => {
    // Jitsi Video Call Integration
    const loadJitsiScript = () => {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsiMeetAPI();
      document.body.appendChild(script);
    };

    const initializeJitsiMeetAPI = () => {
      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName || 'TestRoom',
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: displayName || 'Guest',
        },
        configOverwrite: {
          startWithVideoMuted: false, // Video is shown before joining
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      // Event listener for when a participant joins
      api.addListener('participantJoined', () => {
        setJoined(true); // Enable code writing after joining
        setShowEditor(true); // Show editor after joining
      });

      return () => api.dispose();
    };

    if (window.JitsiMeetExternalAPI) {
      initializeJitsiMeetAPI();
    } else {
      loadJitsiScript();
    }
  }, [roomName, displayName]);

  const handleCodeChange = (value) => {
    setCode(value);

    // Send updated code to WebSocket server for interviewer
    ws.current.send(
      JSON.stringify({
        roomName,
        code: value,
      })
    );
  };

  const executeCode = () => {
    try {
      const result = eval(code); // Evaluate JavaScript code (only for JS, avoid in prod)
      setOutput(result.toString());
    } catch (err) {
      setOutput('Error: ' + err.message);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
      {/* Video Call Section */}
      <div style={{ flex: 1, padding: '10px', position: 'relative' }}>
        <h2>Video Call</h2>
        <div ref={jitsiContainerRef} style={{ height: '400px', width: '100%' }} />

        {/* Picture-in-picture for both interviewer and participant */}
        {joined && (
          <div
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              width: '150px',
              height: '150px',
              border: '1px solid black',
              backgroundColor: '#000', // Dark background
              zIndex: 10, // Appear on top of the main video
            }}
          >
            <h3 style={{ color: '#fff', textAlign: 'center' }}>
              {isInterviewer ? 'Participant' : 'Interviewer'}
            </h3>
            {/* Placeholder for the second video feed */}
          </div>
        )}
      </div>

      {/* Button to Toggle Code Editor (Only after joining) */}
      {joined && (
        <div style={{ padding: '10px' }}>
          <button onClick={() => setShowEditor(!showEditor)}>
            {showEditor ? 'Hide Code Editor' : 'Show Code Editor'}
          </button>
        </div>
      )}

      {/* Conditional Rendering of CodeMirror */}
      {showEditor && (
        <div style={{ flex: 1, padding: '10px' }}>
          <h2>{isInterviewer ? 'Viewing Code' : 'Write and Execute Code'}</h2>
          <CodeMirror
            value={code}
            height="400px"
            theme={oneDark}
            extensions={[javascript()]} // Apply JavaScript syntax highlighting
            onChange={!isInterviewer ? handleCodeChange : undefined}
            editable={!isInterviewer}
          />

          {/* Execute Code Button for Participant */}
          {!isInterviewer && (
            <div>
              <button onClick={executeCode}>Run Code</button>
            </div>
          )}

          {/* Output Section */}
          <div>
            <h3>Output:</h3>
            <pre>{output}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCodingWithVideo;
