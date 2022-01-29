# Create Github Repository CLI

Creates repositories both locally and in Github and links them together with one simple command.

## Setup

An environment variable CGR_AUTH with Github username and personal access token is necessary for running this CLI.  
If for example your repositories are all inside one folder you can have a .env file there. 

Variable should look like:
```
CGR_AUTH=<github-username>:<personal-access-token-with-repo-scope>
```

## Usage

```
npm i -g cgr-cli
cgr-cli <new-repository-name>
```
or
```
npx cgr-cli <new-repository-name>
```
