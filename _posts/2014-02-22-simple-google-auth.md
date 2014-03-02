---
layout: post
title:  OAuth2, Google and Ruby
date:   2014-03-02 18:34:00
categories: development
---

Although it may not look so at a glance, authorizing access to a Google service using Ruby is rather simple. In this post I'd like to take a detailed look at what needs to be done to authorize access to a Google service using [OAuth2](http://oauth.net/2/) protocol.

## The legend

A friend of mine owns a neat collection of playlists on YouTube. I want to create a tiny web app which, with a permission from him, would access those playlists and, maybe some other data on his YouTube account.

I am not going to walk through the process of making a complete web app here, but instead focus on the authorization part, including making a first API call.

## Prerequisites

Before proceeding, two things must be done on Google Cloud:

1. create a project,
2. setup project's credentials.

Both steps are already well-described on [this page](https://developers.google.com/accounts/docs/OAuth2#basicsteps), so I'm not going to dive into it much here. Upon completing it, we will receive the following three strings:

1. `CLIENT_ID`,
2. `CLIENT_SECRET`,
3. `REDIRECT_URI` (or a list of redirect URIs).

Since I don't have an app running online just yet (after all, all I'm doing is hacking to check if I'm capable of getting the needed data), I set the list of redirection URIs to only one URI – `http://localhost`. We'll revisit this once again on "Step 2" below.

## Authorization

Google providers a great authorization gem, called [`signet`](https://github.com/google/signet), which significantly simplifies the process of dealing with authorization logic.

Authorization using OAuth2 consists of 3 steps:

1. generating `AUTHORIZATION_URI`,
2. obtaining `AUTHORIZATION_CODE` by visiting the `AUTHORIZATION_URI`,
3. obtaining `REFRESH_TOKEN` using `AUTHORIZATION_CODE`.

Let's take a look on how each step is done in Ruby.

### 1. Generating an `AUTHORIZATION_URI`:

```ruby
require 'signet/oauth_2/client'

auth = Signet::OAuth2::Client.new(
  authorization_uri: 'https://accounts.google.com/o/oauth2/auth',
  scope:             'https://www.googleapis.com/auth/analytics.readonly',
  state:             'useful_dynamic_string',
  redirect_uri:      REDIRECT_URI,
  client_id:         CLIENT_ID,
  client_secret:     CLIENT_SECRET
)

puts auth.authorization_uri
```

This should output a URI as such:

```
https://accounts.google.com/o/oauth2/auth?access_type=offline&approval_prompt=force&client_id=110528770916-laeoqu8p515sp2l8nmrk6f8ks1vi6hue.apps.googleusercontent.com&redirect_uri=http://localhost&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly&state=useful_dynamic_string
```

Before we proceed, let's take a look at what 'useful_dynamic_string' actually used for.

For the moment, let's pretend that no `{ state: 'useful_dynamic_string' }` parameter is being passed to `Signet::OAuth2::Client` object constructor. I am as a developer, is the only user of the application, therefore using a simple `http://localhost/?code=...` URI absolutely satisfies my needs. In a real-world application though, there's a need to distinguish a user who lands on such URL. Here's where the `state` parameter comes in handy.

Let's say that after pushing the app to a closed beta, I've given the the `AUTHORIZATION_URI` to the 3 of my friends, a team of early adopters. All of them visited the link and got redirected to my app, each with his own `AUTHORIZATION_CODE`:

```
http://localhost/?code=4/E8sBD2JtNuNh55d7An9Yv6w5fcYq.Moh0rgY4p5sQOl05ti8ZT3YdR_QGiQI
http://localhost/?code=4/DNpTH_-_BsiTSqPueoIQtGdfrCAC.AtzGXOB0Rg8YOl05ti8ZT3Zv1PYGiQI
http://localhost/?code=4/ZPq4nXQ_MjCsmt7PdC5WXvnUGPw1.kipp73smZiQQOl05ti8ZT3bHA_gGiQI
```

Seeing these three, how do I distinguish which users in my app they belong to? It's not possible, unless I include some kind of URI parameter, that'll travel first to the user [user concent screen](https://developers.google.com/accounts/docs/OAuth2Login#consentpageexperience) on Google, and then back to my app on `http://mycoolapp.com/my_auth`.

When it comes to building a real-world app, I guess I'd use either an `id` of my user to pass along, or an email. Using email as a value for `state` parameter, the redirection would end up on these three pages, respectively:

```
http://localhost/?code=4/E8sBD2JtNuNh55d7An9Yv6w5fcYq.Moh0rgY4p5sQOl05ti8ZT3YdR_QGiQI&state=mike@server.com
http://localhost/?code=4/DNpTH_-_BsiTSqPueoIQtGdfrCAC.AtzGXOB0Rg8YOl05ti8ZT3Zv1PYGiQI&state=george@server.com
http://localhost/?code=4/ZPq4nXQ_MjCsmt7PdC5WXvnUGPw1.kipp73smZiQQOl05ti8ZT3bHA_gGiQI&state=alice@server.com
```

Now that I've got a `state=user@server.com` parameter back, I can easily tell which user I should proceed the next step with.

### 2. Obtaining an `AUTHORIZATION_CODE`:

Visiting the above URI and granting the access will result in a redirection to an address, that looks as such:

```
http://localhost/?code=4/6ZPdX-xk7a5utvwoca9JgPdsla8I.AmoFRfAY0rYYOl05ti8ZT3ZroTTAiAI
```

The value of `code` URI param is the `AUTHORIZATION_CODE` we're looking for.

Obtaining the `code` is a no-brainer when testing on a local machine. When it comes to real-world apps though, a few additional notes must be taken into consideration.

In the example above, the URI is `localhost` only due to the fact I'm hacking here, i.e. trying to establish whether something will or will not work as I expect it to. For a real world, publicly accessible app, running a staging or production environment, the `REDIRECT_URI` obviously must be a real URI.

For example, a *real* URI may look like `http://mycoolapp.com/my_auth` or `http://staging.mycoolapp.com/my_auth` for production and staging environments respectively. Both such redirect URLs have to be included in a "Redirect URIs" list when setting up an application on Google Cloud (see "Prerequisites" section above).

### 3. Obtaining a `REFRESH_TOKEN`:

```ruby
require 'signet/oauth_2/client'

auth = Signet::OAuth2::Client.new(
  token_credential_uri: 'https://accounts.google.com/o/oauth2/token',
  redirect_uri:         REDIRECT_URI,
  client_id:            CLIENT_ID,
  client_secret:        CLIENT_SECRET,
  code:                 AUTHORIZATION_CODE
)

puts auth.fetch_access_token!
```

This will result in an output as such:

```ruby
{
  "access_token" => "ya29.1.AADtN_Us0-Q9oRmYIBl-0eYiqThLUxczhLk5lbNskf4nv7baj_2x1v6Oc0ptW3V18RYzZg",
  "token_type"   => "Bearer",
  "expires_in"   => 3600,
  "refresh_token"=> "1/eVluU7xcmEoHxUz4Fmk6yMQGPMaLKBpwJ4eqDxDcKw8"
}
```

The value of `refresh_token` key is the `REFRESH_TOKEN` we're looking for. Thanks to the way `signet` is implemented, from now on given `REFRESH_TOKEN` is the only token required to authorize access to a respective client's data. In other words, `refresh_token` **has to be persisted**.

It is worth mentioning that not only `#fetch_access_token!` returns a hash  with `refresh_token` key, but it also *activates* the `auth` object. By *activating* I mean issuing a new `access_token` from Google, which will be valid for the next 3600 seconds. Luckily, there's no need to care about them.

As long as we keep the `REFRESH_TOKEN`, calling `#fetch_access_token!` will authorize the `Signet::OAuth2::Client` instance for doing API interaction on behalf of a given client.

## Making an API call

Now all that's left is to initialize the `Signet::OAuth2::Client` instance using the `REFRESH_TOKEN`, and proceed with making an API call.

This step, being a final, requires [`google-api-client`](https://github.com/google/google-api-ruby-client) gem to be installed.

```ruby
require 'google/api_client'
require 'signet/oauth_2/client'

auth = Signet::OAuth2::Client.new(
  token_credential_uri: 'https://accounts.google.com/o/oauth2/token',
  client_id:            CLIENT_ID,
  client_secret:        CLIENT_SECRET,
  refresh_token:        REFRESH_TOKEN
)

auth.fetch_access_token!

api_client = Google::APIClient.new(
  application_name:    'Playlists fetcher',
  application_version: '1.0.0'
)

api_client.authorization = auth

youtube = api_client.discovered_api('youtube', 'v3')

response_data = api_client.execute(
  api_method: youtube.playlists.list,
  parameters: {
    part: 'id',
    mine: true
  }
).data

puts response_data.inspect
```
