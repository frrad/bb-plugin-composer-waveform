import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SHIMMED_TYPE_PACKAGES } from "../packages/plugin-build/src/runtime-shims.mjs";
import {
  forkPluginPackageJson,
  forkPluginTsconfig,
  registryAliasImports,
  registryItemsForImports,
  registryPackages,
} from "../scripts/lib/plugin-fork.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const plugin = join(root, "plugins/composer");
const json = async (path) => JSON.parse(await readFile(path, "utf8"));
const writeJson = (path, value) => writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
const specifiers = new Set();
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", "dist", ".turbo"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (/\.(?:ts|tsx)$/.test(entry.name)) {
      for (const specifier of registryAliasImports(await readFile(path, "utf8"))) {
        specifiers.add(specifier);
      }
    }
  }
}
await collect(plugin);
const registryDirectory = join(root, "packages/plugin-registry/r");
const registry = await Promise.all(
  (await readdir(registryDirectory))
    .filter((name) => name.endsWith(".json") && name !== "index.json")
    .map((name) => json(join(registryDirectory, name))),
);
const items = registryItemsForImports(specifiers, registry);
for (const item of items) {
  for (const file of item.files) {
    const path = join(plugin, file.target);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, file.content);
  }
}
const registryManifest = await json(join(root, "packages/plugin-registry/package.json"));
const appManifest = await json(join(root, "apps/app/package.json"));
const manifest = await json(join(plugin, "package.json"));
const forked = forkPluginPackageJson(manifest, {
  sdkSpecifier: "0.6.94",
  workspaceBinsByPackage: new Map([["@bb/plugin-build", ["bb-plugin-build"]]]),
  registryDependencies: registryPackages(items, {
    shimmedPackages: new Set(SHIMMED_TYPE_PACKAGES),
    versions: {
      ...registryManifest.devDependencies,
      ...appManifest.devDependencies,
      ...appManifest.dependencies,
    },
  }),
});
await writeJson(join(plugin, "package.json"), forked.manifest);
const tsconfig = forkPluginTsconfig(await json(join(plugin, "tsconfig.json")));
tsconfig.include = [...new Set([...tsconfig.include, "components", "lib", "vendor"])];
await writeJson(join(plugin, "tsconfig.json"), tsconfig);
console.log(`Vendored ${items.length} registry items into plugins/composer`);
