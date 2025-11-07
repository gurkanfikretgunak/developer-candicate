export type PolicyType = 'gdpr' | 'privacy' | 'cookies';

export const policyOrder: PolicyType[] = ['gdpr', 'privacy', 'cookies'];

export const policyFallbackContent: Record<PolicyType, string> = {
  gdpr: `## GDPR Compliance

We are committed to protecting the privacy of all candidates and hiring teams. Personal data is collected only for the purpose of managing the evaluation process and is never sold to third parties.

- Candidates may request deletion of their data at any time by contacting our support team.
- Access to candidate data is limited to organization members with the appropriate permissions.
- Data is stored securely in Supabase (EU data centers).
`,
  privacy: `## Privacy Policy

We collect minimal information necessary to provide the platform. This includes account details, evaluation data, and optional files such as CVs.

- We do not track users for advertising purposes.
- All access is audited and restricted via Role Level Security (RLS).
- Files uploaded to the platform are encrypted at rest.
`,
  cookies: `## Cookie Policy

We use cookies to:

1. Authenticate users securely.
2. Store language preferences.
3. Maintain session continuity across dashboard pages.

We do not use third-party advertising cookies. You can opt-out of analytics cookies at any time.
`,
};
