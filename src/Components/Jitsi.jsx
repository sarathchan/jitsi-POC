import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { oneDark } from '@codemirror/theme-one-dark';
import './CollaborativeCodingWithVideo.css';

const CollaborativeCodingWithVideo = ({ roomName, displayName, isInterviewer }) => {
    const jitsiContainerRef = useRef(null);
    const editorRef = useRef(null);
    const [showEditor, setShowEditor] = useState(false);
    const [joined, setJoined] = useState(false);
    const [code, setCode] = useState('// Write your code here...');
    const [output, setOutput] = useState('');
    const ws = useRef(null);
    const [api, setApi] = useState(null);
    const [language, setLanguage] = useState('javascript'); // Default language

    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:8090'); // WebSocket URL
        ws.current.onopen = () => console.log('Connected to channel');

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
                    filmStripOnly: false,
                },
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
            // Sending code to the backend API for execution
            const response = await fetch(`http://localhost:8080/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language }),
            });

            const data = await response.json();
            result = data.output || 'Error: ' + data.error;
        } catch (err) {
            result = 'Error: ' + err.message;
        }
        setOutput(result.toString());
    };

    // Resizing the editor
    const startResize = (e) => {
        const editorContainer = editorRef.current;
        const startX = e.clientX;
        const startWidth = editorContainer.offsetWidth;

        const doDrag = (e) => {
            editorContainer.style.width = `${startWidth + e.clientX - startX}px`;
        };

        const stopResize = () => {
            document.removeEventListener('mousemove', doDrag);
            document.removeEventListener('mouseup', stopResize);
        };

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopResize);
    };

    return (
        <div className="collaborative-coding">
            <div ref={jitsiContainerRef} className={`jitsi-container ${showEditor ? 'editor-opened' : ''}`} />

            {joined && (
                <div className="editor-toggle">
                    <button onClick={() => setShowEditor(!showEditor)}>
                        {showEditor ? 'Hide Code Editor' : 'Show Code Editor'}
                    </button>
                </div>
            )}

            {showEditor && (
                <div ref={editorRef} className="code-editor-container">
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
                        extensions={[
                            language === 'javascript' ? javascript() :
                            language === 'python' ? python() :
                            language === 'java' ? java() :
                            ''
                        ]}
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

                    <div className="resize-handle" onMouseDown={startResize} />
                </div>
            )}
        </div>
    );
};

export default CollaborativeCodingWithVideo;
