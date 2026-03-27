# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

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
