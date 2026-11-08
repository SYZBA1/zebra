# Week 1 — Operations and security audit

**Planned day:** Thursday, November 5, 2026  
**Reviewed:** November 8, 2026  
**Scope:** Backend authentication, PostgreSQL connection configuration, API operations  
**Runtime verification:** Not performed; Railway database and deployed API were not available during this review.

## Findings

| Priority | Finding | Evidence | Follow-up |
|---|---|---|---|
| High | The API auth middleware extracts the bearer token but calls `supabase.auth.getUser()` without passing it. The token is therefore not explicitly verified by this call, and authenticated project API requests may be rejected. | `backend/src/middleware/authMiddleware.ts` | Verify with an authenticated API request, then pass the extracted token to `getUser(token)` and add middleware tests before deploying. |
| Medium | PostgreSQL SSL is configured with `rejectUnauthorized: false`, which disables certificate verification. | `backend/src/lib/db.ts` | Check Railway's TLS guidance and enable certificate verification where supported before production use. |
| Low | The README's backend environment example still shows a Supabase pooler URL even though the planned standalone database provider is Railway. | `README.md` | Replace the example with Railway's variable-based connection guidance when Railway is provisioned. Do not put a real connection string in the repository. |

## Checks completed

- Project API queries scope reads and writes by the authenticated `user_id`.
- Project routes require the authentication middleware.
- `.env` files are excluded by `.gitignore`; no live connection string was added to this audit.
- API security headers, CORS allow-listing, and rate limiting are configured in the Express app.

## Acceptance status

The code review and findings log are complete. Runtime authentication, Railway TLS, database connectivity, and backup/recovery remain unverified and need an approved Railway test environment.
