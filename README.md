# Headline Fights API

## Overview

This is the Express + MongoDB backend for Headline Fights. It handles:

- Login, registration, sessions, and email verification
- Headline fetches for the game
- Saving user answers and aggregate statistics
- Periodic headline scraping

## Node Version

Use Node 24.

- Preferred local version: `24.14.1`
- This repo pins Node in `.node-version`
- `package.json` also enforces the supported range

## Local Dev Quick Start

1. Install dependencies:

```bash
npm install
```

2. Make sure `.env` is configured for local development. The important values are:

```env
NODE_ENV=dev
ORIGIN=http://localhost:3001
DOMAIN=localhost
DATABASE_CONNECTION_STRING=...
STATISTICS_DOCUMENT_ID=...
SESSION_SECRET=...
RESEND_API_KEY=...
SENDER_EMAIL=...
SENDER_EMAIL_2=...
```

3. Start the API:

```bash
npm run dev
```

4. The API runs on:

```text
http://localhost:3000
```

You do not need a separate React toolchain here. This is just Node/Express.

## Database Setup

Short version: you do not need a local MongoDB instance unless you want one.

By default, this repo can run locally against an Atlas database if
`DATABASE_CONNECTION_STRING` points to Atlas. That is the simplest setup.

If you want true local Mongo instead:

1. Start MongoDB locally
2. Set `DATABASE_CONNECTION_STRING=mongodb://localhost/test`
3. Keep `NODE_ENV=dev`, `ORIGIN=http://localhost:3001`, and `DOMAIN=localhost`

Important: this app expects a `HeadlineStat` document to already exist, and
`STATISTICS_DOCUMENT_ID` must point to it.

## How To Check Whether The DB Is Ready

Connect with `mongosh` using your connection string, then check:

1. That the database has headline data:

```text
db.headlines.countDocuments()
```

2. That the aggregate stats document exists:

```text
db.headlinestats.findOne({ _id: ObjectId("<STATISTICS_DOCUMENT_ID>") })
```

3. That users can be stored:

```text
db.users.countDocuments()
```

If the `headlinestats` query returns `null`, the app is not fully set up yet.

## Fresh DB Requirement

If you point the app at a brand new empty database, you must create a
`HeadlineStat` document first and save its `_id` into `STATISTICS_DOCUMENT_ID`.

This document is used for the aggregate counts shown on the homepage and
dashboard.

## Frontend Pairing

For full local development, run the frontend separately on port 3001.

The frontend must point to:

```text
http://localhost:3000
```

See the frontend README for the exact Next.js setup.

## Environment Notes

- `NODE_ENV=production` is the only value treated as production by the app
- Any other value acts as non-production/local behavior
- CORS uses `ORIGIN`
- Session cookies use `DOMAIN`
- Sessions are stored in Mongo using `DATABASE_CONNECTION_STRING`
- `SESSION_SECRET` must be a cryptographically random string. Generate one with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Email Notes

This repo uses Resend for verification and password reset emails.

If `RESEND_API_KEY` is real, local testing can send real email.

Password reset links use `ORIGIN` as the base URL, so they work correctly in
local and staging environments when `ORIGIN` is set appropriately.

## Useful Commands

```bash
npm install          # install dependencies
npm run dev          # run locally with tsx watch (no build step)
npm run build        # compile TypeScript → dist/
npm start            # run compiled output (production)
npm test             # run all tests
npm run lint         # lint
npm run format       # format
```

## Architecture

- `headline-fights-fe`
- `headline-fights-api`
- `headline-fights-db`
- `headline-fights-s3`
