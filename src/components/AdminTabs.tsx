import React, { useState } from 'react';
import { TableManager } from './TableManager';
import { RatingFactorForm } from './RatingFactorForm';
import { ClassCodeForm } from './forms/ClassCodeForm';
import { StateFactorForm } from './forms/StateFactorForm';
import { TableConfig, RatingFactor, ClassCode, StateFactor } from '../types/tableTypes';
import { formatCurrency, formatDate } from '../utils/formatters';

const ratingFactorsConfig: TableConfig<RatingFactor> = {
  tableName: 'rating_factors',
  displayName: 'Rating Factors',
  columns: [
    { id: 'name', header: 'Factor Name', accessorKey: 'name' },
    { id: 'type', header: 'Type', accessorKey: 'type' },
    {
      id: 'value',
      header: 'Value',
      accessorKey: 'value',
      cell: (value: number) => value?.toFixed(2) || '-'
    },
    {
      id: 'effective_date',
      header: 'Effective Date',
      accessorKey: 'effective_date',
      cell: formatDate
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ]
};

const classCodesConfig: TableConfig<ClassCode> = {
  tableName: 'class_codes',
  displayName: 'Class Codes',
  columns: [
    { id: 'code', header: 'Code', accessorKey: 'code' },
    { id: 'description', header: 'Description', accessorKey: 'description' },
    { id: 'industry_group', header: 'Industry Group', accessorKey: 'industry_group' },
    {
      id: 'hazard_level',
      header: 'Hazard Level',
      accessorKey: 'hazard_level',
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Low' ? 'bg-green-100 text-green-800' :
          value === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ]
};

const stateFactorsConfig: TableConfig<StateFactor> = {
  tableName: 'state_factors',
  displayName: 'State Factors',
  columns: [
    { id: 'state_code', header: 'State Code', accessorKey: 'state_code' },
    { id: 'state_name', header: 'State Name', accessorKey: 'state_name' },
    {
      id: 'base_rate',
      header: 'Base Rate',
      accessorKey: 'base_rate',
      cell: formatCurrency
    },
    {
      id: 'effective_date',
      header: 'Effective Date',
      accessorKey: 'effective_date',
      cell: formatDate
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ]
};

export function AdminTabs() {
  const [activeTab, setActiveTab] = useState('rating_factors');

  const tabs = [
    { id: 'rating_factors', label: 'Rating Factors' },
    { id: 'class_codes', label: 'Class Codes' },
    { id: 'state_factors', label: 'State Factors' },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        {activeTab === 'rating_factors' && (
          <TableManager
            config={ratingFactorsConfig}
            FormComponent={RatingFactorForm}
          />
        )}
        {activeTab === 'class_codes' && (
          <TableManager
            config={classCodesConfig}
            FormComponent={ClassCodeForm}
          />
        )}
        {activeTab === 'state_factors' && (
          <TableManager
            config={stateFactorsConfig}
            FormComponent={StateFactorForm}
          />
        )}
      </div>
    </div>
  );
}