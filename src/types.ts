// Clients table structure
export interface Client {
  ClientID: string;
  ClientName: string;
  PriorityLevel: string; // Expected to be stringified number: "1" to "5"
  RequestedTaskIDs?: string;   // e.g. "T001,T002"
  AttributesJSON?: string;     // JSON string (e.g. '{"region":"north"}')
}

// Workers table structure
export interface Worker {
  WorkerID: string;
  WorkerName: string;
  Skills: string;            // Comma-separated, e.g. "Plumbing,Painting"
  AvailableSlots: string;    // Stringified number
  MaxLoadPerPhase: string;   // Stringified number
}

// Tasks table structure
export interface Task {
  TaskID: string;
  TaskName: string;
  Category: string;
  Duration: string;           // Stringified number
  RequiredSkills: string;     // Comma-separated, e.g. "Welding,Carpentry"
  PreferredPhases: string;    // Comma-separated numbers, e.g. "1,2,3"
  MaxConcurrent: string;      // Stringified number
}

// Rule structure for manual rule-based filtering
export interface Rule {
  field: string;                      // Field to filter by
  operator: 'equals' | 'includes' | 'gt' | 'lt';  // Supported operators
  value: string;                      // String input value
}
