import { Controller, Get, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';

@ApiExcludeController()
@Controller()
export class ApiExplorerController {
  @Get('explorer')
  serveExplorer(@Res() res: Response) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>API Explorer - Healthcare Concepts</title>
<style>
  :root {
    --sidebar-bg: #1e293b;
    --sidebar-text: #94a3b8;
    --sidebar-active: #3b82f6;
    --sidebar-hover: #334155;
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-2: #334155;
    --text: #e2e8f0;
    --text-muted: #94a3b8;
    --accent: #3b82f6;
    --accent-hover: #2563eb;
    --green: #22c55e;
    --red: #ef4444;
    --orange: #f59e0b;
    --border: #334155;
    --radius: 8px;
    --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; font-family: var(--font); background: var(--bg); color: var(--text); font-size: 14px; line-height: 1.6; }
  .layout { display: flex; height: 100vh; }
  .sidebar { width: 300px; min-width: 300px; background: var(--sidebar-bg); border-right: 1px solid var(--border); display: flex; flex-direction: column; overflow: hidden; }
  .sidebar-header { padding: 20px; border-bottom: 1px solid var(--border); }
  .sidebar-header h1 { font-size: 16px; font-weight: 700; color: #fff; letter-spacing: -0.02em; }
  .sidebar-header p { font-size: 12px; color: var(--sidebar-text); margin-top: 4px; }
  .sidebar-search { padding: 12px 16px; border-bottom: 1px solid var(--border); }
  .sidebar-search input { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 13px; outline: none; }
  .sidebar-search input:focus { border-color: var(--accent); }
  .sidebar-tags { padding: 8px 0; overflow-y: auto; flex: 1; }
  .tag-group { margin-bottom: 4px; }
  .tag-header { display: flex; align-items: center; padding: 8px 16px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--sidebar-text); transition: color 0.15s; user-select: none; }
  .tag-header:hover { color: #fff; }
  .tag-header .chevron { margin-right: 8px; font-size: 10px; transition: transform 0.15s; }
  .tag-header .chevron.open { transform: rotate(90deg); }
  .endpoint-list { overflow: hidden; max-height: 0; transition: max-height 0.2s ease; }
  .endpoint-list.open { max-height: 2000px; }
  .endpoint-item { display: flex; align-items: center; padding: 6px 16px 6px 36px; cursor: pointer; font-size: 13px; color: var(--sidebar-text); transition: all 0.1s; border-left: 3px solid transparent; }
  .endpoint-item:hover { background: var(--sidebar-hover); color: #fff; }
  .endpoint-item.active { background: rgba(59,130,246,0.1); color: #fff; border-left-color: var(--accent); }
  .method-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; margin-right: 8px; min-width: 40px; text-align: center; text-transform: uppercase; letter-spacing: 0.05em; }
  .method-GET { background: rgba(34,197,94,0.15); color: var(--green); }
  .method-POST { background: rgba(59,130,246,0.15); color: var(--accent); }
  .method-PUT { background: rgba(245,158,11,0.15); color: var(--orange); }
  .method-DELETE { background: rgba(239,68,68,0.15); color: var(--red); }
  .method-PATCH { background: rgba(245,158,11,0.15); color: var(--orange); }
  .endpoint-path { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .main { flex: 1; overflow-y: auto; padding: 40px; }
  .main-placeholder { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-muted); }
  .main-placeholder h2 { font-size: 24px; margin-bottom: 8px; color: var(--text); }
  .main-placeholder p { font-size: 15px; }
  .endpoint-detail { max-width: 900px; margin: 0 auto; }
  .endpoint-detail .path-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .endpoint-detail .path-row .method-badge { font-size: 14px; padding: 4px 10px; }
  .endpoint-detail .path-row .path-text { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 16px; color: #fff; }
  .endpoint-detail .endpoint-title { font-size: 24px; font-weight: 700; margin-bottom: 16px; color: #fff; }
  .endpoint-detail .endpoint-desc { color: var(--text-muted); margin-bottom: 24px; font-size: 14px; line-height: 1.7; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin-bottom: 12px; }
  .param-table { width: 100%; border-collapse: collapse; }
  .param-table th { text-align: left; padding: 8px 12px; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); }
  .param-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 13px; vertical-align: top; }
  .param-table .param-name { font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; color: #e2e8f0; }
  .param-table .param-type { color: var(--accent); font-size: 12px; }
  .param-table .param-required { color: var(--red); font-size: 11px; font-weight: 600; }
  .param-table .param-desc { color: var(--text-muted); font-size: 12px; }
  .param-table .param-default { color: var(--text-muted); font-size: 11px; }
  .schema-box { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; color: #e2e8f0; line-height: 1.7; }
  .try-section { margin-top: 32px; }
  .try-inputs { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 12px; }
  .try-input-group { margin-bottom: 12px; }
  .try-input-group:last-child { margin-bottom: 0; }
  .try-input-group label { display: block; font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 4px; }
  .try-input-group input, .try-input-group textarea { width: 100%; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface-2); color: var(--text); font-family: var(--font); font-size: 13px; outline: none; }
  .try-input-group input:focus, .try-input-group textarea:focus { border-color: var(--accent); }
  .try-input-group textarea { min-height: 80px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; }
  .try-btn { padding: 10px 24px; border-radius: 6px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; background: var(--accent); color: #fff; transition: background 0.15s; }
  .try-btn:hover { background: var(--accent-hover); }
  .try-result { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-top: 12px; display: none; }
  .try-result-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: var(--surface-2); border-bottom: 1px solid var(--border); }
  .try-result-header .status { font-weight: 600; font-size: 13px; }
  .try-result-header .status.success { color: var(--green); }
  .try-result-header .status.error { color: var(--red); }
  .try-result-body { padding: 16px; font-family: 'JetBrains Mono', 'Fira Code', monospace; font-size: 12px; overflow-x: auto; white-space: pre-wrap; line-height: 1.7; max-height: 400px; overflow-y: auto; }
  .loading { text-align: center; padding: 40px; color: var(--text-muted); }
  .loading .spinner { display: inline-block; width: 24px; height: 24px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface-2); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }
  @media (max-width: 768px) { .sidebar { display: none; } .main { padding: 20px; } }
</style>
</head>
<body>
<div class="layout">
  <nav class="sidebar">
    <div class="sidebar-header">
      <h1>Healthcare Concepts API</h1>
      <p>Facility Registry &amp; Terminology Service</p>
    </div>
    <div class="sidebar-search">
      <input type="text" id="search" placeholder="Search endpoints..." oninput="filterEndpoints(this.value)">
    </div>
    <div class="sidebar-tags" id="sidebar"></div>
  </nav>
  <main class="main">
    <div class="main-placeholder" id="placeholder">
      <h2>API Explorer</h2>
      <p>Select an endpoint from the sidebar to explore</p>
    </div>
    <div class="endpoint-detail" id="detail" style="display:none"></div>
  </main>
</div>

<script>
let spec = null;
let allEndpoints = [];

async function loadSpec() {
  try {
    const res = await fetch('/docs-json');
    spec = await res.json();
    renderSidebar();
  } catch (e) {
    document.getElementById('sidebar').innerHTML = '<div style="padding:20px;color:var(--red)">Failed to load API spec. Make sure Swagger is configured.</div>';
  }
}

function renderSidebar() {
  const sidebar = document.getElementById('sidebar');
  const tags = {};
  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, detail] of Object.entries(methods)) {
      const tag = (detail.tags && detail.tags[0]) || 'Other';
      if (!tags[tag]) tags[tag] = [];
      tags[tag].push({ path, method: method.toUpperCase(), ...detail });
      allEndpoints.push({ path, method: method.toUpperCase(), tag, ...detail });
    }
  }
  let html = '';
  let first = true;
  for (const [tag, endpoints] of Object.entries(tags)) {
    const open = first ? 'open' : '';
    html += '<div class="tag-group">';
    html += '<div class="tag-header" onclick="toggleTag(this)"><span class="chevron ' + open + '">&#9654;</span>' + tag + '</div>';
    html += '<div class="endpoint-list ' + open + '">';
    for (const ep of endpoints) {
      html += '<div class="endpoint-item" data-path="' + ep.path + '" data-method="' + ep.method + '" onclick="showEndpoint(this)">';
      html += '<span class="method-badge method-' + ep.method + '">' + ep.method + '</span>';
      html += '<span class="endpoint-path">' + ep.path + '</span>';
      html += '</div>';
    }
    html += '</div></div>';
    first = false;
  }
  sidebar.innerHTML = html;
}

function toggleTag(el) {
  const list = el.nextElementSibling;
  const chevron = el.querySelector('.chevron');
  list.classList.toggle('open');
  chevron.classList.toggle('open');
}

function filterEndpoints(query) {
  const items = document.querySelectorAll('.endpoint-item');
  const groups = document.querySelectorAll('.tag-group');
  q = query.toLowerCase();
  items.forEach(item => {
    const path = item.dataset.path.toLowerCase();
    const method = item.dataset.method.toLowerCase();
    const match = !q || path.includes(q) || method.includes(q);
    item.style.display = match ? '' : 'none';
  });
  groups.forEach(g => {
    const visible = Array.from(g.querySelectorAll('.endpoint-item')).some(i => i.style.display !== 'none');
    g.style.display = visible ? '' : 'none';
    if (visible && q) {
      g.querySelector('.endpoint-list').classList.add('open');
    }
  });
}

function showEndpoint(el) {
  document.querySelectorAll('.endpoint-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('placeholder').style.display = 'none';
  const detail = document.getElementById('detail');
  detail.style.display = 'block';

  const path = el.dataset.path;
  const method = el.dataset.method;
  const endpoints = spec.paths[path];
  const ep = endpoints[method.toLowerCase()];
  if (!ep) return;

  // Build server base URL
  const server = (spec.servers && spec.servers[0] && spec.servers[0].url) || '';

  // Build parameter sections
  const queryParams = [];
  const pathParams = [];
  const headerParams = [];
  if (ep.parameters) {
    for (const p of ep.parameters) {
      if (p.in === 'query') queryParams.push(p);
      else if (p.in === 'path') pathParams.push(p);
      else if (p.in === 'header') headerParams.push(p);
    }
  }

  // Request body
  const requestBody = ep.requestBody;

  // Responses
  const responses = ep.responses || {};

  let html = '';
  html += '<div class="path-row"><span class="method-badge method-' + method + '">' + method + '</span><span class="path-text">' + path + '</span></div>';
  html += '<h1 class="endpoint-title">' + (ep.summary || ep.operationId || '') + '</h1>';
  if (ep.description) html += '<p class="endpoint-desc">' + escapeHtml(ep.description) + '</p>';

  // Path Parameters
  if (pathParams.length) {
    html += '<div class="section"><div class="section-title">Path Parameters</div>';
    html += '<table class="param-table"><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>';
    for (const p of pathParams) {
      html += '<tr>';
      html += '<td><span class="param-name">' + p.name + '</span></td>';
      html += '<td><span class="param-type">' + (p.schema && p.schema.type || 'string') + '</span></td>';
      html += '<td>' + (p.required ? '<span class="param-required">Yes</span>' : '<span>No</span>') + '</td>';
      html += '<td><span class="param-desc">' + (p.description || '') + '</span></td>';
      html += '</tr>';
    }
    html += '</tbody></table></div>';
  }

  // Query Parameters
  if (queryParams.length) {
    html += '<div class="section"><div class="section-title">Query Parameters</div>';
    html += '<table class="param-table"><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th><th>Default</th></tr></thead><tbody>';
    for (const p of queryParams) {
      html += '<tr>';
      html += '<td><span class="param-name">' + p.name + '</span></td>';
      html += '<td><span class="param-type">' + (p.schema && p.schema.type || 'string') + '</span></td>';
      html += '<td>' + (p.required ? '<span class="param-required">Yes</span>' : '<span>No</span>') + '</td>';
      html += '<td><span class="param-desc">' + (p.description || '') + '</span></td>';
      html += '<td><span class="param-default">' + (p.schema && p.schema.default !== undefined ? p.schema.default : '-') + '</span></td>';
      html += '</tr>';
    }
    html += '</tbody></table></div>';
  }

  // Header Parameters
  if (headerParams.length) {
    html += '<div class="section"><div class="section-title">Header Parameters</div>';
    html += '<table class="param-table"><thead><tr><th>Name</th><th>Type</th><th>Required</th><th>Description</th></tr></thead><tbody>';
    for (const p of headerParams) {
      html += '<tr><td><span class="param-name">' + p.name + '</span></td><td><span class="param-type">' + (p.schema && p.schema.type || 'string') + '</span></td><td>' + (p.required ? '<span class="param-required">Yes</span>' : '<span>No</span>') + '</td><td><span class="param-desc">' + (p.description || '') + '</span></td></tr>';
    }
    html += '</tbody></table></div>';
  }

  // Request Body
  if (requestBody) {
    html += '<div class="section"><div class="section-title">Request Body</div>';
    html += '<div class="schema-box">' + escapeHtml(formatSchema(requestBody.content)) + '</div></div>';
  }

  // Response Schema
  const firstResponse = Object.values(responses)[0];
  if (firstResponse && firstResponse.content) {
    html += '<div class="section"><div class="section-title">Response Schema</div>';
    html += '<div class="schema-box">' + escapeHtml(formatSchema(firstResponse.content)) + '</div></div>';
  }

  // Try It Out
  html += '<div class="try-section"><div class="section-title">Try It Out</div>';
  html += '<div class="try-inputs" id="try-inputs">';

  for (const p of pathParams) {
    html += '<div class="try-input-group"><label>' + p.name + ' <span style="color:var(--red)">*</span></label>';
    html += '<input type="text" id="try-' + p.name + '" placeholder="' + p.name + '" data-param="true" data-in="path"></div>';
  }
  for (const p of queryParams) {
    const def = p.schema && p.schema.default !== undefined ? p.schema.default : '';
    html += '<div class="try-input-group"><label>' + p.name + '</label>';
    html += '<input type="text" id="try-' + p.name + '" placeholder="' + p.name + '" value="' + def + '" data-param="true" data-in="query"></div>';
  }

  html += '</div>';
html += '<button class="try-btn" onclick="sendRequest(&apos;' + method + '&apos;, &apos;' + path + '&apos;)">Send Request</button>';
  html += '<div class="try-result" id="try-result"><div class="try-result-header" id="try-result-header"><span class="status" id="try-status">Loading...</span><span id="try-time"></span></div><div class="try-result-body" id="try-result-body"></div></div>';
  html += '</div>';

  detail.innerHTML = html;
}

function escapeHtml(text) {
  if (!text) return '';
  const d = document.createElement('div');
  d.textContent = text;
  return d.innerHTML;
}

function formatSchema(content) {
  if (!content) return 'No schema defined';
  const firstType = Object.keys(content)[0];
  const schema = content[firstType] && content[firstType].schema;
  if (!schema) return 'No schema defined';
  return JSON.stringify(schema, null, 2);
}

async function sendRequest(method, path) {
  const result = document.getElementById('try-result');
  const status = document.getElementById('try-status');
  const body = document.getElementById('try-result-body');
  const time = document.getElementById('try-time');

  result.style.display = 'block';
  status.textContent = 'Sending...';
  status.className = 'status';
  body.textContent = '';
  time.textContent = '';

  // Build URL
  let url = '';
  const server = (spec.servers && spec.servers[0] && spec.servers[0].url) || '';
  url = path;

  // Replace path params
  const inputs = document.querySelectorAll('#try-inputs input');
  const queryParts = [];
  for (const input of inputs) {
    if (input.dataset.in === 'path') {
      url = url.replace('{' + input.id.replace('try-', '') + '}', input.value || '');
    } else if (input.dataset.in === 'query' && input.value) {
      queryParts.push(encodeURIComponent(input.id.replace('try-', '')) + '=' + encodeURIComponent(input.value));
    }
  }
  if (queryParts.length) url += '?' + queryParts.join('&');

  const start = performance.now();
  try {
    const res = await fetch(url, { method });
    const end = performance.now();
    const data = await res.json();
    status.textContent = res.status + ' ' + res.statusText;
    status.className = 'status ' + (res.ok ? 'success' : 'error');
    body.textContent = JSON.stringify(data, null, 2);
    time.textContent = (end - start).toFixed(1) + 'ms';
  } catch (e) {
    const end = performance.now();
    status.textContent = 'Error';
    status.className = 'status error';
    body.textContent = e.message || 'Request failed';
    time.textContent = (end - start).toFixed(1) + 'ms';
  }
}

loadSpec();
</script>
</body>
</html>`;
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
