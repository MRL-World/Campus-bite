# CampusBite — MERN Food Ordering Demo

এটি university students-এর জন্য homemade food ordering website-এর একটি শেখার উপযোগী MERN starter project।

## Features

- Student signup: full name, student ID, university email, department, phone, password
- Email অথবা Student ID দিয়ে login
- Password bcrypt দিয়ে hash করে MongoDB-তে save
- Bangladeshi regular meals, gym/healthy meals, cake & pastry
- Meal photo, price (BDT), rating/review count
- Quantity add/remove
- Extra rice, water, cutlery
- আগামী দিনের pickup date ও time slot
- Single, 3-Day, 7-Day package
- Package discount calculation
- Order note
- JWT protected order submission
- MongoDB-তে `users` এবং `orders` collection
- Responsive frontend

## Folder Structure

```text
university-food-order/
├── client/                 React + Vite frontend
│   ├── src/
│   └── .env.example
├── server/                 Node + Express backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── .env.example
└── README.md
```

# 1. MongoDB Atlas connect করো

MongoDB Atlas থেকে একটি cluster তৈরি করো। তারপর Database Access থেকে user বানাও এবং Network Access configure করো। Atlas-এর Node.js connection string copy করো।

`server` folder-এর `.env.example` copy করে `.env` বানাও:

```bash
cd server
cp .env.example .env
```

তারপর `.env` edit করো:

```env
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/campusbite
JWT_SECRET=my_super_secret_random_key_123456
PORT=5000
CLIENT_URL=http://localhost:5173
```

**`.env` GitHub-এ push করবে না।** `.gitignore` already দেওয়া আছে।

# 2. Backend চালাও

```bash
cd server
npm install
npm run dev
```

Successful হলে terminal-এ দেখাবে:

```text
MongoDB Atlas connected
Server running on port 5000
```

# 3. Frontend চালাও

নতুন terminal:

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Browser-এ সাধারণত:

```text
http://localhost:5173
```

open করো।

# 4. Database test

1. Website থেকে Sign up করো।
2. MongoDB Atlas → Browse Collections-এ যাও।
3. `campusbite` database-এর `users` collection-এ user দেখতে পাবে।
4. Menu থেকে meal add করো।
5. Pickup date/time select করো।
6. Submit Order চাপো।
7. Atlas-এর `orders` collection-এ order দেখতে পাবে।

এটা হল central database test-এর মূল proof। অন্য team member একই backend/database ব্যবহার করলে একই data দেখতে পাবে।

# Deploy করার basic idea

Frontend Vercel-এ deploy করা সহজ। Backend Express app Render/Railway-এর মতো Node hosting-এ deploy করা beginner-friendly। Backend deploy হওয়ার পরে frontend-এর environment variable update করবে:

```env
VITE_API_URL=https://YOUR-BACKEND-URL/api
```

Backend host-এর environment variables-এ দিতে হবে:

```env
MONGO_URI=YOUR_ATLAS_CONNECTION_STRING
JWT_SECRET=YOUR_SECRET
CLIENT_URL=https://YOUR-VERCEL-FRONTEND.vercel.app
```

তারপর frontend redeploy করবে।

## Test Note

এই version learning/demo-এর জন্য। Real production website বানালে email verification, forgot password, admin dashboard, payment gateway, inventory/availability, seller/cook management, order cancellation/refund এবং stronger validation যোগ করা উচিত।
