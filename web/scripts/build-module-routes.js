const fs = require("fs");
const path = require("path");

// ============================================================================
// RESOURCES CONFIGURATION - Easy to modify paths
// ============================================================================
const BASE_WORKSPACE_PATH = "app/workspace";
const BASE_API_PATH = "app/api/base";
const BASE_API_MODULES_PATH = "app/api/modules";
const RESOURCES = {
  "module-base": {
    alias: "@base",
    client: {
      layouts: "/layouts",
      pages: "/pages",
      target: BASE_WORKSPACE_PATH,
    },
    server: {
      controllers: "/controllers",
      target: BASE_API_PATH,
    },
  },
  modules: {
    alias: "@mdl",
    client: {
      layouts: "/layouts",
      pages: "/pages",
      target: `${BASE_WORKSPACE_PATH}/modules`,
    },
    server: {
      controllers: "/controllers",
      target: BASE_API_MODULES_PATH,
    },
  },
};

const EXTENSIONS = {
  ROUTE: "route.ts",
  PAGE: "page.tsx",
  LAYOUT: "layout.tsx",
};

const AUTO_HEADER = `// Auto-generated file - DO NOT EDIT\n`;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
const getFullPath = (...segments) => path.join(process.cwd(), ...segments);
const fileExists = (filePath) => fs.existsSync(getFullPath(filePath));
const anyFileExists = (filePaths) => filePaths.some((p) => fileExists(p));

const cleanDirectory = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;
  console.log(
    `🗑️  Cleaning existing ${path.relative(process.cwd(), dirPath)} directory...`
  );
  try {
    deleteRecursive(dirPath);
    console.log(
      `✅ Successfully cleaned ${path.relative(process.cwd(), dirPath)} directory`
    );
  } catch (error) {
    console.error(`❌ Error cleaning directory:`, error.message);
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Fallback cleanup successful`);
    } catch (fallbackError) {
      console.error(`❌ Fallback cleanup failed:`, fallbackError.message);
    }
  }
};

const deleteRecursive = (dirPath) => {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const filePath = path.join(dirPath, file);
      fs.statSync(filePath).isDirectory()
        ? deleteRecursive(filePath)
        : fs.unlinkSync(filePath);
    });
    fs.rmdirSync(dirPath);
  }
};

const createFile = (filePath, content, type = "file") => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  // console.log(
  //   `  📄 Created ${type}: ${path.relative(process.cwd(), filePath)}`
  // );
};

// ============================================================================
// PATH HELPERS
// ============================================================================
const getPath = (resourceType, side, moduleName, subPath, file) => {
  const resource = RESOURCES[resourceType];
  const base =
    resourceType === "modules"
      ? `${resourceType}/${moduleName}/${side}${resource[side][subPath]}`
      : `${resourceType}/${side}${resource[side][subPath]}`;
  return file ? `${base}/${file}` : base;
};

const getControllerPath = (resourceType, moduleName, handlerPath) =>
  getPath(
    resourceType,
    "server",
    moduleName,
    "controllers",
    `${handlerPath}.ts`
  );

const getPagePaths = (resourceType, moduleName, pagePath) => {
  const base = getPath(resourceType, "client", moduleName, "pages", pagePath);
  return [`${base}.tsx`, `${base}.ts`, `${base}/index.tsx`, `${base}/index.ts`];
};

const getLayoutPaths = (resourceType, moduleName, layoutPath) => {
  const base = getPath(
    resourceType,
    "client",
    moduleName,
    "layouts",
    layoutPath
  );
  return [`${base}.tsx`, `${base}.ts`];
};

// ============================================================================
// FILE EXISTENCE CHECKERS
// ============================================================================
const handlerExists = (resourceType, moduleName, handlerPath) =>
  fileExists(getControllerPath(resourceType, moduleName, handlerPath));

const pageExists = (resourceType, moduleName, pagePath) =>
  anyFileExists(getPagePaths(resourceType, moduleName, pagePath));

const layoutExists = (resourceType, moduleName, layoutPath) =>
  anyFileExists(getLayoutPaths(resourceType, moduleName, layoutPath));

// ============================================================================
// SCANNERS
// ============================================================================
const scanRouteFile = (routeFilePath) => {
  if (!fileExists(routeFilePath)) return null;
  try {
    const content = fs.readFileSync(getFullPath(routeFilePath), "utf-8");
    const routeGroups = JSON.parse(content);
    return Array.isArray(routeGroups) && routeGroups.length > 0
      ? routeGroups
      : null;
  } catch (error) {
    console.error(`Error processing ${routeFilePath}:`, error.message);
    return null;
  }
};

const scanRoutes = async (resourceType, side) => {
  if (resourceType === "modules") {
    const modules = {};
    const modulesDir = getFullPath("modules");
    if (!fs.existsSync(modulesDir)) return modules;

    const moduleNames = fs
      .readdirSync(modulesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const moduleName of moduleNames) {
      const routeFile = `${resourceType}/${moduleName}/${side}/route.json`;
      const routeGroups = scanRouteFile(routeFile);
      if (routeGroups) {
        modules[moduleName] = routeGroups;
        console.log(
          `Processing ${side} module: ${moduleName} (${routeGroups.length} groups)`
        );
      }
    }
    return modules;
  } else {
    const routeFile = `${resourceType}/${side}/route.json`;
    const routeGroups = scanRouteFile(routeFile);
    if (routeGroups) {
      console.log(
        `Processing ${resourceType} ${side} (${routeGroups.length} groups)`
      );
    }
    return routeGroups;
  }
};

// ============================================================================
// CONTENT GENERATORS
// ============================================================================
const generateRouteContent = (
  resourceType,
  moduleName,
  route,
  type = "route"
) => {
  const resource = RESOURCES[resourceType];
  const comment =
    type.toLowerCase() === "route"
      ? `Generated from ${resourceType}${moduleName ? `/${moduleName}` : ""}/server/route.json`
      : `${type} route: ${route.path}`;
  const alias = moduleName ? `${resource.alias}/${moduleName}` : resource.alias;
  return `${AUTO_HEADER}// ${comment}\n\nexport * from "${alias}/server/controllers${route.handler}";\n`;
};

