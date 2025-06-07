export async function getCoordinates(query) {
	try {
		const myHeaders = new Headers();
		myHeaders.append('Content-Type', 'multipart/form-data');
		myHeaders.append('cache-control', 'no-cache');
		myHeaders.append('Accept', '*/*');
		const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json`, {
			method: 'GET',
			headers: myHeaders,
		});
		const resJson = await res.json();
		return resJson;

	} catch (error) {
		if (error.response) {
			// The request was made and the server responded with a status code
			// that falls out of the range of 2xx
			console.log("response.data", error.response.data);
			console.log("response.status", error.response.status);
			console.log("response.headers", error.response.headers);
		} else if (error.request) {
			// The request was made but no response was received
			// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
			// http.ClientRequest in node.js
			console.log("e.request", error.request);
		} else {
			// Something happened in setting up the request that triggered an Error
			console.log('There has been a problem wile getting place coordinates: ' + error.message);
		}
		throw error;
	}
}