#!/usr/bin/env node
const fs = require('fs');
const slugify = require('slugify');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Ensure the posts directory exists
fs.mkdirSync('posts', { recursive: true });

(async function() {
  // Prompt for title using Node's readline
  const title = await new Promise(resolve => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Post title: ', answer => { rl.close(); resolve(answer.trim()); });
  });

  const date = new Date().toISOString().split('T')[0];
  const slug = slugify(title, { lower: true, strict: true });
  const filename = `${date}-${slug}.md`;
  const filepath = path.join('posts', filename);

  const content = `---
title: "${title}"
layout: layouts/base.njk
date: "${date}"
---

# ${title}

Write your post here.
`;

  fs.writeFileSync(filepath, content);
  console.log(`Created new post: ${filepath}`);

  const editor = process.env.EDITOR || 'vi';
  execSync(`${editor} ${filepath}`, { stdio: 'inherit' });
})(); 