/**
 * URL security utilities for safe link handling
 */

const ALLOWED_PROTOCOLS = ['https:', 'http:'];
const BLOCKED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '192.168.',
  '10.',
  '172.16.',
];

export interface SafeUrlResult {
  isValid: boolean;
  sanitizedUrl: string | null;
  isSecure: boolean;
  error?: string;
}

/**
 * Validates and sanitizes a URL for safe display and navigation
 */
export function validateAndSanitizeUrl(url: string | null | undefined): SafeUrlResult {
  if (!url || typeof url !== 'string') {
    return {
      isValid: false,
      sanitizedUrl: null,
      isSecure: false,
      error: 'Invalid URL',
    };
  }

  // Trim whitespace
  const trimmed = url.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      sanitizedUrl: null,
      isSecure: false,
      error: 'Empty URL',
    };
  }

  try {
    // Parse URL
    let parsed: URL;
    
    // If URL doesn't start with protocol, assume https
    const urlWithProtocol = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;

    parsed = new URL(urlWithProtocol);

    // Check protocol
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return {
        isValid: false,
        sanitizedUrl: null,
        isSecure: false,
        error: 'Invalid protocol. Only HTTP and HTTPS are allowed.',
      };
    }

    // Check for blocked domains (internal/private IPs)
    const hostname = parsed.hostname.toLowerCase();
    const isBlocked = BLOCKED_DOMAINS.some((blocked) => hostname.includes(blocked));

    if (isBlocked) {
      return {
        isValid: false,
        sanitizedUrl: null,
        isSecure: false,
        error: 'Internal/private URLs are not allowed.',
      };
    }

    // Sanitize: remove dangerous characters and ensure proper encoding
    const sanitized = parsed.toString();

    // Additional check: ensure no javascript: or data: protocols slipped through
    if (sanitized.toLowerCase().startsWith('javascript:') || sanitized.toLowerCase().startsWith('data:')) {
      return {
        isValid: false,
        sanitizedUrl: null,
        isSecure: false,
        error: 'Dangerous protocol detected.',
      };
    }

    return {
      isValid: true,
      sanitizedUrl: sanitized,
      isSecure: parsed.protocol === 'https:',
    };
  } catch (error) {
    return {
      isValid: false,
      sanitizedUrl: null,
      isSecure: false,
      error: 'Invalid URL format',
    };
  }
}

/**
 * Safely opens a URL in a new tab with security attributes
 */
export function getSafeLinkProps(url: string): {
  href: string;
  target: string;
  rel: string;
} | null {
  const validation = validateAndSanitizeUrl(url);

  if (!validation.isValid || !validation.sanitizedUrl) {
    return null;
  }

  return {
    href: validation.sanitizedUrl,
    target: '_blank',
    rel: 'noopener noreferrer',
  };
}

