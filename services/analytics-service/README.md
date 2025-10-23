# analytics-service

Lightweight analytics microservice that receives event POSTs and stores them in MySQL.

Endpoints
- POST /events — accept JSON payload { event_type, payload, short_code, timestamp }

Run
- Copy `.env.sample` to `.env` and fill DB connection vars
- npm install
- npm start

Migration
- Run the SQL in `migrations/` against your analytics database
