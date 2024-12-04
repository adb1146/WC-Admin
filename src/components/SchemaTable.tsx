import React from 'react';
import { TableDefinition, DatabaseSchema } from '../types/schema';
import { DataTable } from './DataTable';
import { TableConfig } from '../types/tableTypes';
import { formatDate } from '../utils/formatters';

interface SchemaTableProps {
  table: TableDefinition;
  schema: DatabaseSchema;
  isLoading?: boolean;
  data: any[];
  onEdit: (item: any) => void;
  onDelete: (items: any[]) => void;
}

export function SchemaTable({ table, schema, isLoading = false, data, onEdit, onDelete }: SchemaTableProps) {
  const config: TableConfig<any> = {
    tableName: table.name,
    displayName: table.displayName,
    columns: table.fields.filter(field => !['id', 'created_at', 'updated_at'].includes(field.name)).map(field => ({
      id: field.name,
      header: field.name,
      accessorKey: field.name,
      cell: (value: any) => {
        if (value === null || value === undefined) return '-';

        switch (field.type) {
          case 'date':
            return formatDate(value);
          case 'boolean':
            return value ? 'Yes' : 'No';
          case 'foreignKey':
            const relationship = schema.relationships.find(
              r => r.from.table === table.name && r.from.field === field.name
            );
            if (!relationship) return value;
            const relatedData = data.find(d => d.id === value);
            return relatedData ? relatedData[field.foreignKey!.displayField] : value;
          default:
            return String(value);
        }
      },
    })),
  };

  return (
    <DataTable
      config={config}
      isLoading={false}
      data={data}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}