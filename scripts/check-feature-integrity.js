/**
 * Feature Integrity Check Script
 * ================================
 * Scans the codebase to detect:
 * 1. Frontend API calls that have no matching backend route
 * 2. Backend routes that have no frontend consumer
 * 3. Feature board status mismatches
 *
 * Usage: node scripts/check-feature-integrity.js
 *
 * This is a static analysis tool — it reads source files as text,
 * it does NOT execute any backend or frontend code.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// ─── Colors for terminal output ──────────────────────────────────────────────
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

// ─── Step 1: Extract backend route mounts from index.js ──────────────────────

function getRouteMounts() {
  const indexPath = path.join(ROOT, 'backend', 'index.js');
  const content = fs.readFileSync(indexPath, 'utf-8');

  const mounts = [];
  // Match: app.use("/api/v1/something", variableName);
  const mountRegex = /app\.use\(\s*["'](\/api\/v1\/[^"']+)["']\s*,\s*(\w+)\s*\)/g;
  let match;
  while ((match = mountRegex.exec(content)) !== null) {
    mounts.push({ basePath: match[1], routeVar: match[2] });
  }
  return mounts;
}

// ─── Step 2: Extract routes from each route file ─────────────────────────────

function getRoutesFromFile(filePath) {
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, 'utf-8');
  const routes = [];

  // Pattern 1: router.get("/path", ...) or router.post("/path", ...) etc.
  const directRegex = /router\.(get|post|put|delete|patch)\(\s*["'](\/[^"']*)["']/g;
  let match;
  while ((match = directRegex.exec(content)) !== null) {
    routes.push({ method: match[1].toUpperCase(), path: match[2] });
  }

  // Pattern 2: router.route("/path").get(...).post(...)
  // Split content into lines and process each router.route() line
  const lines = content.split('\n');
  for (const line of lines) {
    const routeMatch = line.match(/router\.route\(\s*["'](\/[^"']*)["']\s*\)/);
    if (routeMatch) {
      const routePath = routeMatch[1];
      // Find all chained HTTP methods on the same line (and possibly next lines)
      const methodRegex = /\.(get|post|put|delete|patch)\s*\(/g;
      let methodMatch;
      // Start searching AFTER the router.route() part
      const afterRoute = line.slice(line.indexOf(routeMatch[0]) + routeMatch[0].length);
      while ((methodMatch = methodRegex.exec(afterRoute)) !== null) {
        routes.push({ method: methodMatch[1].toUpperCase(), path: routePath });
      }
    }
  }

  // Deduplicate (same method + path)
  const seen = new Set();
  return routes.filter(r => {
    const key = `${r.method}:${r.path}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function getAllBackendRoutes() {
  const mounts = getRouteMounts();
  const allRoutes = [];

  const routeDir = path.join(ROOT, 'backend', 'routes');
  const routeFiles = fs.readdirSync(routeDir).filter(f => f.endsWith('.js'));

  for (const mount of mounts) {
    // Try to find the matching route file
    // Convention: routeVar is like "postRoute", file is "postRoute.js"
    const matchingFile = routeFiles.find(f => {
      const baseName = f.replace('.js', '');
      return baseName === mount.routeVar ||
             baseName.toLowerCase() === mount.routeVar.toLowerCase();
    });

    if (matchingFile) {
      const filePath = path.join(routeDir, matchingFile);
      const routes = getRoutesFromFile(filePath);
      for (const route of routes) {
        const fullPath = mount.basePath + (route.path === '/' ? '' : route.path);
        allRoutes.push({
          method: route.method,
          path: fullPath,
          file: matchingFile,
          basePath: mount.basePath,
        });
      }
    }
  }

  return allRoutes;
}

// ─── Step 3: Extract frontend API calls ──────────────────────────────────────

function getFrontendApiCalls() {
  const srcDir = path.join(ROOT, 'frontend', 'src');
  const apiCalls = [];

  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip _legacy, node_modules, prototypes
      if (entry.name === '_legacy' || entry.name === 'node_modules' || entry.name === 'prototypes') {
        continue;
      }

      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        const content = fs.readFileSync(fullPath, 'utf-8');

        // Match: api.get('/path'), api.post('/path'), api.put('/path'), etc.
        // Also match: api.get(`/path/${var}`)
        const apiRegex = /api\.(get|post|put|delete|patch)\(\s*[`'"](\/[^`'"]*)[`'"]/g;
        let match;
        while ((match = apiRegex.exec(content)) !== null) {
          let apiPath = match[2];
          // Normalize template literals: /posts/${id} → /posts/:param
          apiPath = apiPath.replace(/\$\{[^}]+\}/g, ':param');

          apiCalls.push({
            method: match[1].toUpperCase(),
            path: `/api/v1${apiPath}`,
            file: path.relative(ROOT, fullPath),
          });
        }
      }
    }
  }

  walkDir(srcDir);
  return apiCalls;
}

// ─── Step 4: Normalize paths for comparison ──────────────────────────────────

function normalizePath(p) {
  // Remove trailing slashes, normalize param segments
  return p.replace(/\/+$/, '')
          .replace(/\/:[^/]+/g, '/:param')  // :id, :username → :param
          .toLowerCase();
}

function pathsMatch(backendPath, frontendPath) {
  const normBackend = normalizePath(backendPath);
  const normFrontend = normalizePath(frontendPath);
  return normBackend === normFrontend;
}

// ─── Step 5: Cross-reference and report ──────────────────────────────────────

function checkIntegrity() {
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  DeenVerse Feature Integrity Check${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);

  const backendRoutes = getAllBackendRoutes();
  const frontendCalls = getFrontendApiCalls();

  console.log(`${CYAN}Found ${backendRoutes.length} backend routes${RESET}`);
  console.log(`${CYAN}Found ${frontendCalls.length} frontend API calls${RESET}\n`);

  // --- Check 1: Frontend calls without backend routes ---
  console.log(`${BOLD}── 1. Frontend API calls without matching backend routes ──${RESET}\n`);

  const orphanFrontend = [];
  for (const call of frontendCalls) {
    const hasMatch = backendRoutes.some(route =>
      route.method === call.method && pathsMatch(route.path, call.path)
    );
    if (!hasMatch) {
      orphanFrontend.push(call);
    }
  }

  if (orphanFrontend.length === 0) {
    console.log(`  ${GREEN}✅ All frontend API calls have matching backend routes${RESET}\n`);
  } else {
    console.log(`  ${RED}🔴 Found ${orphanFrontend.length} orphan frontend call(s):${RESET}\n`);
    for (const call of orphanFrontend) {
      console.log(`  ${RED}  ${call.method} ${call.path}${RESET}`);
      console.log(`  ${YELLOW}    ↳ Called from: ${call.file}${RESET}`);
    }
    console.log('');
  }

  // --- Check 2: Backend routes without frontend consumers ---
  console.log(`${BOLD}── 2. Backend routes without frontend consumers ──${RESET}\n`);

  const orphanBackend = [];
  for (const route of backendRoutes) {
    const hasConsumer = frontendCalls.some(call =>
      call.method === route.method && pathsMatch(route.path, call.path)
    );
    if (!hasConsumer) {
      orphanBackend.push(route);
    }
  }

  if (orphanBackend.length === 0) {
    console.log(`  ${GREEN}✅ All backend routes are consumed by the frontend${RESET}\n`);
  } else {
    console.log(`  ${YELLOW}⚠️  Found ${orphanBackend.length} backend route(s) without frontend consumers:${RESET}\n`);
    for (const route of orphanBackend) {
      console.log(`  ${YELLOW}  ${route.method} ${route.path}${RESET}`);
      console.log(`       ↳ Defined in: backend/routes/${route.file}`);
    }
    console.log(`\n  ${YELLOW}  Note: Some of these may be consumed by mobile, external services, or Socket.IO.${RESET}`);
    console.log(`  ${YELLOW}  Review manually to determine if they're intentionally backend-only.${RESET}\n`);
  }

  // --- Check 3: Feature board gaps ---
  console.log(`${BOLD}── 3. Feature Board Status ──${RESET}\n`);

  const boardPath = path.join(ROOT, '.agents', 'feature-board.md');
  if (fs.existsSync(boardPath)) {
    const boardContent = fs.readFileSync(boardPath, 'utf-8');
    const warningCount = (boardContent.match(/⚠️/g) || []).length;
    const blockedCount = (boardContent.match(/🔴/g) || []).length;
    const inProgressCount = (boardContent.match(/🔵/g) || []).length;
    const notStartedMatches = (boardContent.match(/⬜/g) || []).length;

    console.log(`  📊 Board summary:`);
    console.log(`     ${GREEN}In Progress: ${inProgressCount}${RESET}`);
    console.log(`     ${YELLOW}Needs Attention: ${warningCount}${RESET}`);
    console.log(`     ${RED}Blocked: ${blockedCount}${RESET}`);
    console.log(`     Not Started layers: ${notStartedMatches}`);

    if (warningCount > 0 || blockedCount > 0) {
      console.log(`\n  ${YELLOW}⚠️  There are features that need attention! Check .agents/feature-board.md${RESET}`);
    }
  } else {
    console.log(`  ${RED}🔴 Feature board not found at .agents/feature-board.md${RESET}`);
    console.log(`  ${YELLOW}   Create it to track multi-agent feature progress.${RESET}`);
  }

  // --- Check 4: Contracts check ---
  console.log(`\n${BOLD}── 4. Feature Contracts ──${RESET}\n`);

  const contractsDir = path.join(ROOT, '.agents', 'contracts');
  if (fs.existsSync(contractsDir)) {
    const contracts = fs.readdirSync(contractsDir).filter(f => f.endsWith('.md') && f !== '_template.md');
    if (contracts.length === 0) {
      console.log(`  ${YELLOW}⚠️  No feature contracts found (only template exists)${RESET}`);
      console.log(`  ${YELLOW}   Create contracts for active features using the template.${RESET}`);
    } else {
      console.log(`  📋 Found ${contracts.length} feature contract(s):`);
      for (const c of contracts) {
        const content = fs.readFileSync(path.join(contractsDir, c), 'utf-8');
        const isComplete = content.includes('✅ Complete');
        const isInProgress = content.includes('🔵 In Progress');
        const status = isComplete ? `${GREEN}✅ Complete${RESET}` :
                       isInProgress ? `${CYAN}🔵 In Progress${RESET}` :
                       `${YELLOW}📋 Planning${RESET}`;
        console.log(`     ${status} — ${c}`);
      }
    }
  } else {
    console.log(`  ${YELLOW}⚠️  Contracts directory not found. Creating would improve coordination.${RESET}`);
  }

  // --- Summary ---
  console.log(`\n${BOLD}${CYAN}═══════════════════════════════════════════════════════${RESET}`);
  console.log(`${BOLD}${CYAN}  Summary${RESET}`);
  console.log(`${BOLD}${CYAN}═══════════════════════════════════════════════════════${RESET}\n`);

  const issues = orphanFrontend.length + (orphanBackend.length > 0 ? 1 : 0);
  if (issues === 0) {
    console.log(`  ${GREEN}${BOLD}✅ All checks passed! Frontend and backend are in sync.${RESET}\n`);
  } else {
    console.log(`  ${RED}${BOLD}Found issues requiring attention:${RESET}`);
    if (orphanFrontend.length > 0) {
      console.log(`  ${RED}  • ${orphanFrontend.length} frontend call(s) without backend routes${RESET}`);
    }
    if (orphanBackend.length > 0) {
      console.log(`  ${YELLOW}  • ${orphanBackend.length} backend route(s) without frontend consumers (review needed)${RESET}`);
    }
    console.log('');
  }
}

checkIntegrity();
