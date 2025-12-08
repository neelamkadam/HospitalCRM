import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /**
     * Optional CSS class name for the column's header and cells
     */
    className?: string;
    filterVariant?: "text" | "select";
    filterKey?: any;
    /**
     * Optional custom props for the column
     */
    [key: string]: any;
  }
}
