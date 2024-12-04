import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldDefinition, TableDefinition, generateZodSchema } from '../types/schema';
import { supabase } from '../lib/supabase';

interface SchemaFormProps {
  table: TableDefinition;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}

const SYSTEM_FIELDS = ['id', 'created_at', 'updated_at', 'last_modified', 'modified_by'];

export function SchemaForm({ table, initialData, onSubmit, onCancel }: SchemaFormProps) {
  const [foreignKeyOptions, setForeignKeyOptions] = React.useState<Record<string, any[]>>({});
  const schema = generateZodSchema(table);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  });

  React.useEffect(() => {
    loadForeignKeyOptions();
  }, []);

  async function loadForeignKeyOptions() {
    const fkFields = table.fields.filter(f => f.type === 'foreignKey' && f.foreignKey);
    
    const options: Record<string, any[]> = {};
    for (const field of fkFields) {
      if (!field.foreignKey) continue;
      
      const { data, error } = await supabase
        .from(field.foreignKey.table)
        .select(`id,${field.foreignKey.displayField}`);
        
      if (!error && data) {
        options[field.name] = data;
      }
    }
    
    setForeignKeyOptions(options);
  }

  function renderField(field: FieldDefinition) {
    const baseProps = {
      ...register(field.name),
      className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500",
    };

    switch (field.type) {
      case 'string':
        return (
          <input
            type="text"
            {...baseProps}
            maxLength={field.maxLength}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            {...baseProps}
            min={field.min}
            max={field.max}
            step="any"
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            {...baseProps}
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        );

      case 'date':
        return (
          <input
            type="datetime-local"
            {...baseProps}
          />
        );

      case 'enum':
        return (
          <select {...baseProps}>
            {field.enumValues?.map(value => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        );

      case 'foreignKey':
        if (!field.foreignKey) return null;
        return (
          <select {...baseProps}>
            <option value="">Select {field.name}</option>
            {foreignKeyOptions[field.name]?.map(option => (
              <option key={option.id} value={option.id}>
                {option[field.foreignKey!.displayField]}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {table.fields.filter(field => {
        // Always hide system-managed fields for new records
        if (!initialData && (SYSTEM_FIELDS.includes(field.name) || field.name === 'id')) {
          return false;
        }
        // For existing records, show all fields except id
        return field.name !== 'id';
      }).map(field => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.description && (
            <p className="mt-1 text-sm text-gray-500">{field.description}</p>
          )}
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">
              {errors[field.name]?.message as string}
            </p>
          )}
        </div>
      ))}

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => {
            reset();
            onCancel();
          }}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          disabled={isSubmitting}
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {isSubmitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>
          {initialData ? 'Update' : 'Create'} {table.displayName}
          </span>
        </button>
      </div>
    </form>
  );
}