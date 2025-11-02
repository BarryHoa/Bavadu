const fs = require("fs");
const path = require("path");
// Note: Avoid glob to support environments without it (e.g., Bun CJS quirk)

const AUTO_HEADER = `// Auto-generated file - DO NOT EDIT\n`;

const handlerExists = (moduleName, handlerPath) =>
  fs.existsSync(
    path.join(
      process.cwd(),
      "modules",
      moduleName,
      "server",
      "controllers",
      `${handlerPath}.ts`
    )
  );

// Check if handler exists in module-base
const handlerExistsBase = (handlerPath) =>
  fs.existsSync(
    path.join(
      process.cwd(),
      "module-base",
      "server",
      "controllers",
      `${handlerPath}.ts`
    )
  );

// ===== Client helpers =====
const pageExists = (moduleName, pagePath) =>
  fs.existsSync(
    path.join(
      process.cwd(),
      "modules",
      moduleName,
      "client",
      "pages",
      `${pagePath}.tsx`
    )
  ) ||
  fs.existsSync(
    path.join(
      process.cwd(),
      "modules",
      moduleName,
      "client",
      "pages",
      `${pagePath}.ts`
    )
  );

const layoutExists = (moduleName, layoutPath) =>
  fs.existsSync(
    path.join(
      process.cwd(),
      "modules",
      moduleName,
      "client",
      "layouts",
      `${layoutPath}.tsx`
    )
  ) ||
  fs.existsSync(
    path.join(
      process.cwd(),
      "modules",
      moduleName,
      "client",
      "layouts",
      `${layoutPath}.ts`
    )
  );

// Scan module-base routes
const scanModuleBase = async () => {
  const routeFile = path.join(
    process.cwd(),
    "module-base",
    "server",
    "route.json"
  );

  if (!fs.existsSync(routeFile)) {
    return null;
  }

  try {
    const routeGroups = JSON.parse(fs.readFileSync(routeFile, "utf-8"));
    if (Array.isArray(routeGroups) && routeGroups.length > 0) {
      console.log(`Processing module-base (${routeGroups.length} groups)`);
      return routeGroups;
    }
  } catch (error) {
    console.error(`Error processing module-base route.json:`, error);
  }

  return null;
};

const scanModules = async () => {
  const modules = {};
  const modulesDir = path.join(process.cwd(), "modules");
  if (!fs.existsSync(modulesDir)) return modules;

  const moduleNames = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const routeFiles = [];
  for (const moduleName of moduleNames) {
    const routeFile = path.join(modulesDir, moduleName, "server", "route.json");
    if (fs.existsSync(routeFile)) routeFiles.push({ moduleName, routeFile });
  }

  console.log(
    `Found ${routeFiles.length} route files:`,
    routeFiles.map((f) => f.routeFile)
  );

  for (const { moduleName, routeFile } of routeFiles) {
    try {
      const routeGroups = JSON.parse(fs.readFileSync(routeFile, "utf-8"));

      if (Array.isArray(routeGroups) && routeGroups.length > 0) {
        modules[moduleName] = routeGroups;
        console.log(
          `Processing module: ${moduleName} (${routeGroups.length} groups)`
        );
      }
    } catch (error) {
      console.error(`Error processing ${routeFile}:`, error);
    }
  }
  return modules;
};

// Scan client route groups from modules/*/client/route.json
const scanClientRoutes = async () => {
  const modules = {};
  const modulesDir = path.join(process.cwd(), "modules");
  if (!fs.existsSync(modulesDir)) return modules;

  const moduleNames = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  const routeFiles = [];
  for (const moduleName of moduleNames) {
    const routeFile = path.join(modulesDir, moduleName, "client", "route.json");
    if (fs.existsSync(routeFile)) routeFiles.push({ moduleName, routeFile });
  }

  console.log(
    `Found ${routeFiles.length} client route files:`,
    routeFiles.map((f) => f.routeFile)
  );

  for (const { moduleName, routeFile } of routeFiles) {
    try {
      const routeGroups = JSON.parse(fs.readFileSync(routeFile, "utf-8"));

      if (Array.isArray(routeGroups) && routeGroups.length > 0) {
        modules[moduleName] = routeGroups;
        console.log(
          `Processing client module: ${moduleName} (${routeGroups.length} groups)`
        );
      }
    } catch (error) {
      console.error(`Error processing ${routeFile}:`, error);
    }
  }
  return modules;
};

