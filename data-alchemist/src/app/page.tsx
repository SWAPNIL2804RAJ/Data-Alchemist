'use client';

import React, { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import EditableTable from '@/components/EditableTable';
import { ColumnDef } from '@tanstack/react-table';
import { Client, Worker, Task } from '@/types';

interface Rule {
  field: string;
  operator: 'equals' | 'includes' | 'gt' | 'lt';
  value: string;
  weight: number;
}

export default function Home() {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientErrors, setClientErrors] = useState<Record<number, string[]>>({});
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState<'clients' | 'workers' | 'tasks'>('clients');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  const [rules, setRules] = useState<Rule[]>([]);
  const [newRule, setNewRule] = useState<Rule>({ field: '', operator: 'equals', value: '', weight: 1 });

  const validateClients = (data: Client[]) => {
    const errors: Record<number, string[]> = {};
    data.forEach((row, index) => {
      const rowErrors: string[] = [];
      if (!row.ClientID?.trim()) rowErrors.push("Missing ClientID");
      if (!row.ClientName?.trim()) rowErrors.push("Missing ClientName");
      const priority = parseInt(row.PriorityLevel);
      if (isNaN(priority) || priority < 1 || priority > 5) rowErrors.push("Invalid Priority (1-5)");
      if (rowErrors.length > 0) errors[index] = rowErrors;
    });
    return errors;
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) return;

    const selectedData =
      target === 'clients' ? clients :
      target === 'workers' ? workers :
      tasks;

    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, data: selectedData, target }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('❌ Failed to fetch result:', errorText);
        alert('AI query failed. Please check your request or API key.');
        return;
      }

      const json = await res.json();

      if (target === 'clients') setFilteredClients(json.filtered);
      if (target === 'workers') setFilteredWorkers(json.filtered);
      if (target === 'tasks') setFilteredTasks(json.filtered);

      console.log('📊 Filtered Results:', json.filtered);
    } catch (error) {
      console.error('❌ Error:', error);
      alert('Something went wrong while processing your request.');
    }
  };

  const handleAddRule = () => {
    if (!newRule.field || !newRule.value || !newRule.weight) return;
    setRules([...rules, newRule]);
    setNewRule({ field: '', operator: 'equals', value: '', weight: 1 });
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleApplyRules = () => {
    const data = target === 'clients' ? clients : target === 'workers' ? workers : tasks;

    const scored = data
      .map((item) => {
        let score = 0;
        for (const rule of rules) {
          const val = (item as any)[rule.field];
          if (val === undefined) continue;

          const match =
            (rule.operator === 'equals' && String(val) === rule.value) ||
            (rule.operator === 'includes' && String(val).includes(rule.value)) ||
            (rule.operator === 'gt' && parseFloat(val) > parseFloat(rule.value)) ||
            (rule.operator === 'lt' && parseFloat(val) < parseFloat(rule.value));

          if (match) score += rule.weight;
        }
        return { ...item, _score: score };
      })
      .filter((item) => item._score > 0)
      .sort((a, b) => b._score - a._score);

    if (target === 'clients') setFilteredClients(scored as Client[]);
    if (target === 'workers') setFilteredWorkers(scored as Worker[]);
    if (target === 'tasks') setFilteredTasks(scored as Task[]);
  };

  const renderRuleBuilder = () => {
    const fields = target === 'clients'
      ? ['ClientID', 'ClientName', 'PriorityLevel']
      : target === 'workers'
        ? ['WorkerID', 'WorkerName', 'Skills', 'AvailableSlots', 'MaxLoadPerPhase']
        : ['TaskID', 'TaskName', 'Category', 'Duration', 'RequiredSkills', 'PreferredPhases', 'MaxConcurrent'];

    return (
      <div className="mt-4">
        <h3 className="text-md font-semibold text-black mb-2">Manual Rule Builder</h3>

        <div className="flex flex-wrap gap-2 items-center text-black mb-4">
          <select
            value={newRule.field}
            onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="">Select Field</option>
            {fields.map((field) => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>

          <select
            value={newRule.operator}
            onChange={(e) => setNewRule({ ...newRule, operator: e.target.value as Rule['operator'] })}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="equals">equals</option>
            <option value="includes">includes</option>
            <option value="gt">greater than</option>
            <option value="lt">less than</option>
          </select>

          <input
            type="text"
            value={newRule.value}
            onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
            placeholder="Enter value"
            className="border px-2 py-1 rounded text-sm"
          />

          <input
            type="number"
            value={newRule.weight}
            onChange={(e) => setNewRule({ ...newRule, weight: Number(e.target.value) })}
            placeholder="Weight"
            className="border px-2 py-1 rounded text-sm w-20"
          />

          <button onClick={handleAddRule} className="bg-gray-800 text-white px-3 py-1 rounded cursor-pointer">
            Add Rule
          </button>
          <button onClick={handleApplyRules} className="bg-green-600 text-white px-3 py-1 rounded cursor-pointer">
  Apply Rules
</button>

        </div>

        <div className="space-y-2">
          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-center justify-between border p-2 rounded bg-white shadow-sm w-full max-w-md">
              <span className="text-sm text-gray-800">
                {rule.field} {rule.operator} "{rule.value}" (Weight: {rule.weight})
              </span>
              <button
                onClick={() => handleDeleteRule(idx)}
                className="text-red-600 text-lg hover:text-red-800 cursor-pointer"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const clientColumns: ColumnDef<Client>[] = [
    { accessorKey: 'ClientID', header: 'Client ID' },
    { accessorKey: 'ClientName', header: 'Client Name' },
    { accessorKey: 'PriorityLevel', header: 'Priority' },
  ];

  const workerColumns: ColumnDef<Worker>[] = [
    { accessorKey: 'WorkerID', header: 'Worker ID' },
    { accessorKey: 'WorkerName', header: 'Worker Name' },
    { accessorKey: 'Skills', header: 'Skills' },
    { accessorKey: 'AvailableSlots', header: 'Available Slots' },
    { accessorKey: 'MaxLoadPerPhase', header: 'Max Load/Phase' },
  ];

  const taskColumns: ColumnDef<Task>[] = [
    { accessorKey: 'TaskID', header: 'Task ID' },
    { accessorKey: 'TaskName', header: 'Task Name' },
    { accessorKey: 'Category', header: 'Category' },
    { accessorKey: 'Duration', header: 'Duration' },
    { accessorKey: 'RequiredSkills', header: 'Required Skills' },
    { accessorKey: 'PreferredPhases', header: 'Preferred Phases' },
    { accessorKey: 'MaxConcurrent', header: 'Max Concurrent' },
  ];

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-neutral-950">📊 Data Alchemist</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUpload
          label="Upload Clients CSV"
          onDataParsed={(data) => {
            setClients(data);
            setClientErrors(validateClients(data));
            setFilteredClients([]);
          }}
        />
        <FileUpload label="Upload Workers CSV" onDataParsed={(data) => {
          setWorkers(data);
          setFilteredWorkers([]);
        }} />
        <FileUpload label="Upload Tasks CSV" onDataParsed={(data) => {
          setTasks(data);
          setFilteredTasks([]);
        }} />
      </div>

      {(clients.length || workers.length || tasks.length) > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-black">Ask a Question</h2>

          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              placeholder='e.g. Show all workers skilled in "Plumbing"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-gray-400 px-3 py-2 rounded w-full text-sm text-gray-900"
            />

            <select
              value={target}
              onChange={(e) => setTarget(e.target.value as 'clients' | 'workers' | 'tasks')}
              className="border border-gray-400 px-2 py-2 rounded text-sm text-gray-900"
            >
              <option value="clients">Clients</option>
              <option value="workers">Workers</option>
              <option value="tasks">Tasks</option>
            </select>

            <button
              onClick={handleQuerySubmit}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Ask
            </button>
          </div>

          {renderRuleBuilder()}
        </section>
      )}

      {clients.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-black">Clients Data</h2>
          <EditableTable
            data={filteredClients.length ? filteredClients : clients}
            columns={clientColumns}
            errors={clientErrors}
          />
        </section>
      )}

      {workers.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-black">Workers Data</h2>
          <EditableTable
            data={filteredWorkers.length ? filteredWorkers : workers}
            columns={workerColumns}
          />
        </section>
      )}

      {tasks.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-black">Tasks Data</h2>
          <EditableTable
            data={filteredTasks.length ? filteredTasks : tasks}
            columns={taskColumns}
          />
        </section>
      )}
    </main>
  );
}