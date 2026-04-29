docker exec chatapp_db psql -U admin -d chatapp -c "SELECT * FROM \"__EFMigrationsHistory\""
docker exec chatapp_db psql -U admin -d chatapp -c "SELECT * FROM \"__efmigrationshistory\""
