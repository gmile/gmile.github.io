---
layout: post
title:  Raw SQL in a Rails project
date:   2016-02-01 21:00
description: Some tips of how we began writing pure SQL in our Rails project
categories: development
published: true
---

## The Problem

Early into web development I adoped this odd way of thinking about SQL:

> SQL is for some experienced old guys with beards from the 90th. But I come from the world of Ruby on Rails where we have ActiveRecord, that conveniently hides all the SQL complexity. Writing raw SQL is not welcome anymore, it's _not safe_, and is a sign of a bad programming tone.

Sounds weird? I know, right! But back in a day, it was a thing I believed in. In almost all of the projects I've been involved in writing raw SQL was considered a bad thing to do. More often than not I'd hear a conversation like this:

> – Guys, we should probably write this in raw SQL,<br>
> – Raw SQL? Seriously?!<br>
> – Yeah. Why not? It'll be much faster!<br>
> – Who cares about the speed. No-one knows SQL anymore! How are we going to support a piece of code like that? What if there's<br>
a mistake in the SQL query? Also, how do you test a piece of code like that?<br>
> – But...<br>
> – Sorry man, let's write this "the Rails way", building the query via ActiveRecord relations.<br>
> – Okay.

For a while this was really disapponting. Until one day.

## The Hope

On this project we had to generate an XML file. In order to generate the file we'd have to load and iterate over 150k ActiveRecord objects. Sounds like not much, but for each object we'd pull a bunch of its associations, and a bunch of association's associations.

Initially the file would take a few minutes to be generated, which was just fine. But as we went on brining more and more associations in, the file generation process surpassed a mark of 20 minutes. This turned out to be critical for a 3rd party consumer system we were feeding the file into: the system was refusing to wait that long, and simply began erroring back at us. To its honour I should admit it was very kind of this 3rd party system to wait 20 minutes in the first place before yelling at us!

As I looked at the logs for the process seeing tons and tons of SQL requests, I became curious if it's possible to get all the data in a single SQL query. Deep in my heart I sensed pure SQL would save us here! 

## The Solution

It was quickly identified that we had two options to go with:

1. start caching the file, so that we have a pre-made file before the 3rd party comes to take it,
2. try a radical "rewrite all the things" solution using pure SQL, and see what happens.

The caching solution would require us to throw in some caching code as well as some code/rules to invalidate the cache. Also it was clear that we would no longer be providing a "live feed", which didn't feel right.

On the contrary, the "raw SQL" solution looked more appealing:

1. all the Ruby code for pre-loading associations would be gone in favor of a new one-liner to just call a single SQL statement,
2. we would not initialize hundreds of thousands of Ruby objects. Ruby GC would be happy!
3. no more useless bytes to send over the wire, as right now we had ActiveRecord load all columns for all models participating in the process,
4. I personally wanted to verify the idea of taking advantage of raw SQL power.

More importantly, to achieve the above all we had to do was to check in a file with SQL code into our git repo, and then call the SQL query from our Ruby code. It just felt simple!

Long story short: after we did the migration, it was taking roughly **1 minute** to actually load all the data we needed! What's more important, it was now possible to start optimizing the SQL query by runnning `EXPLAIN` and auditing indexes. Also, looking at SQL's `SELECT` was a pure joy, as we could quickly see what columns we actually needed for the generated XML file.

## Howto-s

Since this was far from a standard conventional path, a few questions quickly popped into our minds:

1. Where do we put the SQL code?
2. Is there an SQL style we should adhere to?
3. How do we test a piece of SQL code? Do we even have to?
4. How do we build an SQL expression using some dynamic value from Ruby?

Let me cover all of them.

### Where do we put the SQL code?

We didn't want to lose track of SQL files in the system, so we've made a decision to put all of the SQL code in a place dedicated for just that purpose:

* inside `lib/` we created a folder called `sql`,
* each file in the `sql` folder would have to have a `.sql` extension, e.g. `our_precious_feed.sql`, `some_big_report.sql`, etc.

To call the SQL code we've added an object, `RawSQL`. Internally the object would know a hardcoded path to our .sql files, know how to load a file with SQL code, execute it via `ActiveRecord::Base.execute` and return an instance of `ActiveRecord::Result`. You'd use it like this:

