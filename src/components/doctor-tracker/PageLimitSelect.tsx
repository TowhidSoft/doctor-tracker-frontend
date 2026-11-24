'use client';

import { Select } from 'antd';

interface PageLimitSelectProps {
  value: number;
  onChange: (limit: number) => void;
}

const LIMIT_OPTIONS = [10, 20, 30, 50, 100];

/**
 * Left-corner "N / page" selector to pair with antd Table's right-corner
 * pagination. Keep this in sync anywhere a dashboard list table is rendered.
 */
export default function PageLimitSelect({ value, onChange }: PageLimitSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500">Show</span>
      <Select
        value={value}
        onChange={onChange}
        options={LIMIT_OPTIONS.map((n) => ({ label: `${n} / page`, value: n }))}
        size="middle"
        style={{ width: 120 }}
      />
    </div>
  );
}
