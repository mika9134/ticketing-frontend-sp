// 


import { fetchTable } from '../apis/table'; // adjust path if needed
import { host, token } from '../apis/config';
import { getAccessToken } from '../stores/tokenStore';


const territoryUrl = `${host}territory/get-my-territory`;
const routeUrl = `${host}route/get-by-territory-id/`;
const routingUrl = `${host}travel/get-route`;
const travelLogUrl = `${host}travel/get-travel-routes`;
const routePointUrl = `${host}route/get-point-of-sales-visit/`;



export	async function getRoutePoint(routeId) {
		let routePoints;
		try {
            let token = getAccessToken();
			let locations = [];
			// Fetch Route Points
			let routePoints = await fetchTable(`${routePointUrl}${routeId}`, token, 1, 10, '', '', routeId);

			if (routePoints.succeed == true) {
				let routePointsTotal = routePoints.data.paginationInfo.totalItems;

				routePoints = await fetchTable(`${routePointUrl}${routeId}`, token, 1, routePointsTotal, '', '', routeId);

				routePoints = routePoints.data.items;
			} else {
				throw new Error('No point of sales part of this route');
			}
			for (const point of routePoints) {
				//  Push posId and location to locations
				locations = [
					...locations,
					{
						id: point.id,
						name: point.name,
						location: [point.latitude, point.longitude],
						landmark: point.landmark,
						node_distance: Infinity,
						node: ''
					}
				];
			}


            return locations;
		} catch (error) {
			console.error('Error fetching table data:', error);
		}
	}

export	async function getRoutesByTerritory(territoryId) {
		try {

               let token = getAccessToken();

			let routes = await fetchTable(`${routeUrl}${territoryId}`, token);
            
			if (routes.succeed == true) {
				routes = routes.data;

				for (let x = 0; x < routes.length; x++) {
					if (fixedRoute == routes[x].id) {
						selectedRouteName = routes[x].name;
						break;
					}
				}
            return routes;
        } else {
				throw new Error('No data');
			}
		} catch (error) {
			routes = [];
			locations = [];
			selectedRoute = '';
			console.error('Error fetching table data:', error);
		}
	}



