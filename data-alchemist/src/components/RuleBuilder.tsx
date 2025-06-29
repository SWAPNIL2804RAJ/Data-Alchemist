// src/components/RuleBuilder.tsx
'use client';
import React, { useState } from 'react';

export interface Rule {
  field: string;
  operator: string;
  value: string;
}

interface RuleBuilderProps {
  fields: string[];
  onApplyRules: (rules: Rule[]) => void;
}

export default function RuleBuilder({ fields, onApplyRules }: RuleBuilderProps) {
  const [rules, setRules] = useState<Rule[]>([
    { field: '', operator: '', value: '' },
  ]);

  const updateRule = (index: number, key: keyof Rule, value: string) => {
    const newRules = [...rules];
    newRules[index][key] = value;
    setRules(newRules);
  };

  const addRule = () => {
    setRules([...rules, { field: '', operator: '', value: '' }]);
  };

  const removeRule = (index: number) => {
    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  const handleApply = () => {
    onApplyRules(rules.filter(rule => rule.field && rule.operator));
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="font-semibold text-black mb-2">🧩 Rule-Based Filter</h3>
      {rules.map((rule, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <select
            className="border px-2 py-1 text-sm text-black"
            value={rule.field}
            onChange={(e) => updateRule(index, 'field', e.target.value)}
          >
            <option value="">Field</option>
            {fields.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <select
            className="border px-2 py-1 text-sm text-black"
            value={rule.operator}
            onChange={(e) => updateRule(index, 'operator', e.target.value)}
          >
            <option value="">Operator</option>
            <option value="equals">equals</option>
            <option value="contains">contains</option>
            <option value="greater">greater than</option>
            <option value="less">less than</option>
          </select>
          <input
            className="border px-2 py-1 text-sm text-black"
            placeholder="Value"
            value={rule.value}
            onChange={(e) => updateRule(index, 'value', e.target.value)}
          />
          <button
            className="text-red-600"
            onClick={() => removeRule(index)}
          >
            ❌
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-600 text-white px-3 py-1 text-sm rounded"
          onClick={addRule}
        >
          ➕ Add Rule
        </button>
        <button
          className="bg-green-600 text-white px-3 py-1 text-sm rounded"
          onClick={handleApply}
        >
          ✅ Apply Filter
        </button>
      </div>
    </div>
  );
}
