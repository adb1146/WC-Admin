import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RatingFactorFormData, FactorType } from '../types/ratingFactor';

const factorTypes: FactorType[] = ['Multiplier', 'Addition', 'Percentage', 'Fixed'];

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['Multiplier', 'Addition', 'Percentage', 'Fixed']),
  value: z.number().min(0),
  effective_date: z.string(),
  status: z.enum(['Active', 'Inactive']),
});

interface RatingFactorFormProps {
  initialData?: RatingFactorFormData;
  onSubmit: (data: RatingFactorFormData) => void;
  onCancel: () => void;
}

export function RatingFactorForm({ initialData, onSubmit, onCancel }: RatingFactorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RatingFactorFormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: '',
      type: 'Multiplier',
      value: 0,
      effective_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Factor Name
        </label>
        <input
          type="text"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Factor Type
        </label>
        <select
          {...register('type')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {factorTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Value</label>
        <input
          type="number"
          step="0.01"
          {...register('value', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.value && (
          <p className="mt-1 text-sm text-red-600">{errors.value.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Effective Date
        </label>
        <input
          type="date"
          {...register('effective_date')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.effective_date && (
          <p className="mt-1 text-sm text-red-600">
            {errors.effective_date.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          {...register('status')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          {initialData ? 'Update' : 'Create'} Rating Factor
        </button>
      </div>
    </form>
  );
}