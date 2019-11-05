# Schnitzellunch

https://schnitzellunch.se/

[![Netlify Status](https://api.netlify.com/api/v1/badges/f7653c2a-ff32-44da-8ebe-65e0a144778c/deploy-status)](https://app.netlify.com/sites/schnitzellunch/deploys)

- Staticly hosted on Netlify
- Master is automatically built and deployed
- Scraping is done with Netlify Functions (AWS Lambda)
- Result from scraping is saved in a Fauna database
- Data is retrieved via GraphQL

## Hosting
Netlify

## Backend
Netlify Functions (AWS Lambda)

Functions are placed in `src/lambda`.
Example: src/lambda/schnitzel.js
Which can then be accessed at `/.netlify/functions/schnitzel`

## Database
FaunaDB

## Dev

It's a create-react-app app.

To run webpack dev server and Netlify functions locally at the same host:

`$ npm run dev`
