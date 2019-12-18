'use strict';

const fs = require('fs');
const options = require('package-options');
const path = require('path');

main().catch(console.warn);

async function main() {
  const config = options.reset().loadCmd().default;
  const fileList = makeFileList(config.provider);
  const dictionary = await makeDictionary(fileList);
  saveDictionary(dictionary, config.provider);
}

function makeFileList(providers = null) {
  if (typeof providers === 'string') {
    providers = [providers];
  }

  if (!providers) {
    providers = ['yandex', 'hunspell', 'grammarBot'];
  }

  const rootPath = path.join(__dirname, 'readme');

  const projects = fs.readdirSync(rootPath)
    .filter(fileName => fileName !== '.gitignore')
    .map(fileName => path.join(rootPath, fileName));

  return projects.reduce((fileList, project) => {
    providers.forEach((provider) => {
      const filePath = path.join(project, provider + '.json');
      if (fs.existsSync(filePath)) {
        fileList.push(filePath);
      }
    });

    return fileList;
  }, []);
}

async function makeDictionary(fileList) {
  const dictionary = {};
  for (const file of fileList) {
    let corrections = JSON.parse(await fs.promises.readFile(file, 'utf8'));

    if (!corrections) {
      corrections = [];
    }

    if (corrections.items) {
      corrections = corrections.items;
    }

    corrections.forEach((correction) => {
      if (dictionary[correction.fragment]) {
        dictionary[correction.fragment] += 1;
      } else {
        dictionary[correction.fragment] = 1;
      }
    });
  }

  return Object.entries(dictionary)
    .sort(([f1, c1], [f2, c2]) => c2 - c1)
    .map(([fragment, count]) => {
      return `# ${count}\n${fragment}`;
    })
    .join('\n');
}

function saveDictionary(content, provider) {
  provider = provider || 'all';
  const filePath = path.join(__dirname, 'dictionaries', provider + '.dic');
  fs.writeFileSync(filePath, content);
}
