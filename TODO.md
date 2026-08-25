# TODO

Ordered roughly top-to-bottom in build order: manual/account-level setup first (marked N/A — no code), then schema, then the accounts hub app, then integration into HostMate and Cue, then DNS, then end-to-end testing. Check items off (`- [x]`) instead of deleting, or delete once truly done — your call.

## Shared account login (SSO across HostMate + Cue)

Decided approach: Supabase Auth, identity lives in a new `identity` schema inside the *existing* HostMate Supabase project (not a separate project — free-tier project cap hit, and this avoids a 3rd project entirely; can be split into its own project later if needed, at the cost of a coordinated JWT-secret cutover). HostMate and Cue each independently verify the shared JWT. Business-owner/admin identity only — HostMate's existing venue PIN logins for front-of-house staff are untouched. Central account hub at `accounts.cadenceops.com.au` handles login + app switching, like accounts.google.com → Drive/Docs.

- [ ] Enable the Email (password) auth provider in the existing HostMate Supabase project (if not already on) **[N/A — manual, Supabase dashboard]**
- [ ] (Optional) Enable Google OAuth sign-in — needs a Google Cloud OAuth client set up first **[N/A — manual, Supabase dashboard + Google Cloud Console]**
- [ ] Confirm the four values needed for integration: Project URL, `anon` key, `service_role` key, JWT Secret (Project Settings → API) — same project HostMate already uses **[N/A — manual]**
- [x] Design and create the `identity` schema (`businesses`, `business_members`) + Row-Level-Security policies in the existing HostMate Supabase project, kept self-contained (no FKs into `public`) so it can be split into its own project later without a redesign
- [x] Scaffold the accounts hub app: login form (email/password, + magic link/Google if enabled) and an app-switcher screen linking to HostMate and Cue
- [ ] Implement cookie-based Supabase session storage in the hub (`Domain=.cadenceops.com.au`) in place of the default `localStorage`, so the session is visible to every subdomain
- [ ] Add session-hydration bootstrap code to HostMate's frontend: read the shared cookie on load and call `supabase.auth.setSession(...)` before rendering owner-level UI
- [ ] Add the same session-hydration bootstrap code to Cue's frontend
- [ ] Add JWT verification (against the identity project's JWT secret) to Cue's Cloudflare Functions for any owner-level protected routes
- [ ] Add JWT verification to HostMate's Cloudflare Functions for any new owner-level (non-PIN) routes, as they come up
- [ ] Build a sign-out flow that clears the shared cookie and ends the session across the hub, HostMate, and Cue together
- [ ] Set up the `accounts.cadenceops.com.au` custom domain for the hub in Cloudflare Pages **[N/A — manual, Cloudflare dashboard/DNS]**
- [ ] Confirm/set up the `hostmate.cadenceops.com.au` custom domain in Cloudflare Pages **[N/A — manual, Cloudflare dashboard/DNS]**
- [ ] Set up the `cue.cadenceops.com.au` custom domain for Cue in Cloudflare Pages **[N/A — manual, Cloudflare dashboard/DNS]**
- [ ] End-to-end test: log in at the hub, launch into HostMate, confirm the session is recognized with no second login prompt
- [ ] End-to-end test: launch into Cue from the hub (or directly), confirm the session is recognized with no second login prompt
- [ ] End-to-end test: sign out from one app, confirm the session ends across the hub and both apps
