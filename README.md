This is a static page site hosted on github pages, built on Next.js, that captures stats for a particular raid team at the end of the season.
It leverages the Warcraft Logs API to pull in data for a raid team and aggragates stats (both generic and seasonal) to show graphs by raider.

## Getting Started

### Prerequisites
Both the codegen and the local server depend on a warcraft logs credential token being part of the environment variables under ``TOKEN``

### Code Gen
This project makes use of graphql-codegen to be able to generate types based off of our queries. When updating queries you need to run ``npm run generate`` to update types

### Local server development

To start local server, you can run ``npm run start`` which should bring up the local server on port ``3000`` under ``/raid-recap``
First, run the development server:
