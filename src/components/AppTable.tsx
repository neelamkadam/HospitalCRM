import { AgGridReact } from "ag-grid-react";
import { ColDef, GridOptions, RowStyle } from "ag-grid-community";
import { useAppSelector } from "../redux/store";
import "../Apptable.css";
import { useMemo } from "react";

interface AppTableProps<T> {
  rowData: T[];
  columnDefs: ColDef<T>[];
  theme?: "light" | "dark";
  className?: string;
  height?: number;
  gridOptions?: GridOptions<T>;
  onRowClicked?: (rowData: T) => void;
  rowStyle?: RowStyle | ((params: any) => RowStyle); // Add rowStyle prop
  rowClickable?: boolean;
  pagination?: boolean;
  loading?: boolean;
}

const AppTable = <T,>({
  rowData,
  columnDefs,
  className = "",
  gridOptions,
  onRowClicked,
  rowStyle, // Receive rowStyle as a prop
  rowClickable = false,
  pagination = false,
}: AppTableProps<T>): JSX.Element => {
  const { theme } = useAppSelector((state) => state.theme);
  const agGridClass =
    theme === "dark" ? "ag-theme-quartz-dark" : "ag-theme-quartz";

  const handleRowClicked = (event: any) => {
    if (onRowClicked) {
      onRowClicked(event.data); // Pass row data to the callback
    }
  };

  const getRowStyle = (params: any) => {
    if (rowStyle)
      return typeof rowStyle === "function" ? rowStyle(params) : rowStyle;

    const isLastRow = params.node.rowIndex === rowData.length - 1; // Default styling for last row
    return {
      backgroundColor: params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb", // Alternate row colors
      height: isLastRow ? "60px" : "40px",
      cursor: rowClickable ? "pointer" : "",
    };
  };
  const noRowsOverlayComponentParams = useMemo(() => {
    return {
      noRowsMessageFunc: () =>
        "No rows found at: " + new Date().toLocaleTimeString(),
    };
  }, []);

  return (
    <div
      className={`${agGridClass} ${className}`}
      style={{
        overflowY: "auto",
      }}
    >
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs.map((colDef) => ({
          ...colDef,
          headerClass: "custom-header-cell", // Apply custom class to headers
        }))}
        onRowClicked={handleRowClicked}
        getRowStyle={getRowStyle} // Use rowStyle prop or fallback
        domLayout="autoHeight"
        pagination={pagination}
        paginationPageSize={10}
        noRowsOverlayComponentParams={noRowsOverlayComponentParams}
        paginationPageSizeSelector={[10, 20, 50, 100]}
        {...gridOptions}
      />
    </div>
  );
};

export default AppTable;