const generateRouteContent = (moduleName, route, type = "route") => {
  const comment =
    type.toLowerCase() === "route"
      ? `Generated from modules/${moduleName}/server/route.json`
      : `${type} route: ${route.path}`;

  return `${AUTO_HEADER}// ${comment}

export * from "@mdl/${moduleName}/server/controllers${route.handler}";
`;
};

// Generate route content for module-base (uses @base instead of @mdl)
const generateRouteContentBase = (route, type = "route") => {
  const comment =
    type.toLowerCase() === "route"
      ? `Generated from module-base/server/route.json`
      : `${type} route: ${route.path}`;

  return `${AUTO_HEADER}// ${comment}

export * from "@base/server/controllers${route.handler}";
`;
};

const generateRouteFile = (moduleName, routes) => {
  const validRoutes = routes.filter((route) => {
    const exists = handlerExists(moduleName, route.handler);
    if (!exists)
      console.warn(
        `  ⚠️  Skipping route "${route.path}" - handler not found: ${route.handler}.ts`
      );
    return exists;
  });

  if (validRoutes.length === 0) return null;

  // Nếu chỉ có 1 route, dùng content đơn giản
  if (validRoutes.length === 1) {
    return generateRouteContent(moduleName, validRoutes[0], "route");
  }

  // Nhiều routes thì cần imports và exports
  const imports = [...new Set(validRoutes.map((route) => route.handler))].map(
    (handler) =>
      `import * from "@mdl/${moduleName}/server/controllers${handler}";`
  );

  const routeHandlers = validRoutes.map(
    (route) =>
      `export * from "@mdl/${moduleName}/server/controllers${route.handler}";`
  );

  return `${AUTO_HEADER}// Generated from modules/${moduleName}/server/route.json

${imports.join("\n")}

${routeHandlers.join("\n")}
`;
};

// ===== Client generation helpers =====
const genClientPageContent = (
  moduleName,
  pagePath
) => `${AUTO_HEADER}export { default } from "@mdl/${moduleName}/client/pages${pagePath}";
`;

const genClientLayoutContent = (
  moduleName,
  layoutPath
) => `${AUTO_HEADER}export { default } from "@mdl/${moduleName}/client/layouts${layoutPath}";
`;

const createPageFile = (filePath, content) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`  📄 Created page: ${filePath}`);
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

const createRouteFile = (filePath, content, type) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content);
  console.log(`  📄 Created ${type} route: ${filePath}`);
};

