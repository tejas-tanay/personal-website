---
layout: layouts/base.njk
title: "Home"
---
<h1>Tejas Tanay Sharma</h1>
<p>I build public-service software and write about incentives, cities, and emergent power games.</p>

<p>Based in Dubai after cutting my teeth on Indian GovTech, I'm pivoting our family firm toward SaaS while unpacking the politics of code, capital, and culture.</p>

<h2>Recent essays</h2>
<ul>
{% for post in collections.posts | slice(0, 3) %}
  <li><a href="{{ post.url }}">{{ post.data.title }}</a> <time datetime="{{ post.date | date('YYYY-MM-DD') }}">{{ post.date | date('MMMM DD, YYYY') }}</time></li>
{% endfor %}
</ul>

<p><a class="button" href="/book/">Book time →</a></p>

<p><a href="https://linkedin.com/in/tejas-tanay-sharma">LinkedIn</a> · <a href="https://twitter.com/tejas_tanay">Twitter</a> · <a href="https://instagram.com/tejastanaysharma">Instagram</a> · <a href="mailto:me@tejastanaysharma.com">Email</a> <!-- · <a href="https://github.com/tejas-tanay">GitHub</a> --></p>

<footer>&copy; 2025 Tejas Tanay Sharma — thoughts are my own.</footer> 