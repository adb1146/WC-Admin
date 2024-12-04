import React, { useState } from 'react';
import { SchemaManager } from './SchemaManager';
import { insuranceSchema } from '../types/insuranceSchema';
import { TableDefinition } from '../types/schema';
import { 
  ClipboardList, 
  FileText, 
  Table2, 
  Activity, 
  Calculator, 
  FileCheck, 
  Sliders, 
  Database,
  Map, 
  Building2
} from 'lucide-react';

interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  table: TableDefinition;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('applications');

  const tabs: TabConfig[] = [
    { 
      id: 'applications', 
      label: 'Applications', 
      icon: <ClipboardList className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'applications')!
    },
    { 
      id: 'audit_logs', 
      label: 'Audit Logs', 
      icon: <FileText className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'audit_logs')!
    },
    { 
      id: 'class_codes', 
      label: 'Class Codes', 
      icon: <Table2 className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'class_codes')!
    },
    { 
      id: 'health_check', 
      label: 'Health Check', 
      icon: <Activity className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'health_check')!
    },
    { 
      id: 'premium_rules', 
      label: 'Premium Rules', 
      icon: <Calculator className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'premium_rules')!
    },
    { 
      id: 'quotes', 
      label: 'Quotes', 
      icon: <FileCheck className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'quotes')!
    },
    { 
      id: 'rating_factors', 
      label: 'Rating Factors', 
      icon: <Sliders className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'rating_factors')!
    },
    { 
      id: 'rating_tables', 
      label: 'Rating Tables', 
      icon: <Database className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'rating_tables')!
    },
    { 
      id: 'territories', 
      label: 'Territories', 
      icon: <Map className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'territories')!
    },
    { 
      id: 'verified_business_names', 
      label: 'Verified Businesses', 
      icon: <Building2 className="w-5 h-5" />,
      table: insuranceSchema.tables.find(t => t.name === 'verified_business_names')!
    }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  w-full flex items-center px-2 py-2 text-sm font-medium rounded-md
                  ${activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                {tab.icon}
                <span className="ml-3">{tab.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="py-6 px-8">
          <SchemaManager
            schema={insuranceSchema}
            table={tabs.find(t => t.id === activeTab)!.table}
          />
        </div>
      </div>
    </div>
  );
}