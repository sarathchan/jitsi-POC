import React from 'react';
import CollaborativeCodingWithVideo from './Components/Jitsi';

function App() {
  // Define room name and display name
  const roomName = 'vpaas-magic-cookie-b03fcc221553405c8ba6f97372ff2878/SampleAppCorrectFollowingsHeadLess';
  const displayName = 'John Doe1'; // Change this to the participant's name dynamically if needed

  // Check if the URL contains the word '/interviewer'
  const isInterviewer = window.location.pathname.includes('/interviewer');

  return (
    <div className="App">
      {/* CollaborativeCodingWithVideo component with roomName, displayName, and isInterviewer props */}
      <CollaborativeCodingWithVideo
        roomName={roomName}
        displayName={displayName}
        isInterviewer={isInterviewer}
      />
    </div>
  );
}

export default App;
