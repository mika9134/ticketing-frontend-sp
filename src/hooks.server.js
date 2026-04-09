import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
  const path = event.url.pathname;

  if (path.endsWith('/signin')) {
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 1 && segments[0] === 'signin') {
      throw redirect(302, '/');
    } else if (segments.length === 2 && segments[1] === 'signin') {
      throw redirect(302, `/${segments[0]}`);
    }
  }

  return resolve(event);
}
