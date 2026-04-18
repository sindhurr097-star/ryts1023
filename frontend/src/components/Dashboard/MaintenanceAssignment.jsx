import React, { useState, useEffect } from 'react';
import { User, Wrench, Clock, CheckCircle, XCircle, AlertCircle, ArrowRight } from 'lucide-react';
import {
  getEngineers,
  autoAssignMaintenance,
  manualAssignMaintenance,
  reassignMaintenance,
  completeMaintenance,
  cancelMaintenance,
  getMaintenanceAssignments,
  getAssignmentsByStatus,
  updateEngineerAvailability
} from '../../services/maintenanceService';

const MaintenanceAssignment = ({ machineId, machineLabel, costAnalysis }) => {
  const [assignments, setAssignments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [notes, setNotes] = useState('');
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignAssignmentId, setReassignAssignmentId] = useState('');
  const [reassignEngineerId, setReassignEngineerId] = useState('');

  useEffect(() => {
    setEngineers(getEngineers());
    setAssignments(getMaintenanceAssignments());
  }, []);

  const handleAutoAssign = () => {
    const priority = costAnalysis?.recommendation === 'Fix Immediately' ? 'critical' : 
                    costAnalysis?.recommendation === 'Schedule Soon' ? 'high' : 'medium';
    
    const assignment = autoAssignMaintenance(machineId, machineLabel, priority, costAnalysis);
    if (assignment) {
      setAssignments(getMaintenanceAssignments());
      setEngineers(getEngineers());
    }
  };

  const handleManualAssign = () => {
    if (!selectedEngineer) return;
    
    const priority = costAnalysis?.recommendation === 'Fix Immediately' ? 'critical' : 
                    costAnalysis?.recommendation === 'Schedule Soon' ? 'high' : 'medium';
    
    const assignment = manualAssignMaintenance(selectedEngineer, machineId, machineLabel, priority, costAnalysis);
    if (assignment) {
      setAssignments(getMaintenanceAssignments());
      setEngineers(getEngineers());
      setShowAssignModal(false);
      setSelectedEngineer('');
    }
  };

  const handleReassign = () => {
    if (!reassignEngineerId || !reassignAssignmentId) return;
    
    const assignment = reassignMaintenance(reassignAssignmentId, reassignEngineerId);
    if (assignment) {
      setAssignments(getMaintenanceAssignments());
      setEngineers(getEngineers());
      setShowReassignModal(false);
      setReassignAssignmentId('');
      setReassignEngineerId('');
    }
  };

  const handleComplete = (assignmentId) => {
    const assignment = completeMaintenance(assignmentId, notes);
    if (assignment) {
      setAssignments(getMaintenanceAssignments());
      setEngineers(getEngineers());
      setNotes('');
    }
  };

  const handleCancel = (assignmentId) => {
    const assignment = cancelMaintenance(assignmentId, notes);
    if (assignment) {
      setAssignments(getMaintenanceAssignments());
      setEngineers(getEngineers());
      setNotes('');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-danger bg-red-50 border-red-200';
      case 'high': return 'text-warning bg-yellow-50 border-yellow-200';
      case 'medium': return 'text-primary bg-blue-50 border-blue-200';
      default: return 'text-textMuted bg-gray-50 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned': return 'text-primary bg-blue-50 border-blue-200';
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'cancelled': return 'text-textMuted bg-gray-50 border-gray-200';
      default: return 'text-textMuted bg-gray-50 border-gray-200';
    }
  };

  const machineAssignments = assignments.filter(a => a.machineId === machineId);

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Wrench size={20} className="text-primary" />
        <h3 className="font-semibold text-textPrimary">Maintenance Assignment</h3>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleAutoAssign}
          className="flex-1 bg-primary text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Auto Assign
        </button>
        <button
          onClick={() => setShowAssignModal(true)}
          className="flex-1 bg-gray-100 text-textPrimary px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          Manual Assign
        </button>
      </div>

      {/* Machine Assignments */}
      {machineAssignments.length > 0 ? (
        <div className="space-y-3">
          {machineAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {assignment.engineerAvatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-textPrimary">{assignment.engineerName}</div>
                    <div className="text-xs text-textMuted">{assignment.engineerId}</div>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(assignment.status)}`}>
                  {assignment.status}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(assignment.priority)}`}>
                  {assignment.priority}
                </span>
                <div className="text-xs text-textMuted">
                  {new Date(assignment.assignedAt).toLocaleString()}
                </div>
              </div>

              {assignment.status === 'assigned' && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => {
                      setReassignAssignmentId(assignment.id);
                      setShowReassignModal(true);
                    }}
                    className="flex-1 text-xs bg-gray-200 text-textPrimary px-2 py-1 rounded hover:bg-gray-300 transition-colors"
                  >
                    Reassign
                  </button>
                  <button
                    onClick={() => handleComplete(assignment.id)}
                    className="flex-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  >
                    Complete
                  </button>
                  <button
                    onClick={() => handleCancel(assignment.id)}
                    className="flex-1 text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-textMuted text-center py-4 bg-gray-50 rounded-lg">
          No maintenance assignments for this machine
        </div>
      )}

      {/* Manual Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-textPrimary mb-4">Assign Engineer</h3>
            <div className="space-y-3">
              {getEngineers().map((engineer) => (
                <button
                  key={engineer.id}
                  onClick={() => setSelectedEngineer(engineer.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border ${
                    selectedEngineer === engineer.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {engineer.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-textPrimary">{engineer.name}</div>
                    <div className="text-xs text-textMuted">
                      {engineer.expertise.join(', ')} • Workload: {engineer.workload}
                    </div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    engineer.availability === 'available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-textMuted'
                  }`}>
                    {engineer.availability}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedEngineer('');
                }}
                className="flex-1 bg-gray-200 text-textPrimary px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleManualAssign}
                disabled={!selectedEngineer}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reassign Modal */}
      {showReassignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-semibold text-textPrimary mb-4">Reassign to Different Engineer</h3>
            <div className="space-y-3">
              {getEngineers().map((engineer) => (
                <button
                  key={engineer.id}
                  onClick={() => setReassignEngineerId(engineer.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border ${
                    reassignEngineerId === engineer.id
                      ? 'border-primary bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                    {engineer.avatar}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-textPrimary">{engineer.name}</div>
                    <div className="text-xs text-textMuted">
                      {engineer.expertise.join(', ')} • Workload: {engineer.workload}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowReassignModal(false);
                  setReassignAssignmentId('');
                  setReassignEngineerId('');
                }}
                className="flex-1 bg-gray-200 text-textPrimary px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!reassignEngineerId}
                className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceAssignment;
