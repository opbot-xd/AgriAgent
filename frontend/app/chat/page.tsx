import React, { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  const [loading, setLoading] = useState(false);

  const handleResult = (result: any) => {
    console.log(result);
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Agricultural Assistant</h1>
      <ChatInterface
        onResult={handleResult}
        setLoading={setLoading}
        loading={loading}
      />
    </div>
  );
}