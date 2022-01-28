#!/usr/bin/env node

import 'dotenv/config';
import { exec } from 'child_process';
import fetch from 'node-fetch';

const name = process.argv[2];
const AUTH = process.env.AUTH;

const headers = {
    'Authorization': `Basic ${Buffer.from(AUTH, 'utf8').toString('base64')}`
};

const run = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`error: ${err}`);
                reject(err);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
            }
            console.log(stdout);
            resolve(stdout);
        });
    });
}

const echo = async (message) => {
    await run(`echo ${message}`);
}

const mkdir = async () => {
    await echo(`Creating a new folder ${name}`);
    await run(`mkdir ${name}`);
}

const initRepo = async () => {
    await run(`git init ${name}`);
    await run(`echo # ${name}>> ${name}/README.md`);
    await run(`cd ${name} && git add README.md`);
    await run(`cd ${name} && git commit -m "Initial commit"`);
}

const createGithubRepo = async () => {
    const body = JSON.stringify({
        name,
        private: true
    });

    await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body
    });
}

const pushLocalRepoToGithub = async (user) => {
    await run(`cd ${name} && git remote add origin https://github.com/${user}/${name}.git`);
    try {
        await run(`cd ${name} && git push -u origin master`);
    } catch (e) {
        console.log(`error: ${e}`);
    }
}

const getGithubUser = async () => {
    const res = await fetch('https://api.github.com/user', { headers });
    const user = await res.json();
    return user.login;
}

const user = await getGithubUser();
await mkdir();
await initRepo();
await createGithubRepo();
await pushLocalRepoToGithub(user);
