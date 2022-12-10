// Cloudflare Worker 1
// Description: Imports data from Bakalari API to Cloudflare KV
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
    const date = new Date();
    const day = date.getDay();
    const hour = date.getHours();
    if (day >= 5 && hour >= 15) {
        date.setDate(date.getDate() + 3);
    }
    const dateString = date.toISOString().split("T")[0];
    const response = await fetch(`https://spsul.bakalari.cz/api/3/timetable/actual?date=${dateString}`, options);
    if (response.ok) {
        const json = await response.json();
        return json;
    } else {
        console.log('Error:')
        console.log(response);
    }
    return null;
}
addEventListener("fetch", (event) => {

    event.respondWith(async function () {
        const reqDate = Math.floor(Date.now() / 1000);
        let bearerToken = await BKDB.get("token", "json");
        if (!bearerToken) { bearerToken = await getBearerToken() }
        if (bearerToken.time + bearerToken.expires_in + 360 < reqDate) { bearerToken = await refreshBearerToken(bearerToken) }
        await BKDB.put("token", JSON.stringify(bearerToken));
        const timetable = await getTimetable(bearerToken);

        let timetableString = JSON.stringify(timetable);
        console.log(timetableString);
        let hours = timetableString.search("Hours");
        if (hours != -1) {
            await BKDB.put("timetable", JSON.stringify(timetable));
            return new Response("Data saved");
        } else {
            return new Response("Data not saved");
        }
    }());
});