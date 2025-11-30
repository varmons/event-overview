# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Event Overview seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please send an email describing the vulnerability. Include the following details:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- A response acknowledging your report within 48 hours
- An assessment of the vulnerability and its severity
- A timeline for addressing the issue
- Notification when the vulnerability has been fixed

## Security Best Practices

When using Event Overview:

1. **Environment Variables**: Never commit `.env.local` or any file containing secrets
2. **Password Hash**: Use a strong, unique password and store only its SHA-256 hash
3. **Supabase Keys**: Use Row Level Security (RLS) policies in Supabase
4. **Dependencies**: Regularly update dependencies to patch known vulnerabilities

## Generating a Secure Password Hash

```bash
# Using Node.js
node -e "console.log(require('crypto').createHash('sha256').update('YOUR_PASSWORD').digest('hex'))"

# Using OpenSSL
echo -n "YOUR_PASSWORD" | openssl dgst -sha256
```

Then set `NEXT_PUBLIC_SUBMIT_PASSWORD_HASH` in your `.env.local` file.
