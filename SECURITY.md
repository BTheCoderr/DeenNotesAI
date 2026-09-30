# Security Policy

## Supported version

Security fixes target the current production release of DeenNotes AI and the current `main` branch.

## Reporting a vulnerability

Please do **not** open a public GitHub issue for vulnerabilities that could expose user accounts, private reflections, credentials, tokens, subscription data, or server-side secrets.

Prefer GitHub's private vulnerability-reporting / Security Advisory flow when it is available for this repository. Otherwise, contact the repository owner privately through GitHub before sharing exploit details publicly.

Include:

- affected surface and version
- reproduction steps
- expected vs. actual behavior
- impact
- screenshots or logs with secrets and personal data removed

## Secrets

Never commit:

- Supabase service-role or secret keys
- database passwords
- AI provider keys
- JWTs or user session tokens
- Netlify personal access tokens
- private Quran provider credentials
- RevenueCat secret credentials

Public/publishable client values should still be managed through documented environment variables.

## Data access model

Account-owned data should remain protected by Supabase Row Level Security and least-privilege grants. Server-only credentials must never be exposed through `NEXT_PUBLIC_*` or `EXPO_PUBLIC_*` variables unless the credential is explicitly designed to be public.
