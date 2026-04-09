import { writable, get } from 'svelte/store';

const defaultCompany = { organization: "", logo: "", owner: "" };

// Safe parse helper
function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

// Load initial values from localStorage
const initialCompany = typeof window !== 'undefined'
  ? safeParse(localStorage.getItem('company'), defaultCompany)
  : defaultCompany;

const initialCompanyName = typeof window !== 'undefined'
  ? (localStorage.getItem('companyName') || "")
  : "";

// Main company store
export const companyStore = writable(initialCompany);

// Independent company name store
export const companyName = writable(initialCompanyName);

// Persist `companyStore` to localStorage
if (typeof window !== 'undefined') {
  companyStore.subscribe((value) => {
    localStorage.setItem('company', JSON.stringify(value));
  });

  companyName.subscribe((value) => {
    localStorage.setItem('companyName', value);
  });
}

// Helper to access company name directly
export function getCompanyName() {
  return get(companyName);
}
