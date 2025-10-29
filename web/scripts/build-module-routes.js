const fs = require("fs");
const path = require("path");
const { glob } = require("glob");

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

const scanModules = async () => {
  const modules = {};
  const routeFiles = await glob("modules/*/server/route.json", {
    cwd: process.cwd(),
  });

  console.log(`Found ${routeFiles.length} route files:`, routeFiles);

  for (const routeFile of routeFiles) {
    try {
      const moduleName = routeFile.split(/[/\\]/)[1];
      const routes = JSON.parse(
        fs.readFileSync(path.resolve(process.cwd(), routeFile), "utf-8")
      );

      if (routes.length > 0) {
        modules[moduleName] = routes;
        console.log(
          `Processing module: ${moduleName} (${routes.length} routes)`
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

  return `// Auto-generated file - DO NOT EDIT
// ${comment}

export * from "@mdl/${moduleName}/server/controllers${route.handler}";
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

  return `// Auto-generated file - DO NOT EDIT
// Generated from modules/${moduleName}/server/route.json

${imports.join("\n")}

${routeHandlers.join("\n")}
`;
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

const buildModuleRoutes = async () => {
  console.log("🔍 Scanning modules for routes...");
  const modules = await scanModules();

  if (Object.keys(modules).length === 0) {
    console.log("❌ No modules with routes found");
    return;
  }

  console.log(`✅ Found ${Object.keys(modules).length} modules with routes`);

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

  for (const [moduleName, routes] of Object.entries(modules)) {
    console.log(`📝 Generating routes for module: ${moduleName}`);
    const moduleApiDir = path.join(apiModulesDir, moduleName);
    fs.mkdirSync(moduleApiDir, { recursive: true });

    let createdCount = 0;
    let skippedCount = 0;

    // Main route
    const rootRoutes = routes.filter((route) => route.path === "/");
    if (rootRoutes.length > 0) {
      const mainRouteContent = generateRouteFile(moduleName, rootRoutes);
      if (mainRouteContent) {
        createRouteFile(
          path.join(moduleApiDir, "route.ts"),
          mainRouteContent,
          "main"
        );
        createdCount += rootRoutes.filter((route) =>
          handlerExists(moduleName, route.handler)
        ).length;
      } else {
        console.warn(`  ⚠️  Skipping main route - no valid handlers found`);
      }
      skippedCount += rootRoutes.filter(
        (route) => !handlerExists(moduleName, route.handler)
      ).length;
    }

    // Other routes (skip root path "/" as it's already handled above)
    routes.forEach((route) => {
      if (route.path === "/") return; // Skip root path, already handled

      if (!handlerExists(moduleName, route.handler)) {
        console.warn(
          `  ⚠️  Skipping route "${route.path}" - handler not found: ${route.handler}.ts`
        );
        skippedCount++;
        return;
      }

      const isDynamic = route.path.includes("[") && route.path.includes("]");
      const routePath = isDynamic
        ? route.path.replace(/\[([^\]]+)\]/g, "[$1]")
        : route.path.replace(/^\//, "");

      const routeFile = path.join(moduleApiDir, routePath, "route.ts");
      const content = generateRouteContent(
        moduleName,
        route,
        isDynamic ? "Dynamic" : "Static"
      );

      createRouteFile(routeFile, content, isDynamic ? "dynamic" : "static");
      createdCount++;
    });

    console.log(
      `✅ Generated ${createdCount} routes for ${moduleName}${skippedCount > 0 ? ` (skipped ${skippedCount} with missing handlers)` : ""}`
    );
  }

  console.log("🎉 Module routes build completed!");
};

if (require.main === module) {
  buildModuleRoutes().catch(console.error);
}

module.exports = { buildModuleRoutes };
