'use client';

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';

export default function CopyCertificateLink({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button type="button" onClick={copy} className="btn-secondary btn-sm">
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : navigatorShareAvailable() ? (
        <Share2 className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {copied ? 'Lien copié' : 'Copier le lien public'}
    </button>
  );
}

function navigatorShareAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.share === 'function';
}
