# SpinCycle Bikes – Campus Bike Share API

A REST API built with **Node.js, Express.js and SQLite** for the Backend Development Fundamentals group assignment.

## 1. Features

- Three related SQLite tables: `riders`, `bikes`, and `rentals`.
- Bike CRUD: list, get one, add, update and delete.
- Rider endpoints for registration and management.
- Rental creation and bike return workflow.
- SQL `INNER JOIN` endpoint showing rider and bike names.
- Search bikes by type using a query parameter.
- Input validation with clear HTTP error responses.
- Bike summary by type using SQL `GROUP BY`.
- Automated tests for the three summary tests in the brief.

## 2. Requirements

Install **Node.js 18 or later** and **Visual Studio Code**. Internet access is needed once to install npm packages.

## 3. Run in VS Code

1. Extract the ZIP file.
2. Open the extracted `spincycle_bikes` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
```

5. Start the server:

```bash
npm start
```

6. Open `http://localhost:3000` in a browser or Postman.

The SQLite database is created automatically at `data/spincycle.db` on first start. No manual database setup is needed.

For automatic restart while developing:

```bash
npm run dev
```

## 4. API endpoints

Base URL: `http://localhost:3000`

### Bikes

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/bikes` | Get all bikes |
| GET | `/bikes/:id` | Get one bike |
| POST | `/bikes` | Add a bike |
| PUT | `/bikes/:id` | Update a bike |
| DELETE | `/bikes/:id` | Delete a bike |
| GET | `/bikes?type=Road` | Search by type |
| GET | `/bikes?status=available` | Filter by status |
| GET | `/bikes/summary` | Count bikes grouped by type |

### Riders

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/riders` | Get all riders |
| GET | `/riders/:id` | Get one rider |
| POST | `/riders` | Add a rider |
| PUT | `/riders/:id` | Update a rider |
| DELETE | `/riders/:id` | Delete a rider |

### Rentals

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/rentals` | Get all rentals |
| POST | `/rentals` | Create a rental |
| GET | `/rentals/join` | Rental details with rider and bike names |
| PATCH | `/rentals/:id/return` | Mark a rental as returned |

## 5. Example requests

Use Postman with `Body → raw → JSON` for POST and PUT requests.

### Add a rider

`POST /riders`

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "phone": "9876543210"
}
```

### Add a bike

`POST /bikes`

```json
{
  "name": "Blue Comet",
  "type": "Road"
}
```

The bike status defaults to `available`.

### Update a bike

`PUT /bikes/1`

```json
{
  "name": "Blue Comet Pro",
  "type": "Mountain",
  "status": "available"
}
```

### Search by type

`GET /bikes?type=Mountain`

### Create a rental

`POST /rentals`

```json
{
  "rider_id": 1,
  "bike_id": 1
}
```

Only an available bike can be rented. Its status changes to `rented`.

### Return a bike

`PATCH /rentals/1/return`

The rental is marked `returned`, a return timestamp is recorded, and the bike becomes `available` again.

### Rental join endpoint

`GET /rentals/join`

The response includes `rider_name`, `bike_name`, and `bike_type` along with rental details.

### Summary by type

`GET /bikes/summary`

Example response:

```json
[
  { "type": "Mountain", "count": 3 },
  { "type": "Road", "count": 4 }
]
```

If the database has no bikes, the response is:

```json
[]
```

Both responses use HTTP `200 OK`. The endpoint uses SQL `GROUP BY`.

## 6. Validation and status codes

- `200 OK` – successful GET, update, delete or return.
- `201 Created` – rider, bike or rental created.
- `400 Bad Request` – missing or invalid input.
- `404 Not Found` – requested record or route does not exist.
- `409 Conflict` – duplicate email, unavailable bike, or record protected by rental history.
- `500 Internal Server Error` – unexpected server-side error.

Bike fields:
- `name`: required, non-empty string.
- `type`: required, non-empty string.
- `status`: `available`, `rented`, or `maintenance`.

Rider fields:
- `name`: required.
- `email`: required and must have a valid email format.
- `phone`: optional string.

Rental fields:
- `rider_id`: positive integer referencing an existing rider.
- `bike_id`: positive integer referencing an existing bike.

## 7. Run automated tests

Stop the main server if it is running, then run:

```bash
npm test
```

The tests cover:
1. Bikes added in two types are counted correctly.
2. The summary endpoint returns HTTP 200 and a count for each type.
3. With no bikes, the endpoint returns HTTP 200 and `[]`.

The tests use a separate temporary database and do not delete your normal `data/spincycle.db` database.

## 8. Database relationship

```text
RIDERS (1) -------- (Many) RENTALS (Many) -------- (1) BIKES

riders.id  <------- rentals.rider_id
bikes.id   <------- rentals.bike_id
```

- One rider can have multiple rental records over time.
- One bike can have multiple rental records over time.
- Each rental belongs to one rider and one bike.
- Foreign keys protect rental history from accidental deletion.

## 9. Project structure

```text
spincycle_bikes/
├── src/
│   ├── routes/
│   │   ├── bikes.js
│   │   ├── riders.js
│   │   └── rentals.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── validation.js
│   ├── app.js
│   ├── database.js
│   └── server.js
├── tests/
│   └── summary.test.js
├── data/                 (created automatically)
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 10. Important notes for the group

- The brief explicitly requires the three tables, bike CRUD, the rental join endpoint, validation, query search, and the summary endpoint. Those are implemented here.
- The rider CRUD and rental return workflow are additional practical functionality to make the campus bike-share scenario usable.
- The database starts empty. Add riders and bikes through Postman before creating a rental.
- Do not upload `node_modules` to GitHub; use `npm install` from `package.json`.
- Before submission, run the server, test each endpoint in Postman, run `npm test`, and capture screenshots of successful requests and the summary tests.
