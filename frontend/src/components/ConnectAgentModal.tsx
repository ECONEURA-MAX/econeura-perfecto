import React from 'react';

interface ConnectAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect?: (agentData: any) => void;
}

export function ConnectAgentModal({ isOpen, onClose, onConnect }: ConnectAgentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 className="text-xl font-bold mb-4">Connect Agent</h3>
        <p className="text-gray-600 mb-4">Agent connection interface</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Close
        </button>
      </div>
    </div>
  );
}
