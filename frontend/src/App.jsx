import React, { useEffect, useState } from 'react';
import { useWs } from './hooks/useWs'; // Adjust the import path as necessary

const App = () => {
  const inputRef = React.useRef(null);
  const [isReady, val, send] = useWs('ws://localhost:3000');

  const sendMessage = message => {
    if (isReady) {
      send(message);
    }
  };
  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">
          WebSocket Status: {isReady ? 'Connected' : 'Disconnected'}
        </h2>
      </div>
      <div className="mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => sendMessage(inputRef.current.value)}
        >
          Send Test Message
        </button>
        <label className="ml-4">Send Message:</label>
        <input
          ref={inputRef}
          type="text"
          className="ml-4 border border-solid border-gray-500 p-2 rounded"
        />
      </div>
      <div className="border rounded p-4">
        <h3 className="font-bold mb-2">Messages:</h3>
        <ul>{val}</ul>
      </div>
    </div>
  );
};

export default App;
