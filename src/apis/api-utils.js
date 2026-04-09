
import { host, host_super, token } from "./config.js";
import { setTokens, getRefreshToken } from "../stores/tokenStore.js";
import { goto } from '$app/navigation';
import { page } from '$app/stores';
let timeline;
let span;
let api_address = host;

var lastRefresh = 0;
var delay = 60;

/**
 * Login API call
 * @param {string} username - The username of the user
 * @param {string} password - The password of the user
 * @returns {Promise<{access_token: string, refresh_token: string}>} - The tokens
 */
export async function login(username, password) {
  const apiUrl = `${host}account/login`;
  // const apiUrl = `${host_super}login`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(JSON.stringify({ "message": response.error }));
  }

  let data = await response.json();

  if (data.succeed == false) {
    throw new Error(JSON.stringify({ "changePassword": false, "message": data.error }));
  }


  if (data.succeed && data.error === "Password Reset Required") {
    throw new Error(JSON.stringify({ "changePassword": true, "message": data.access_token }));
  }

  let access_token = data.access_token;
  let refresh_token = data.refresh_token;

  return { access_token, refresh_token }; // Return the tokens

}

export async function token_refresh() {
  const apiUrl = `${host}account/refresh`;
  // const apiUrl = `${host_super}login`
  let token = getRefreshToken();

  if (lastRefresh >= (Date.now() - delay))
    return true;
  lastRefresh = Date.now();


  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',
    },
    body: JSON.stringify({ refresh_token: token }),
  });
  if (response.status == 401) {
    console.log("Expired");
    setTokens("", "");
    window.location.reload();
    return false;
  }

  let data = await response.json();

  if (data.succeed) {
    let access_token = data.access_token;
    let refresh_token = data.refresh_token;
    setTokens(access_token, refresh_token);
    return true; // Return the tokens
  }

}

export async function login_superadmin(username, password) {

  const apiUrl = `${host_super}login`
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error(JSON.stringify({ "message": response.error }));
  }

  let data = await response.json();

  if (data.succeed == false) {
    throw new Error(JSON.stringify({ "changePassword": false, "message": data.error }));
  }


  if (data.succeed && data.error === "Password Reset Required") {
    throw new Error(JSON.stringify({ "changePassword": true, "message": data.access_token }));
  }

  let access_token = data.access_token;
  let refresh_token = data.refresh_token;
  return { access_token, refresh_token }; // Return the tokens
}


export async function fetchRecentSalesVsDefect(span, timeline, region, territory, route, point_of_sale, user_id, category, parent_product, product, warehouse, stock_type) {

  let apiUrl = new URL(`${host}dashboard-volume/defect-vs-stock/recent?timeline=${timeline}&span=${span}`);

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (point_of_sale)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale);
  if (user_id)
    apiUrl.searchParams.append('employee_id', user_id);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parent_product)
    apiUrl.searchParams.append('parent_product_id', parent_product);
  if (product)
    apiUrl.searchParams.append('product_id', product);
  if (warehouse)
    apiUrl.searchParams.append('warehouse_id', warehouse);
  if (stock_type)
    apiUrl.searchParams.append('stock_type', stock_type);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });

    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}



export async function fetchTotalVolume(span, timeline, region, territory, route, point_of_sale, user_id) {

  let apiUrl = new URL(`${host}dashboard-volume/total-volume?timeline=${timeline}`);
  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (point_of_sale)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale);
  if (user_id)
    apiUrl.searchParams.append('user_id', user_id);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });

    if (response.status == 401) {
      await token_refresh();
    }
    else {

    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchMTM(span, timeline, region, territory, route, point_of_sale, user_id) {

  let apiUrl = new URL(`${host}dashboard-volume/mtm?timeline=${timeline}`);

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (point_of_sale)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale);
  if (user_id)
    apiUrl.searchParams.append('user_id', user_id);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });

    if (response.status == 401) {
      await token_refresh();
    }
    else {

    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}


