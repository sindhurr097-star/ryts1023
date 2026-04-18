// Engineer data model
const ENGINEERS = [
  {
    id: 'ENG_001',
    name: 'John Smith',
    expertise: ['CNC', 'HVAC'],
    workload: 0,
    availability: 'available',
    avatar: 'JS'
  },
  {
    id: 'ENG_002',
    name: 'Sarah Johnson',
    expertise: ['CNC', 'PUMP'],
    workload: 0,
    availability: 'available',
    avatar: 'SJ'
  },
  {
    id: 'ENG_003',
    name: 'Mike Williams',
    expertise: ['HVAC', 'ELECTRICAL'],
    workload: 0,
    availability: 'available',
    avatar: 'MW'
  },
  {
    id: 'ENG_004',
    name: 'Emily Davis',
    expertise: ['PUMP', 'MECHANICAL'],
    workload: 0,
    availability: 'available',
    avatar: 'ED'
  }
];

// Machine type to expertise mapping
const MACHINE_EXPERTISE_MAP = {
  CNC_01: 'CNC',
  CNC_02: 'CNC',
  HVAC_01: 'HVAC',
  PUMP_01: 'PUMP'
};

// Maintenance assignments state
let maintenanceAssignments = [];
let assignmentIdCounter = 1;

/**
 * Get all engineers
 */
export const getEngineers = () => {
  return ENGINEERS;
};

/**
 * Get engineer by ID
 */
export const getEngineerById = (engineerId) => {
  return ENGINEERS.find(eng => eng.id === engineerId);
};

/**
 * Get available engineers for a specific machine type
 */
export const getAvailableEngineersForMachine = (machineId) => {
  const requiredExpertise = MACHINE_EXPERTISE_MAP[machineId];
  if (!requiredExpertise) {
    return ENGINEERS.filter(eng => eng.availability === 'available');
  }
  
  return ENGINEERS.filter(eng => 
    eng.availability === 'available' && 
    eng.expertise.includes(requiredExpertise)
  );
};

/**
 * Automatically assign maintenance to an engineer
 * Uses workload-based assignment (assigns to engineer with lowest workload)
 */
export const autoAssignMaintenance = (machineId, machineLabel, priority, costAnalysis) => {
  const availableEngineers = getAvailableEngineersForMachine(machineId);
  
  if (availableEngineers.length === 0) {
    // No available engineers, fallback to all engineers
    const allEngineers = ENGINEERS.filter(eng => eng.expertise.includes(MACHINE_EXPERTISE_MAP[machineId]));
    if (allEngineers.length === 0) {
      return null; // No suitable engineers found
    }
    // Assign to engineer with lowest workload
    const assignedEngineer = allEngineers.reduce((min, eng) => 
      eng.workload < min.workload ? eng : min
    , allEngineers[0]);
    
    return createAssignment(assignedEngineer, machineId, machineLabel, priority, costAnalysis);
  }
  
  // Assign to available engineer with lowest workload
  const assignedEngineer = availableEngineers.reduce((min, eng) => 
    eng.workload < min.workload ? eng : min
  , availableEngineers[0]);
  
  return createAssignment(assignedEngineer, machineId, machineLabel, priority, costAnalysis);
};

/**
 * Manually assign maintenance to a specific engineer
 */
export const manualAssignMaintenance = (engineerId, machineId, machineLabel, priority, costAnalysis) => {
  const engineer = getEngineerById(engineerId);
  if (!engineer) {
    return null;
  }
  
  return createAssignment(engineer, machineId, machineLabel, priority, costAnalysis);
};

/**
 * Create a maintenance assignment
 */
const createAssignment = (engineer, machineId, machineLabel, priority, costAnalysis) => {
  const assignment = {
    id: `ASSIGN_${assignmentIdCounter++}`,
    engineerId: engineer.id,
    engineerName: engineer.name,
    engineerAvatar: engineer.avatar,
    machineId,
    machineLabel,
    priority,
    costAnalysis,
    status: 'assigned',
    assignedAt: new Date().toISOString(),
    estimatedCompletion: null,
    notes: ''
  };
  
  // Update engineer workload
  engineer.workload += 1;
  
  // Add to assignments
  maintenanceAssignments.push(assignment);
  
  return assignment;
};

/**
 * Reassign maintenance to a different engineer
 */
export const reassignMaintenance = (assignmentId, newEngineerId) => {
  const assignment = maintenanceAssignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return null;
  }
  
  const newEngineer = getEngineerById(newEngineerId);
  if (!newEngineer) {
    return null;
  }
  
  // Decrease workload of old engineer
  const oldEngineer = getEngineerById(assignment.engineerId);
  if (oldEngineer) {
    oldEngineer.workload = Math.max(0, oldEngineer.workload - 1);
  }
  
  // Update assignment
  assignment.engineerId = newEngineer.id;
  assignment.engineerName = newEngineer.name;
  assignment.engineerAvatar = newEngineer.avatar;
  assignment.reassignedAt = new Date().toISOString();
  
  // Increase workload of new engineer
  newEngineer.workload += 1;
  
  return assignment;
};

/**
 * Complete maintenance assignment
 */
export const completeMaintenance = (assignmentId, completionNotes = '') => {
  const assignment = maintenanceAssignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return null;
  }
  
  // Update assignment status
  assignment.status = 'completed';
  assignment.completedAt = new Date().toISOString();
  assignment.notes = completionNotes;
  
  // Decrease engineer workload
  const engineer = getEngineerById(assignment.engineerId);
  if (engineer) {
    engineer.workload = Math.max(0, engineer.workload - 1);
  }
  
  return assignment;
};

/**
 * Cancel maintenance assignment
 */
export const cancelMaintenance = (assignmentId, reason = '') => {
  const assignment = maintenanceAssignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return null;
  }
  
  // Update assignment status
  assignment.status = 'cancelled';
  assignment.cancelledAt = new Date().toISOString();
  assignment.notes = reason;
  
  // Decrease engineer workload
  const engineer = getEngineerById(assignment.engineerId);
  if (engineer) {
    engineer.workload = Math.max(0, engineer.workload - 1);
  }
  
  return assignment;
};

/**
 * Get all maintenance assignments
 */
export const getMaintenanceAssignments = () => {
  return maintenanceAssignments;
};

/**
 * Get assignments by status
 */
export const getAssignmentsByStatus = (status) => {
  return maintenanceAssignments.filter(a => a.status === status);
};

/**
 * Get assignments by engineer
 */
export const getAssignmentsByEngineer = (engineerId) => {
  return maintenanceAssignments.filter(a => a.engineerId === engineerId);
};

/**
 * Get assignments by machine
 */
export const getAssignmentsByMachine = (machineId) => {
  return maintenanceAssignments.filter(a => a.machineId === machineId);
};

/**
 * Update engineer availability
 */
export const updateEngineerAvailability = (engineerId, availability) => {
  const engineer = getEngineerById(engineerId);
  if (engineer) {
    engineer.availability = availability;
    return engineer;
  }
  return null;
};

/**
 * Reset all assignments (for testing)
 */
export const resetAssignments = () => {
  maintenanceAssignments = [];
  assignmentIdCounter = 1;
  ENGINEERS.forEach(eng => {
    eng.workload = 0;
    eng.availability = 'available';
  });
};
