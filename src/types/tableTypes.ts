import { RatingFactor } from './ratingFactor';

export type TableNames = 'rating_factors' | 'class_codes' | 'state_factors';

export interface ClassCode {
  id: string;
  code: string;
  description: string;
  industry_group: string;
  hazard_level: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Inactive';
  last_modified: string;
  modified_by: string;
}

export interface StateFactor {
  id: string;
  state_code: string;
  state_name: string;
  base_rate: number;
  effective_date: string;
  status: 'Active' | 'Inactive';
  last_modified: string;
  modified_by: string;
}

export type TableData = RatingFactor | ClassCode | StateFactor;

export interface TableConfig<T extends TableData> {
  tableName: TableNames;
  displayName: string;
  columns: ColumnConfig<T>[];
  defaultSort?: { id: keyof T; desc: boolean };
}

export interface ColumnConfig<T> {
  id: keyof T;
  header: string;
  accessorKey: keyof T;
  cell?: (value: any) => React.ReactNode;
}