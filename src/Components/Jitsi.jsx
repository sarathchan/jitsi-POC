import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import './CollaborativeCodingWithVideo.css'; // Import your CSS file for styles

const CollaborativeCodingWithVideo = ({ roomName, displayName, isInterviewer }) => {
    const jitsiContainerRef = useRef(null);
    const [showEditor, setShowEditor] = useState(false);
    const [joined, setJoined] = useState(false);
    const [code, setCode] = useState('// Write your code here...');
    const [output, setOutput] = useState('');
    const ws = useRef(null);
    const [api, setApi] = useState(null);
    const [language, setLanguage] = useState('javascript'); // Default language

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8090'); // WebSocket URL
        ws.current.onopen = () => console.log('COnnected Chan');

        ws.current.onmessage = (message) => {
            const receivedData = JSON.parse(message.data);
            if (receivedData.roomName === roomName) {
             
                setCode(receivedData.code);
            }
        };

        return () => {
            ws.current.close();
        };
    }, [roomName]);
    console.log(roomName,"channn",code)

    useEffect(() => {
        const loadJitsiScript = () => {
            const script = document.createElement('script');
            script.src = 'https://8x8.vc/vpaas-magic-cookie-b03fcc221553405c8ba6f97372ff2878/external_api.js';
            script.async = true;
            script.onload = () => initializeJitsiMeetAPI();
            document.body.appendChild(script);
        };

        const initializeJitsiMeetAPI = () => {
            const domain = '8x8.vc';
            const options = {
                roomName: roomName || 'defaultRoom',
                width: '100%',
                height: '100%',
                parentNode: jitsiContainerRef.current,
                userInfo: {
                    displayName: displayName || 'Guest',
                },
                configOverwrite: {
                    startWithVideoMuted: true,
                },
                interfaceConfigOverwrite: {
                    filmStripOnly: true,
                }
            };

            const apiInstance = new window.JitsiMeetExternalAPI(domain, options);
            setApi(apiInstance);

            apiInstance.addListener('participantJoined', () => {
                setJoined(true);
                setShowEditor(true);
            });

            return () => apiInstance.dispose();
        };

        if (window.JitsiMeetExternalAPI) {
            initializeJitsiMeetAPI();
        } else {
            loadJitsiScript();
        }
    }, [roomName, displayName]);

    const handleCodeChange = (value) => {
        setCode(value);
        ws.current.send(
            JSON.stringify({
                roomName,
                code: value,
            })
        );
    };

    const executeCode = async () => {
        let result;
        try {
            if (language === 'javascript') {
                result = eval(code); // Evaluate JavaScript code
            } else {
                // Example for Python, C, and Java execution using an external API
                const response = await fetch(`YOUR_API_ENDPOINT`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code, language }),
                });

                const data = await response.json();
                result = data.output || 'Error: ' + data.error;
            }
        } catch (err) {
            result = 'Error: ' + err.message;
        }
        setOutput(result.toString());
    };

    return (
        <div className="collaborative-coding">
            <div className="video-call">
                <h2>Video Call</h2>
                <div ref={jitsiContainerRef} className="jitsi-container" />
            </div>

            {joined && (
                <div className="editor-toggle">
                    <button onClick={() => setShowEditor(!showEditor)}>
                        {showEditor ? 'Hide Code Editor' : 'Show Code Editor'}
                    </button>
                </div>
            )}

            {showEditor && (
                <div className="code-editor">
                    <h2>{isInterviewer ? 'Viewing Code' : 'Write and Execute Code'}</h2>
                    <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="c">C</option>
                    </select>

                    <CodeMirror
                        value={code}
                        height="400px"
                        theme={oneDark}
                        extensions={[javascript()]}
                        onChange={!isInterviewer ? handleCodeChange : undefined}
                        editable={!isInterviewer}
                    />

                    {!isInterviewer && (
                        <div>
                            <button onClick={executeCode}>Run Code</button>
                        </div>
                    )}

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
