import React from 'react';
import { Book, Database, Shield, Table2, FileText, RefreshCw, Download, Upload } from 'lucide-react';

export function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <header className="text-center mb-12">
        <Book className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900">Workers Comp Admin Documentation</h1>
        <p className="mt-2 text-gray-600">Learn how to use the administrative interface effectively</p>
      </header>

      <section className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Authentication</h2>
          </div>
          <div className="prose">
            <ul className="list-disc pl-6 space-y-2">
              <li>Sign in using your authorized email and password</li>
              <li>Your session will remain active until you sign out</li>
              <li>All actions are logged and associated with your user account</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Database className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Database Management</h2>
          </div>
          <div className="prose">
            <ul className="list-disc pl-6 space-y-2">
              <li>Navigate between tables using the sidebar menu</li>
              <li>Each table provides full CRUD (Create, Read, Update, Delete) operations</li>
              <li>Data validation ensures integrity across all operations</li>
              <li>Foreign key relationships are enforced and displayed in dropdown menus</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Table2 className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Table Features</h2>
          </div>
          <div className="prose">
            <ul className="list-disc pl-6 space-y-2">
              <li>Sort any column by clicking the header</li>
              <li>Search across all fields using the search box</li>
              <li>Select multiple rows for bulk operations</li>
              <li>Paginate through large datasets</li>
              <li>Adjust the number of rows displayed per page</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <FileText className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Forms and Validation</h2>
          </div>
          <div className="prose">
            <ul className="list-disc pl-6 space-y-2">
              <li>Required fields are marked with an asterisk (*)</li>
              <li>Input validation provides immediate feedback</li>
              <li>Related records are available in dropdown menus</li>
              <li>Changes are validated before saving to the database</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold">Real-time Updates</h2>
          </div>
          <div className="prose">
            <ul className="list-disc pl-6 space-y-2">
              <li>Changes made by other users are reflected in real-time</li>
              <li>The interface automatically updates when data changes</li>
              <li>Notifications appear for successful operations</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <div className="flex space-x-2">
              <Download className="w-6 h-6 text-blue-600" />
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold ml-2">Import/Export</h2>
          </div>
          <div className="prose">
            <ul className="list-disc pl-6 space-y-2">
              <li>Export data to CSV format for analysis</li>
              <li>Import data from CSV files for bulk updates</li>
              <li>Data validation is performed during import</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}