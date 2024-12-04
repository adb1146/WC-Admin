import React from 'react';
import { BarChart, Activity, AlertCircle } from 'lucide-react';
import { TableData } from '../types/tableTypes';
import { analyzeTableData } from '../utils/dataAnalytics';

interface DataInsightsProps {
  data: TableData[];
}

export function DataInsights({ data }: DataInsightsProps) {
  const analysis = analyzeTableData(data);

  if (!analysis) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium">Records</h3>
          </div>
          <span className="text-2xl font-semibold">{analysis.totalRecords}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {analysis.activeRecords} active
        </p>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="font-medium">Recent Changes</h3>
          </div>
          <span className="text-2xl font-semibold">{analysis.recentChanges}</span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          In the last 7 days
        </p>
      </div>

      {analysis.potentialIssues.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="font-medium">Data Quality</h3>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {analysis.potentialIssues.length} potential issues found
          </p>
        </div>
      )}
    </div>
  );
}