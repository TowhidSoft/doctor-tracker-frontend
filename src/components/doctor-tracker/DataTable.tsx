"use client";

import { memo } from "react";
import { Empty, Pagination, Table, TableColumnsType } from "antd";
import PageLimitSelect from "@/components/doctor-tracker/PageLimitSelect";
import type { ApiMeta } from "@/redux/service/admin/doctorApi";

interface DataTableProps<T extends { id: string }> {
  columns: TableColumnsType<T>;
  data: T[];
  /** Pass `isFetching`, so the previous rows stay visible (dimmed) while a new page loads. */
  loading: boolean;
  meta?: ApiMeta | null;
  page: number;
  limit: number;
  onPageChange: (page: number, limit: number) => void;
  onLimitChange: (limit: number) => void;
  scrollX?: number;
  onRowClick?: (row: T) => void;
  emptyTitle?: string;
  emptyHint?: string;
}

function DataTable<T extends { id: string }>({
  columns,
  data,
  loading,
  meta,
  page,
  limit,
  onPageChange,
  onLimitChange,
  scrollX = 900,
  onRowClick,
  emptyTitle = "Nothing to show",
  emptyHint = "Try changing or resetting the filters.",
}: DataTableProps<T>) {
  const total = meta?.total ?? 0;

  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white">
      <Table<T>
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={false}
        scroll={{ x: scrollX }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<><strong>{emptyTitle}</strong><br />{emptyHint}</>} /> }}
        onRow={
          onRowClick
            ? (row) => ({ onClick: () => onRowClick(row), className: "cursor-pointer" })
            : undefined
        }
      />
      <div className="flex flex-col gap-3 border-t border-[#F0F0F0] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <PageLimitSelect value={limit} onChange={onLimitChange} />
        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger={false}
          hideOnSinglePage={false}
          showTotal={(t, range) => (t === 0 ? "No results" : `${range[0]}–${range[1]} of ${t}`)}
          onChange={onPageChange}
          responsive
        />
      </div>
    </div>
  );
}

export default memo(DataTable) as typeof DataTable;
