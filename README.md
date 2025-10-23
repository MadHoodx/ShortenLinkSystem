# 🔗 ShortenLink System

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?style=flat&logo=vuedotjs)](https://vuejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-005C84?style=flat&logo=mysql)](https://www.mysql.com/)

## 📋 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Demo](#-demo)
4. [Installation Guide](#-installation-guide)

---

## ✨ Features

- 🔐 **User Authentication** - Secure JWT-based login/register system
- ✂️ **URL Shortening** - Generate short links with custom codes
- 📊 **Analytics Dashboard** - Real-time click tracking and statistics
- 📈 **Visual Charts** - Interactive charts powered by Chart.js
- 📱 **QR Code Generation** - Auto-generate QR codes for each short link
- ✏️ **Link Management** - Edit titles and delete unwanted links
- 🎨 **Responsive Design** - Works seamlessly on mobile, tablet, and desktop

---

## 💻 Tech Stack

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express 5.x** - Web framework
- **MySQL 8.0** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Build tool
- **Chart.js** - Data visualization
- **Axios** - HTTP client

### Architecture
- **urlst-service** (Port 3001) - URL shortening, authentication, QR generation
- **analytics-service** (Port 4001) - Click tracking and statistics
- **Frontend** (Port 5173) - User interface

---

## 🎥 Demo

**Live Demo:** [https://shorten-url-mh.vercel.app](https://shorten-url-mh.vercel.app)

### Screenshots

**Dashboard View:**
![Dashboard](https://media.discordapp.net/attachments/830465829401133056/1430912484759568484/image.png?ex=68fb8099&is=68fa2f19&hm=5bf22226221745071351ee72e7414f959c51e0c7af332513eb88f9474ec78d89&=&format=webp&quality=lossless&width=2464&height=1148)

**Analytics View:**
![Analytics](https://media.discordapp.net/attachments/830465829401133056/1430912195201335438/image.png?ex=68fb8054&is=68fa2ed4&hm=6d67453bd462ba34efb8bde5f383fd5c8f72bb7783f37c083526ed9926df209e&=&format=webp&quality=lossless&width=2216&height=1248)

---

## 📦 Installation Guide

### Prerequisites

| Software | Version | Download Link |
|----------|---------|---------------|
| **Node.js** | 18+ | [nodejs.org](https://nodejs.org/) |
| **MySQL** | 8.0+ | [dev.mysql.com](https://dev.mysql.com/downloads/) |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) |

> **Note:** Choose either Local MySQL or Docker MySQL setup below

---

### Option 1: Local MySQL Setup

#### Step 1: Clone Repository

```bash
git clone https://github.com/MadHoodx/ShortenLinkSystem.git
cd ShortenLinkSystem
```

#### Step 2: Start MySQL Server

```bash
# macOS (Homebrew)
brew services start mysql

# Linux (systemd)
sudo systemctl start mysql

# Windows
# Start MySQL from Services or MySQL Workbench
```

#### Step 3: Create Databases

```bash
mysql -u root -p
```

Run these SQL commands:

```sql
CREATE DATABASE shorturl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SHOW DATABASES;
EXIT;
```

#### Step 4: Run Migrations

```bash
# urlst-service migrations (users + urls tables)
mysql -u root -p shorturl < services/urlst-service/migrations/20251023_add_users_and_device.sql
mysql -u root -p shorturl < services/urlst-service/migrations/20251023_add_title_column.sql

# analytics-service migration (events table)
mysql -u root -p analytics < services/analytics-service/migrations/20251023_create_events.sql
```

**Verify migrations:**
```bash
mysql -u root -p
```

```sql
USE shorturl;
SHOW TABLES;  -- Should see: users, urls
DESCRIBE urls;

USE analytics;
SHOW TABLES;  -- Should see: events
DESCRIBE events;
EXIT;
```

#### Step 5: Configure Backend Services

**urlst-service:**
```bash
cd services/urlst-service
npm install

# Create .env file
cat > .env << 'EOL'
MYSQLHOST=127.0.0.1
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLDATABASE=shorturl
PORT=3001
JWT_SECRET=your-secret-key-change-this
BASE_URL=http://localhost:3001
CORS_ORIGIN=http://localhost:5173
ANALYTICS_URL=http://localhost:4001/events
EOL

# Edit password
nano .env
```

**analytics-service:**
```bash
cd ../analytics-service
npm install

# Create .env file
cat > .env << 'EOL'
MYSQLHOST=127.0.0.1
MYSQLPORT=3306
MYSQLUSER=root
MYSQLPASSWORD=your_password
MYSQLDATABASE=analytics
PORT=4001
CORS_ORIGIN=http://localhost:5173
EOL

# Edit password
nano .env
```

**frontend:**
```bash
cd ../../frontend
npm install

# Create .env file
cat > .env << 'EOL'
VITE_API_URL=http://localhost:3001/api
VITE_ANALYTICS_API=http://localhost:4001
EOL
```

#### Step 6: Start All Services

Open **3 separate terminals**:

**Terminal 1:**
```bash
cd services/urlst-service
npm start
# ✓ URL Service listening on 3001
```

**Terminal 2:**
```bash
cd services/analytics-service
npm start
# ✓ Analytics Service listening on 4001
```

**Terminal 3:**
```bash
cd frontend
npm run dev
# ✓ Local: http://localhost:5173
```

#### Step 7: Access Application

🌐 Open browser: **http://localhost:5173**

**Test it:**
1. Click "Login / Sign up"
2. Register new account
3. Create a short link
4. View analytics

---

### Option 2: Docker MySQL Setup

#### Step 1: Clone Repository

```bash
git clone https://github.com/MadHoodx/ShortenLinkSystem.git
cd ShortenLinkSystem
```

#### Step 2: Start MySQL Container

```bash
# Start MySQL
docker run --name shorturl-mysql \
  -e MYSQL_ROOT_PASSWORD=root123 \
  -e MYSQL_DATABASE=shorturl \
  -p 3306:3306 \
  -d mysql:8.0

# Wait for initialization . . .

# Create analytics database
docker exec -i shorturl-mysql mysql -uroot -proot123 << EOF
CREATE DATABASE analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
```

#### Step 3: Run Migrations

```bash
docker exec -i shorturl-mysql mysql -uroot -proot123 shorturl < services/urlst-service/migrations/20251023_add_users_and_device.sql
docker exec -i shorturl-mysql mysql -uroot -proot123 shorturl < services/urlst-service/migrations/20251023_add_title_column.sql
docker exec -i shorturl-mysql mysql -uroot -proot123 analytics < services/analytics-service/migrations/20251023_create_events.sql
```

**Verify:**
```bash
docker exec -it shorturl-mysql mysql -uroot -proot123
```

```sql
SHOW DATABASES;
USE shorturl;
SHOW TABLES;
USE analytics;
SHOW TABLES;
EXIT;
```

#### Step 4: Configure Services

Use `MYSQLPASSWORD=root123` in all `.env` files

Follow **Step 5** from Option 1 to create `.env` files (change password to `root123`)

#### Step 5: Start Services

Follow **Step 6 & 7** from Option 1

**Stop Docker MySQL:**
```bash
docker stop shorturl-mysql
docker rm shorturl-mysql
```

---

### Database Schema

**shorturl database:**

```sql
-- users table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- urls table
CREATE TABLE urls (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_url TEXT NOT NULL,
  short_code VARCHAR(10) UNIQUE NOT NULL,
  title VARCHAR(255),
  owner_id INT,
  device_id VARCHAR(128),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_urls_owner_id (owner_id),
  INDEX idx_urls_device_id (device_id),
  INDEX idx_title (title),
  CONSTRAINT fk_urls_user FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);
```

**analytics database:**

```sql
-- events table
CREATE TABLE events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_type VARCHAR(128) NOT NULL,
  short_code VARCHAR(128),
  payload JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_event_type (event_type),
  INDEX idx_short_code (short_code)
);
```

### Troubleshooting

**MySQL Connection Error:**
```bash
# Check MySQL status
brew services list | grep mysql     # macOS
systemctl status mysql              # Linux

# Restart MySQL
brew services restart mysql         # macOS
sudo systemctl restart mysql        # Linux
```

**Port Already in Use:**
```bash
lsof -i :3001  # urlst-service
lsof -i :4001  # analytics-service
lsof -i :5173  # frontend
kill -9 <PID>
```

**Database Issues:**
```bash
# Reset databases
mysql -u root -p -e "DROP DATABASE IF EXISTS shorturl;"
mysql -u root -p -e "DROP DATABASE IF EXISTS analytics;"
mysql -u root -p -e "CREATE DATABASE shorturl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p -e "CREATE DATABASE analytics CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---


## 📝 License

**Made with ❤️ by [MadHoodx](https://github.com/MadHoodx)**
