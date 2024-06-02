---
layout: post
title:  Functionally dependent columns between SELECT and GROUP BY in MySQL
date:   2016-01-31 20:45
description: Review of a recent change in MySQL
categories: development
published: true
---

**The problem**

While skimming though [SQL excercises][1], I stumbled upon this one:

> Select the name of each manufacturer along with the name and price of its most expensive product.

It sounded pretty straightforward, so I immediately wrote a solution:

```sql
  SELECT m.Name,
         p.Name,
         MAX(p.Price)
    FROM Products p
    JOIN Manufacturers m ON m.Code = p.Manufacturer
GROUP BY p.Manufacturer
```

And... it didn't work. Instead, I got this error:

```
ERROR 1055 (42000): Expression #2 of SELECT list is not in GROUP BY clause and contains nonaggregated column 'sql_excercises.p.Name' which is not functionally dependent on columns in GROUP BY clause; this is incompatible with sql_mode=only_full_group_by
```

**The theory**

The error got me intrigued. Not only I was failing at solving a pretty straightforward-sounding task, but also it was the first time I saw this particular error. I started googling to see what's going on, and after some time, it turned out I was attempting to write an ambigius thing that should never work.

The solution I wrote felt very familiar and trivial, like if I've been writing it quite a lot in the past. Why was the code not working anymore? As it turned out, things have changed since MySQL 5.7.5: starting this minor update, MySQL treats aggregating in a much more restricted way. However, as I learned further, by failing at my code it was doing the right thing.

To put it simple, the new rule of thumb is this: `SELECT` must contain only aggregate functions, or column names listed in `GROUP BY`.

This is pretty good restriction, that actually makes a lot of sense. For example, you cannot find out the most expensive product using `MAX` aggregate function:

```sql
SELECT Code, MAX(Price) FROM Products;
```

Indeed, what if there are multiple products to have the same price, which is a maximum within a give set? Here's how the above example of code will be treated by different versions of MySQL:

1. Before 5.7.5: it may (and will, given enough tries) return any product for whilch `price = MAX(price)`; **this is ambigious**,
2. After 5.7.5: it will fail with an error.

**The solution**

To wrap up, let me describe one of possible solutions.

Following the rule of thumb above, what we can do is find the most expensive product for each manufacturer:

```sql
SELECT Manufacturer, MAX(Price) FROM Products GROUP BY Manufacturer;
```
```
+--------------+-------+
| Manufacturer | Price |
+--------------+-------+
|            1 |   240 |
|            2 |   180 |
|            3 |   270 |
|            4 |   150 |
|            5 |   240 |
|            6 |   120 |
+--------------+-------+
```

Given the set above, it's easy to see that all we need to do is to join two more tables, providing `Manufacturer.Name` and `Products.Name` respectively. Let's do just that:

```sql
SELECT m.Name,
       p.Name,
       pm.Price
  FROM Manufacturers m
  JOIN (   SELECT Manufacturer,
                  MAX(Price) AS Price
             FROM Products
         GROUP BY Manufacturer) pm ON pm.Manufacturer = m.Code
  JOIN Products p ON pm.Price = p.Price;
```
```
+-----------------+------------+-------+
| Name            | Name       | Price |
+-----------------+------------+-------+
| Sony            | Hard drive |   240 |
| Fujitsu         | Hard drive |   240 |
| Winchester      | Memory     |   120 |
| Iomega          | ZIP drive  |   150 |
| Sony            | Monitor    |   240 |
| Fujitsu         | Monitor    |   240 |
| Creative Labs   | DVD drive  |   180 |
| Hewlett-Packard | Printer    |   270 |
| Creative Labs   | DVD burner |   180 |
+-----------------+------------+-------+
```

It looks like people behind MySQL are trying to fix some of the long-standing problems by starting to follow SQL spec more strictly, which is definitely a good thing.

[1]: https://en.wikibooks.org/wiki/SQL_Exercises/The_computer_store
