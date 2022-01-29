#!/usr/bin/env node

import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const name = process.argv[2];
const AUTH = process.env.CGR_AUTH;

if (!AUTH) {
    console.log('Environment variable CGR_AUTH missing.');
    process.exit(1);
}

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

const headers = {
    'Authorization': `Basic ${Buffer.from(AUTH, 'utf8').toString('base64')}`
};

const run = promisify(exec);

const mkdir = async () => {
    console.log(`Creating a new folder ${name}`);
    await run(`mkdir ${name}`);
}

const initRepo = async () => {
    console.log(`Initializing git repository ${name}.git`);
    await run(`git init ${name}`);
    await run(`echo # ${name}>> ${name}/README.md`);
    await run(`cd ${name} && git add README.md`);
    await run(`cd ${name} && git commit -m "Initial commit"`);
}

const createGithubRepo = async () => {
    console.log('Creating a Github repository');
    const body = JSON.stringify({
        name,
        private: true
    });

    const res = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body
    });
    const data = await res.json();
    const url = data.html_url;
    return url;
}

const pushLocalRepoToGithub = async (url) => {
    console.log('Pushing local repository to remote');
    await run(`cd ${name} && git remote add origin ${url}.git`);
    await run(`cd ${name} && git push -u origin master`);
}

const getGithubUser = async () => {
    console.log('Authenticating user');
    const res = await fetch('https://api.github.com/user', { headers });
    const user = await res.json();
    console.log(`Authenticated as ${user.login}`);
}

try {
    await getGithubUser();
    await mkdir();
    await initRepo();
    const url = await createGithubRepo();
    await sleep();
    await pushLocalRepoToGithub(url);
    console.log(`
        All done.
        Github repository: ${url}
        Local repository folder: ${'./'}${name}
    `);
} catch (e) {
    console.log(e);
    process.exit(1);
}
