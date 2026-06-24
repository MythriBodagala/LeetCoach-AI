const fs = require("fs");
const path = require("path");

const directories = [
  "server/src/config",
  "server/src/constants",
  "server/src/controllers",
  "server/src/middlewares",
  "server/src/models",
  "server/src/repositories",
  "server/src/routes/v1",
  "server/src/services",
  "server/src/utils",
  "server/src/validators",
];

const files = [
  "server/package.json",
  "server/tsconfig.json",

  "server/src/app.ts",
  "server/src/server.ts",

  "server/src/config/environment.ts",

  "server/src/controllers/auth.controller.ts",
  "server/src/controllers/ai.controller.ts",

  "server/src/middlewares/auth.middleware.ts",
  "server/src/middlewares/error.middleware.ts",
  "server/src/middlewares/rate-limiter.middleware.ts",

  "server/src/repositories/user.repository.ts",
  "server/src/repositories/problem.repository.ts",

  "server/src/routes/index.ts",
  "server/src/routes/v1/auth.routes.ts",
  "server/src/routes/v1/ai.routes.ts",

  "server/src/services/ai.service.ts",
  "server/src/services/token.service.ts",

  "server/src/validators/auth.validator.ts",
];

console.log("Creating folders...");

directories.forEach((dir) => {
  fs.mkdirSync(dir, { recursive: true });
});

console.log("Creating files...");

files.forEach((file) => {
  const filePath = path.resolve(file);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, "");
    console.log(`✓ ${file}`);
  }
});

console.log("\nProject structure created successfully!");