import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StateFactor } from '../../types/tableTypes';

const schema = z.object({
  state_code: z.string().length(2, 'State code must be 2 characters'),
  state_name: z.string().min(1, 'State name is required'),
  base_rate: z.number().min(0, 'Base rate must be non-negative'),
  effective_date: z.string(),
  status: z.enum(['Active', 'Inactive']),
});

type FormData = Omit<StateFactor, 'id' | 'last_modified' | 'modified_by'>;

interface StateFactorFormProps {
  initialData?: StateFactor;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function StateFactorForm({ initialData, onSubmit, onCancel }: StateFactorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      state_code: '',
      state_name: '',
      base_rate: 0,
      effective_date: new Date().toISOString().split('T')[0],
      status: 'Active',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          State Code
        </label>
        <input
          type="text"
          {...register('state_code')}
          maxLength={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.state_code && (
          <p className="mt-1 text-sm text-red-600">{errors.state_code.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          State Name
        </label>
        <input
          type="text"
          {...register('state_name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.state_name && (
          <p className="mt-1 text-sm text-red-600">{errors.state_name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Base Rate
        </label>
        <input
          type="number"
          step="0.01"
          {...register('base_rate', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.base_rate && (
          <p className="mt-1 text-sm text-red-600">{errors.base_rate.message}</p>
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
          {initialData ? 'Update' : 'Create'} State Factor
        </button>
      </div>
    </form>
  );
}