import { formatIncompletePhoneNumber } from "@/lib/libphonenumber";

// Node.js compatible base64 decoding
function base64Decode(str: string): string {
  if (typeof window === 'undefined') {
    // Server-side: Use Buffer
    return Buffer.from(str, 'base64').toString('utf-8');
  } else {
    // Client-side: Use atob
    return atob(str);
  }
}

export function decodeEmail(email: string) {
  return base64Decode(email);
}

export function decodePhoneNumber(phone: string) {
  return base64Decode(phone);
}

export function formatPhoneNumber(phone: string) {
  return formatIncompletePhoneNumber(phone);
}
