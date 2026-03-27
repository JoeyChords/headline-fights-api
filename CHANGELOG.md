# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.1.1] - 2026-03-27

### Security

- Fixed critical password reset bypass in [routes/resetPassword.js](./routes/resetPassword.js) — endpoint now validates `password_reset_token` from the request against the stored token before allowing a password change, and clears the token after use to prevent reuse.
- Fixed IDOR vulnerability in [routes/updateStatistics.js](./routes/updateStatistics.js) — user statistics are now updated using `req.user.id` from the authenticated session instead of a user-supplied ID in the request body.
- Added authentication guard to [routes/game.js](./routes/game.js) and [routes/settings.js](./routes/settings.js) — unauthenticated requests now receive a 401 instead of crashing.
- Replaced `Math.random()` with `crypto.randomInt()` for all email verification code generation across login, register, game, settings, and dashboard routes.
- Added `helmet` middleware to set secure HTTP response headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc.).
- Added `express-rate-limit` to auth endpoints — login, forgotPassword, resetPassword, and verify are limited to 10 requests per 15 minutes; register is limited to 5 per hour.
- Fixed accidental global variable declarations in [models/user.js](./models/user.js), [models/headline.js](./models/headline.js), and [models/headlineStat.js](./models/headlineStat.js) — models are now declared with `const`.
- Added explicit `require` statements for Mongoose models in all route files that use them, removing reliance on accidental globals.
- Added `.catch()` error handling to promise chains in [routes/register.js](./routes/register.js).
- Added fallback 401 response to [routes/login.js](./routes/login.js) for the case where the route handler is reached without an authenticated session.

## [1.1.0] - 2026-03-26

### Added

- Local development setup guidance in the README.

### Changed

- Pinned the API runtime to Node 24 for local and deploy consistency.
- Migrated outbound email delivery from SendGrid/Nodemailer to Resend.
- Upgraded the package and dependency stack to current supported versions, including Express, Mongoose, bcrypt, and related runtime packages.
- Replaced deprecated middleware usage such as `body-parser` with current Express equivalents.
- Updated `connect-mongo` integration to match the newer package export shape.
- Switched password reset token generation to `crypto.randomUUID()`.
- Removed leftover Jest scaffolding and placeholder test artifacts so a real API test suite can be added cleanly later.

### Security

- Performed dependency upgrades and lockfile refreshes to eliminate known `npm audit` vulnerabilities in the API package set.

### Fixed

- Updated password hashing in [models/user.js](./models/user.js) to use async Mongoose middleware compatible with the current stack.
- Fixed `comparePassword()` in [models/user.js](./models/user.js) to return the bcrypt comparison result.
