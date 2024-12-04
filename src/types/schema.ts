import { z } from 'zod';

export type FieldType = 
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'enum'
  | 'foreignKey';

export interface ForeignKeyConfig {
  table: string;
  displayField: string;
}

export interface FieldDefinition {
  name: string;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enumValues?: string[];
  foreignKey?: ForeignKeyConfig;
  description?: string;
}

export interface TableDefinition {
  name: string;
  displayName: string;
  fields: FieldDefinition[];
  primaryKey: string[];
  foreignKeys?: {
    field: string;
    references: {
      table: string;
      field: string;
    };
  }[];
  uniqueConstraints?: string[][];
  description?: string;
}

export interface DatabaseSchema {
  tables: TableDefinition[];
  relationships: {
    from: { table: string; field: string };
    to: { table: string; field: string };
    type: 'oneToOne' | 'oneToMany' | 'manyToMany';
  }[];
}

export function generateZodSchema(tableDef: TableDefinition) {
  const shape: Record<string, z.ZodType<any>> = {};

  for (const field of tableDef.fields) {
    let fieldSchema: z.ZodType<any>;

    switch (field.type) {
      case 'string':
        fieldSchema = z.string();
        if (field.minLength) fieldSchema = fieldSchema.min(field.minLength);
        if (field.maxLength) fieldSchema = fieldSchema.max(field.maxLength);
        if (field.pattern) fieldSchema = fieldSchema.regex(new RegExp(field.pattern));
        break;

      case 'number':
        fieldSchema = z.number();
        if (field.min !== undefined) fieldSchema = fieldSchema.min(field.min);
        if (field.max !== undefined) fieldSchema = fieldSchema.max(field.max);
        break;

      case 'boolean':
        fieldSchema = z.boolean();
        break;

      case 'date':
        fieldSchema = z.string().datetime();
        break;

      case 'enum':
        if (!field.enumValues) throw new Error(`Enum field ${field.name} must have enumValues`);
        fieldSchema = z.enum(field.enumValues as [string, ...string[]]);
        break;

      case 'foreignKey':
        fieldSchema = z.string();
        break;

      default:
        throw new Error(`Unsupported field type: ${field.type}`);
    }

    shape[field.name] = field.required === false ? fieldSchema.optional() : fieldSchema;
  }

  return z.object(shape);
}