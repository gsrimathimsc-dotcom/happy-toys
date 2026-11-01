# Happy Toys API

ASP.NET Core Web API for the Happy Toys demo store. It uses **in-memory data only**: no
database is installed, and orders and new accounts are cleared when the server restarts.

## Run it

You need the [.NET 10 SDK](https://dotnet.microsoft.com/download). From this `backend` folder:

```powershell
dotnet run --project HappyToys.API --launch-profile http
```

Then open the interactive API page: <http://localhost:5254/swagger>

Run the automated tests:

```powershell
dotnet test
```

## Demo accounts

These are public demo logins. Authentication here is **not production-grade security**.

| Role | Email | Password |
|---|---|---|
| Admin | `admin@happytoys.example` | `Admin@123` |
| Customer | `demo@happytoys.example` | `Demo@123` |

To try a protected endpoint in Swagger: call `POST /api/users/login`, copy the `token`, click
**Authorize** and paste it in.

## How it is organised

| Folder | Purpose |
|---|---|
| `Controllers` | Receive HTTP requests and call a service. No business rules here. |
| `Services` | The business rules: pricing, stock, order stages, login. |
| `Interfaces` | What each service offers, so services can be swapped or tested. |
| `DTOs` | The shapes of requests and responses, including validation rules. |
| `Models` | The data stored by EF Core. |
| `Data` | `AppDbContext`, the seed files, and the code that loads them at startup. |
| `Middleware` | Central error handling and the demo login check. |
| `Validators` | Shared validation patterns (mobile number, PIN code). |

There is no separate `Repositories` folder. EF Core's `AppDbContext` already does that job, and
another layer on top would only repeat it.

**Moving to PostgreSQL later:** replace `UseInMemoryDatabase` in `Program.cs` with the PostgreSQL
provider, add EF Core migrations, and swap the `StockLock` in `OrderService` for a database
transaction. Controllers and DTOs do not change.

## Response format

Every endpoint answers in the same shape:

```json
{ "success": true, "data": { } }
{ "success": false, "error": "Message to show", "errors": { "customer.mobile": ["..."] } }
```

## Endpoints

| Method | Path | Who |
|---|---|---|
| GET | `/api/products` | Anyone |
| GET | `/api/products/{id}` | Anyone |
| GET | `/api/products/search?q=` | Anyone |
| GET | `/api/products/category/{categoryId}` | Anyone |
| POST, PUT, DELETE | `/api/products`, `/api/products/{id}` | Admin |
| GET | `/api/categories`, `/api/categories/{id}` | Anyone |
| GET | `/api/cart` | User or guest |
| POST | `/api/cart/items` | User or guest |
| PUT, DELETE | `/api/cart/items/{id}` | User or guest |
| POST | `/api/cart/validate` | Anyone |
| GET, POST | `/api/wishlist` | User or guest |
| DELETE | `/api/wishlist/{productId}` | User or guest |
| POST | `/api/orders` | Anyone |
| GET | `/api/orders` | Logged-in user |
| GET | `/api/orders/{id}` | Owner, admin, or anyone with a guest order's number |
| PUT | `/api/orders/{id}/status` | Admin, or the owner to cancel |
| POST | `/api/users/register`, `/api/users/login` | Anyone |
| POST | `/api/users/logout` | Logged-in user |
| GET, PUT | `/api/users/profile` | Logged-in user |
| GET | `/api/admin/dashboard`, `/api/admin/orders`, `/api/admin/products` | Admin |

`GET /api/products` accepts `category`, `q`, `minPrice`, `maxPrice`, `minRating`, `inStock`,
`collection` (`featured`, `best-sellers`, `new-arrivals`, `offers`), `sort` (`popularity`, `newest`,
`price-asc`, `price-desc`, `discount`), `page` and `pageSize`.

Guests identify their server-side cart and wishlist with an `X-Guest-Id` header. The website keeps
the cart in the browser's localStorage and uses `POST /api/cart/validate` to check it against current
prices and stock.

Order stages run `confirmed → processing → shipped → delivered`. An order can be cancelled before it
ships, which returns its items to stock.
