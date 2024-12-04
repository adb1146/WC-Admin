-- Create tables to store schema information
CREATE TABLE tables (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  schema text NOT NULL DEFAULT 'public',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE columns (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name text NOT NULL REFERENCES tables(name),
  name text NOT NULL,
  type text NOT NULL,
  is_nullable boolean NOT NULL DEFAULT true,
  max_length integer,
  description text,
  position integer NOT NULL,
  enum_values text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE relationships (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_table text NOT NULL REFERENCES tables(name),
  from_field text NOT NULL,
  to_table text NOT NULL REFERENCES tables(name),
  to_field text NOT NULL,
  relationship_type text NOT NULL CHECK (relationship_type IN ('oneToOne', 'oneToMany', 'manyToMany')),
  display_field text NOT NULL DEFAULT 'name',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Function to sync schema information
CREATE OR REPLACE FUNCTION sync_schema_info() RETURNS void AS $$
BEGIN
  -- Sync tables
  INSERT INTO tables (name, schema)
  SELECT table_name, table_schema
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name NOT IN (SELECT name FROM tables)
    AND table_name NOT LIKE '\_%'
    AND table_name != 'schema_migrations';

  -- Sync columns
  INSERT INTO columns (table_name, name, type, is_nullable, max_length, position)
  SELECT 
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable = 'YES',
    c.character_maximum_length,
    c.ordinal_position
  FROM information_schema.columns c
  JOIN tables t ON t.name = c.table_name
  WHERE c.table_schema = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM columns 
      WHERE table_name = c.table_name 
      AND name = c.column_name
    );

  -- Sync relationships
  INSERT INTO relationships (from_table, from_field, to_table, to_field, relationship_type)
  SELECT DISTINCT
    tc.table_name,
    kcu.column_name,
    ccu.table_name,
    ccu.column_name,
    'oneToMany'
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM relationships
      WHERE from_table = tc.table_name
      AND from_field = kcu.column_name
      AND to_table = ccu.table_name
      AND to_field = ccu.column_name
    );
END;
$$ LANGUAGE plpgsql;