// admin.js
const ADMIN_PASSWORD = 'irsyad2024';
const STORAGE_KEY = 'admin-projects';

function checkLogin() { return sessionStorage.getItem('admin-auth') === 'true'; }
function showPanel() { document.getElementById('login-page').style.display = 'none'; document.getElementById('admin-panel').style.display = 'block'; loadProjectList(); }
function showLogin() { document.getElementById('login-page').style.display = 'flex'; document.getElementById('admin-panel').style.display = 'none'; }

document.getElementById('login-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const pw = document.getElementById('password').value;
  const err = document.getElementById('login-error');
  if (pw === ADMIN_PASSWORD) { sessionStorage.setItem('admin-auth', 'true'); err.style.display = 'none'; showPanel(); }
  else { err.textContent = '✗ Incorrect password.'; err.style.display = 'block'; document.getElementById('password').value = ''; }
});
document.getElementById('logout-btn')?.addEventListener('click', () => { sessionStorage.removeItem('admin-auth'); showLogin(); });

function getProjects() {
  try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : getDefaultProjects(); } catch { return getDefaultProjects(); }
}
function saveProjects(projects) { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)); }
function getDefaultProjects() {
  return [
    { id: 1, title: "Sales Performance Dashboard", description: "Interactive Power BI dashboard tracking real-time sales KPIs.", tools: ["Power BI", "SQL", "Excel"], image: "", github: "https://github.com/irsyadfadillah", featured: true, category: "Data Analytics" },
    { id: 2, title: "HR Process Automation", description: "End-to-end automation of employee onboarding workflow.", tools: ["Power Automate", "SharePoint", "Excel"], image: "", github: "https://github.com/irsyadfadillah", featured: true, category: "Automation" }
  ];
}

document.getElementById('add-project-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target;
  const title = form.querySelector('#proj-title').value.trim();
  const description = form.querySelector('#proj-desc').value.trim();
  if (!title || !description) { showAlert('alert-error', '✗ Title and description are required.'); return; }
  const tools = form.querySelector('#proj-tools').value.split(',').map(t => t.trim()).filter(Boolean);
  const projects = getProjects();
  projects.push({ id: Date.now(), title, description, tools, image: form.querySelector('#proj-image').value.trim(), github: form.querySelector('#proj-github').value.trim(), featured: form.querySelector('#proj-featured').checked, category: form.querySelector('#proj-category').value });
  saveProjects(projects);
  showAlert('alert-success', `✓ Project "${title}" added!`);
  form.reset(); loadProjectList(); renderJsonOutput(projects);
});

function loadProjectList() {
  const projects = getProjects();
  const container = document.getElementById('projects-list');
  if (!container) return;
  if (!projects.length) { container.innerHTML = '<p style="color:var(--text3);font-family:DM Mono,monospace;font-size:.78rem;text-align:center;padding:24px">No projects yet.</p>'; return; }
  container.innerHTML = projects.map(p => `
    <div class="project-item" data-id="${p.id}">
      <div><div class="project-item-title">${p.title}</div><div class="project-item-meta">${p.category} · ${(p.tools||[]).join(', ')}</div></div>
      <div style="display:flex;align-items:center;gap:10px">${p.featured ? '<span class="badge">Featured</span>' : ''}<button class="delete-btn" onclick="deleteProject(${p.id})">Delete</button></div>
    </div>`).join('');
}

function deleteProject(id) {
  if (!confirm('Delete this project?')) return;
  const projects = getProjects().filter(p => p.id !== id);
  saveProjects(projects); loadProjectList(); renderJsonOutput(projects);
  showAlert('alert-success', '✓ Project deleted.');
}

function renderJsonOutput(projects) {
  const output = document.getElementById('json-output');
  if (output) output.textContent = JSON.stringify(projects, null, 2);
}
document.getElementById('generate-json')?.addEventListener('click', () => { renderJsonOutput(getProjects()); document.getElementById('json-section').scrollIntoView({ behavior: 'smooth' }); });
document.getElementById('copy-json')?.addEventListener('click', () => {
  navigator.clipboard.writeText(document.getElementById('json-output').textContent).then(() => {
    const btn = document.getElementById('copy-json'); btn.textContent = '✓ Copied!'; setTimeout(() => btn.textContent = 'Copy JSON', 2000);
  });
});

function showAlert(type, message) {
  const el = document.getElementById(type);
  if (!el) return; el.textContent = message; el.style.display = 'block';
  setTimeout(() => el.style.display = 'none', 4000);
}

document.addEventListener('DOMContentLoaded', () => { if (checkLogin()) showPanel(); else showLogin(); });
