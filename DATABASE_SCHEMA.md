# Happy Toys Database Schema

The database is PostgreSQL, managed with Entity Framework Core Code First migrations. Table rules are
in `backend/HappyToys.Infrastructure/Configurations`.

Every table has a primary key. Most tables also record `CreatedAt` and `UpdatedAt`, which are filled in
automatically. Money uses `numeric(10,2)`.

## Tables

| Table | Purpose | Key rules |
|---|---|---|
| **Roles** | Customer and Admin | Unique name |
| **Users** | Accounts | Unique email; passwords stored only as hashes |
| **UserAddresses** | Saved delivery addresses | Removed with the user |
| **Categories** | The 10 toy categories | Unique name; cannot be deleted while it has products |
| **Products** | The catalog | Stock cannot go below 0; original price cannot be below the selling price; indexed for search and filters |
| **ProductImages** | Product photos | Lowest `SortOrder` is the main image |
| **Carts** | One cart per user or visitor | Exactly one owner: `UserId` or `GuestId` |
| **CartItems** | Products in a cart | One row per product; quantity above 0 |
| **Wishlists** | One wishlist per user or visitor | Exactly one owner: `UserId` or `GuestId` |
| **WishlistItems** | Saved products | The same product cannot be saved twice |
| **Orders** | Placed orders | Keeps the delivery details and totals from the time of purchase |
| **OrderItems** | Products in an order | Keeps the name and price from the time of purchase; a sold product cannot be erased |
| **Payments** | One payment per order | Records the method and status; online methods are simulated |
| **Reviews** | Customer reviews | One review per customer per product; rating from 1 to 5 |
| **InventoryTransactions** | Every stock change | Records the amount, the reason and the order |
| **Coupons** | Discount codes | Unique code |

`UserSessions` is one extra, temporary table for the current login. JWT login removes it in Step 2.

## Relationships

```
Roles 1─* Users 1─* UserAddresses
              1─1 Carts      1─* CartItems      *─1 Products
              1─1 Wishlists  1─* WishlistItems  *─1 Products
              1─* Orders     1─* OrderItems     *─1 Products
                             1─1 Payments
              1─* Reviews                       *─1 Products
Categories 1─* Products 1─* ProductImages
                        1─* InventoryTransactions
```

## How orders stay correct

Placing an order is one database transaction. It locks the products being bought, checks their stock,
reduces it, and writes the order, its items, its payment and the stock records together. If any step
fails, nothing is saved. The lock makes a second customer wait for the first, so the last toy cannot
be sold twice.

Cancelling an order works the same way. It locks the order first, so stock can only be returned once.

## Demo data

`backend/HappyToys.Infrastructure/Data/Seed` holds 10 categories and 40 products. On an empty database,
`DataSeeder` adds them with 2 coupons and the demo accounts.
