import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./card";

// Context to pass column labels to cells
const TableContext = React.createContext<{ columns: string[] }>({ columns: [] });

interface ResponsiveTableProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: string[];
  children: React.ReactNode;
}

/**
 * ResponsiveTable - A table that transforms into cards on mobile
 * 
 * Usage:
 * <ResponsiveTable columns={["Name", "Email", "Status", "Actions"]}>
 *   <ResponsiveTableHeader>
 *     <ResponsiveTableHead>Name</ResponsiveTableHead>
 *     ...
 *   </ResponsiveTableHeader>
 *   <ResponsiveTableBody>
 *     <ResponsiveTableRow>
 *       <ResponsiveTableCell>John Doe</ResponsiveTableCell>
 *       ...
 *     </ResponsiveTableRow>
 *   </ResponsiveTableBody>
 * </ResponsiveTable>
 */
export function ResponsiveTable({ columns, children, className, ...props }: ResponsiveTableProps) {
  return (
    <TableContext.Provider value={{ columns }}>
      <div className={cn("w-full", className)} {...props}>
        {/* Desktop Table */}
        <div className="hidden md:block relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            {children}
          </table>
        </div>
        {/* Mobile Cards - rendered by ResponsiveTableBody */}
      </div>
    </TableContext.Provider>
  );
}

export const ResponsiveTableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
ResponsiveTableHeader.displayName = "ResponsiveTableHeader";

interface ResponsiveTableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  mobileRender?: (children: React.ReactNode) => React.ReactNode;
}

export const ResponsiveTableBody = React.forwardRef<
  HTMLTableSectionElement,
  ResponsiveTableBodyProps
>(({ className, children, ...props }, ref) => {
  const { columns } = React.useContext(TableContext);
  
  // Clone children to pass column context for mobile rendering
  const enhancedChildren = React.Children.map(children, (child, rowIndex) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        columns,
        rowIndex,
      });
    }
    return child;
  });

  return (
    <>
      {/* Desktop tbody */}
      <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props}>
        {children}
      </tbody>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {enhancedChildren}
      </div>
    </>
  );
});
ResponsiveTableBody.displayName = "ResponsiveTableBody";

interface ResponsiveTableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  columns?: string[];
  rowIndex?: number;
  mobileCardClassName?: string;
}

export const ResponsiveTableRow = React.forwardRef<
  HTMLTableRowElement,
  ResponsiveTableRowProps
>(({ className, children, columns = [], rowIndex, mobileCardClassName, ...props }, ref) => {
  // Extract cell contents for mobile view
  const cells = React.Children.toArray(children);
  
  return (
    <>
      {/* Desktop row */}
      <tr
        ref={ref}
        className={cn(
          "border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50 hidden md:table-row",
          className
        )}
        {...props}
      >
        {children}
      </tr>
      {/* Mobile card */}
      <Card className={cn("md:hidden", mobileCardClassName)}>
        <CardContent className="p-4 space-y-3">
          {cells.map((cell, idx) => {
            if (!React.isValidElement(cell)) return null;
            const label = columns[idx] || `Field ${idx + 1}`;
            const isActions = label.toLowerCase() === 'actions';
            
            return (
              <div key={idx} className={cn(
                isActions ? "pt-2 border-t flex flex-wrap gap-2" : "flex justify-between items-start gap-2"
              )}>
                {!isActions && (
                  <span className="text-sm font-medium text-muted-foreground shrink-0">
                    {label}:
                  </span>
                )}
                <div className={cn(isActions ? "flex-1" : "text-right flex-1")}>
                  {cell.props.children}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </>
  );
});
ResponsiveTableRow.displayName = "ResponsiveTableRow";

export const ResponsiveTableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
      className
    )}
    {...props}
  />
));
ResponsiveTableHead.displayName = "ResponsiveTableHead";

export const ResponsiveTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
ResponsiveTableCell.displayName = "ResponsiveTableCell";
