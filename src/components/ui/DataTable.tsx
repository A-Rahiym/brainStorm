export type TableColumn<T> = {
  key: string;
  header: React.ReactNode;
  render: (row: T) => React.ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  className = "",
}: {
  columns: TableColumn<T>[];
  rows: T[];
  className?: string;
}) {
  const lastIndex = columns.length - 1;

  return (
    <div className="-mx-6 overflow-x-auto px-6">
      <table className={`w-full min-w-[720px] border-collapse ${className}`}>
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key}
                scope="col"
                className={`whitespace-nowrap border-b border-border px-3 py-3.5 text-left text-sm font-medium text-text-secondary ${i === 0 ? "pl-0" : ""} ${i === lastIndex ? "pr-0" : ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row.id}
              className={`[&:hover>td]:bg-bg ${rowIndex === rows.length - 1 ? "[&>td]:border-b-0" : ""}`}
            >
              {columns.map((col, i) => (
                <td
                  key={col.key}
                  className={`whitespace-nowrap border-b border-border px-3 py-4 align-middle text-[15px] font-medium text-text-primary ${i === 0 ? "pl-0" : ""} ${i === lastIndex ? "pr-0 text-right" : ""}`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
