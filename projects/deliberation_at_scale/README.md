# Deliberation at scale: Socially democratic inputs to AI
<img align="left" width="100" height="100" style="margin-right: 20px;" src="./documentation/images/logo.png">
The prototype available in this repository aims to test whether intimate, small group discussions, enhanced by scalable intra-group communication protocols, can generate valuable contributions to the wider debate about challenges facing AI.

<br/><br/>

# Packages
| name | description                  |
|------|------------------------------|
| [data-core](./packages/data-core/) |Package with all the data model definitions  |
| [frontend](./packages/frontend/) | Package with the end-user and admin frontend |
| [orchestrator](./packages/orchestrator/) | Manager for all the deliberations and job queue handler |
| [edge-functions](./packages/edge-functions/) | Supabase Edge functions   |
| [common](./packages/common/) | Shared library between packages   |

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

References:

- https://www.conventionalcommits.org/
- https://seesparkbox.com/foundry/semantic_commit_messages
- http://karma-runner.github.io/1.0/dev/git-commit-msg.html
