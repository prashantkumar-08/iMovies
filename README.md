# iMovies – MERN movie ticket booking
## Run
1. Start MongoDB locally (or use Atlas).
2. Server: `cd server && cp .env.example .env && npm i && npm run seed && npm run dev`  (API on :5000)
3. Client: `cd client && npm i && npm run dev`  (UI on :5173)
Seed logins: admin@imovies.com / admin123 , user@imovies.com / user123
## Structure (MVC)
models/ (Mongoose) · controllers/ (logic) · routes/ (view/routing layer) · middleware/ (JWT, roles, errors)
## Key flows
- Seat locking: POST /api/bookings atomically locks seats for 5 min (TTL), emits Socket.io `seats` events.
- Payment: POST /api/bookings/:id/pay is a simulated gateway. Swap the marked block in bookingController.js for Razorpay/Stripe.
- Admin: /api/movies, /api/theatres, /api/shows (POST creates show + seat grid), /api/admin/stats.
