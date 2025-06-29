import { Client } from '@/types';

export function validateClients(clients: Client[]): Record<number, string[]> {
  const errors: Record<number, string[]> = {};
  const seenIDs = new Set<string>();

  clients.forEach((client, index) => {
    const rowErrors: string[] = [];

    // Required fields
    if (!client.ClientID) rowErrors.push('Missing ClientID');
    if (!client.ClientName) rowErrors.push('Missing ClientName');
    if (!client.PriorityLevel) rowErrors.push('Missing PriorityLevel');

    // Duplicate IDs
    if (seenIDs.has(client.ClientID)) {
      rowErrors.push('Duplicate ClientID');
    } else {
      seenIDs.add(client.ClientID);
    }

    // Priority Level: should be between 1 and 5
    const priority = parseInt(client.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      rowErrors.push('Invalid PriorityLevel (1–5)');
    }

    // RequestedTaskIDs: Must be CSV of values
    if (client.RequestedTaskIDs && typeof client.RequestedTaskIDs === 'string') {
      const taskIDs = client.RequestedTaskIDs.split(',');
      if (taskIDs.some(id => id.trim() === '')) {
        rowErrors.push('Malformed RequestedTaskIDs');
      }
    }

    // AttributesJSON: Try parsing to JSON
    try {
      if (client.AttributesJSON && client.AttributesJSON.trim() !== '') {
        JSON.parse(client.AttributesJSON);
      }
    } catch {
      rowErrors.push('Invalid JSON in AttributesJSON');
    }

    if (rowErrors.length > 0) {
      errors[index] = rowErrors;
    }
  });

  return errors;
}
