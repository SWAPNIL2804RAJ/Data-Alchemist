
import { Client } from '@/types';

export type ValidationResult = Record<number, string[]>;

export const validateClients = (clients: Client[]): ValidationResult => {
  const errors: ValidationResult = {};
  const clientIDs = new Set<string>();

  clients.forEach((client, index) => {
    const rowErrors: string[] = [];

    if (!client.ClientID || client.ClientID.trim() === '') {
      rowErrors.push('ClientID is missing');
    } else if (clientIDs.has(client.ClientID)) {
      rowErrors.push('Duplicate ClientID');
    } else {
      clientIDs.add(client.ClientID);
    }

    if (!client.ClientName || client.ClientName.trim() === '') {
      rowErrors.push('ClientName is missing');
    }

    const priority = parseInt(client.PriorityLevel);
    if (isNaN(priority) || priority < 1 || priority > 5) {
      rowErrors.push('PriorityLevel must be between 1 and 5');
    }

    if (rowErrors.length > 0) {
      errors[index] = rowErrors;
    }
  });

  return errors;
};
