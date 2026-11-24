"use client";

import { memo, useEffect, useRef, useState } from "react";
import { Button, DatePicker, Input, Select } from "antd";
import { RotateCcw, Search } from "lucide-react";
import dayjs from "dayjs";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const { RangePicker } = DatePicker;

export interface FilterSelect {
  key: string;
  placeholder: string;
  value?: string;
  options: { label: string; value: string }[];
  loading?: boolean;
  onChange: (value?: string) => void;
}

interface FilterBarProps {
  search: string;
  searchPlaceholder?: string;
  onSearchChange: (value: string) => void;
  selects?: FilterSelect[];
  dateFrom?: string;
  dateTo?: string;
  onDateChange: (from?: string, to?: string) => void;
  sortValue: string;
  sortOptions: { label: string; value: string }[];
  onSortChange: (value: string) => void;
  onReset: () => void;
  canReset: boolean;
}

/**
 * Search (debounced 400 ms), dropdown filters, created-date range and sort.
 * The text box keeps its own state so typing never re-renders the table; only the
 * debounced value is lifted to the parent, which is what triggers a request.
 */
function FilterBar({
  search,
  searchPlaceholder = "Search",
  onSearchChange,
  selects = [],
  dateFrom,
  dateTo,
  onDateChange,
  sortValue,
  sortOptions,
  onSortChange,
  onReset,
  canReset,
}: FilterBarProps) {
  const [text, setText] = useState(search);
  const debounced = useDebouncedValue(text, 400);
  const searchRef = useRef(search);
  searchRef.current = search;

  useEffect(() => {
    const next = debounced.trim();
    if (next !== searchRef.current) onSearchChange(next);
  }, [debounced, onSearchChange]);

  const handleReset = () => {
    setText("");
    onReset();
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <Input
        allowClear
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={searchPlaceholder}
        prefix={<Search size={16} className="text-text-light" />}
        className="w-full sm:w-72"
        aria-label={searchPlaceholder}
      />

      {selects.map((select) => (
        <Select
          key={select.key}
          allowClear
          showSearch
          optionFilterProp="label"
          value={select.value}
          placeholder={select.placeholder}
          options={select.options}
          loading={select.loading}
          onChange={(value?: string) => select.onChange(value)}
          className="w-full sm:w-48"
          aria-label={select.placeholder}
        />
      ))}

      <RangePicker
        className="w-full sm:w-64"
        value={dateFrom && dateTo ? [dayjs(dateFrom), dayjs(dateTo)] : null}
        onChange={(_, strings) => (strings[0] && strings[1] ? onDateChange(strings[0], strings[1]) : onDateChange())}
        placeholder={["Added from", "Added to"]}
      />

      <Select
        value={sortValue}
        options={sortOptions}
        onChange={onSortChange}
        className="w-full sm:w-48"
        aria-label="Sort by"
      />

      <Button icon={<RotateCcw size={14} />} onClick={handleReset} disabled={!canReset && !text}>
        Reset
      </Button>
    </div>
  );
}

export default memo(FilterBar);
