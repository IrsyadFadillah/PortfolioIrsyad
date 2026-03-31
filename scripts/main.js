// main.js — portfolio interactivity, project & journey loading, animations

const categoryIcons = {
  'Data Analytics': '📊', 'Automation': '⚙️',
  'Process Improvement': '📈', 'default': '💡'
};

// ===== LOAD JSON =====
async function fetchJSON(path) {
  try {
    const r = await fetch(path);
    if (!r.ok) throw new Error('fetch failed');
    return await r.json();
  } catch (e) {
    console.warn(`Could not load ${path}`, e);
    return null;
  }
}

// ===== JOURNEY / TIMELINE =====
function createTimelineItem(item) {
  return `
    <div class="timeline-item">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-duration">${item.duration}</div>
        <div class="timeline-title">${item.title}</div>
        <div class="timeline-org">${item.organization}</div>
        <div class="timeline-desc">${item.description}</div>
      </div>
    </div>
  `;
}

async function renderJourney() {
  const data = await fetchJSON('data/journey.json');
  if (!data) return;

  const eduContainer = document.getElementById('educationTimeline');
  const expContainer = document.getElementById('experienceTimeline');

  if (eduContainer && data.education) {
    eduContainer.innerHTML = data.education.slice(0, 2).map(createTimelineItem).join('');
  }
  if (expContainer && data.experience) {
    expContainer.innerHTML = data.experience.slice(0, 2).map(createTimelineItem).join('');
  }

  initTimelineReveal();
}

function initTimelineReveal() {
  const items = document.querySelectorAll('.timeline-item');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => observer.observe(el));
}

// ===== PROJECTS =====
async function loadProjects() {
  const data = await fetchJSON('data/projects.json');
  return data || [];
}

function createProjectCard(project) {
  const icon = categoryIcons[project.category] || categoryIcons['default'];
  const tools = (project.tools || []).map(t => `<span class="tool-tag">${t}</span>`).join('');
  const imageContent = project.image
    ? `<img src="${project.image}" alt="${project.title}" loading="lazy">`
    : `<div class="project-image-placeholder">${icon}</div>`;
  return `
    <article class="project-card reveal" data-category="${project.category || 'All'}">
      <div class="project-image">
        ${imageContent}
        <span class="project-category-badge">${project.category || 'Project'}</span>
      </div>
      <div class="project-body">
        <h3 class="project-title">${project.title}</h3>
        <p class="project-desc">${project.description}</p>
        <div class="project-tools">${tools}</div>
        <div class="project-links">
          ${project.github ? `<a href="${project.github}" target="_blank" rel="noopener" class="project-link">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            GitHub
          </a>` : ''}
        </div>
      </div>
    </article>
  `;
}

async function renderFeaturedProjects() {
  const projects = await loadProjects();
  const featured = projects.filter(p => p.featured);
  const container = document.getElementById('featuredGrid');
  if (!container) return;
  container.innerHTML = featured.length
    ? featured.map(createProjectCard).join('')
    : '<p style="color:var(--text-muted);font-family:\'DM Mono\',monospace;font-size:.8rem">No featured projects yet.</p>';
  initReveal();
}

let allProjects = [];
async function renderAllProjects() {
  allProjects = await loadProjects();
  const categories = ['All', ...new Set(allProjects.map(p => p.category).filter(Boolean))];
  const filterBar = document.getElementById('filterBar');
  if (filterBar) {
    filterBar.innerHTML = categories.map((cat, i) =>
      `<button class="filter-btn${i === 0 ? ' active' : ''}" data-filter="${cat}">${cat}</button>`
    ).join('');
    filterBar.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filtered = btn.dataset.filter === 'All' ? allProjects : allProjects.filter(p => p.category === btn.dataset.filter);
        const container = document.getElementById('allProjectsGrid');
        container.innerHTML = filtered.map(createProjectCard).join('');
        initReveal();
      });
    });
  }
  const container = document.getElementById('allProjectsGrid');
  if (container) { container.innerHTML = allProjects.map(createProjectCard).join(''); }
  initReveal();
}

// ===== SCROLL REVEAL =====
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

// ===== NAV HIGHLIGHT =====
function initNavHighlight() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a, .mobile-menu a');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) link.style.color = 'var(--accent)';
        });
      }
    });
  }, { threshold: 0.4 });
  sections.forEach(s => observer.observe(s));
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  hamburger?.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
    const isOpen = mobileMenu.classList.contains('open');
    hamburger.querySelectorAll('span')[0].style.transform = isOpen ? 'rotate(45deg) translateY(7px)' : '';
    hamburger.querySelectorAll('span')[1].style.opacity = isOpen ? '0' : '1';
    hamburger.querySelectorAll('span')[2].style.transform = isOpen ? 'rotate(-45deg) translateY(-7px)' : '';
  });
  mobileMenu?.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = '1'; });
    });
  });
}

// ===== TYPED EFFECT =====
function initTyped() {
  const el = document.getElementById('typedText');
  if (!el) return;
  const phrases = ['Data & Process Improvement Enthusiast', 'Power BI Developer', 'Automation Architect', 'Analytics Problem Solver'];
  let phraseIndex = 0, charIndex = 0, deleting = false;
  function type() {
    const current = phrases[phraseIndex];
    if (!deleting) {
      el.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) { deleting = true; setTimeout(type, 2200); return; }
    } else {
      el.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) { deleting = false; phraseIndex = (phraseIndex + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? 40 : 65);
  }
  type();
}

// ===== NAV SCROLL =====
function initNavScroll() {
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    nav.style.borderBottomColor = window.scrollY > 20 ? 'var(--border)' : 'transparent';
  }, { passive: true });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('themeToggle')?.addEventListener('click', window.themeManager.toggleTheme);
  window.themeManager.updateToggleIcon(window.themeManager.getTheme());
  initMobileMenu();
  initNavScroll();
  initNavHighlight();
  initTyped();
  initReveal();
  renderJourney();
  renderFeaturedProjects();
  renderAllProjects();
});
