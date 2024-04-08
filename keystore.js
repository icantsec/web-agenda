const KEY_PREFIX = "pical.";

function saveData(key, data) {
    localStorage.setItem(KEY_PREFIX+key, JSON.stringify(data));
	console.log("stored " + (KEY_PREFIX+key));
}

function readData(key) {
    var data = localStorage.getItem(KEY_PREFIX+key);
    if (data) {
        return JSON.parse(data);
    }
	return false;
}

function toggleEventChecked(key, id) {
    events = readData(key);
    d_events = events["data"];
    d_events.forEach( event => {
        if(event.uuid == id) {
            event.checked_off = !event.checked_off;
        }
    });
    events["data"] = d_events;
    saveData(key, events);
}