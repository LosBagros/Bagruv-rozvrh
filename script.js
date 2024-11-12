let time = new Date();
let timeNow = new Date(
  time.getFullYear(),
  time.getMonth(),
  time.getDate(),
  time.getHours(),
  time.getMinutes()
);
let minutes = time.getMinutes();
getJson();

setInterval(async function () {
  time = new Date();
  timeNow = new Date(
    time.getFullYear(),
    time.getMonth(),
    time.getDate(),
    time.getHours(),
    time.getMinutes()
  );
  minutes = time.getMinutes();
  if (minutes % 10 == 5) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    await getJson();
  }
}, 60000);

async function getJson() {
  const response = await fetch("https://rozvrh-api.bagros.eu/");
  const data = await response.json();

  let table = document.querySelector("#data");
  let html = `<thead><tr class="border"><th></th>`;

  let firstHour = 0;
  let lastActiveHour = 0;
  for (let day of data.Days) {
    for (let atom of day.Atoms) {
      const hourIndex = data.Hours.findIndex((h) => h.Id === atom.HourId);
      if (firstHour === 0 || hourIndex < firstHour) firstHour = hourIndex;
      if (hourIndex > lastActiveHour) lastActiveHour = hourIndex;
    }
  }

  for (let i = firstHour; i <= lastActiveHour; i++) {
    html += `<th class="border px-2">${data.Hours[i].Caption}<br />${data.Hours[i].BeginTime}-${data.Hours[i].EndTime}</th>`;
  }
  html += "</tr></thead>";

  for (let j = 0; j < data.Days.length; j++) {
    html += `<tr class="border">`;

    let date =
      data.Days[j].Date.slice(8, 10) +
      "." +
      data.Days[j].Date.slice(5, 7) +
      ".";
    let day = new Date(data.Days[j].Date).toLocaleDateString("cs-CZ", {
      weekday: "short",
    });
    html += `<td class="border px-2"><strong>${day}</strong><br />${date}<br /></td>`;

    if (
      data.Days[j].DayDescription !== "" &&
      data.Days[j].DayType !== "WorkDay"
    ) {
      html += `<td class="border" colspan="${
        lastActiveHour - firstHour + 1
      }" class="event"><br />${data.Days[j].DayDescription}<br /><br /></td>`;
    } else if (
      data.Days[j].DayDescription === "" &&
      data.Days[j].DayType !== "WorkDay"
    ) {
      html += `<td class="border" colspan="${
        lastActiveHour - firstHour + 1
      }" class="event"><br />${data.Days[j].DayType}<br /><br /></td>`;
    } else {
      let currentHourIndex = firstHour;

      for (let i = 0; i < data.Days[j].Atoms.length; i++) {
        let hourId = data.Days[j].Atoms[i].HourId;

        while (data.Hours[currentHourIndex].Id < hourId) {
          html += `<td class="border"><br /><br /><br /><br /></td>`;
          currentHourIndex++;
        }

        let subjectId = data.Days[j].Atoms[i].SubjectId;
        if (subjectId == null) {
          html += `<td class="text-red-700 font-bold border"><br /><br />Removed<br /><br /><br /></td>`;
        } else {
          let teacherId = data.Days[j].Atoms[i].TeacherId;
          let roomId = data.Days[j].Atoms[i].RoomId;
          let subject = data.Subjects.find((x) => x.Id === subjectId).Abbrev;
          let teacher = data.Teachers.find((x) => x.Id === teacherId).Abbrev;
          let room = data.Rooms.find((x) => x.Id === roomId).Abbrev;

          let startArr = data.Hours[currentHourIndex].BeginTime.split(":");
          let endArr = data.Hours[currentHourIndex].EndTime.split(":");
          let start = new Date(
            time.getFullYear(),
            time.getMonth(),
            time.getDate(),
            parseInt(startArr[0], 10),
            parseInt(startArr[1], 10)
          );
          let end = new Date(
            time.getFullYear(),
            time.getMonth(),
            time.getDate(),
            parseInt(endArr[0], 10),
            parseInt(endArr[1], 10)
          );

          if (
            timeNow >= start &&
            timeNow < end &&
            data.Days[j].Date.slice(0, 10) === time.toISOString().slice(0, 10)
          ) {
            html += `<td class="text-green-600 border"><br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br /></td>`;
          } else if (
            (timeNow > end &&
              data.Days[j].Date.slice(0, 10) ===
                time.toISOString().slice(0, 10)) ||
            data.Days[j].Date.slice(0, 10) < time.toISOString().slice(0, 10)
          ) {
            html += `<td class="text-amber-600 border"><br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br /></td>`;
          } else {
            html += `<td class="border"><br /><strong>${subject}</strong><br />${teacher}<br />${room}<br /><br /></td>`;
          }
          currentHourIndex++;
        }
      }

      while (currentHourIndex <= lastActiveHour) {
        html += `<td class="border"><br /><br /><br /><br /></td>`;
        currentHourIndex++;
      }
    }
    html += "</tr>";
  }
  table.innerHTML = html;
  console.log("Data updated...");
}