const generateRouteFile = (resourceType, moduleName, routes) => {
  const validRoutes = routes.filter((route) => {
    const exists = handlerExists(resourceType, moduleName, route.handler);
    if (!exists) {
      console.warn(
        `  ⚠️  Skipping route "${route.path}" - handler not found: ${route.handler}.ts`
      );
    }
    return exists;
  });

  if (validRoutes.length === 0) return null;
  if (validRoutes.length === 1)
    return generateRouteContent(resourceType, moduleName, validRoutes[0]);

  const resource = RESOURCES[resourceType];
  const alias = moduleName ? `${resource.alias}/${moduleName}` : resource.alias;
  const routeHandlers = validRoutes.map(
    (route) => `export * from "${alias}/server/controllers${route.handler}";`
  );
  return `${AUTO_HEADER}// Generated from ${resourceType}${moduleName ? `/${moduleName}` : ""}/server/route.json\n\n${routeHandlers.join("\n")}\n`;
};

const genClientPageContent = (resourceType, moduleName, pagePath) => {
  const resource = RESOURCES[resourceType];
  const alias = moduleName ? `${resource.alias}/${moduleName}` : resource.alias;
  const normalizedPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  return `${AUTO_HEADER}export { default } from "${alias}/client/pages${normalizedPath}";\n`;
};

const genClientLayoutContent = (resourceType, moduleName, layoutPath) => {
  const resource = RESOURCES[resourceType];
  const alias = moduleName ? `${resource.alias}/${moduleName}` : resource.alias;
  const normalizedPath = layoutPath.startsWith("/")
    ? layoutPath
    : `/${layoutPath}`;
  return `${AUTO_HEADER}export { default } from "${alias}/client/layouts${normalizedPath}";\n`;
};

