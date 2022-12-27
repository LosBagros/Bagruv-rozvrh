// Cloudflare Worker 1
// Description: Imports data from Bakalari API to Cloudflare KV
let success = true;
addEventListener('scheduled', event => {
  event.waitUntil(
    handleSchedule()
  )
})

async function handleSchedule() {
  await getData();
  console.log(success);
}
async function getBearerToken() {
    const reqDate = Math.floor(Date.now() / 1000);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `username=${USERNAME}&password=${PASSWORD}&grant_type=password&client_id=ANDR`,
    };
    const response = await fetch("https://spsul.bakalari.cz/api/login", options);
    if (response.ok) {
        let json = await response.json();
        json.time = reqDate;
        return json;
    }
    return null;
}
async function refreshBearerToken(bearerToken) {
    const reqDate = Math.floor(Date.now() / 1000);
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `refresh_token=${bearerToken.refresh_token}&grant_type=refresh_token&client_id=ANDR`,
    };
    const response = await fetch("https://spsul.bakalari.cz/api/login", options);
    if (response.ok) {
        let json = await response.json();
        json.time = reqDate;
        return json;
    }
    return null;
}

async function getTimetable(bearerToken) {
    const options = {
        method: "GET",
        headers: {
            Authorization: `Bearer ${bearerToken.access_token}`,
        },
    };

    let time = new Date();
    let date = time.getDate();
    let day = time.getDay();
    if (day == 5 && time.getHours() >= 15) {
        time.setDate(date + 3);
    } else if (day == 6) {
        time.setDate(date + 2);
    } else if (day == 0) {
        time.setDate(date + 1);
    }
    const dateString = time.toISOString().split("T")[0];
    const response = await fetch(`https://spsul.bakalari.cz/api/3/timetable/actual?date=${dateString}`, options);
    if (response.ok) {
        const json = await response.json();
        return json;
    }
    return null;
}
addEventListener("fetch", (event) => {

    event.respondWith(async function () {
        await getData();
        return new Response(success);
    }());
});

async function getData(){
    const reqDate = Math.floor(Date.now() / 1000);
        let bearerToken = await BKDB.get("token", "json");
        if (!bearerToken) { bearerToken = await getBearerToken() }
        if (bearerToken.time + bearerToken.expires_in + 960 < reqDate) { bearerToken = await refreshBearerToken(bearerToken) }
        await BKDB.put("token", JSON.stringify(bearerToken));
        const timetable = await getTimetable(bearerToken);

        let timetableString = JSON.stringify(timetable);
        let hours = timetableString.search("Hours");
        if (hours != -1) {
            await BKDB.put("timetable", JSON.stringify(timetable));
        } else {
            success = false;
        }
}
