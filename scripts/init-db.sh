#!/bin/bash

# Exit on error
set -e

# Load environment variables
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Database configuration
DB_NAME=${DB_NAME:-"sanita"}
DB_USER=${DB_USER:-"sanita_user"}
DB_PASSWORD=${DB_PASSWORD:-"sanita_secure_pwd_123"}

# Check if PostgreSQL is running
if ! pg_isready > /dev/null 2>&1; then
  echo "Error: PostgreSQL is not running"
  exit 1
fi

# Create database user if not exists
echo "Creating database user..."
psql -v ON_ERROR_STOP=1 postgres <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
  END
  \$\$;
EOSQL

# Create database if not exists
echo "Creating database..."
psql -v ON_ERROR_STOP=1 postgres <<-EOSQL
  SELECT 'CREATE DATABASE $DB_NAME'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec
  GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
EOSQL

# Configure database settings
echo "Configuring database settings..."
psql -v ON_ERROR_STOP=1 --dbname "$DB_NAME" <<-EOSQL
  -- Enable connection pooling
  ALTER SYSTEM SET max_connections = '200';
  ALTER SYSTEM SET shared_buffers = '256MB';
  
  -- Query optimization
  ALTER SYSTEM SET work_mem = '16MB';
  ALTER SYSTEM SET maintenance_work_mem = '256MB';
  
  -- Write-ahead logging
  ALTER SYSTEM SET wal_level = 'logical';
  ALTER SYSTEM SET max_wal_senders = '10';
  
  -- Query planner settings
  ALTER SYSTEM SET random_page_cost = '1.1';
  ALTER SYSTEM SET effective_cache_size = '1GB';

  -- Create schema if not exists
  CREATE SCHEMA IF NOT EXISTS sanita;
  
  -- Grant permissions
  GRANT ALL ON SCHEMA sanita TO $DB_USER;
  ALTER USER $DB_USER SET search_path TO sanita,public;
EOSQL

echo "Database initialization complete!"
echo "You can now run: npx prisma migrate dev" 