// ============================================================================
// ROUTE PROCESSING HELPERS
// ============================================================================
const normalizeRoutePath = (routePath, isDynamic = false) =>
  isDynamic
    ? routePath.replace(/\[([^\]]+)\]/g, "[$1]")
    : routePath.replace(/^\//, "");

const isDynamicRoute = (routePath) =>
  routePath.includes("[") && routePath.includes("]");

// ============================================================================
// CLEANUP FUNCTION - Clean all target directories once
// ============================================================================
const cleanAllTargetDirectories = () => {
  console.log("🧹 Cleaning all target directories...");
  const pathsToClean = [
    BASE_WORKSPACE_PATH,
    BASE_API_PATH,
    BASE_API_MODULES_PATH,
  ];

  pathsToClean.forEach((targetPath) => {
    const fullPath = getFullPath(targetPath);
    if (fs.existsSync(fullPath)) {
      cleanDirectory(fullPath);
    }
  });

  console.log("✅ All target directories cleaned");
};

// ============================================================================
// SERVER ROUTES BUILDERS
// ============================================================================
const buildServerRoutesForResource = (resourceType, routeData) => {
  const resource = RESOURCES[resourceType];
  const targetDir = getFullPath(resource.server.target);
  // Only create directory if it doesn't exist (already cleaned)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    // console.log(`📁 Created ${resource.server.target} directory`);
  }

  let createdCount = 0;
  let skippedCount = 0;

  const processRoutes = (
    routeGroups,
    moduleName = null,
    baseDir = targetDir
  ) => {
    for (const group of routeGroups) {
      const groupPath = (group.path || group.group || "/").replace(/^\//, "");
      const routes = Array.isArray(group.routes) ? group.routes : [];
      if (routes.length === 0) continue;

      const groupDir = groupPath ? path.join(baseDir, groupPath) : baseDir;
      fs.mkdirSync(groupDir, { recursive: true });

      // Root routes
      const rootRoutes = routes.filter((r) => r.path === "/");
      if (rootRoutes.length > 0) {
        const validRoutes = rootRoutes.filter((r) =>
          handlerExists(resourceType, moduleName, r.handler)
        );
        if (validRoutes.length > 0) {
          const content = generateRouteFile(
            resourceType,
            moduleName,
            validRoutes
          );
          createFile(
            path.join(groupDir, EXTENSIONS.ROUTE),
            content,
            "main route"
          );
          createdCount += validRoutes.length;
        }
        skippedCount += rootRoutes.length - validRoutes.length;
      }

      // Other routes
      routes.forEach((route) => {
        if (route.path === "/") return;
        if (!handlerExists(resourceType, moduleName, route.handler)) {
          console.warn(
            `  ⚠️  Skipping route "${route.path}" - handler not found: ${route.handler}.ts`
          );
          skippedCount++;
          return;
        }

        const isDynamic = isDynamicRoute(route.path);
        const routePath = normalizeRoutePath(route.path, isDynamic);
        const routeFile = path.join(groupDir, routePath, EXTENSIONS.ROUTE);
        const content = generateRouteContent(
          resourceType,
          moduleName,
          route,
          isDynamic ? "Dynamic" : "Static"
        );
        createFile(routeFile, content, isDynamic ? "dynamic" : "static route");
        createdCount++;
      });
    }
  };

  if (resourceType === "modules") {
    for (const [moduleName, routeGroups] of Object.entries(routeData)) {
      console.log(`📝 Generating routes for module: ${moduleName}`);
      const moduleDir = path.join(targetDir, moduleName);
      fs.mkdirSync(moduleDir, { recursive: true });
      processRoutes(routeGroups, moduleName, moduleDir);
      console.log(`✅ Generated routes for ${moduleName}`);
    }
  } else {
    processRoutes(routeData);
  }

  console.log(
    `✅ Generated ${createdCount} routes${skippedCount > 0 ? ` (skipped ${skippedCount})` : ""}`
  );
};

const buildServerRoutes = async () => {
  console.log("🔍 Scanning modules for server routes...");
  for (const [resourceType] of Object.entries(RESOURCES)) {
    const routeData = await scanRoutes(resourceType, "server");
    if (
      routeData &&
      (resourceType === "modules"
        ? Object.keys(routeData).length > 0
        : routeData.length > 0)
    ) {
      console.log(`📝 Building ${resourceType} server routes...`);
      buildServerRoutesForResource(resourceType, routeData);
    }
  }
};

// ============================================================================
// CLIENT PAGES BUILDERS
// ============================================================================
const buildClientPagesForResource = (resourceType, routeData) => {
  const resource = RESOURCES[resourceType];
  const targetDir = getFullPath(resource.client.target);
  // Only create directory if it doesn't exist (already cleaned)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
    // console.log(`📁 Created ${resource.client.target} directory`);
  }

  let created = 0;
  let skipped = 0;

  const processRoutes = (
    routeGroups,
    moduleName = null,
    baseDir = targetDir
  ) => {
    for (const group of routeGroups) {
      const groupPath = (group.path || group.group || "/").replace(/^\//, "");
      const routes = Array.isArray(group.routes) ? group.routes : [];

      // Handle direct page in group (without routes array)
      if (group.page && routes.length === 0) {
        const groupDir = groupPath ? path.join(baseDir, groupPath) : baseDir;
        fs.mkdirSync(groupDir, { recursive: true });

        // Group-level layout
        if (
          group.layout &&
          layoutExists(resourceType, moduleName, group.layout)
        ) {
          const content = genClientLayoutContent(
            resourceType,
            moduleName,
            group.layout
          );
          createFile(path.join(groupDir, EXTENSIONS.LAYOUT), content, "layout");
        }

        // Direct page
        if (pageExists(resourceType, moduleName, group.page)) {
          const content = genClientPageContent(
            resourceType,
            moduleName,
            group.page
          );
          createFile(path.join(groupDir, EXTENSIONS.PAGE), content, "page");
          created++;
        } else {
          console.warn(
            `  ⚠️  Skipping "${groupPath}" - page not found: ${group.page}.tsx`
          );
          skipped++;
        }
        continue;
      }

      // Handle routes array
      if (routes.length === 0) continue;

      const groupDir = groupPath ? path.join(baseDir, groupPath) : baseDir;
      fs.mkdirSync(groupDir, { recursive: true });

      // Group-level layout
      if (
        group.layout &&
        layoutExists(resourceType, moduleName, group.layout)
      ) {
        const content = genClientLayoutContent(
          resourceType,
          moduleName,
          group.layout
        );
        createFile(path.join(groupDir, EXTENSIONS.LAYOUT), content, "layout");
      }

      // Root routes
      const rootRoutes = routes.filter((r) => r.path === "/");
      if (rootRoutes.length > 0) {
        const valid = rootRoutes.filter((r) =>
          pageExists(resourceType, moduleName, r.page)
        );
        if (valid.length > 0) {
          const content = genClientPageContent(
            resourceType,
            moduleName,
            valid[0].page
          );
          createFile(path.join(groupDir, EXTENSIONS.PAGE), content, "page");
          created++;
        } else {
          skipped += rootRoutes.length;
        }
      }

      // Other routes
      routes.forEach((r) => {
        if (r.path === "/") return;
        if (!pageExists(resourceType, moduleName, r.page)) {
          console.warn(
            `  ⚠️  Skipping "${r.path}" - page not found: ${r.page}.tsx`
          );
          skipped++;
          return;
        }

        const routePath = normalizeRoutePath(r.path);
        const filePath = path.join(groupDir, routePath, EXTENSIONS.PAGE);
        const content = genClientPageContent(resourceType, moduleName, r.page);
        createFile(filePath, content, "page");
        created++;

        // Route-level layout
        if (r.layout && layoutExists(resourceType, moduleName, r.layout)) {
          const layoutContent = genClientLayoutContent(
            resourceType,
            moduleName,
            r.layout
          );
          createFile(
            path.join(groupDir, routePath, EXTENSIONS.LAYOUT),
            layoutContent,
            "layout"
          );
        }
      });
    }
  };

  if (resourceType === "modules") {
    for (const [moduleName, routeGroups] of Object.entries(routeData)) {
      console.log(`📝 Generating client pages for module: ${moduleName}`);
      const moduleDir = path.join(targetDir, moduleName);
      fs.mkdirSync(moduleDir, { recursive: true });
      processRoutes(routeGroups, moduleName, moduleDir);
      console.log(
        `✅ Client pages generated for ${moduleName}: ${created} created${skipped ? `, ${skipped} skipped` : ""}`
      );
    }
  } else {
    processRoutes(routeData);
    console.log(
      `✅ Client pages generated for ${resourceType}: ${created} created${skipped ? `, ${skipped} skipped` : ""}`
    );
  }
};

const buildClientPages = async () => {
  console.log("🔍 Scanning client routes...");
  for (const [resourceType] of Object.entries(RESOURCES)) {
    const routeData = await scanRoutes(resourceType, "client");
    if (
      routeData &&
      (resourceType === "modules"
        ? Object.keys(routeData).length > 0
        : routeData.length > 0)
    ) {
      console.log(`📝 Building ${resourceType} client pages...`);
      buildClientPagesForResource(resourceType, routeData);
    }
  }
  console.log("🎉 Client pages build completed!");
};

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================
if (require.main === module) {
  (async () => {
    try {
      // Clean all target directories once at the beginning
      cleanAllTargetDirectories();

      await buildServerRoutes();
      await buildClientPages();
      console.log("🎉 Module routes and client pages build completed!");
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}

module.exports = { buildServerRoutes, buildClientPages };
