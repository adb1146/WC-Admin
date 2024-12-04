export type FactorType = 'Multiplier' | 'Addition' | 'Percentage' | 'Fixed';

export interface RatingFactor {
  id: string;
  name: string;
  type: FactorType;
  value: number;
  effective_date: string;
  status: 'Active' | 'Inactive';
  last_modified: string;
  modified_by: string;
}

export interface RatingFactorFormData extends Omit<RatingFactor, 'id' | 'last_modified' | 'modified_by'> {
  id?: string;
}