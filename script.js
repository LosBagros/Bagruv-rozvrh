let time = new Date();
let timeNow = new Date(time.getFullYear(), time.getMonth(), time.getDate(), time.getHours(), time.getMinutes());
let minutes = time.getMinutes();
getJson();
setInterval(async function () {
  if (minutes % 10 === 5) {
    console.log("getting data...");
    await getJson();
  }
}, 60000);
async function getJson() {
  const response = await fetch("https://rozvrh-api.bagros.eu/");
  const data = await response.json();
  
  table = document.querySelector("#data");
  html = "<thead><tr><th></th>";

  hours = 0;
  for (let i = 0; i < data.Days.length; i++) {
    if (data.Days[i].Atoms.length > hours) {
      hours = data.Days[i].Atoms.length;
    }
  }
  let firstHour = 0;
  if (hours == 0) { hours = 8 }
  for (let i = 0; i < hours; i++) {
    if (data.Hours[i].BeginTime == "8:00") {
      firstHour = i;
      break;
    }
  }
  for (let i = firstHour; i < hours; i++) {
    html += `<th>${data.Hours[i].Caption}<br />${data.Hours[i].BeginTime}-${data.Hours[i].EndTime}</th>`;
  }
  html += "</tr></thead>";
  for (let j = 0; j < data.Days.length; j++) {
    html += "<tr>";
    date = data.Days[j].Date;
    date = date.slice(8, 10) + "." + date.slice(5, 7) + ".";
    day = new Date(data.Days[j].Date);
    day = day.toLocaleDateString("cs-CZ", { weekday: "short" });
    html += `<td><br /><strong>${day}</strong><br />${date}</td>`;
    if (data.Days[j].DayDescription != "" && data.Days[j].DayType != "WorkDay") {
      html += `<td colspan="${hours}" class="event"><br />${data.Days[j].DayDescription}<br /><br /></td>`;
    } else if (data.Days[j].DayDescription == "" && data.Days[j].DayType != "WorkDay") {
      html += `<td colspan="${hours}" class="event"><br />${data.Days[j].DayType}<br /><br /></td>`;
    } else {
      for (let i = 0; i < data.Days[j].Atoms.length; i++) {
        subjectId = data.Days[j].Atoms[i].SubjectId;
        hourId = data.Days[j].Atoms[i].HourId;
        if (hourId == 2) 
          continue;
        if (subjectId == null) {
          html += `<td class="removed"><br /><br />Removed<br /><br /><br /></td>`;
        } else {
          teacherId = data.Days[j].Atoms[i].TeacherId;
          roomId = data.Days[j].Atoms[i].RoomId;
          subject = data.Subjects.find((x) => x.Id == subjectId).Abbrev;
          teacher = data.Teachers.find((x) => x.Id == teacherId).Abbrev;
          room = data.Rooms.find((x) => x.Id == roomId).Abbrev;

          startArr = data.Hours[i-1 + firstHour].EndTime.split(":");
          startHours = parseInt(startArr[0], 10);
          startMinutes = parseInt(startArr[1], 10);
          start = new Date(time.getFullYear(), time.getMonth(), time.getDate(), startHours, startMinutes);
          endArr = data.Hours[i + firstHour].EndTime.split(":");
          endHours = parseInt(endArr[0], 10);
          endMinutes = parseInt(endArr[1], 10);
          end = new Date(time.getFullYear(), time.getMonth(), time.getDate(), endHours, endMinutes);

          if (timeNow >= start && timeNow < end && data.Days[j].Date.slice(0, 10) == time.toISOString().slice(0, 10)) {
            html += `<td class="event"><br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br /></td>`;
          } else if(timeNow > end && data.Days[j].Date.slice(0, 10) == time.toISOString().slice(0, 10) || data.Days[j].Date.slice(0, 10) < time.toISOString().slice(0, 10)) {
            html += `<td class="passed"><br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br /></td>`;
          } else {
            html += `<td><br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br /></td>`;
          }
        }
      }
      html += "</tr>";
    }
  }
  table.innerHTML = html;
  console.log("Data updated...");
}
