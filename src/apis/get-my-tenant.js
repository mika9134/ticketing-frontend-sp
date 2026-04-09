// src/lib/api.js
import { companyName, companyStore, getCompanyName } from '../stores/companyStore';
import { getHost, host_super } from './config.js'
import { isHash } from '$lib/check-hash';
import { get } from 'svelte/store';





export async function fetchTenant(hashedOrganization) {


  if(!isHash(hashedOrganization)){
    throw new Error("Invalid company")

  }
  let api_address = `${host_super}${hashedOrganization}/`;


  try {
    const response = await fetch(`${api_address}get-my-tenant`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      companyStore.set({ })
      companyName.set("")

      throw new Error('Failed to fetch organization');
    }

    const data = await response.json();
  

    companyStore.set(data)
    const cs = get(companyStore);
    companyName.set(hashedOrganization);
    getHost();
  } catch (error) {
      companyStore.set({ });
      companyName.set("");
  }
}
