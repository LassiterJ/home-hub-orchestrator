import { memo, type ReactNode } from 'react'

import { BaseNode, BaseNodeContent, BaseNodeHeader } from '@/components/features/workflow/nodes/BaseNode'
import { TableBody, TableCell, TableRow } from '@/components/ui/Table/Table'
import { Position } from '@xyflow/react'
import { LabeledHandle } from '../../handles/LabeledHandle'

/* DATABASE SCHEMA NODE HEADER ------------------------------------------------ */
/**
 * A container for the database schema node header.
 */
export type DatabaseSchemaNodeHeaderProps = {
   children?: ReactNode;
};

export const DatabaseSchemaNodeHeader = ({
                                            children,
                                         }: DatabaseSchemaNodeHeaderProps) => {
   return (
      <BaseNodeHeader
         className="rounded-tl-md rounded-tr-md bg-secondary p-2 text-center text-sm text-muted-foreground">
         <h2>{children}</h2>
      </BaseNodeHeader>
   )
}

/* DATABASE SCHEMA NODE BODY -------------------------------------------------- */
/**
 * A container for the database schema node body that wraps the table.
 */
export type DatabaseSchemaNodeBodyProps = {
   children?: ReactNode;
};

export const DatabaseSchemaNodeBody = ({
                                          children,
                                       }: DatabaseSchemaNodeBodyProps) => {
   return (
      <BaseNodeContent className="p-0">
         <table className="border-spacing-10 overflow-visible">
            <TableBody>{children}</TableBody>
         </table>
      </BaseNodeContent>
   )
}

/* DATABASE SCHEMA TABLE ROW -------------------------------------------------- */
/**
 * A wrapper for individual table rows in the database schema node.
 */

export type DatabaseSchemaTableRowProps = {
   children: ReactNode;
   className?: string;
};

export const DatabaseSchemaTableRow = ({
                                          children,
                                          className,
                                       }: DatabaseSchemaTableRowProps) => {
   return (
      <TableRow className={`relative text-xs ${className || ''}`}>
         {children}
      </TableRow>
   )
}

/* DATABASE SCHEMA TABLE CELL ------------------------------------------------- */
/**
 * A simplified table cell for the database schema node.
 * Renders static content without additional dynamic props.
 */
export type DatabaseSchemaTableCellProps = {
   className?: string;
   children?: ReactNode;
};

export const DatabaseSchemaTableCell = ({
                                           className,
                                           children,
                                        }: DatabaseSchemaTableCellProps) => {
   return <TableCell className={className}>{children}</TableCell>
}

/* DATABASE SCHEMA NODE ------------------------------------------------------- */
/**
 * The main DatabaseSchemaNode component that wraps the header and body.
 * It maps over the provided schema data to render rows and cells.
 */
export type DatabaseSchemaNodeProps = {
   className?: string;
   children?: ReactNode;
};

export const DatabaseSchemaNode = ({
                                      className,
                                      children,
                                   }: DatabaseSchemaNodeProps) => {
   return <BaseNode className={className}>{children}</BaseNode>
}

/* Full Component -------------------------------------------------------------- */

export type DatabaseSchemaNodeData = {
   data: {
      label: string;
      schema: { title: string; type: string }[];
   };
};

const DatabaseSchemaDemo = memo(({ data }: DatabaseSchemaNodeData) => {
   console.log('DatabaseSchemaDemo. data: ', data)
   return (
      <DatabaseSchemaNode className="p-0">
         <DatabaseSchemaNodeHeader>{data.label}</DatabaseSchemaNodeHeader>
         <DatabaseSchemaNodeBody>
            {data.schema.map((entry) => (
               <DatabaseSchemaTableRow key={entry.title}>
                  <DatabaseSchemaTableCell className="pl-0 pr-6 font-light">
                     <LabeledHandle
                        id={entry.title}
                        title={entry.title}
                        type="target"
                        position={Position.Left}
                     />
                  </DatabaseSchemaTableCell>
                  <DatabaseSchemaTableCell className="pr-0 font-thin">
                     <LabeledHandle
                        id={entry.title}
                        title={entry.type}
                        type="source"
                        position={Position.Right}
                        className="p-0"
                        handleClassName="p-0"
                        labelClassName="p-0 w-full pr-3 text-right"
                     />
                  </DatabaseSchemaTableCell>
               </DatabaseSchemaTableRow>
            ))}
         </DatabaseSchemaNodeBody>
      </DatabaseSchemaNode>
   )
})

export default DatabaseSchemaDemo
