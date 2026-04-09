export function isHash(str) {
  return /^[a-fA-F0-9]{32}$/.test(str) ||  // MD5
         /^[a-fA-F0-9]{40}$/.test(str) ||  // SHA1
         /^[a-fA-F0-9]{64}$/.test(str);    // SHA256
}
