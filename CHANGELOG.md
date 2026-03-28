# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [1.2.1] - 2026-03-27

### Fixed

- Fixed [routes/verify.js](./routes/verify.js) — session set manually after email verification was missing `email_verified: true`, causing the game page to immediately redirect newly verified users to `/login`.
- Fixed [routes/register.js](./routes/register.js) — `sendVerificationEmail` was fire-and-forget; now awaited so failures surface as a 500 instead of silently succeeding with no email sent. Also corrected email argument to use the normalized form.

## [1.2.0] - 2026-03-27

### Fixed

- Fixed `passport.serializeUser` in [index.js](./index.js) — `email_verified` was not included in the serialized session object, causing `req.user.email_verified` to always be `undefined` in route handlers. This made [routes/headlines.js](./routes/headlines.js) return 403 for all authenticated users regardless of verification status.
- Fixed password reset email link in [functions/sendPasswordResetEmail.js](./functions/sendPasswordResetEmail.js) — URL was hardcoded to the production domain; now uses `process.env.ORIGIN` so reset links work correctly in local and staging environments.
- Removed redundant `dotenv.config()` calls from [functions/sendPasswordResetEmail.js](./functions/sendPasswordResetEmail.js) and [functions/sendVerificationEmail.js](./functions/sendVerificationEmail.js) — env is already loaded by `index.js` at startup.

## [1.1.3] - 2026-03-27

### Security

- Fixed unverified accounts being able to access gameplay — [routes/headlines.js](./routes/headlines.js) and [routes/updateStatistics.js](./routes/updateStatistics.js) now return 403 if the session user's `email_verified` flag is false.
- Added server-side allowlist validation in [routes/updateStatistics.js](./routes/updateStatistics.js) for all dynamic `$inc` field paths — `attribute1`, `attribute2` must be one of the 15 known bias attributes; `attribute1Answer`, `attribute2Answer` must be `true`, `false`, or `neither`; `publicationAnswer` must match a known publication; `headline` must be a valid 24-character hex ObjectId. Inputs outside the allowlist are rejected with 400.
- Changed the `updateStatistics` write gate from `req.body.user` (client-controlled) to `req.body.headline` (the meaningful field).
- Added `isStrongPassword` enforcement to [routes/resetPassword.js](./routes/resetPassword.js) — the reset flow no longer accepts weak passwords.
- Fixed email enumeration in [routes/forgotPassword.js](./routes/forgotPassword.js) — the endpoint now always returns `email_sent: true` regardless of whether the email address is registered.
- Changed [routes/logout.js](./routes/logout.js) from GET to POST to prevent CSRF-triggered logouts via top-level cross-site navigation.
- Added `req.session.destroy()` after `req.logout()` in [routes/logout.js](./routes/logout.js) to ensure the session is fully invalidated on logout.

## [1.1.2] - 2026-03-27

### Security

- Fixed bcrypt fire-and-forget anti-pattern in [routes/resetPassword.js](./routes/resetPassword.js) — `bcrypt.hash` is now awaited so the password update cannot complete before the hash is ready.
- Fixed fire-and-forget async calls in [routes/updateStatistics.js](./routes/updateStatistics.js) — `updateHeadlineDocument` and `updateHeadlineStatsDocument` are now awaited so errors are catchable.
- Added null guard in [routes/verify.js](./routes/verify.js) — if no user document is found for the submitted email the route returns `submitted_in_time: false` instead of crashing on property access.
- Added server-side password strength validation in [routes/register.js](./routes/register.js) using `isStrongPassword` — weak passwords are rejected with a 400 response before any database work occurs.
- Added try/catch error handling to [routes/home.js](./routes/home.js) and [routes/dashboard.js](./routes/dashboard.js) — unhandled DB errors now return 500 instead of crashing the process.
- Fixed accidental global variable `userCount` in [routes/home.js](./routes/home.js) — declared with `const`.
- Added empty-array guard in [routes/headlines.js](./routes/headlines.js) — returns `{ headline: null }` instead of crashing when the headline collection is empty.
- Replaced deprecated `findByIdAndRemove` with `findByIdAndDelete` in [routes/headlines.js](./routes/headlines.js).

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
