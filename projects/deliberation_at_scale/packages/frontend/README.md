# Deliberation at Scale - Frontend
![Screenshot overview](./documentation/images/basic-prototype-overview.png)

This frontend demonstrates a basic prototype with a simple chat window where an AI facilitator occasionally summarizes the conversation to actionable and insightful outcomes.

# Installation
Install all the dependencies:
```
npm run setup
```

Provision your `.env` file if you don't have it yet (this will overwrite an existing `.env` file):
```
npm run setup:env
```

Make sure all the environment variables are properly filled in.

# Running in development
To run in development:
```
npm run start
```

# Authentication
This frontend works only with [Magic Links](https://supabase.com/docs/guides/auth/auth-magic-link) provided by Supabase Authentication. This makes the sign in and sign up page essentially the same page. To make sure users are also created on the first ever login you need to turn off `confirm email` in the `Authentication > Providers` page in the `Email` section.

![Screenshot of disabling confirm email](./documentation/images/confirm-email-off.png)

# Type generation
To make the various clients fetching data type-safe you can generate types from introspecting the database:
```
npm run db:generate-types
```
