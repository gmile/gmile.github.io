---
layout: post
title:  Replaying Ecto queries after an ExUnit run
date:   2019-03-17 12:27:00
description: A blog post in which I describe a helper I made to replay queries from an particular test case
categories:
  - development
  - elixir
---

A test case at hand (mistakingly) asserted on order of records returned by `UPDATE ... RETURNING ...`. In the process of trying to understnd what's going on I made a small helper I'd like to share.

My goal was to `require IEx; IEx.pry` in the test code, then make a few DB queries from within the test in an attempt to gather more details about the issue. Luckly, the test in question would consistently fail with a given seed.

However, I immediately encountered a couple of problems.

First of all, I couldn't simply "pry" in to the test. Putting `require IEx; IEx.pry` in the test code and running  `iex -S mix --seed 12345` will not stop execution of the test suite: the greed dots would keep appearing on the screen, pushing the invitation to enter commands in form of `iex>` further away. Attempting to enter commands was not practical.

At this point I could try and re-create the data using factories. However, not only this would take some time to make  right: in effect this would be similar to running the test alone. But the test wasn't failing when ran alone in the first place! I needed the exact same data as in the test.

So at this point I had an idea: I want to capture the `INSERT`/`UPDATE`/`DELETE` queries ran during the test and replay them on top of a development DB for off-line inspection.

To do that, first I ensured that logger actually spits DB queries into the standard output. I edited `config/test.exs` like this:

```elixir
# config/test.exs

config :logger, level: :debug
```

Next, the following setup block was prepended to the test:

```elixir
setup do
  require Logger
  Logger.debug("--- START ---")
  on_exit fn -> Logger.debug("--- END ---") end 

  :ok
end
```

Now, running `mix test --seed 12345` would highlight the test with a failing assertion and spit a big bunch of log records alongside. The queries I was interested in were in between red `--- START ---` and `--- END ---`. After filtering a bunch of unrelated lines, I got these:

```sql
INSERT INTO "profiles" ("country_code","disable_reminders_token","full_name","id","reminders_enabled","signup_language","type","utm_campaign","utm_medium","utm_source","utm_term","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ["ES", "$2b$04$H74sJpzD9AQhXNw/VqyzMu2FCEz4FcAf8wDW4jwXFY4gPeIJDTrie", "John Doe #2763", <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, true, "en", "personal", "5-2019", "adwords", "google", "contract management", #DateTime<2019-03-14 15:09:22.459951Z>, #DateTime<2019-03-14 15:09:22.459951Z>]
INSERT INTO "folders" ("id","owner_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7) [<<8, 78, 57, 205, 133, 200, 75, 208, 169, 140, 188, 225, 65, 236, 255, 136>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88", "Folder 96", "draft", #DateTime<2019-03-14 15:09:22.463765Z>, #DateTime<2019-03-14 15:09:22.463765Z>]
INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<8, 78, 57, 205, 133, 200, 75, 208, 169, 140, 188, 225, 65, 236, 255, 136>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92", "Folder 97", "draft", #DateTime<2019-03-14 15:09:22.467774Z>, #DateTime<2019-03-14 15:09:22.467774Z>]
INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<0, 197, 92, 181, 226, 195, 75, 14, 180, 20, 187, 156, 229, 160, 198, 16>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92.00c55cb5_e2c3_4b0e_b414_bb9ce5a0c610", "Folder 98", "draft", #DateTime<2019-03-14 15:09:22.471807Z>, #DateTime<2019-03-14 15:09:22.471807Z>]
INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<69, 122, 92, 218, 5, 79, 73, 229, 144, 174, 55, 173, 121, 11, 85, 113>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92.457a5cda_054f_49e5_90ae_37ad790b5571", "Folder 99", "draft", #DateTime<2019-03-14 15:09:22.474138Z>, #DateTime<2019-03-14 15:09:22.474138Z>]
INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<184, 206, 200, 225, 115, 215, 64, 236, 139, 124, 103, 32, 204, 190, 131, 38>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<69, 122, 92, 218, 5, 79, 73, 229, 144, 174, 55, 173, 121, 11, 85, 113>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92.457a5cda_054f_49e5_90ae_37ad790b5571.b8cec8e1_73d7_40ec_8b7c_6720ccbe8326", "Folder 100", "draft", #DateTime<2019-03-14 15:09:22.476939Z>, #DateTime<2019-03-14 15:09:22.476939Z>]
UPDATE "folders" SET "parent_id" = $1, "updated_at" = $2 WHERE "id" = $3 [nil, #DateTime<2019-03-14 15:09:22.479967Z>, <<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>]
UPDATE "folders" AS f0 SET "path" = subpath(f0."path",nlevel($1)-1), "updated_at" = $2 WHERE (f0."deleted_at" IS NULL) AND (f0."owner_id" = $3) AND (f0."type" = $4) AND (f0."path" <@ $5) RETURNING f0."id", f0."path", f0."ctid" ["084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92", #DateTime<2019-03-14 15:09:22.481521Z>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, "draft", "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92"]
```

