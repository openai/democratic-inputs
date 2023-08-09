```
COMMENT ON SCHEMA public IS e'@graphql({"inflect_names": true})';

DO
$$
DECLARE
    row record;
BEGIN
    FOR row IN SELECT tablename FROM pg_tables AS t
        WHERE t.schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', row.tablename); -- Enable RLS for all tables
    END LOOP;
END;
$$;
```
