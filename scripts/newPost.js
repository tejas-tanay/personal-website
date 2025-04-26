#!/usr/bin/env node
const inquirer = require('inquirer');
const fs = require('fs');
const slugify = require('slugify');
const path = require('path');
const { execSync } = require('child_process');

// Ensure the posts directory exists
fs.mkdirSync('posts', { recursive: true });

(async function() {
  const { title } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Post title:' }
  ]);

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