Upon looking closer, it became apparent that these lines cannot be sent to the DB directly: the lines are SQL statements with parameter placeholders next to lists of actual values. However, two things were noted:

1. the query and list of values looked exactly what `Ecto.Repo.query!/2` should accept,
2. it seemed like it should be possible to convert list of values to Elixir code verbatim using `Code.string_eval/1`.

I arrived at the following code:

```elixir
alias MyApp.Repo

lines = 
  """
  INSERT INTO "profiles" ("country_code","disable_reminders_token","full_name","id","reminders_enabled","signup_language","type","utm_campaign","utm_medium","utm_source","utm_term","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ["ES", "$2b$04$H74sJpzD9AQhXNw/VqyzMu2FCEz4FcAf8wDW4jwXFY4gPeIJDTrie", "John Doe #2763", <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, true, "en", "personal", "5-2019", "adwords", "google", "contract management", #DateTime<2019-03-14 15:09:22.459951Z>, #DateTime<2019-03-14 15:09:22.459951Z>]
  INSERT INTO "folders" ("id","owner_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7) [<<8, 78, 57, 205, 133, 200, 75, 208, 169, 140, 188, 225, 65, 236, 255, 136>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88", "Folder 96", "draft", #DateTime<2019-03-14 15:09:22.463765Z>, #DateTime<2019-03-14 15:09:22.463765Z>]
  INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<8, 78, 57, 205, 133, 200, 75, 208, 169, 140, 188, 225, 65, 236, 255, 136>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92", "Folder 97", "draft", #DateTime<2019-03-14 15:09:22.467774Z>, #DateTime<2019-03-14 15:09:22.467774Z>]
  INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<0, 197, 92, 181, 226, 195, 75, 14, 180, 20, 187, 156, 229, 160, 198, 16>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92.00c55cb5_e2c3_4b0e_b414_bb9ce5a0c610", "Folder 98", "draft", #DateTime<2019-03-14 15:09:22.471807Z>, #DateTime<2019-03-14 15:09:22.471807Z>]
  INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<69, 122, 92, 218, 5, 79, 73, 229, 144, 174, 55, 173, 121, 11, 85, 113>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92.457a5cda_054f_49e5_90ae_37ad790b5571", "Folder 99", "draft", #DateTime<2019-03-14 15:09:22.474138Z>, #DateTime<2019-03-14 15:09:22.474138Z>]
  INSERT INTO "folders" ("id","owner_id","parent_id","path","title","type","inserted_at","updated_at") VALUES ($1,$2,$3,$4,$5,$6,$7,$8) [<<184, 206, 200, 225, 115, 215, 64, 236, 139, 124, 103, 32, 204, 190, 131, 38>>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, <<69, 122, 92, 218, 5, 79, 73, 229, 144, 174, 55, 173, 121, 11, 85, 113>>, "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92.457a5cda_054f_49e5_90ae_37ad790b5571.b8cec8e1_73d7_40ec_8b7c_6720ccbe8326", "Folder 100", "draft", #DateTime<2019-03-14 15:09:22.476939Z>, #DateTime<2019-03-14 15:09:22.476939Z>]
  UPDATE "folders" SET "parent_id" = $1, "updated_at" = $2 WHERE "id" = $3 [nil, #DateTime<2019-03-14 15:09:22.479967Z>, <<177, 123, 205, 17, 52, 199, 67, 158, 182, 15, 107, 99, 193, 40, 94, 146>>]
  UPDATE "folders" AS f0 SET "path" = subpath(f0."path",nlevel($1)-1), "updated_at" = $2 WHERE (f0."deleted_at" IS NULL) AND (f0."owner_id" = $3) AND (f0."type" = $4) AND (f0."path" <@ $5) RETURNING f0."id", f0."path", f0."ctid" ["084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92", #DateTime<2019-03-14 15:09:22.481521Z>, <<198, 4, 160, 194, 122, 254, 67, 223, 174, 12, 90, 147, 18, 213, 223, 241>>, "draft", "084e39cd_85c8_4bd0_a98c_bce141ecff88.b17bcd11_34c7_439e_b60f_6b63c1285e92"]\
  """

regex = ~r{#DateTime\<(.[^\>]*)\>}

run_query = fn line ->
  result = Regex.named_captures(~r|(?<query>.*) (?<params>\[.*\])|, line)
  {params, []} = Code.eval_string Regex.replace(regex, result["params"], fn _, x -> "~N[#{b}]" end)
  Repo.query!(result["query"], params) |> IO.inspect
end

lines
|> String.split("\n")
|> Enum.each(run_query)
```
