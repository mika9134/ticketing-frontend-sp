import {host,token} from "./config.js";
import { errorMessage, isLoading } from '../stores/uiStores.js';
import { formatFieldNames } from "$lib/utils.js";
import { setTokens, getRefreshToken, getAccessToken } from "../stores/tokenStore.js";
import { goto } from '$app/navigation';
import { token_refresh } from "../apis/api-utils.js";

export function exportCSV(datasets = [], filenames = []) {
  const dateStr = new Date().toISOString().split('T')[0];

  const buildCSV = (rows) => {
    if (!rows || rows.length === 0) return null;
    const headers = Object.keys(rows[0]).filter(h => h !== "file_name");
    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const bom = '\uFEFF';
    const headerRow = headers.map(h => `"${h}"`).join(',');
    const body = rows.map(r => headers.map(h => escape(r[h])).join(',')).join('\n');
    return bom + headerRow + '\n' + body;
  };

  const download = (csv, filename) => {
    if (!csv) return;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  datasets.forEach((rows, index) => {
    if (!Array.isArray(rows) || rows.length === 0) return;

    let fileName = filenames[index] || `export_${index + 1}`;
    
    fileName = fileName.replace(/\.csv$/i, '');

    download(
      buildCSV(rows),
      `${fileName}_${dateStr}.csv` 
    );
  });
}

export async function fetchSummary(
    endpoint, 
    token, 
    page = 1, 
    pageSize = 10, 
    column = "", 
    searchString = "", 
    additional_param = {}, 
    start_date = "", 
    end_date = ""
) {
    try {
        isLoading.set(true);
        errorMessage.set(null);

        // 1. Base URL
        let url = `${endpoint}?page=${page}&pageSize=${pageSize}`;

        // 2. Additional Params
        if (typeof additional_param === "object" && additional_param !== null) {
            Object.entries(additional_param).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url += `&${key}=${encodeURIComponent(value)}`;
                }
            });
        } else if (additional_param) {
            url += `&id=${encodeURIComponent(additional_param)}`;
        }

        // 3. Filters
        if (column) url += `&column=${encodeURIComponent(column)}`;
        if (searchString) url += `&searchString=${searchString}`;
        if (start_date) url += `&start_date=${encodeURIComponent(start_date)}`;
        if (end_date) url += `&end_date=${encodeURIComponent(end_date)}`;
        // 4. Fetch
        const response = await fetch(url, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        // 5. Token Refresh
        if (response.status === 401) {
            const refreshed = await token_refresh();
            if (refreshed) {
                return fetchSummary(
                    endpoint,
                    getAccessToken(),
                    page,
                    pageSize,
                    column,
                    searchString,
                    additional_param,
                    start_date,
                    end_date
                );
            }
        }

        // 6. Error handling
        if (!response.ok) {
            const errorDetails = await response.json();
            errorMessage.set(errorDetails.error || "Failed to fetch summary");
            return errorDetails;
        }

        // 7. Success
        return await response.json();

    } catch (error) {
        console.error("Fetch Summary Error:", error);
        errorMessage.set(error.message);
        return { error: error.message };
    } finally {
        isLoading.set(false);
    }
}

export async function fetch_all_filters(get_table_endpoint, token) {
    let url = `${get_table_endpoint}`;

    try {
        let response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Encoding': 'gzip',
            },
        });

        console.log("responseeeeeee", response);

        // Handle unauthorized
        if (response.status === 401) {
            if (await token_refresh()) {
                return fetch_all_filters(token); // retry with refreshed token
            }
            const errorDetails = await response.json();
            errorMessage.set(errorDetails.error);
            return errorDetails;
        }

        // Handle other errors
        if (!response.ok) {
            const errorDetails = await response.json();
            errorMessage.set(errorDetails.error);
            return errorDetails;
        }

        const data = await response.json();
        return data;

    } catch (err) {
        console.error("Fetch failed:", err);
        errorMessage.set("Network error");
        return { error: "Network error" };
    }
}


export async function fetchTable(get_table_endpoint, token=token, page=1, pageSize=10, column="", searchString="", additional_param={}, start_date="", end_date="") {
    try {

        isLoading.set(true); // Start loading
        errorMessage.set(null); // Clear previous errors
        let url = `${get_table_endpoint}?page=${page}&pageSize=${pageSize}`;
        
        
        if(typeof additional_param === 'object')
            Object.keys(additional_param).forEach((k) => {url = additional_param[k] === null? url:  url + `&${k}=${additional_param[k]}`;});
        else
           url = url + `&id=${additional_param}`;    
        
        if(column != "")
        {
        url = url + `&column=${column}`;
        }
        
        if(searchString != "")
        {
        url = url + `&searchString=${searchString}`;
        }

        if (start_date != "")
        {
        url = url + `&start_date=${start_date}`;
        }
        
        if (end_date != "")
        {
        url = url + `&end_date=${end_date}`;
        }
        
        let response = await fetch(url, {
            
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Encoding': 'gzip',
              },
        });
        
        if (response.status == 401) {
        if (await token_refresh())
        {
               return fetchTable(get_table_endpoint, getAccessToken(), page, pageSize, column, searchString, additional_param, start_date, end_date);
        }
    }
        
        if (!response.ok) {
            const errorDetails = await response.json();
            errorMessage.set(errorDetails.error);
            return errorDetails;
        }
        const columns = await response.json();

        // For debugging: log dynamically read keys
        if (columns.length > 0) {
            const keys = Object.keys(columns[0]);
        }
        return columns;
    } catch (error) {
        return {"error": error}
    } finally {
        isLoading.set(false);
    }
}

export async function fetchHiddenFields(endpoint, token = token) {
    try {
        isLoading.set(true); // Start loading
        errorMessage.set(null); // Clear previous errors
        const url = `${host}utility/hidden-table-fields?endpoint=${endpoint}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (response.status == 401) {
        if (await token_refresh())
        {
            return fetchHiddenFields(endpoint, getAccessToken());   
        }
    }
        
        if (!response.ok) {
            const errorDetails = await response.json();
            errorMessage.set(errorDetails.message);
            return errorDetails;
        }

        const errorDetails = await response.json();
    
        if(!errorDetails.succeed) {
            errorMessage.set(errorDetails.error);
            return errorDetails;
        }

        const hiddenFields = await response.json();
        return hiddenFields; // Return the list of hidden fields
    } catch (error) { 
        return {"error": error}
    } finally {
        isLoading.set(false);
    }
}

export async function fetchSearchColumns(endpoint, token = token) {
    try {
        isLoading.set(true); // Start loading
        errorMessage.set(null); // Clear previous errors
        const url = `${endpoint}`;
        const response = await fetch(url, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        
        if (response.status == 401) {
            if (await token_refresh())
            {
              return fetchSearchColumns(endpoint, getAccessToken());
            }
        }
        
        if (!response.ok) {
            const errorDetails = await response.json();
            errorMessage.set(errorDetails.error);
            return errorDetails;
        }

        const hiddenFields = await response.json();
        return hiddenFields; // Return the list of hidden fields
    } catch (error) { 
        return {"error": error}
    } finally {
        isLoading.set(false);
    }
}