const buildServerRoutes = async () => {
  console.log("🔍 Scanning modules for server routes...");
  const modules = await scanModules();
  const moduleBaseRoutes = await scanModuleBase();

  const hasModules = Object.keys(modules).length > 0;
  const hasModuleBase = moduleBaseRoutes !== null;

  if (!hasModules && !hasModuleBase) {
    console.log("❌ No modules with routes found");
    return;
  }

  if (hasModules) {
    console.log(`✅ Found ${Object.keys(modules).length} modules with routes`);
  }

  // ===== Build module-base routes in api/base/ =====
  if (hasModuleBase) {
    console.log("📝 Building module-base routes in api/base/...");
    const apiBaseDir = path.join(process.cwd(), "app", "api", "base");

    if (fs.existsSync(apiBaseDir)) {
      console.log("🗑️  Cleaning existing api/base directory...");
      try {
        deleteRecursive(apiBaseDir);
        console.log("✅ Successfully cleaned api/base directory");
      } catch (error) {
        console.error("❌ Error cleaning directory:", error.message);
        try {
          fs.rmSync(apiBaseDir, { recursive: true, force: true });
          console.log("✅ Fallback cleanup successful");
        } catch (fallbackError) {
          console.error("❌ Fallback cleanup failed:", fallbackError.message);
        }
      }
    }

    fs.mkdirSync(apiBaseDir, { recursive: true });
    console.log("📁 Created fresh api/base directory");

    let baseCreatedCount = 0;
    let baseSkippedCount = 0;

    for (const group of moduleBaseRoutes) {
      const groupPath = group.path || "/";
      const routes = Array.isArray(group.routes) ? group.routes : [];

      if (routes.length === 0) continue;

      // Create directory for this group path (e.g., /view-list-data-table -> view-list-data-table/)
      const groupPathClean = groupPath.replace(/^\//, "");
      const targetDir = path.join(apiBaseDir, groupPathClean);
      fs.mkdirSync(targetDir, { recursive: true });

      // Main route for this group (path === "/")
      const rootRoutes = routes.filter((route) => route.path === "/");
      if (rootRoutes.length > 0) {
        const validRootRoutes = rootRoutes.filter((route) =>
          handlerExistsBase(route.handler)
        );

        if (validRootRoutes.length > 0) {
          const mainRouteContent =
            validRootRoutes.length === 1
              ? generateRouteContentBase(validRootRoutes[0], "route")
              : `${AUTO_HEADER}// Generated from module-base/server/route.json\n\n${validRootRoutes.map((route) => `export * from "@base/server/controllers${route.handler}";`).join("\n")}\n`;

          createRouteFile(
            path.join(targetDir, "route.ts"),
            mainRouteContent,
            "main"
          );
          baseCreatedCount += validRootRoutes.length;
        } else {
          console.warn(
            `  ⚠️  Skipping group "${groupPath}" main route - no valid handlers found`
          );
        }
        baseSkippedCount += rootRoutes.filter(
          (route) => !handlerExistsBase(route.handler)
        ).length;
      }

      // Other routes in this group
      routes.forEach((route) => {
        if (route.path === "/") return;

        if (!handlerExistsBase(route.handler)) {
          console.warn(
            `  ⚠️  Skipping route "${route.path}" - handler not found: ${route.handler}.ts`
          );
          baseSkippedCount++;
          return;
        }

        const isDynamic = route.path.includes("[") && route.path.includes("]");
        const routePath = isDynamic
          ? route.path.replace(/\[([^\]]+)\]/g, "[$1]")
          : route.path.replace(/^\//, "");

        const routeFile = path.join(targetDir, routePath, "route.ts");
        const content = generateRouteContentBase(
          route,
          isDynamic ? "Dynamic" : "Static"
        );

        createRouteFile(routeFile, content, isDynamic ? "dynamic" : "static");
        baseCreatedCount++;
      });
    }

    console.log(
      `✅ Generated ${baseCreatedCount} routes for module-base${baseSkippedCount > 0 ? ` (skipped ${baseSkippedCount} with missing handlers)` : ""}`
    );
  }

  // ===== Build regular modules routes in api/modules/ =====
  if (hasModules) {
    const apiModulesDir = path.join(process.cwd(), "app", "api", "modules");

    if (fs.existsSync(apiModulesDir)) {
      console.log("🗑️  Cleaning existing api/modules directory...");
      try {
        deleteRecursive(apiModulesDir);
        console.log("✅ Successfully cleaned api/modules directory");
      } catch (error) {
        console.error("❌ Error cleaning directory:", error.message);
        try {
          fs.rmSync(apiModulesDir, { recursive: true, force: true });
          console.log("✅ Fallback cleanup successful");
        } catch (fallbackError) {
          console.error("❌ Fallback cleanup failed:", fallbackError.message);
        }
      }
    }

    fs.mkdirSync(apiModulesDir, { recursive: true });
    console.log("📁 Created fresh api/modules directory");

    for (const [moduleName, routeGroups] of Object.entries(modules)) {
      console.log(`📝 Generating routes for module: ${moduleName}`);
      const moduleApiDir = path.join(apiModulesDir, moduleName);
      fs.mkdirSync(moduleApiDir, { recursive: true });

      let createdCount = 0;
      let skippedCount = 0;

      for (const group of routeGroups) {
        const groupName = group.group || null;
        const routes = Array.isArray(group.routes) ? group.routes : [];

        if (routes.length === 0) continue;

        const targetDir = groupName
          ? path.join(moduleApiDir, groupName)
          : moduleApiDir;
        fs.mkdirSync(targetDir, { recursive: true });

        // Main route for this group
        const rootRoutes = routes.filter((route) => route.path === "/");
        if (rootRoutes.length > 0) {
          const mainRouteContent = generateRouteFile(moduleName, rootRoutes);
          if (mainRouteContent) {
            createRouteFile(
              path.join(targetDir, "route.ts"),
              mainRouteContent,
              groupName ? `group:${groupName}` : "main"
            );
            createdCount += rootRoutes.filter((route) =>
              handlerExists(moduleName, route.handler)
            ).length;
          } else {
            console.warn(
              `  ⚠️  Skipping ${groupName ? `group "${groupName}" ` : "main "}route - no valid handlers found`
            );
          }
          skippedCount += rootRoutes.filter(
            (route) => !handlerExists(moduleName, route.handler)
          ).length;
        }

        // Other routes in this group
        routes.forEach((route) => {
          if (route.path === "/") return;

          if (!handlerExists(moduleName, route.handler)) {
            console.warn(
              `  ⚠️  Skipping route "${route.path}" - handler not found: ${route.handler}.ts`
            );
            skippedCount++;
            return;
          }

          const isDynamic =
            route.path.includes("[") && route.path.includes("]");
          const routePath = isDynamic
            ? route.path.replace(/\[([^\]]+)\]/g, "[$1]")
            : route.path.replace(/^\//, "");

          const routeFile = path.join(targetDir, routePath, "route.ts");
          const content = generateRouteContent(
            moduleName,
            route,
            isDynamic ? "Dynamic" : "Static"
          );

          createRouteFile(routeFile, content, isDynamic ? "dynamic" : "static");
          createdCount++;
        });
      }

      console.log(
        `✅ Generated ${createdCount} routes for ${moduleName}${skippedCount > 0 ? ` (skipped ${skippedCount} with missing handlers)` : ""}`
      );
    }
  }
};

const buildClientPages = async () => {
  // ===== Build client pages for workspace =====
  console.log("🔍 Scanning client routes...");
  const clientModules = await scanClientRoutes();

  const workspaceModulesDir = path.join(
    process.cwd(),
    "app",
    "workspace",
    "modules"
  );

  if (fs.existsSync(workspaceModulesDir)) {
    console.log("🗑️  Cleaning existing app/workspace/modules directory...");
    try {
      deleteRecursive(workspaceModulesDir);
      console.log("✅ Successfully cleaned app/workspace/modules directory");
    } catch (error) {
      console.error("❌ Error cleaning directory:", error.message);
      try {
        fs.rmSync(workspaceModulesDir, { recursive: true, force: true });
        console.log("✅ Fallback cleanup successful");
      } catch (fallbackError) {
        console.error("❌ Fallback cleanup failed:", fallbackError.message);
      }
    }
  }

  fs.mkdirSync(workspaceModulesDir, { recursive: true });
  console.log("📁 Created fresh app/workspace/modules directory");

  for (const [moduleName, routeGroups] of Object.entries(clientModules)) {
    console.log(`📝 Generating client pages for module: ${moduleName}`);
    const moduleDir = path.join(workspaceModulesDir, moduleName);
    fs.mkdirSync(moduleDir, { recursive: true });

    let created = 0;
    let skipped = 0;

    for (const group of routeGroups) {
      const groupName = group.group || null;
      const routes = Array.isArray(group.routes) ? group.routes : [];
      if (routes.length === 0) continue;

      const targetDir = groupName ? path.join(moduleDir, groupName) : moduleDir;
      fs.mkdirSync(targetDir, { recursive: true });

      // group-level layout
      if (group.layout) {
        if (layoutExists(moduleName, group.layout)) {
          const layoutContent = genClientLayoutContent(
            moduleName,
            group.layout
          );
          createPageFile(path.join(targetDir, "layout.tsx"), layoutContent);
        } else {
          console.warn(
            `  ⚠️  Skipping group layout for ${moduleName}/${groupName ?? "(root)"} - layout not found: ${group.layout}.tsx`
          );
        }
      }

      const rootRoutes = routes.filter((r) => r.path === "/");
      if (rootRoutes.length > 0) {
        const valid = rootRoutes.filter((r) => pageExists(moduleName, r.page));
        if (valid.length > 0) {
          const content = genClientPageContent(moduleName, valid[0].page);
          createPageFile(path.join(targetDir, "page.tsx"), content);
          created++;
        } else {
          console.warn(
            `  ⚠️  Skipping ${groupName ? `group "${groupName}" ` : ""}main page - no valid component found`
          );
          skipped += rootRoutes.length;
        }
      }

      routes.forEach((r) => {
        if (r.path === "/") return;
        if (!pageExists(moduleName, r.page)) {
          console.warn(
            `  ⚠️  Skipping "${r.path}" - page not found: ${r.page}.tsx`
          );
          skipped++;
          return;
        }
        const routePath = r.path.replace(/^\//, "");
        const filePath = path.join(targetDir, routePath, "page.tsx");
        const content = genClientPageContent(moduleName, r.page);
        createPageFile(filePath, content);
        created++;

        // route-level layout
        if (r.layout) {
          if (layoutExists(moduleName, r.layout)) {
            const routeLayoutContent = genClientLayoutContent(
              moduleName,
              r.layout
            );
            const layoutFile = path.join(targetDir, routePath, "layout.tsx");
            createPageFile(layoutFile, routeLayoutContent);
          } else {
            console.warn(
              `  ⚠️  Skipping layout for route "${r.path}" - layout not found: ${r.layout}.tsx`
            );
          }
        }
      });
    }

    console.log(
      `✅ Client pages generated for ${moduleName}: ${created} created${skipped ? `, ${skipped} skipped` : ""}`
    );
  }

  console.log("🎉 Client pages build completed!");
};

if (require.main === module) {
  (async () => {
    try {
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