export async function fetchSalesVolume(span, timeline, region, territory, route, point_of_sale, employee, category, parentProduct, product) {
  const apiUrl = new URL(`${host}dashboard-volume/volume?span=${span}&timeline=${timeline}`);
  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (point_of_sale)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}



export async function fetchCashVsCredit(span, timeline, region, territory_id, route_id, point_of_sale_id, employee, category, parentProduct, product) {

  let apiUrl = new URL(`${host}dashboard-volume/cash-vs-credit?span=${span}&timeline=${timeline}`);

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);


  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching cash vs credit: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchTopRevenue(span, timeline, region, territory_id, route_id, point_of_sale_id, employee, category, parent_product) {

  let apiUrl = new URL(`${host}dashboard-volume/revenue?span=${span}&timeline=${timeline}`);
  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id',category);
  if (parent_product)
    apiUrl.searchParams.append('parent_product_id',parent_product);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching top revenue ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

// Add more API functions as needed
export async function fetchYearsToDate(span, timeline, territory_id, route_id, point_of_sale_id, employee, category, parentProduct, product) {
  const apiUrl = new URL(`${host}dashboard-volume/year-to-date-sales?span=${span}&timeline=${timeline}`);

  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchYearsToDateStat(span, timeline) {
  const apiUrl = `${host}dashboard-volume/years-to-date-single?span=${span}&timeline=${timeline}`;
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchTotalDeposit(span, timeline, region, territory_id, route_id, point_of_sale_id, employee_id) {
  let apiUrl = new URL(`${host}dashboard-volume/sales-vs-deposit?span=${span}&timeline=${timeline}`)

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (employee_id)
    apiUrl.searchParams.append('employee_id', employee_id);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}
export async function fetchTotalDepositRecent(timeline, region, territory_id, route_id, point_of_sale_id, employee_id) {
  let apiUrl = new URL(`${host}dashboard-volume/sales-vs-deposit/recent?timeline=${timeline}`)

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (employee_id)
    apiUrl.searchParams.append('employee_id', employee_id);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching recent deposit data: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}


export async function fetchDefectVsStock(span, timeline, category, parent_product, product, warehouse, stock_type) {
  const apiUrl = new URL(`${host}dashboard-volume/defect-vs-stock?span=${span}&timeline=${timeline}`);

  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parent_product)
    apiUrl.searchParams.append('parent_product_id', parent_product);
  if (product)
    apiUrl.searchParams.append('product_id', product);
  if (warehouse)
    apiUrl.searchParams.append('warehouse_id', warehouse);
  if (stock_type)
    apiUrl.searchParams.append('stock_type', stock_type);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}


export async function fetchPurchasedVssold(span, timeline) {
  const apiUrl = `${host}dashboard-volume/purchased-vs-sold?span=${span}&timeline=${timeline}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchEmployees(span, timeline, territory_id, route_id, point_of_sale_id, employee, category, parentProduct, product) {
  const apiUrl = new URL(`${host}dashboard-volume/top-sales-sr?timeline=${timeline}&span=${span}`);

  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchSalesVsTarget(span, timeline, territory, route, employee, category, parentProduct, product) {
  let apiUrl = new URL(`${host}dashboard-kpi/sales-volume-kpi?span=${span}&timeline=${timeline}`);

  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales vs target: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchOrderSalesContribution(span, timeline, territory, route, employee, category, parentProduct, product) {
  let apiUrl = new URL(`${host}dashboard-kpi/order-conversion-kpi?span=${span}&timeline=${timeline}`);

  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching order sales contribution: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchPenetrationTarget(span, timeline, territory, route, employee) {
  let apiUrl = new URL(`${host}dashboard-kpi/penetration-kpi?span=${span}&timeline=${timeline}`);

  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);


  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching order sales contribution: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchCallCompletionTarget(span, timeline, territory, route, employee) {
  let apiUrl = new URL(`${host}dashboard-kpi/call-completion-kpi?span=${span}&timeline=${timeline}`);

  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);


  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching order sales contribution: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchProductivityTarget(span, timeline, territory, route, employee) {
  let apiUrl = new URL(`${host}dashboard-kpi/productivity-kpi?span=${span}&timeline=${timeline}`);

  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);


  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching order sales contribution: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchTopCustomers(span, timeline, region, territory_id, route_id, top_n, category, parentProduct, product, product_type) {
  const apiUrl = new URL(`${host}dashboard-products/top-customers?span=${span}&timeline=${timeline}`);

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (top_n)
    apiUrl.searchParams.append('top_n', top_n);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);
  if (product_type)
    apiUrl.searchParams.append('product_type', product_type);
  
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
      // body: JSON.stringify({ territory_id, route_id, top_n }),
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching Top Categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchTopCategories(span, timeline, region, territory_id, route_id, point_of_sale_id, top_n) {
  const apiUrl = new URL(`${host}dashboard-products/top-categories?span=${span}&timeline=${timeline}`);

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (top_n)
    apiUrl.searchParams.append('top_n', top_n);
 
  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching Top Customers: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}
export async function fetchremaningDepositVolume(span, timeline, territory_id, route_id, point_of_sale_id, top_n) {
  const apiUrl = `${host}dashboard-volume/top-remaining-deposits?span=${span}&timeline=${timeline}&territory_id=${territory_id}&route_id=${route_id}&point_of_sale_id=${point_of_sale_id}&top_n=${top_n}`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching sales volume: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchTopProducts(span, timeline, region, territory, route, point_of_sale, top_n, category, parentProduct, product_type) {

  let apiUrl = new URL(`${host}dashboard-products/top-products?span=${span}&timeline=${timeline}`);

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory)
    apiUrl.searchParams.append('territory_id', territory);
  if (route)
    apiUrl.searchParams.append('route_id', route);
  if (point_of_sale)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale);
  if (top_n)
    apiUrl.searchParams.append('top_n', top_n);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product_type)
    apiUrl.searchParams.append('product_type', product_type);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching Top Products: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchTopCategoriesTable(span, timeline, region, territory_id, route_id, point_of_sale_id, parent_category_id, top_n, product_type, parentProduct) {
  const apiUrl = new URL(`${host}dashboard-products/top-products-table?span=${span}&timeline=${timeline}`);
  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (top_n)
    apiUrl.searchParams.append('top_n', top_n);
  if (parent_category_id)
    apiUrl.searchParams.append('parent_category_id', parent_category_id);
  if (product_type)
    apiUrl.searchParams.append('product_type', product_type);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);


  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching Top Categories: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}

export async function fetchCashVsCreditVoid(span, timeline, region, territory_id, route_id, point_of_sale_id, employee, category, parentProduct, product) {
  let apiUrl = new URL(`${host}dashboard-volume/cash-vs-credit-voidd?span=${span}&timeline=${timeline}`);

  if (region)
    apiUrl.searchParams.append('demarcation_id', region);
  if (territory_id)
    apiUrl.searchParams.append('territory_id', territory_id);
  if (route_id)
    apiUrl.searchParams.append('route_id', route_id);
  if (point_of_sale_id)
    apiUrl.searchParams.append('point_of_sale_id', point_of_sale_id);
  if (employee)
    apiUrl.searchParams.append('employee_id', employee);
  if (category)
    apiUrl.searchParams.append('category_id', category);
  if (parentProduct)
    apiUrl.searchParams.append('parent_product_id', parentProduct);
  if (product)
    apiUrl.searchParams.append('product_id', product);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Encoding': 'gzip',
      },
    });
    if (response.status == 401) {
      if (!await token_refresh()) {

      }
    }
    if (!response.ok) {
      throw new Error(`Error fetching cash vs credit: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    //console.error(error);
    throw error;
  }
}
