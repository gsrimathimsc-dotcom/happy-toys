# Happy Toys API

ASP.NET Core Web API for Happy Toys, backed by PostgreSQL.

To run it, follow [SETUP_GUIDE.md](../SETUP_GUIDE.md). The tables are described in
[DATABASE_SCHEMA.md](../DATABASE_SCHEMA.md). With the API running, every endpoint can be tried at
<http://localhost:5254/swagger>.

## How it is organised

| Project | Purpose |
|---|---|
| `HappyToys.API` | Controllers, middleware and startup. Receives requests and calls a service. |
| `HappyToys.Application` | The business rules: services, DTOs and validation. |
| `HappyToys.Domain` | The entities and enums. It depends on nothing else. |
| `HappyToys.Infrastructure` | PostgreSQL: `AppDbContext`, table rules, migrations and seed data. |
| `HappyToys.API.Tests` | Automated tests that run the real API on real PostgreSQL. |

There is no separate repository layer. `IAppDbContext` already gives the services a clean way to reach
the database, and another layer would only repeat it.

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
| GET | `/api/products/summary` | Anyone |
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

Guests identify their server-side cart and wishlist with an `X-Guest-Id` header.

Order stages run `confirmed → processing → shipped → delivered`. An order can be cancelled before it
ships, which returns its items to stock.
