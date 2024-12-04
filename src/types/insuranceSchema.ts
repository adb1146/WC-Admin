import { DatabaseSchema } from './schema';

export const insuranceSchema: DatabaseSchema = {
  tables: [
    {
      name: 'applications',
      displayName: 'Applications',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'business_name', type: 'string', required: true },
        { name: 'status', type: 'enum', enumValues: ['Draft', 'Submitted', 'Under Review', 'Approved', 'Declined'] },
        { name: 'submission_date', type: 'date' },
        { name: 'total_premium', type: 'number', min: 0 },
        { name: 'effective_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date' },
        { name: 'last_modified', type: 'date' },
        { name: 'modified_by', type: 'string' }
      ],
      primaryKey: ['id']
    },
    {
      name: 'audit_logs',
      displayName: 'Audit Logs',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'table_name', type: 'string', required: true },
        { name: 'record_id', type: 'string', required: true },
        { name: 'action', type: 'enum', enumValues: ['INSERT', 'UPDATE', 'DELETE'], required: true },
        { name: 'old_data', type: 'string' },
        { name: 'new_data', type: 'string' },
        { name: 'performed_by', type: 'string', required: true },
        { name: 'performed_at', type: 'date', required: true }
      ],
      primaryKey: ['id']
    },
    {
      name: 'class_codes',
      displayName: 'Class Codes',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'code', type: 'string', required: true, minLength: 4, maxLength: 4 },
        { name: 'description', type: 'string', required: true },
        { name: 'industry_group', type: 'string', required: true },
        { name: 'hazard_level', type: 'enum', enumValues: ['Low', 'Medium', 'High'] },
        { name: 'status', type: 'enum', enumValues: ['Active', 'Inactive'] },
        { name: 'last_modified', type: 'date' },
        { name: 'modified_by', type: 'string' }
      ],
      primaryKey: ['id'],
      uniqueConstraints: [['code']]
    },
    {
      name: 'health_check',
      displayName: 'Health Check',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'service_name', type: 'string', required: true },
        { name: 'status', type: 'enum', enumValues: ['Healthy', 'Degraded', 'Down'] },
        { name: 'last_check', type: 'date', required: true },
        { name: 'details', type: 'string' }
      ],
      primaryKey: ['id']
    },
    {
      name: 'premium_rules',
      displayName: 'Premium Rules',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'rule_type', type: 'enum', enumValues: ['Modifier', 'Exclusion', 'Requirement'] },
        { name: 'condition', type: 'string', required: true },
        { name: 'action', type: 'string', required: true },
        { name: 'priority', type: 'number', min: 1 },
        { name: 'status', type: 'enum', enumValues: ['Active', 'Inactive'] },
        { name: 'effective_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date' }
      ],
      primaryKey: ['id']
    },
    {
      name: 'quotes',
      displayName: 'Quotes',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'application_id', type: 'foreignKey', required: true, foreignKey: {
          table: 'applications',
          displayField: 'business_name'
        }},
        { name: 'premium_amount', type: 'number', min: 0, required: true },
        { name: 'status', type: 'enum', enumValues: ['Draft', 'Issued', 'Accepted', 'Declined', 'Expired'] },
        { name: 'valid_until', type: 'date', required: true },
        { name: 'created_at', type: 'date' },
        { name: 'created_by', type: 'string' }
      ],
      primaryKey: ['id']
    },
    {
      name: 'rating_factors',
      displayName: 'Rating Factors',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'type', type: 'enum', enumValues: ['Multiplier', 'Addition', 'Percentage', 'Fixed'] },
        { name: 'value', type: 'number', required: true },
        { name: 'effective_date', type: 'date', required: true },
        { name: 'status', type: 'enum', enumValues: ['Active', 'Inactive'] },
        { name: 'last_modified', type: 'date' },
        { name: 'modified_by', type: 'string' }
      ],
      primaryKey: ['id']
    },
    {
      name: 'rating_tables',
      displayName: 'Rating Tables',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'description', type: 'string' },
        { name: 'effective_date', type: 'date', required: true },
        { name: 'expiration_date', type: 'date' },
        { name: 'status', type: 'enum', enumValues: ['Active', 'Inactive'] },
        { name: 'data', type: 'string' },
        { name: 'last_modified', type: 'date' },
        { name: 'modified_by', type: 'string' }
      ],
      primaryKey: ['id']
    },
    {
      name: 'territories',
      displayName: 'Territories',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'code', type: 'string', required: true },
        { name: 'name', type: 'string', required: true },
        { name: 'state', type: 'string', required: true, minLength: 2, maxLength: 2 },
        { name: 'risk_factor', type: 'number', min: 0, max: 10 },
        { name: 'status', type: 'enum', enumValues: ['Active', 'Inactive'] },
        { name: 'effective_date', type: 'date', required: true },
        { name: 'last_modified', type: 'date' },
        { name: 'modified_by', type: 'string' }
      ],
      primaryKey: ['id'],
      uniqueConstraints: [['code', 'state']]
    },
    {
      name: 'verified_business_names',
      displayName: 'Verified Business Names',
      fields: [
        { name: 'id', type: 'string', required: true },
        { name: 'business_name', type: 'string', required: true },
        { name: 'tax_id', type: 'string', required: true },
        { name: 'verification_date', type: 'date', required: true },
        { name: 'verification_source', type: 'string', required: true },
        { name: 'status', type: 'enum', enumValues: ['Active', 'Inactive'] },
        { name: 'last_modified', type: 'date' },
        { name: 'modified_by', type: 'string' }
      ],
      primaryKey: ['id'],
      uniqueConstraints: [['tax_id']]
    }
  ],
  relationships: [
    {
      from: { table: 'quotes', field: 'application_id' },
      to: { table: 'applications', field: 'id' },
      type: 'oneToMany'
    }
  ]
};