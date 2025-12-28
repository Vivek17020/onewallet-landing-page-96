import React, { useEffect } from 'react';

/**
 * Security component that sets Content Security Policy headers
 * Helps prevent XSS attacks and other code injection vulnerabilities
 */
export function CSPHeaders() {
  useEffect(() => {
    const isDev = import.meta.env.DEV;

    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';

    const prodDirectives = [
      "default-src 'self' blob: data:",
      // Scripts: AdSense, AMP
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.ampproject.org https://unpkg.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.google.com blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https:",
      // Connect: AdSense
      "connect-src 'self' https: wss: https://pagead2.googlesyndication.com https://*.google.com",
      "media-src 'self' https:",
      // Frames: AdSense
      "frame-src 'self' blob: https://googleads.g.doubleclick.net https://*.google.com https://tpc.googlesyndication.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https:",
      "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ];

    const devDirectives = [
      "default-src 'self' blob: data:",
      // Allow eval and blob scripts during dev for tooling (Vite, SWC) + AdSense
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.ampproject.org https://unpkg.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.google.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https:",
      // Permit websocket/HMR and API calls during dev + AdSense
      "connect-src 'self' ws: wss: https: https://pagead2.googlesyndication.com https://*.google.com",
      "media-src 'self' https:",
      // Allow AdSense iframes
      "frame-src 'self' https://googleads.g.doubleclick.net https://*.google.com https://tpc.googlesyndication.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ];

    cspMeta.content = (isDev ? devDirectives : prodDirectives).join('; ');

    const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingCSP) existingCSP.remove();
    document.head.appendChild(cspMeta);

    const securityHeaders = [
      { name: 'X-Content-Type-Options', content: 'nosniff' },
      { name: 'X-Frame-Options', content: 'DENY' },
      { name: 'X-XSS-Protection', content: '1; mode=block' },
      { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
    ];

    securityHeaders.forEach((header) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = header.name;
      meta.content = header.content;
      const existing = document.querySelector(`meta[http-equiv="${header.name}"]`);
      if (existing) existing.remove();
      document.head.appendChild(meta);
    });

    return () => {
      // Persist headers
    };
  }, []);

  return null;
}
