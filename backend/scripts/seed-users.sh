#!/usr/bin/env bash
set -euo pipefail

API_URL="${API_URL:-http://localhost:5000}"

register_user() {
  local nombres="$1"
  local apellidos="$2"
  local correo="$3"
  local contrasena="$4"

  curl -sS -X POST "${API_URL}/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"nombres\":\"${nombres}\",\"apellidos\":\"${apellidos}\",\"correo\":\"${correo}\",\"contrasena\":\"${contrasena}\"}"
}

echo "Registrando usuarios..."
register_user "Admin" "System" "admin@unimagdalena.edu.co" "Admin123*"
register_user "Carlos" "Vega" "vigilante@unimagdalena.edu.co" "Vigilante123*"
register_user "Laura" "Perez" "user1@unimagdalena.edu.co" "User123*"
register_user "Andres" "Rojas" "user2@unimagdalena.edu.co" "User123*"

echo "Actualizando roles en base de datos..."
psql -U postgres -d unideportes_db -c "UPDATE usuarios SET id_rol = 3 WHERE correo_electronico = 'admin@unimagdalena.edu.co';"
psql -U postgres -d unideportes_db -c "UPDATE usuarios SET id_rol = 2 WHERE correo_electronico = 'vigilante@unimagdalena.edu.co';"

echo "Listo."
