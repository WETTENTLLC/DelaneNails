@echo off
echo Setting up DelaneNails project with pnpm...

:: Remove any existing package.json
if exist package.json del package.json

:: Initialize a new pnpm project
pnpm init

:: Install dependencies
pnpm add axios dotenv chart.js @supabase/supabase-js
pnpm add -D express nodemon cors

:: Create scripts in package.json
echo Updating package.json with required scripts...
powershell -Command "(Get-Content package.json) -replace '\"scripts\": {', '\"scripts\": {\"dev\": \"node server.js\", \"serve\": \"node server.js\", \"start\": \"node server.js\", \"test\": \"node index.js\", \"test:basic\": \"node index.js basic\", \"test:full\": \"node index.js comprehensive\",' | Set-Content package.json"

echo Done! Now you can run: pnpm run dev
