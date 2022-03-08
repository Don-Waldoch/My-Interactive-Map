/////////////////////////////////////////////////////////////////////

window.onload = async () => {
	dwalzMap.coordinates = await getMyLocation();
	dwalzMap.makeMap();
}

/////////////////////////////////////////////////////////////////////

async function getMyLocation() {
    pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    return [pos.coords.latitude, pos.coords.longitude];
}

/////////////////////////////////////////////////////////////////////
// Create the Dwalz Map object, properties, and methods

const dwalzMap = {
    coordinates: [],
    foursquare: [],
    markers: [],
    map: {},
    
    makeMap() {
        this.map = L.map('map', {
            center: this.coordinates,
            zoom: 12,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);

        // Custom green marker for the user's location (with shadow!!)
        var myIcon = L.icon({
            iconUrl: './assets/marker-green.png',
            shadowUrl: './assets/shadow.png',
            iconSize: [26, 46],
            iconAnchor: [22, 94],
            popupAnchor: [-8, -86],
        });
        
        let userLocation = L.marker(this.coordinates, {icon: myIcon});
        userLocation.addTo(this.map).bindPopup('<p1><b>You Are Here</b></p1>').openPopup();
    },

    addMarkers() {
        // First remove any previous business markers
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers = [];

        // Add the new business markers using default blue icons.
        this.foursquare.forEach(business => {
            let coordinates = [business.geocodes.main.latitude, business.geocodes.main.longitude];
            let popup = `<p1><b>${business.name}</b></p1>`;
            let marker = L.marker(coordinates);
            marker.addTo(this.map).bindPopup(popup);
            this.markers.push(marker);
        });
    }
}

/////////////////////////////////////////////////////////////////////
// This function is called when the "Business Type" selector changes

async function SelectBusiness() {
    let business = document.getElementById("Destination").value;
    dwalzMap.foursquare = await getFoursquare(business);
    dwalzMap.addMarkers();
}

/////////////////////////////////////////////////////////////////////
// https://developer.foursquare.com/reference/place-search

async function getFoursquare(business) {
    let limit = 5;
	let latitude  = dwalzMap.coordinates[0];
	let longitude = dwalzMap.coordinates[1];

    const options = {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
        }
    };
    
    let url = `https://api.foursquare.com/v3/places/search`;
    let apiCall = `${url}?query=${business}&ll=${latitude}%2C${longitude}&limit=${limit}`
    let response = await fetch(apiCall, options);
    let businesses = await response.json();
    
    return businesses.results;
}

/////////////////////////////////////////////////////////////////////
