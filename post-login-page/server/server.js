const express = require('express');
const cors = require('cors');
const io = require('socket.io')(5000, {
    cors: ['http://localhost']
});


const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

const carLender = [12.924865, 77.550866];
const carPooler = [12.932375989090675, 77.55149747184085];
const college = [12.9350833, 77.5308973];

const available_duration = 15 * 60;

// {
//     "_id":"",
//     "name":"",
//     "rating":"",
//     "distance":"",
//     "eta":"",
//     "lat":"",
//     "lng":""
// }

//     const carLendersArr = [
//   [12.938424, 77.550346],
//   [12.943215317980076, 77.54436815172889],
//   [12.947355744750512, 77.53863280862069],
//   [12.947326170606349, 77.5243703151023],
//   [12.93854246808602, 77.52233715113013],
//   [12.930882353770603, 77.51902946646351],
//   [12.91692200408026, 77.53165329045191]
//   // [12.915812875108708, 77.56497097626988],
//   // [12.930542269752769, 77.56351438120412],
//   // [12.941662682612048, 77.56035842519388],
//   // [12.91386072158737, 77.53122652353656],
//   // [12.911435297147186, 77.5568383203813],
//   // [12.92474526242629, 77.55107263156964],
//   // [12.925455107380667, 77.550040876773]
// ];
// const carPooler = [12.932375989090675, 77.55149747184085];
// const someDrivers = [
//     {
//         "_id": "*&&G*&GVUKYGUBYMGHYB",
//         "name": "Prakash",
//         "rating": 4.3,
//         "lat": 12.938424,
//         "lng": 77.550346,
//         "tocollege": "true"
//     },
//     {
//         "_id": "*&&G*&GVUKYGUBYMGHYB",
//         "name": "Suresh",
//         "rating": 4.3,
//         "lat": 12.943215317980076,
//         "lng": 77.54436815172889,
//         "tocollege": "true"
//     },
//     {
//         "_id": "*&&G*&GVUKYGUBYMGHYB",
//         "name": "Vikram",
//         "rating": 3.8,
//         "lat": 12.947355744750512,
//         "lng": 77.53863280862069,
//         "tocollege": "true"
//     },
//     {
//         "_id": "*&&G*&GVUKYGUBYMGHYB",
//         "name": "Prakash",
//         "rating": 4.8,
//         "lat": 12.947326170606349,
//         "lng": 77.5243703151023,
//         "tocollege": "true"
//     },
//     {
//         "_id": "373941fe-9e86-439d-b88d-2b63de821f67",
//         "name": "Meena",
//         "rating": 4.4,
//         "lat": 12.93854246808602,
//         "lng": 77.52233715113013,
//         "tocollege": "true"
//     },
//     {
//         "_id": "83cee387-de09-4360-80db-e5a61bd906f7",
//         "name": "Suresh",
//         "rating": 4.0,
//         "lat": 12.930882353770603,
//         "lng": 77.51902946646351,
//         "tocollege": "true"
//     },
//     {
//         "_id": "f8f5d115-fa30-407d-b90c-b277ead87f9c",
//         "name": "Kavya",
//         "rating": 3.9,
//         "lat": 12.91692200408026,
//         "lng": 77.53165329045191,
//         "tocollege": "true"
//     },
//     {
//         "_id": "373f73fb-d0a6-40ee-9681-329dfd6a3d35",
//         "name": "Kavya",
//         "rating": 4.0,
//         "lat": 12.915812875108708,
//         "lng": 77.56497097626988,
//         "tocollege": "true"
//     },
//     {
//         "_id": "92f843c1-4038-4736-9e40-5e16ade7be26",
//         "name": "Kavya",
//         "rating": 4.2,
//         "lat": 12.930542269752769,
//         "lng": 77.56351438120412,
//         "tocollege": "true"
//     },
//     {
//         "_id": "13990896-46c8-4b40-a441-8126ea84e82d",
//         "name": "Anita",
//         "rating": 3.6,
//         "lat": 12.941662682612048,
//         "lng": 77.56035842519388,
//         "tocollege": "true"
//     },
//     {
//         "_id": "342b0ae4-9f85-414a-9a9a-14771c818dbb",
//         "name": "Anita",
//         "rating": 4.2,
//         "lat": 12.91386072158737,
//         "lng": 77.53122652353656,
//         "tocollege": "true"
//     },
//     {
//         "_id": "f54785a6-81a8-4840-ae21-0365a380be60",
//         "name": "Anita",
//         "rating": 4.0,
//         "lat": 12.911435297147186,
//         "lng": 77.5568383203813,
//         "tocollege": "true"
//     },
//     {
//         "_id": "3addde70-c59f-4d01-a2cd-7e726ddd1e9d",
//         "name": "Anita",
//         "rating": 4.7,
//         "lat": 12.92474526242629,
//         "lng": 77.55107263156964,
//         "tocollege": "true"
//     },
//     {
//         "_id": "babb000c-65a9-4c62-b897-8e51abab995b",
//         "name": "Kavya",
//         "rating": 4.1,
//         "lat": 12.925455107380667,
//         "lng": 77.550040876773,
//         "tocollege": "true"
//     }
// ];

