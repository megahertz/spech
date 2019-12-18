'use strict';

const fs = require('fs');
const path = require('path');
const { request } = require('../src/providers/helpers/http/http');
const HttpClient = require('../src/providers/helpers/http/HttpClient');

main().catch(console.error);

async function main() {
  const httpClient = new HttpClient(request, {
    debugFn: console.log,
    headers: {
      'User-Agent': 'Node.js',
    },
  });
  httpClient.on('error', () => 0);

  for (let i = 1; i < 5; i++) {
    await getTopReadme(httpClient, i);
  }

  console.info('Done');
}

async function getTopReadme(httpClient, page = 1) {
  const topRepos = await getTopRepositories(httpClient, page);
  await Promise.all(topRepos.map(repo => downloadReadme(httpClient, repo)));
}

/**
 * @param {HttpClient} httpClient
 * @param {number} page
 * @return {Promise<Array<{name: string, flatName: string, readmeUrl: string}>>}
 */
async function getTopRepositories(httpClient, page = 1) {
  const apiUrl = 'https://api.github.com/search/repositories?'
    + 'q=language:javascript'
    + '&page=' + page
    + '&sort=stars';

  const readmeUrl = 'https://raw.githubusercontent.com/{name}/master/README.md';

  const response = await httpClient.getJson(apiUrl);
  return response.items.map((meta) => {
    return {
      name: meta.full_name,
      flatName: meta.full_name.replace('/', '--'),
      readmeUrl: readmeUrl.replace('{name}', meta.full_name),
    };
  });
}

/**
 * @param {HttpClient} httpClient
 * @param {{name: string, flatName: string, readmeUrl: string}} repository
 */
async function downloadReadme(httpClient, repository) {
  const destPath = path.join(__dirname, 'readme', repository.flatName);
  await fs.promises.mkdir(destPath, { recursive: true });
  const writeStream = fs.createWriteStream(path.join(destPath, 'README.md'));

  return httpClient.getUsingTransformer(repository.readmeUrl, (response) => {
    response.stream.pipe(writeStream);
    return new Promise((resolve) => {
      response.stream
        .on('end', resolve)
        .on('error', (e) => {
          console.warn('Item skipped', repository, e);

          try {
            fs.rmdirSync(destPath, { recursive: true });
          } catch (err) {
            // do nothing
          }

          resolve();
        });
    });
  });
}
