#!/bin/bash

# Warte, bis Jira bereit ist
until curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/rest/api/2/status | grep -q "200"; do
  echo "Warte auf Jira..."
  sleep 10
done

echo "Jira ist bereit. Erstelle Admin-User..."

# Admin-User anlegen (ersetze Werte nach Bedarf)
JIRA_URL="http://localhost:8080"
ADMIN_USER="admin"
ADMIN_PW="admin123"
ADMIN_MAIL="admin@example.com"

curl -u admin:admin123 -X POST --data '{
  "name": "'$ADMIN_USER'",
  "password": "'$ADMIN_PW'",
  "emailAddress": "'$ADMIN_MAIL'",
  "displayName": "Administrator"
}' -H "Content-Type: application/json" $JIRA_URL/rest/api/2/user

echo "Admin-User wurde angelegt."