```ruby
result = RawSQL.new('our_precious_feed.sql').result
# on a "result" object:
#   1. call .to_a to get an array of hashes,
#   2. call .columns to get a list of columns (useful for generating CSVs).
```

### Is there an SQL style we should adhere to?

Early on we've adoped a simple [style guide](https://github.com/meadmaker/sql-style-guide). It hasn't been updated for quite a while, but it was a good start. We're still using it.

### How do we test an SQL file? Do we even have to?

This is a tricky one. No, there's no need. SQL is essentially a way to describe the data you want. However, we ended up with the following rules:

1. write a full-blown integration test based on DB data only when you absolutetly need to (this really sucks, but sometimes you better be safe than sorry),
2. write a sanity-check test that verifies SQL syntax to not blow up when when executed.

An RSpec test `spec/lib/sql/our_precious_feed_sql.rb` for the latter case would look like this:

```ruby
require 'spec_helper'

describe 'My shiny feed of items' do
  it 'returns correct columns' do
    columns = RawSQL.new('our_precious_feed.sql').result.columns
    
    expect(columns).to eql %(
      my_column_1
      my_column_2
      my_column_3
    )
  end
end
```

Not only a test like this would execute SQL code and raise if there were a syntax error, but also it'd check a contract between SQL and Ruby realms: an expected array of columns returned (which is stored in `ActiveRecord::Result` even if there was no actual data returned) from SQL to be relied upon in Ruby.

### How do we make the SQL accept dynamic values?

Our initial SQL query was just "take all the data" style of query. But what if we need to specify an ID, string or an array for the SQL query to depend upon in, say, a `WHERE` clause?

Luckly, there's a very convenient mechanism of doing this in Ruby called string interpolation:

```ruby
"Hello, %{name}" % { name: 'Darkness my old friend' } # => "Hello, Darkness my old friend"
```

It's especially expressive when it comes to [generating SQL strings with proper values](http://davebaker.me/articles/tip-ruby-string-interpolation-with-hashes):

All we had to do was to change the `RawSQL`s method signature to accept params like this:

```ruby
RawSQL.new('some_big_report.sql').result(some_date: '2014-03-04 13:23:34')
```

There was one caveat, however: quoting and typecasting. To do that we used the [`quote`](https://github.com/rails/rails/blob/v4.2.5.1/activerecord/lib/active_record/connection_adapters/abstract/quoting.rb#L8) method from `ActiveRecord::ConnectionAdapters::Quoting` module.

With that in mind, he source for the class would look like this:

```ruby
class RawSQL
  include ActiveRecord::ConnectionAdapters::Quoting

  def initialize(filename)
    @filename = filename
  end

  def result(params)
    ActiveRecord::Base.connection.exec_query(query % quoted_parameters(params))
  end

  private

  attr_reader :filename

  def query
    File.read(Rails.root.join('lib/portal/sql', filename))
  end

  def quoted_parameters(params)
    params.each_with_object({}) do |(key, value), result|
      result[key] =
      if value.is_a?(Array)
        value.map { |item| quote(item) }.join(', ')
      elsif value.is_a?(Integer)
        value
      else
        quote(value)
      end
    end
  end
end
```

## Conclusion

These days I find a query code written in pure SQL much more appealing that an equivalent multi-line join code written using ActiveRecord relations. Yet to be fair, there are plenty of cases where utilities provided by Arel are absolutely necessary.

Take a user's search query, for example: it have to incorporate searching by first name, last name, email, id, something else... It can be really intimidating to build this using raw SQL strings. Here's where [arel](https://github.com/rails/arel) comes to the rescue. Another good example would be iterating over a simple set of associations, like rendering comments for a post. Writing a raw SQL for a job like that would be a waste of time!

Do not be scared of writing raw SQL like I was. After getting myself familiar with simple `SELECT`s, `GROUP BY`s and a small set of aggregate functions like `MAX`, `SUM` and alike, I discovered a whole world of new tools, such as window functions, materialized views, jsonb, and lots of other powerful database features.

I wish someone sat down with me back in a day and told me there ain't anything bad about writing pure SQL code. Instead I had to learn this simple truth my own, hard way.

SQL has been around for more than 40 years. It's a giant. Why not build, standing on the shoulders of giant?

---

Big kudos to my friend [Alexei Sholik](https://github.com/alco/) for proofreading the post!

---

**Update**. Added sample source code for `RawSQL` class.
