# Rappler aiDialogue

OpenAI powered focus group discussion built on Firebase.

## Pre-requisites

- Sign up for a free Firebase project -> https://firebase.google.com/
- Upgrade the project to pay as you go Blaze plan. This is needed in order to deploy functions which are used in the project to connect to OpenAI
- Create a [new web app](https://firebase.google.com/learn/pathways/firebase-web) in your Firebase project.
- An OpenAI account and API key.

## Setup

1. Install Nodejs using nvm and ensure sure that you are using Nodejs v20. More about how to use nvm or Node Version Manager [here](https://github.com/nvm-sh/nvm).


    ```
    nvm install v20
    nvm use v20
    ```

1. Install firebase-tools

    ```
    npm install -g firebase-tools
    ```

1. Clone this repository

    ```
    git clone git@github.com:TheRapplers/fgdai.git
    ```

1. Create a .env file from env.example, replace the values of the environment variables with values from your Firebase project.
1. Open a terminal and go to the root folder of the project, execute this command and follow the instructions to login to your firebase account.

    ```
    firebase login
    ```

1. After successfully logging in to your firebase account, execute the following command. Replace <firebase_project_id> with the project id of your firebase project.

    ```
    firebase use <firebase_project_id>
    ```

1. Install packages inside the hosting/ folder

    ```
    cd hosting/
    npm install
    ```

1. Enable experimental support for webframeworks in firebase

    ```
    firebase experiments:enable webframeworks
    ```
1. Add your OPENAI_API_KEY environment variable by executing the command below and following the instructions
    ```
    firebase functions:secrets:set OPENAI_API_KEY
    ```

# Run Locally

To run the web application locally, execute the following command inside the project folder. This will 

```firebase emulators:start import=seed/```

Open a browser window and go to http://localhost:4000. Click on ```View Website``` under the *Hosting Emulator* card.