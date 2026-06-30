import { getCompanyName } from "../stores/companyStore";
import { getAccessToken } from "../stores/tokenStore";

let access_token = getAccessToken();
let company_name = getCompanyName();

// Defining the options for the hosts
const AZURE_ENVIRONMENT = 'https://bs-sfa-acc-ne-apigw-aca01.ambitiousflower-d54c051b.northeurope.azurecontainerapps.io/';
const EXPERIMENTAL_ENVIRONMENT = 'https://bluesparksfa.bluespark.et:8088/';
const LOCAL_ENVIRONMENT = 'http://127.0.0.1:8001/';
const PUBLIC_IP_LOCAL_ENVIRONMENT = 'http://172.10.10.149:8001/';

// Picking the right backend host
// const BACKEND_HOST = AZURE_ENVIRONMENT;
const BACKEND_HOST = LOCAL_ENVIRONMENT;

// Setting up the host and super host
export let host = `${BACKEND_HOST}${company_name}/`
export function getHost() {
  host = `${BACKEND_HOST}${getCompanyName()}/`;
}
export const host_super = `${BACKEND_HOST}`

// Export the token for API access
export const token = access_token;
