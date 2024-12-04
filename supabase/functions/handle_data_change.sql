CREATE OR REPLACE FUNCTION handle_data_change(
  p_table_name text,
  p_record_id uuid,
  p_old_data jsonb,
  p_new_data jsonb,
  p_action text,
  p_user_email text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result jsonb;
  v_audit_id uuid;
BEGIN
  -- Start transaction
  BEGIN
    -- Perform the data change
    IF p_action = 'UPDATE' THEN
      EXECUTE format(
        'UPDATE %I SET data = $1, last_modified = now(), modified_by = $2 WHERE id = $3',
        p_table_name
      ) USING p_new_data, p_user_email, p_record_id;
    ELSIF p_action = 'INSERT' THEN
      EXECUTE format(
        'INSERT INTO %I (data, last_modified, modified_by) VALUES ($1, now(), $2)',
        p_table_name
      ) USING p_new_data, p_user_email;
    END IF;

    -- Create audit log entry
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_data,
      new_data,
      performed_by,
      performed_at
    ) VALUES (
      p_table_name,
      COALESCE(p_record_id::text, 'new'),
      p_action,
      p_old_data,
      p_new_data,
      p_user_email,
      now()
    ) RETURNING id INTO v_audit_id;

    -- Return success result
    v_result := jsonb_build_object(
      'success', true,
      'audit_id', v_audit_id
    );
    
    RETURN v_result;
  EXCEPTION WHEN OTHERS THEN
    -- Return error result
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM
    );
  END;
END;
$$;