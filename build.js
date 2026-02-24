const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

// Configuration
const DIST_DIR = path.join(__dirname, 'dist');
const MD_DIR = path.join(__dirname, 'md');
const BLOG_DIR = path.join(DIST_DIR, 'blog');
const ABOUT_DIR = path.join(DIST_DIR, 'about');
const BLOG_LIST_PAGE = path.join(BLOG_DIR, 'index.html');
const INDEX_PAGE = path.join(DIST_DIR, 'index.html');
const ABOUT_MD = path.join(MD_DIR, 'about.md');
const ABOUT_HTML = path.join(ABOUT_DIR, 'index.html');

// Helper to parse frontmatter-like fields from MD
function parseMd(content) {
  const lines = content.split('\n');
  const metadata = {};
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('id:')) {
      metadata.id = line.replace('id:', '').trim();
    } else if (line.startsWith('date:')) {
      metadata.date = line.replace('date:', '').trim();
    } else if (line.startsWith('title:')) {
      metadata.title = line.replace('title:', '').trim();
    } else if (line.startsWith('excerpt:')) {
      metadata.excerpt = line.replace('excerpt:', '').trim();
    } else if (line === '---' && i > 0) {
      bodyStart = i + 1;
      break;
    }
  }

  const body = lines.slice(bodyStart).join('\n');
  return { metadata, body };
}

function formatDate(dateStr) {
  const [month, day, year] = dateStr.split('/');
  const date = new Date(`${year}-${month}-${day}`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${parseInt(day)}, ${year}`;
}

function getIsoDate(dateStr) {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function generateLayout(title, content, currentTab) {
  return `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <meta name="theme-color" content="#0f1419" />
  <script>
    (function() {
      const theme = localStorage.getItem('theme') || 'light';
      document.documentElement.setAttribute('data-theme', theme);
    })();
  </script>
  <title>` + title + `</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap"
    rel="stylesheet" />
  <link rel="stylesheet" href="/style.css" />
  <link rel="icon" type="image/png" href="/assets/favicon.png" />
</head>

<body>
  <nav class="tab-nav" aria-label="Main navigation">
    <a href="/" class="nav-brand">Chaos Lab</a>
    <div class="nav-links">
      <a href="/blog" id="tab-blog"` + (currentTab === 'blog' ? ' aria-current="page"' : '') + `>Blog</a>
      <a href="/about" id="tab-about"` + (currentTab === 'about' ? ' aria-current="page"' : '') + `>About</a>
    </div>
  </nav>

  <div class="panels">
    ` + content + `
  </div>

  <footer class="site-footer">
    <div class="copyright">&copy; 2026, Chao</div>
    <nav class="links" aria-label="Contacts">
      <a href="mailto:chaoslabme@gmail.com" title="Email" id="email-link"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg></a>
      <div id="copy-tooltip" class="copy-tooltip">Copied!</div>
      <a href="https://linkedin.com/in/chaozho" target="_blank" rel="noopener" title="LinkedIn"><svg
          xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect width="4" height="12" x="2" y="9" />
          <circle cx="4" cy="4" r="2" />
        </svg></a>
    </nav>
    <button class="theme-toggle" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme">
      <svg class="sun-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
      <svg class="moon-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    </button>
  </footer>
  <script>
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    });

    const emailLink = document.getElementById('email-link');
    const tooltip = document.getElementById('copy-tooltip');
    if (emailLink && tooltip) {
      emailLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = 'chaoslabme@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          const rect = emailLink.getBoundingClientRect();
          const footerRect = emailLink.closest('.links').getBoundingClientRect();
          tooltip.style.left = (rect.left - footerRect.left + rect.width / 2) + 'px';
          tooltip.classList.add('show');
          setTimeout(() => {
            tooltip.classList.remove('show');
          }, 1000);
        });
      });
    }
  </script>
</body>

</html>`;
}

function generatePostHtml(metadata, htmlContent) {
  const formattedDate = formatDate(metadata.date);
  const content = `
    <section class="view is-active">
      <div class="post-view">
        <a href="/blog" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Blog
        </a>

        <header class="post-header">
          <h1>` + metadata.title + `</h1>
          <p class="excerpt">` + metadata.excerpt + `</p>
          <p class="meta">` + formattedDate + `</p>
        </header>

        <article class="post-content">
` + htmlContent + `
        </article>
      </div>
    </section>`;
  return generateLayout(metadata.title, content, 'blog');
}

function updateBlogListPage(posts) {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true });
  }
  const listHtml = posts.map(post => `
          <li>
            <article>
              <h3><a href="/blog/` + post.id + `/">` + post.title + `</a></h3>
              <p class="meta">` + formatDate(post.date) + `</p>
              <p class="excerpt">` + post.excerpt + `</p>
            </article>
          </li>`).join('');

  const content = `
    <!-- Blog view -->
    <section id="view-blog" class="view is-active" aria-labelledby="blog-heading">
      <div class="blog-inner">
        <h2 id="blog-heading" class="section-title">Blog</h2>
        <ul class="blog-list">
` + listHtml + `
        </ul>
      </div>
    </section>`;

  const fullHtml = generateLayout('Blog', content, 'blog');
  fs.writeFileSync(BLOG_LIST_PAGE, fullHtml);
}

function updateIndexPage(posts) {
  const recentPosts = posts.slice(0, 3);
  const listHtml = recentPosts.map(post => `
            <li>
              <a href="/blog/` + post.id + `/">` + post.title + `</a>
              <time datetime="` + getIsoDate(post.date) + `">` + formatDate(post.date) + `</time>
            </li>`).join('');

  const content = `
    <!-- Main view -->
    <section id="view-main" class="view is-active" aria-labelledby="main-heading">
      <div class="main-inner">
        <h1 id="main-heading" class="name">Chaofeng Zhou</h1>
        <p class="tagline">Chaos, decoded</p>
        <p class="intro">
          I build things and write about tech and personal growth.
        </p>
        <div class="recent-section">
          <h2>Recent articles</h2>
          <ul class="recent-list">
