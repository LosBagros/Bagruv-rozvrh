setInterval(async function () {
  await getJson();
}, 3600000);
getJson();
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

  for (let j = 0; j < data.Days.length; j++) {
    hours = document.querySelector("#data").children[j].children;
    date = data.Days[j].Date;
    date = date.slice(8, 10) + "." + date.slice(5, 7) + ".";
    // get name of day e.g. Monday
    let day = new Date(data.Days[j].Date);
    day = day.toLocaleDateString("cs-CZ", { weekday: "short" });
    hours[0].innerHTML = `<br />${day}<br />${date}`;
    for (let i = 0; i < data.Days[j].Atoms.length; i++) {
      subjectId = data.Days[j].Atoms[i].SubjectId;
      if (subjectId == null) {
        html = `<br /><br /><strong>Removed</strong><br /><br /><br />`;
      } else {
        teacherId = data.Days[j].Atoms[i].TeacherId;
        roomId = data.Days[j].Atoms[i].RoomId;
        subject = data.Subjects.find((x) => x.Id == subjectId).Abbrev;
        teacher = data.Teachers.find((x) => x.Id == teacherId).Abbrev;
        room = data.Rooms.find((x) => x.Id == roomId).Abbrev;
        html = `<br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br />`;
      }
      hours[i + 1].innerHTML = html;
    }
  }
  console.log("Data updated...");
  return;
}
