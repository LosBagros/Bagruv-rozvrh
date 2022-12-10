getJson();
setInterval(async function () {
  var time = new Date();
  var minutes = time.getMinutes();

  if (minutes % 10 === 5) {
    await getJson();
  }
}, 60000);
async function getJson() {
  const response = await fetch("https://rozvrh-api.bagros.eu/");
  const data = await response.json();

  let subjectId;
  let teacherId;
  let roomId;
  let subject;
  let teacher;
  let room;
  let html;
  let hours;

  table = document.querySelector("#data");
  html = "<thead><tr><th></th>";

  hours = 0;
  for (let i = 0; i < data.Days.length; i++) {
    if (data.Days[i].Atoms.length > hours) {
      hours = data.Days[i].Atoms.length;
    }
  }
  if(hours == 0) {hours = 8}
  for (let i = 0; i < hours; i++) {
    html += `<th>${data.Hours[i].Caption}<br />${data.Hours[i].BeginTime}-${data.Hours[i].EndTime}</th>`;
  }
  html += "</tr></thead>";
  for (let j = 0; j < data.Days.length; j++) {
    html += "<tr>";
    date = data.Days[j].Date;
    date = date.slice(8, 10) + "." + date.slice(5, 7) + ".";
    let day = new Date(data.Days[j].Date);
    day = day.toLocaleDateString("cs-CZ", { weekday: "short" });
    html += `<td><br /><strong>${day}</strong><br />${date}</td>`;
    if (data.Days[j].DayDescription != "" && data.Days[j].DayType != "WorkDay") {
      html += `<td colspan="${hours}"><br /><span class="event">${data.Days[j].DayDescription}</span><br /><br /></td>`;
    } else if(data.Days[j].DayDescription == "" && data.Days[j].DayType != "WorkDay") {
      html += `<td colspan="${hours}"><br /><span class="event">${data.Days[j].DayType}</span><br /><br /></td>`;
    } else {
      for (let i = 0; i < data.Days[j].Atoms.length; i++) {
        subjectId = data.Days[j].Atoms[i].SubjectId;
        if (subjectId == null) {
          html += `<td><br /><br /><span class="removed">Removed</span><br /><br /><br /></td>`;
        } else {
          teacherId = data.Days[j].Atoms[i].TeacherId;
          roomId = data.Days[j].Atoms[i].RoomId;
          subject = data.Subjects.find((x) => x.Id == subjectId).Abbrev;
          teacher = data.Teachers.find((x) => x.Id == teacherId).Abbrev;
          room = data.Rooms.find((x) => x.Id == roomId).Abbrev;
          html += `<td><br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br /></td>`;
        }
      }
      html += "</tr>";
    }
  }
  table.innerHTML = html;
  console.log("Data updated...");
}
