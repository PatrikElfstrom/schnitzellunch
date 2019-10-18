# Schnitzellunch

https://schnitzellunch.patrikelfstrom.se/

[![Netlify Status](https://api.netlify.com/api/v1/badges/b94b2836-cf67-46fc-9c23-1b353ad1f2bb/deploy-status)](https://app.netlify.com/sites/schnitzellunch/deploys)

* Staticly hosted on Netlify
* Master is automatically built and deployed
* Scraping is done with Netlify Functions (AWS Lambda)

**WARNING: The scraping is never cached and done on every request. Data should be saved to the database.**

## TODO

* Cache scraping results in database
* Scrape all days when scraping kvartersmenyn (now only scraping Friday)
* Build frontend
* Add support for more sites
* ...

## Hosting
https://app.netlify.com/sites/schnitzellunch/overview

## Backend
Netlify Functions (AWS Lambda)
https://docs.netlify.com/functions/overview/

Functions are placed in `src/lambda`.
Example: src/lambda/schnitzel.js
Which can then be accessed at `/.netlify/functions/schnitzel`

## Database
Thinking about using FaunaDB since it's free and Netlify has built in support.
Has also support for GraphQL.

https://dashboard.fauna.com/db/schnitzellunch

## Dev

It's a create-react-app app.

To run webpack dev server and Netlify functions locally at the same host:
`$ npm i -g netlify-cli`
`$ netlify dev`