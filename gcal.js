const googleClientID = "google_api_client_id_here";
const timeToExpiry = 1000*60*60*24;//1 day in ms

function processTokenResponse(tokenResponse) {
    if (tokenResponse.access_token) {
        console.log('Access token received:', tokenResponse.access_token);

        // Store the access token in localStorage
        localStorage.setItem('googleAccessToken', tokenResponse.access_token);
        localStorage.setItem('accessTokenExpiry', Date.now() + (tokenResponse.expires_in * 1000));

        fetchEvents();//tokenResponse.access_token
    } else {
        console.error('No access token received.');
    }
}

function handleCredentialResponse(response) {
    console.log("Encoded JWT ID token: " + response.credential);

    // Check if the access token exists and is not expired
    const accessToken = localStorage.getItem('googleAccessToken');
    const expiry = localStorage.getItem('accessTokenExpiry');

    if (accessToken && expiry && Date.now() < expiry) {
        fetchEvents(accessToken);
    } else {
		console.log("expired token");
        // If there's no valid access token, request a new one
        google.accounts.oauth2.initTokenClient({
            client_id: googleClientID, // Replace with your actual client ID
            scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
            callback: processTokenResponse,
        }).requestAccessToken();
    }
}


// Function to fetch events from the current week
function fetchEvents(inputDate = new Date()) {
	
	
	const accessToken = localStorage.getItem('googleAccessToken');
    const expiry = localStorage.getItem('accessTokenExpiry');

    if (accessToken && expiry && Date.now() < expiry) {

    } else {
		console.log("expired token. please log in");
    }
	
    var today = new Date();
    const date = new Date(inputDate);

    const firstDayOfWeek = new Date(date.setDate(date.getDate() - date.getDay()));
    const lastDayOfWeek = new Date(firstDayOfWeek.getTime());
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
	
	var year = firstDayOfWeek.getFullYear();
	var month = String(firstDayOfWeek.getMonth() + 1).padStart(2, '0'); // Adding 1 because getMonth() returns zero-based month
	var day = String(firstDayOfWeek.getDate()).padStart(2, '0');

	// Construct the string in the format yyyy-mm-dd
	var keyName = `g${year}-${month}-${day}`;
	
	var stored_data = readData(keyName);
	if(stored_data && stored_data["expiry"] > Date.now()) {
		console.log("stored data found & not expired, skipping sync");
		fillAgendaGoogle(stored_data);
		return;
	}

    const timeMin = firstDayOfWeek.toISOString();
    const timeMax = lastDayOfWeek.toISOString();
	
	

    fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        var events = data.items.map(event => ({
            uuid: crypto.randomUUID(),
            gid: event.id,
            title: event.summary ? event.summary : "No Title",
            start_time: event.start.dateTime || event.start.date,
            end_time: event.end.dateTime || event.end.date,
            details: event.description ? event.description : "No Description",
            location: event.location ? event.location : "No Location",
            status: event.status ? event.status : "No Status",
//            storage_updated: today,
            event_updated: event.updated ? event.updated : today,
            visibility: event.visibility ? event.visibility : "NA",
            checked_off: false,
            type: "google"
        }));

        if(stored_data) {//update/add, keep checked_off
            temp_store = stored_data["data"];
            merged_store = [];
            events.forEach(event => {
                storedEventIndex = temp_store.findIndex(se => se.gid == event.gid);
                if (storedEventIndex > -1) {
                    // Update existing event, preserve 'checked_off'
                    let updatedEvent = {...event, checked_off: temp_store[storedEventIndex].checked_off};
                    merged_store.push(updatedEvent);
                } else {
                    // Add new event since it doesn't exist in temp_store
                    merged_store.push(event);
                }
            });
            events = {"data": merged_store};
        } else {
            events = {"data": events};
        }
        
		events["expiry"] = (Date.now() + timeToExpiry);
		saveData(keyName, events);
        console.log('Events this week:', events);
        fillAgendaGoogle(events);
    })
    .catch(error => {
        console.error('Error fetching events:', error);
    });
}
