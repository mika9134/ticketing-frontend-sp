import { getCompanyName} from "../stores/companyStore";
import { getAccessToken } from "../stores/tokenStore";

let access_token = getAccessToken();
let company_name = getCompanyName();

// Define the base API host
// export const host = 'http://172.10.10.202:8000/';
// export const host = 'https://sfa.enablertech.et/'

// development environment

  export let host = `https://bluesparksfa.bluespark.et:8088/${company_name}/`
   export function getHost() {
     host = `https://bluesparksfa.bluespark.et:8088/${getCompanyName()}/`;
     // console.log("commm", getCompanyName())
   }
 export const host_super = 'https://bluesparksfa.bluespark.et:8088/'

// testing environment
//export let host = `http://127.0.0.1:8000/${company_name}/`
//export function getHost() {
// host = `http://127.0.0.1:8000/${getCompanyName()}/`;
//}
//export const host_super = 'http://127.0.0.1:8000/'
//export let host = `http://127.0.0.1:8002/${company_name}/`;
//export function getHost() {
//host = `http://127.0.0.1:8002/${getCompanyName()}/`;
//}
//export const host_super = 'http://127.0.0.1:8002/'

// Define the token for API access
export const token = access_token;

