import { writable } from 'svelte/store';

// Store for managing global error messages
export const errorMessage = writable(null);

// Store for managing global loading state
export const isLoading = writable(false);