# Happy Toys Setup Guide

This guide runs the full application on a Windows computer: the React website, the ASP.NET Core API
and a PostgreSQL database.

## 1. Required software

| Software | Version | Check it with |
|---|---|---|
| [.NET SDK](https://dotnet.microsoft.com/download) | 10 | `dotnet --version` |
| [Node.js](https://nodejs.org) | 20 or newer | `node -v` |
| [PostgreSQL](https://www.postgresql.org/download/) with pgAdmin 4 | 18 | Open pgAdmin 4 |

## 2. Connect the API to PostgreSQL

Your database password is stored privately on your computer with .NET user secrets. It is never saved
in the project, so it cannot reach GitHub.

Open a terminal in the `backend` folder and run this once, using your own PostgreSQL password:

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=happytoys;Username=postgres;Password=YOUR_PASSWORD" --project HappyToys.API
```

## 3. Start the API

In the `backend` folder:

```powershell
dotnet run --project HappyToys.API --launch-profile http
```

The first start creates the `happytoys` database, its tables and the demo data. Leave this terminal open.
The interactive API page is at <http://localhost:5254/swagger>.

To see the data, open pgAdmin 4 and go to **Servers > PostgreSQL 18 > Databases > happytoys > Schemas >
public > Tables**.

## 4. Start the website

In a second terminal, in the `frontend` folder:

```powershell
npm install
npm run dev
```

Open <http://localhost:5173>.

## 5. Demo accounts

These accounts are created on your own computer from `appsettings.Development.json`.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@happytoys.example` | `Admin@123` |
| Customer | `demo@happytoys.example` | `Demo@123` |

The online site does not use these passwords. Its accounts are created from private settings in the
hosting service.

## 6. Database changes (EF Core migrations)

Run these in the `backend` folder. The first command only needs to run once on each computer.

```powershell
dotnet tool restore
dotnet ef migrations add NameOfTheChange --project HappyToys.Infrastructure --startup-project HappyToys.API
dotnet ef database update --project HappyToys.Infrastructure --startup-project HappyToys.API --connection "Host=localhost;Port=5432;Database=happytoys;Username=postgres;Password=YOUR_PASSWORD"
```

When developing, the API also applies new migrations by itself when it starts.

## 7. Automated tests

The tests create and remove their own temporary databases, and never touch `happytoys`. Point them at
your server and run them from the `backend` folder:

```powershell
$env:HAPPYTOYS_TEST_DB = "Host=localhost;Port=5432;Username=postgres;Password=YOUR_PASSWORD;Database=postgres"
dotnet test
```

## 8. Online settings

The online API reads these private settings. They belong in the hosting service, never in the project.

| Setting | Purpose |
|---|---|
| `DATABASE_URL` | Online database address, including its password |
| `Cors__AllowedOrigins__0` | Address of the online website |
| `Seed__AdminPassword` | Password for the online admin account |
| `Seed__CustomerPassword` | Password for the online demo customer |
| `Seed__SampleOrders` | `true` adds 8 sample customers and about 70 sample orders (only when there are no orders yet). Leave unset for a real store. |

## 9. Troubleshooting

| Problem | Fix |
|---|---|
| `No database is configured` | Repeat step 2. |
| `password authentication failed` | Your password is wrong. Repeat step 2 with the correct one. |
| `Failed to connect to localhost:5432` | Start the `postgresql-x64-18` service in Windows Services. |
| The website shows "Could not reach the server" | Start the API (step 3). |
| Port 5254 or 5173 is already in use | Close the other terminal that is running the app. |
