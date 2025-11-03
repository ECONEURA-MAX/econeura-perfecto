import React from 'react';

interface WorkflowManagerProps {
  workflows?: any[];
}

export function WorkflowManager({ workflows = [] }: WorkflowManagerProps) {
  return (
    <div className="p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Workflow Manager</h3>
      <p className="text-gray-600">Workflows: {workflows.length}</p>
    </div>
  );
}
