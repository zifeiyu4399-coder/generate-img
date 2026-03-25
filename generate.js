#!/usr/bin/env node
import { run } from '@mermaid-js/mermaid-cli';

const input = 'architecture.mmd';
const output = 'architecture.png';

const config = {
  puppeteerConfig: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
};

run(input, output, config)
  .then(() => {
    console.log('Generated successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
