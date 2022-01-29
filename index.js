#!/usr/bin/env node

import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';
import { validateName } from './utils/validation.js';

const name = process.argv[2];
const AUTH = process.env.CGR_AUTH;

if (!AUTH) {
    console.log('Environment variable CGR_AUTH missing');
    process.exit(1);
}

if (!name) {
    console.log('Name argument missing');
    console.log('Usage: cgr-cli <repository-name>');
    process.exit(1);
} else if (!validateName(name)) {
    console.log('Invalid name.');
}

const sleep = (ms = 2000) => new Promise((r) => setTimeout(r, ms));

const headers = {
    'Authorization': `Basic ${Buffer.from(AUTH, 'utf8').toString('base64')}`
};

const run = promisify(exec);

const createGithubRepo = async () => {
    console.log('Creating a Github repository');
    const body = JSON.stringify({
        name,
        private: true,
        auto_init:  true
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

const cloneRepo = async (url) => {
    console.log(`Cloning ${url}`);
    await run(`git clone ${url}`);
}

try {
    // const url = await createGithubRepo();
    // await sleep();
    // await cloneRepo(url);
    // console.log(`
    //     All done.
    //     Github repository: ${url}
    //     Local repository folder: ${'./'}${name}
    // `);
} catch (e) {
    console.log(e);
    process.exit(1);
}