` + listHtml + `
          </ul>
          <div class="see-more-container">
            <a href="/blog" class="see-more">See more</a>
          </div>
        </div>
      </div>
    </section>`;

  const fullHtml = generateLayout('Chaofeng - Chaos, decoded', content, 'main');
  fs.writeFileSync(INDEX_PAGE, fullHtml);
}

function generateAboutHtml(htmlContent) {
  const content = `
    <!-- About view -->
    <section id="view-about" class="view is-active" aria-labelledby="about-heading">
      <div class="about-inner">
        <h2 id="about-heading" class="section-title">About</h2>
` + htmlContent + `
      </div>
    </section>`;
  return generateLayout('About', content, 'about');
}

function updateAboutPage() {
  if (fs.existsSync(ABOUT_MD)) {
    const content = fs.readFileSync(ABOUT_MD, 'utf8');
    let body = content;
    if (content.includes('---')) {
      const parts = content.split('---');
      body = parts.slice(1).join('---');
    }
    const htmlContent = marked.parse(body);
    const fullHtml = generateAboutHtml(htmlContent);
    if (!fs.existsSync(ABOUT_DIR)) {
      fs.mkdirSync(ABOUT_DIR, { recursive: true });
    }
    fs.writeFileSync(ABOUT_HTML, fullHtml);
    // console.log('Updated about page.');
  }
}

function main() {
  const generatedFiles = new Set();
  const generatedDirs = new Set();

  const files = fs.readdirSync(MD_DIR).filter(f => f.endsWith('.md') && f !== '_template.md' && f !== 'about.md');
  const allPosts = [];

  files.forEach(file => {
    const filePath = path.join(MD_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const { metadata, body } = parseMd(content);

    if (!metadata.id || !metadata.date || !metadata.title) {
      console.warn('Skipping ' + file + ': Missing metadata (id, date, or title)');
      return;
    }

    allPosts.push(metadata);

    const postDir = path.join(BLOG_DIR, metadata.id);
    const postFile = path.join(postDir, 'index.html');

    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    generatedDirs.add(postDir);

    const htmlContent = marked.parse(body);
    const fullHtml = generatePostHtml(metadata, htmlContent);
    const exists = fs.existsSync(postFile);
    fs.writeFileSync(postFile, fullHtml);
    generatedFiles.add(postFile);
    if (!exists) {
      console.log('Generated blog post: ' + metadata.id);
    }
  });

  allPosts.sort((a, b) => new Date(getIsoDate(b.date)) - new Date(getIsoDate(a.date)));

  updateBlogListPage(allPosts);
  generatedFiles.add(BLOG_LIST_PAGE);
  generatedDirs.add(BLOG_DIR);

  updateIndexPage(allPosts);
  generatedFiles.add(INDEX_PAGE);

  updateAboutPage();
  if (fs.existsSync(ABOUT_HTML)) {
    generatedFiles.add(ABOUT_HTML);
    generatedDirs.add(ABOUT_DIR);
  }

  // Ensure dist/style.css and dist/assets are marked as generated/protected files so they're not deleted by cleanup
  const distStyleCss = path.join(DIST_DIR, 'style.css');
  if (fs.existsSync(distStyleCss)) {
    generatedFiles.add(distStyleCss);
  }
  const distAssetsDir = path.join(DIST_DIR, 'assets');
  if (fs.existsSync(distAssetsDir)) {
    generatedDirs.add(distAssetsDir);
    // Recursively add all files in dist/assets to generatedFiles to protect them
    const addFilesRecursively = (dir) => {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        if (fs.statSync(fullPath).isDirectory()) {
          generatedDirs.add(fullPath);
          addFilesRecursively(fullPath);
        } else {
          generatedFiles.add(fullPath);
        }
      });
    };
    addFilesRecursively(distAssetsDir);
  }

  // Cleanup unmatched files and dirs in dist
  function cleanup(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        // Only cleanup blog/ and about/ directories
        const relativePath = path.relative(DIST_DIR, fullPath);
        if (relativePath.startsWith('blog') || relativePath.startsWith('about')) {
          cleanup(fullPath);
          // After cleaning up children, if this directory itself is not in generatedDirs, delete it if empty
          if (!generatedDirs.has(fullPath)) {
            const remaining = fs.readdirSync(fullPath);
            if (remaining.length === 0) {
              fs.rmdirSync(fullPath);
              console.log('Deleted unmatched directory: ' + path.relative(DIST_DIR, fullPath));
            }
          }
        }
      } else {
        // Only cleanup files that should be synced with MD
        const relativePath = path.relative(DIST_DIR, fullPath);
        const isBlogFile = relativePath.startsWith('blog');
        const isAboutFile = relativePath.startsWith('about');
        const isIndexFile = relativePath === 'index.html';

        if ((isBlogFile || isAboutFile || isIndexFile) && !generatedFiles.has(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log('Deleted unmatched file: ' + path.relative(DIST_DIR, fullPath));
        }
      }
    });
  }

  cleanup(DIST_DIR);

  console.log('Build completed.');
}

main();