const someDrivers = [
    {
        "_id": "*&&G*&GVUKYGdfvUBYMGHYB",
        "name": "Ken",
        "rating": 4.2,
        "lat": 12.91386072158737,
        "lng": 77.53122652353656,
        "tocollege": "true"
    },
    {
        "_id": "f54785a6-81a8-4840-ae21-0365a380be60",
        "name": "Jack",
        "rating": 4.0,
        "lat": 12.911435297147186,
        "lng": 77.5568383203813,
        "tocollege": "true"
    },
    {
        "_id": "mynameisron",
        "name": "Ron",
        "rating": 4.7,
        "lat": 12.92474526242629,
        "lng": 77.55107263156964,
        "tocollege": "true"
    },
    {
        "_id": "*&&G*&GVUKYGUBdfvwefYMGHYB",
        "name": "Tony",
        "rating": 4.1,
        "lat": 12.925455107380667,
        "lng": 77.550040876773,
        "tocollege": "true"
    }
];



io.on('connection', (socket) => {
    console.log(`Received connection from ${socket.id}`);

    socket.on('joinRoom', (data) => {
        socket.join(data.roomName);
        console.log(`Socket ${socket.id} joined room: ${data.roomName}`);

        if (data.userName) {
            console.log(`A new user has joined the room: ${data.userName}`);
            socket.to(data.roomName).emit('hello', `A new user has joined the room ${data.roomName}: ${data.userName}`);
        }
    });

    socket.on('driver_message', (data) => {
        console.log("Driver messaged!");
        socket.to(data.roomName).emit('driver_message', `This is just a driver's message`);

    })

    socket.on('update_location', (data) => {

    });

});

const osrmRouteFetch = async (from, to) => {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;

    const response = await fetch(osrmUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
};


app.get('/', (req, res) => {
    res.send("Welcome to server!");
});

app.get('/data', (req, res) => {
    // console.log(req.json);
    res.json(req.query);
});

const possibleDrivers = [];
//  URL looks like : http:localhost:3000/finddrivers?lat=1234&lng=1234&dlat=1234&dlng=1234&tocollege=true
app.get('/user/finddrivers', async (req, res) => {
    var data = {};
    var data2 = {};
    console.log("Here!");
    //  Fetch data from DB (instead of someDrivers variable)


    for (let i = 0; i < someDrivers.length; i++) {
        // check if both's destination is same:
        console.log("");
        currentDriver = someDrivers[i];
        console.log(`Checking driver ${i + 1}/${someDrivers.length} ${currentDriver.name}`);
        if (currentDriver.tocollege == req.query.tocollege) {
            data = await osrmRouteFetch([currentDriver.lat, currentDriver.lng], [req.query.lat, req.query.lng]);
            data2 = await osrmRouteFetch([req.query.lat, req.query.lng], college);

            var total_time = data.routes[0].duration + data2.routes[0].duration;

            console.log(`Total time with ${currentDriver.name} is ${total_time}`)

            currentDriver.distance = data.routes[0].distance;
            currentDriver.eta = data.routes[0].duration;

            // if(currentDriver.eta !==0 && total_time<available_duration){
            //     possibleDrivers.push(currentDriver);
            // }

            possibleDrivers.push(currentDriver);

        }
    }
    console.log(possibleDrivers);

    //  Sorting the array according to ETA
    possibleDrivers.sort((a, b) => a.eta - b.eta);



    res.send(possibleDrivers.slice(0, 5));
    // const data = await osrmRouteFetch([someDrivers[0].lat,someDrivers[0].lng],[req.query.lat,req.query.lng]);
});

app.get('/driver/available', async (req, res) => {

    // console.log("New driver available!");

    let currentDriver = {
        "_id": req.query._id,
        "lat": req.query.lat,
        "lng": req.query.lng,
        "dlat": req.query.dlat,
        "dlng": req.query.dlng,
        "tocollege": req.query.tocollege
    }

    // console.log(`Details: ${currentDriver}`);
    res.json(currentDriver);



});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Use an endpoint like /data?name=Alex&rating=4.9 to test.');
});

