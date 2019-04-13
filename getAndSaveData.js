const https = require('https');
const fs = require('fs');

const colsToKeep = [
    0, // Nombre de bornes disponibles
    1, // Nombre vélo en PARK+
    2, // Nombres de bornes en station
    9, // nbFreeDock
    10,// Nombre de vélo mécanique
    12, // nbDock
    13, // Nombre vélo électrique
    14, // Code de la station
    15, // Nom de la station 
    16, // Nom de la station 
    19, // geo
];

let waitTwoMinutes = 120000;
let gC = 0;

let req = _ => {
    https.get('https://opendata.paris.fr/explore/dataset/velib-disponibilite-en-temps-reel/download/?format=csv&timezone=Asia/Shanghai&use_labels_for_header=true', (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let a = [];
            console.log("start job ...");
            let lines = data.split("\n");
            let headerKeys = lines[0].split(";");
            let numFields = headerKeys.length;
            for (let i = 0; i < numFields; ++i) {
                headerKeys[i] = headerKeys[i].normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, "_").replace(/\+/g, "").toLowerCase();
            }
            let size = lines.length;
            let numColToKeep = colsToKeep.length;
            for (let i = 1; i < size; ++i) {
                if (lines[i] === "") continue;
                let res = {}
                let values = lines[i].split(";")
                for (let j = 0; j < numColToKeep; ++j) {
                    let c = colsToKeep[j];
                    let key = headerKeys[c];
                    if (key === "geo") {
                        let [latitude, longitude] = values[c].split(',');
                        res["latitude"] = parseFloat(latitude);
                        res["longitude"] = parseFloat(longitude);
                    } else if (key === "nom_de_la_station") {
                        res[key] = values[c];
                    } else {
                        res[key] = parseInt(values[c], 10);
                    }
                }
                let now = new Date();
                res["time"] = Date.now();
                a.push(res);
            }
            fs.writeFile("datasets/ds" + gC + ".json", JSON.stringify(a), "utf8", function (err) {
                if (err) {
                    return console.log(err);
                }
                ++gC;
                console.log("end job sleeping");
            });
        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
    });
}

setInterval(req, waitTwoMinutes);