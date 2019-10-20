# Schnitzellunch

https://schnitzellunch.patrikelfstrom.se/

[![Netlify Status](https://api.netlify.com/api/v1/badges/b94b2836-cf67-46fc-9c23-1b353ad1f2bb/deploy-status)](https://app.netlify.com/sites/schnitzellunch/deploys)

* Staticly hosted on Netlify
* Master is automatically built and deployed
* Scraping is done with Netlify Functions (AWS Lambda)
* Result from scraping is saved in a Fauna database
* Data is retrieved via GraphQL

## Hosting
https://app.netlify.com/sites/schnitzellunch/overview

## Backend
Netlify Functions (AWS Lambda)
https://docs.netlify.com/functions/overview/

Functions are placed in `src/lambda`.
Example: src/lambda/schnitzel.js
Which can then be accessed at `/.netlify/functions/schnitzel`

## Database
FaunaDB

https://dashboard.fauna.com/db/schnitzellunch

## Dev

It's a create-react-app app.

To run webpack dev server and Netlify functions locally at the same host:

`$ npm run dev`
