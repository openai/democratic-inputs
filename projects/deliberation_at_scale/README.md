# Deliberation at scale: Socially democratic inputs to AI
<img align="left" width="100" height="100" style="margin-right: 20px;" src="./documentation/images/logo.png">
The prototype available in this repository aims to test whether intimate, small group discussions, enhanced by scalable intra-group communication protocols, can generate valuable contributions to the wider debate about challenges facing AI.

<br/><br/>

# Packages
All packages in this monorepo are managed by [Nx](https://nx.dev/) to make it easy to have dependencies between them and run them in development.

| name | description                  | location
|------|------------------------------|----------------|
| [data-core](./packages/data-core/) |Package with all the data model definitions  | https://localhost:3201/ |
| [frontend](./packages/frontend/) | Package with the end-user and admin frontend | https://localhost:3200/ |
| [orchestrator](./packages/orchestrator/) | Manager for all the deliberations and job queue handler | |
| [edge-functions](./packages/edge-functions/) | Supabase Edge functions   | |
| [common](./packages/common/) | Shared library between packages   | |

# Installation
To setup all the packages run the following command:
```
npm run setup
```

Now in the `data-core`, `frontend` and `orchestrator` packages you should initialize the `.env` files that are filled in by you or shared via a password manager.

# Running in development
To start all services in development:
```
npm run start
```

# Development guidelines

## Configuring a double remote
For collaboration purposes it is recommended to sync changes between both an internal remote and the GIT remote of OpenAI on Github.

Execute the following commands to properly initialize your local GIT clone (based on: https://jeffkreeftmeijer.com/git-multiple-remotes/):
```
git remote add openai https://github.com/openai/democratic-inputs.git

git remote add internal https://[INTERNAL_GIT_HERE].com/democratic-inputs/democratic-inputs.git

git remote remove origin

git remote add origin https://github.com/openai/democratic-inputs.git

git remote set-url --add --push origin https://github.com/openai/democratic-inputs.git

git remote set-url --add --push origin https://[INTERNAL_GIT_HERE].com/democratic-inputs/democratic-inputs.git
```

### Nx Console VSCode Extension
To make development a bit more smooth it is recommended to install the [Nx Console](https://marketplace.visualstudio.com/items?itemName=nrwl.angular-console) (when using VSCode). This extension gives you an overview of all the packages in the monorepo and gives you some shortcuts to execute various scripts.

## Semantic Commit Messages
We are using semantic commit messages in this project. The `scope` is `deliberation-at-scale` to be able to quickly filter on all the commits applicable on this project.

Format: `<type>(<scope>): <subject>`

### Example

```
feat: add hat wobble
^--^  ^------------^
|     |
|     +-> Summary in present tense.
|
+-------> Type: chore, docs, feat, fix, refactor, style, or test.
```

More Examples:
- `feat`: (new feature for the user, not a new feature for build script)
- `fix`: (bug fix for the user, not a fix to a build script)
- `docs`: (changes to the documentation)
- `style`: (formatting, missing semi colons, etc; no production code change)
- `refactor`: (refactoring production code, eg. renaming a variable)
- `test`: (adding missing tests, refactoring tests; no production code change)
- `chore`: (updating grunt tasks etc; no production code change)
