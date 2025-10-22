 # urlst-service
 
This is a microservice for generating short links: it receives the full URL (full_url) from the user, generates a `short_code` and stores the mapping in a database, then returns the short URL to the user, with the option to generate a QR code of the short URL so that they can scan and access the original link. The service also has an endpoint for redirecting when the short URL is accessed

 Quick start

 1. Copy `.env.sample` to `.env` and fill your DB credentials.
 2. Install depencies: `npm install` (run in `services/urlst-service`).
 3. Ensure the `urls` table exists
 4. Start: `npm start` 

 Endpoints
 - POST /api/shorten  — body: { full_url }
 - GET /api/history  — returns recent shortened URLs
 - GET /:code       — redirect to original URL
 - GET /health      — basic health check

 DB table

 ```sql
 CREATE TABLE IF NOT EXISTS urls (
   id INT AUTO_INCREMENT PRIMARY KEY,
   full_url TEXT NOT NULL,
   short_code VARCHAR(10) NOT NULL UNIQUE,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 );
 ```

 Environment variables (`.env`)

 ```env
 PORT=3001
 MYSQL_HOST=127.0.0.1
 MYSQL_USER=root
 MYSQL_PASSWORD=your_db_password_here
 MYSQL_DATABASE=shorturl
 BASE_URL=http://localhost:3001
 ANALYTICS_URL=
 ```