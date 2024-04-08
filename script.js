const weekDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
let currentDate = new Date();
let currentWeekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function formatDate(date) {
    return `${date.getDate()}`;
}

function updateDateRange() {
    const startOfWeek = new Date(currentWeekStart);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const formattedStart = `${monthNames[startOfWeek.getMonth()]} ${startOfWeek.getDate()}`;
    const formattedEnd = `${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getDate()}`;
    document.getElementById('dateRange').textContent = `${formattedStart} - ${formattedEnd}`;
}

function pickDate(value) {

    // The value is in the format "yyyy-mm-dd"
	var parts = value.split("/");
    
    // Extract day, month, and year
    var month = parseInt(parts[0], 10)-1;
    var day = parseInt(parts[1], 10); // Months are 0-based in JavaScript Date objects
    var year = parseInt(parts[2], 10);
    
    // Create a new Date object
    let selectedDate = new Date(year, month, day);
 
    // Adjust to the beginning of the week based on the selected date
    // Assuming Sunday is the start of the week, adjust accordingly if your week starts on a different day
    let dayIndex = selectedDate.getDay(); // Sunday - 0, Monday - 1, etc.
    let weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - dayIndex);

    currentWeekStart = new Date(weekStart);
    updateAgenda();
}

function updateAgenda() {
    for (let i = 0; i < 7; i++) {
        const dayElement = document.getElementById(weekDays[i]);
        const dateElement = dayElement.querySelector('.date');
        const date = new Date(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate() + i);
        dateElement.textContent = formatDate(date);
        if (date.toDateString() === new Date().toDateString()) {
            dayElement.classList.add('currentDay');
        } else {
            dayElement.classList.remove('currentDay');
        }
    }
    updateDateRange();
}

function toggleSignIn() {
	document.getElementById("signInContainer").classList.toggle("hidden");
}
function toggleCreateEvent() {
	document.getElementById("createEventContainer").classList.toggle("hidden");
}

function changeWeek(amount) {
    currentWeekStart.setDate(currentWeekStart.getDate() + 7 * amount);
    updateAgenda();
}

function fillAgendaGoogle(weeks_events = -1) {//add check for existing first, add tasks to the agenda
	var today = new Date();
	if(weeks_events == -1) {
		console.log("updating events");
		//weeks_events = fetchEvents(currentWeekStart);
	}
	weeks_events = weeks_events["data"];
	weeks_events.forEach((event) => {
		var inner_task = buildTask(event);
		var start_date = new Date(event["start_time"]);
		var task_list = document.getElementsByClassName("day")[(new Date(event["start_time"])).getDay()].getElementsByTagName("ul")[0];
		task_list.innerHTML += inner_task;
	});
}

function openEvent(num) {
	document.getElementById("eventBox"+num).classList.toggle("hidden");
}

function formatTime(date) {
	date = new Date(date);
	hour = date.getHours();
	if(hour < 10) {
		hour = "0" + hour;
	}
	min = date.getMinutes();
	if(min < 10) {
		min = "0" + min;
	}
	return hour + ":" + min;
}

function toggleComplete(id, taskNo) {
	document.getElementById(id).classList.toggle("checked");
	document.getElementById('eventBox'+taskNo).classList.toggle("complete");
	document.getElementById('mark'+id).classList.toggle("hidden");
	document.getElementById('comp'+id).classList.toggle("hidden");
	document.getElementById('check'+taskNo).classList.toggle("hidden");
	var year = currentWeekStart.getFullYear();
	var month = String(currentWeekStart.getMonth() + 1).padStart(2, '0'); // Adding 1 because getMonth() returns zero-based month
	var day = String(currentWeekStart.getDate()).padStart(2, '0');
	// Construct the string in the format yyyy-mm-dd
	var keyName = `g${year}-${month}-${day}`;
	toggleEventChecked(keyName, id);
}

var tasksBuilt = 0;
function buildTask(event) {//build the HTML for the task box, taking in an "Event", maybe add icons to each
	classes = ["checked", "completed", ""]
	if(!event.checked_off) {
		classes = ["", "", "hidden"]
	}
	var ret = '<li id="'+event.uuid+'" onclick="openEvent('+tasksBuilt+')" class="event'+event["type"]+' '+classes[0]+'">' + event["title"] + '</li>';
	ret += '<div class="eventBox hidden ebox '+classes[1]+'" id="eventBox'+tasksBuilt+'"><div class="eventBoxContainer" onclick="openEvent('+tasksBuilt+')"></div><div class="eventBoxContent">'
	ret += '<div class="header"><span class="title">' + event["title"] + '</span><span class="time">' + formatTime(event["start_time"]) + '</span></div>';
	ret += '<div class="timeLocCombo">';
	ret += '<div class="timeBox"><div class="boxIcon"><i class="fa-regular fa-clock"></i></div><span class="start">'+formatTime(event["start_time"])+' - </span><span class="end">'+formatTime(event["end_time"])+'</span></div>';
	ret += '<div class="locBox"><div class="boxIcon"><i class="fa-solid fa-location-dot"></i></div><span class="location">'+event["location"]+'</span></div>';
	ret += '</div>';
	//ret += '<div class="statusBox"><div class="boxIcon">Status: </div><span class="status">'+event["status"]+'</span></div>';
	ret += '<div class="detailBox"><div class="boxIcon">Details: </div><span class="details">'+event["details"]+'</span></div>';
	
	ret += '<div class="type">Source: ' + getSourceHTML(event["type"]) + '</div>';
	ret += '<div class="complete" onclick="toggleComplete(\''+event.uuid+'\', '+tasksBuilt+')">';
	if(event.checked_off) {
		ret += '<span id="mark'+event.uuid+'" class="hidden">Mark Complete?</span><span id="comp'+event.uuid+'">Completed </span>';
	} else {
		ret += '<span id="mark'+event.uuid+'">Mark Complete? </span><span id="comp'+event.uuid+'" class="hidden">Completed </span>';
	}
	ret += '<i id="check'+tasksBuilt+'" class="fa-regular fa-circle-check '+classes[2]+'"></i></div>';
	ret += '</div></div>';
	tasksBuilt++;
	return ret;
}


function getSourceHTML(source) {
	if(source == "google") {
		return '<i class="fa-brands fa-google"></i>';
	}
	return '<i class="fa-regular fa-clipboard"></i>';
}

document.getElementById('prevWeek').addEventListener('click', () => changeWeek(-1));
document.getElementById('nextWeek').addEventListener('click', () => changeWeek(1));
updateAgenda();