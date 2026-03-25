const { generate } = require('@mermaid-js/mermaid-cli');
const fs = require('fs');

const input = 'architecture.mmd';
const output = 'architecture.png';

const config = {
  puppeteerConfig: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
};

generate(input, output, config)
  .then(() => {
    console.log('Generated successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
