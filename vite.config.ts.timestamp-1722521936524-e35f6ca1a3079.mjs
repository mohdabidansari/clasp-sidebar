// vite.config.ts
import { resolve } from "path";
import { build, defineConfig } from "file:///D:/upwork/Google%20Apps%20Clasp%20SideBar%20Plugin%20POC/sidebar/node_modules/vite/dist/node/index.js";
import { existsSync, readFileSync } from "fs";
import react from "file:///D:/upwork/Google%20Apps%20Clasp%20SideBar%20Plugin%20POC/sidebar/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { viteStaticCopy } from "file:///D:/upwork/Google%20Apps%20Clasp%20SideBar%20Plugin%20POC/sidebar/node_modules/vite-plugin-static-copy/dist/index.js";
import { viteSingleFile } from "file:///D:/upwork/Google%20Apps%20Clasp%20SideBar%20Plugin%20POC/sidebar/node_modules/vite-plugin-singlefile/dist/esm/index.js";
import { writeFile } from "fs/promises";
import alias from "file:///D:/upwork/Google%20Apps%20Clasp%20SideBar%20Plugin%20POC/sidebar/node_modules/@rollup/plugin-alias/dist/es/index.js";
var __vite_injected_original_dirname = "D:\\upwork\\Google Apps Clasp SideBar Plugin POC\\sidebar";
var PORT = 3e3;
var clientRoot = "./src/client";
var outDir = "./dist";
var serverEntry = "src/server/index.ts";
var copyAppscriptEntry = "./appsscript.json";
var devServerWrapper = "./dev/dev-server-wrapper.html";
var staticFilesEntry = "src/server/static/";
var projectRootDir = resolve(__vite_injected_original_dirname);
var clientEntrypoints = [
  {
    name: "CLIENT - sidebar-main",
    filename: "sidebar-main",
    template: "sidebar-main/index.html"
  }
];
var keyPath = resolve(__vite_injected_original_dirname, "./certs/key.pem");
var certPath = resolve(__vite_injected_original_dirname, "./certs/cert.pem");
var pfxPath = resolve(__vite_injected_original_dirname, "./certs/cert.pfx");
var devServerOptions = {
  port: PORT
};
if (existsSync(keyPath) && existsSync(certPath)) {
  devServerOptions.https = {
    key: readFileSync(resolve(__vite_injected_original_dirname, "./certs/key.pem")),
    cert: readFileSync(resolve(__vite_injected_original_dirname, "./certs/cert.pem"))
  };
}
if (existsSync(pfxPath)) {
  devServerOptions.https = {
    pfx: readFileSync(pfxPath),
    passphrase: "abc123"
  };
}
var clientServeConfig = () => defineConfig({
  // @ts-ignore: Unreachable code error
  plugins: [alias(), react()],
  server: devServerOptions,
  root: clientRoot,
  resolve: {
    alias: {
      "@": resolve(projectRootDir, "src/client")
    }
  }
});
var clientBuildConfig = ({
  clientEntrypointRoot,
  template
}) => defineConfig({
  plugins: [react(), viteSingleFile({ useRecommendedBuildConfig: true })],
  root: resolve(__vite_injected_original_dirname, clientRoot, clientEntrypointRoot),
  build: {
    sourcemap: false,
    write: false,
    // don't write to disk
    outDir,
    emptyOutDir: true,
    minify: true,
    rollupOptions: {
      external: ["react", "react-dom", "gas-client", "@types/react"],
      output: {
        format: "iife",
        // needed to use globals from UMD builds
        dir: outDir,
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "gas-client": "GASClient",
          "@types/react": "@types/react"
        }
      },
      input: resolve(__vite_injected_original_dirname, clientRoot, template)
    }
  },
  resolve: {
    alias: {
      "@": resolve(projectRootDir, "src/client")
    }
  }
});
var serverBuildConfig = {
  emptyOutDir: true,
  minify: false,
  // needed to work with footer
  lib: {
    entry: resolve(__vite_injected_original_dirname, serverEntry),
    fileName: "code",
    name: "globalThis",
    formats: ["iife"]
  },
  rollupOptions: {
    output: {
      entryFileNames: "code.js",
      extend: true,
      footer: (chunk) => chunk.exports.map((exportedFunction) => `function ${exportedFunction}() {};`).join("\n")
    }
  }
};
var buildConfig = ({ mode }) => {
  const targets = [
    { src: copyAppscriptEntry, dest: "./" },
    { src: staticFilesEntry + "/[!.]*", dest: "./" }
  ];
  if (mode === "development") {
    targets.push(
      ...clientEntrypoints.map((entrypoint) => ({
        src: devServerWrapper,
        dest: "./",
        rename: `${entrypoint.filename}.html`,
        transform: (contents) => contents.toString().replace(/__PORT__/g, String(PORT)).replace(/__FILE_NAME__/g, entrypoint.template)
      }))
    );
  }
  return defineConfig({
    plugins: [
      viteStaticCopy({
        targets
      }),
      /**
       * This builds the client react app bundles for production, and writes them to disk.
       * Because multiple client entrypoints (dialogs) are built, we need to loop through
       * each entrypoint and build the client bundle for each. Vite doesn't have great tooling for
       * building multiple single-page apps in one project, so we have to do this manually with a
       * post-build closeBundle hook (https://rollupjs.org/guide/en/#closebundle).
       */
      mode === "production" && {
        name: "build-client-production-bundles",
        closeBundle: async () => {
          console.log("Building client production bundles...");
          for (const clientEntrypoint of clientEntrypoints) {
            console.log("Building client bundle for", clientEntrypoint.name);
            const buildOutput = await build(
              clientBuildConfig({
                clientEntrypointRoot: clientEntrypoint.filename,
                template: clientEntrypoint.template
              })
            );
            await writeFile(
              resolve(__vite_injected_original_dirname, outDir, `${clientEntrypoint.filename}.html`),
              // @ts-expect-error - output is an array of RollupOutput
              buildOutput.output[0].source
            );
          }
          console.log("Finished building client bundles!");
        }
      }
    ].filter(Boolean),
    build: serverBuildConfig
  });
};
var vite_config_default = async ({ command, mode }) => {
  if (command === "serve") {
    return clientServeConfig();
  }
  if (command === "build") {
    return buildConfig({ mode });
  }
  return {};
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx1cHdvcmtcXFxcR29vZ2xlIEFwcHMgQ2xhc3AgU2lkZUJhciBQbHVnaW4gUE9DXFxcXHNpZGViYXJcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHVwd29ya1xcXFxHb29nbGUgQXBwcyBDbGFzcCBTaWRlQmFyIFBsdWdpbiBQT0NcXFxcc2lkZWJhclxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovdXB3b3JrL0dvb2dsZSUyMEFwcHMlMjBDbGFzcCUyMFNpZGVCYXIlMjBQbHVnaW4lMjBQT0Mvc2lkZWJhci92aXRlLmNvbmZpZy50c1wiOy8qIGVzbGludC1kaXNhYmxlIGltcG9ydC9uby1leHRyYW5lb3VzLWRlcGVuZGVuY2llcyAqL1xyXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCc7XHJcbmltcG9ydCB7IEJ1aWxkT3B0aW9ucywgU2VydmVyT3B0aW9ucywgYnVpbGQsIGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkRmlsZVN5bmMgfSBmcm9tICdmcyc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xyXG5pbXBvcnQgeyB2aXRlU3RhdGljQ29weSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXN0YXRpYy1jb3B5JztcclxuaW1wb3J0IHsgdml0ZVNpbmdsZUZpbGUgfSBmcm9tICd2aXRlLXBsdWdpbi1zaW5nbGVmaWxlJztcclxuaW1wb3J0IHsgd3JpdGVGaWxlIH0gZnJvbSAnZnMvcHJvbWlzZXMnO1xyXG5pbXBvcnQgYWxpYXMgZnJvbSAnQHJvbGx1cC9wbHVnaW4tYWxpYXMnO1xyXG5cclxuY29uc3QgUE9SVCA9IDMwMDA7XHJcbmNvbnN0IGNsaWVudFJvb3QgPSAnLi9zcmMvY2xpZW50JztcclxuY29uc3Qgb3V0RGlyID0gJy4vZGlzdCc7XHJcbmNvbnN0IHNlcnZlckVudHJ5ID0gJ3NyYy9zZXJ2ZXIvaW5kZXgudHMnO1xyXG5jb25zdCBjb3B5QXBwc2NyaXB0RW50cnkgPSAnLi9hcHBzc2NyaXB0Lmpzb24nO1xyXG5jb25zdCBkZXZTZXJ2ZXJXcmFwcGVyID0gJy4vZGV2L2Rldi1zZXJ2ZXItd3JhcHBlci5odG1sJztcclxuY29uc3Qgc3RhdGljRmlsZXNFbnRyeSA9ICdzcmMvc2VydmVyL3N0YXRpYy8nO1xyXG5cclxuY29uc3QgcHJvamVjdFJvb3REaXIgPSByZXNvbHZlKF9fZGlybmFtZSk7XHJcblxyXG5jb25zdCBjbGllbnRFbnRyeXBvaW50cyA9IFtcclxuICB7XHJcbiAgICBuYW1lOiAnQ0xJRU5UIC0gc2lkZWJhci1tYWluJyxcclxuICAgIGZpbGVuYW1lOiAnc2lkZWJhci1tYWluJyxcclxuICAgIHRlbXBsYXRlOiAnc2lkZWJhci1tYWluL2luZGV4Lmh0bWwnLFxyXG4gIH0sXHJcbl07XHJcblxyXG5jb25zdCBrZXlQYXRoID0gcmVzb2x2ZShfX2Rpcm5hbWUsICcuL2NlcnRzL2tleS5wZW0nKTtcclxuY29uc3QgY2VydFBhdGggPSByZXNvbHZlKF9fZGlybmFtZSwgJy4vY2VydHMvY2VydC5wZW0nKTtcclxuY29uc3QgcGZ4UGF0aCA9IHJlc29sdmUoX19kaXJuYW1lLCAnLi9jZXJ0cy9jZXJ0LnBmeCcpOyAvLyBpZiBuZWVkZWQgZm9yIFdpbmRvd3NcclxuXHJcbmNvbnN0IGRldlNlcnZlck9wdGlvbnM6IFNlcnZlck9wdGlvbnMgPSB7XHJcbiAgcG9ydDogUE9SVCxcclxufTtcclxuXHJcbi8vIHVzZSBrZXkgYW5kIGNlcnQgc2V0dGluZ3Mgb25seSBpZiB0aGV5IGFyZSBmb3VuZFxyXG5pZiAoZXhpc3RzU3luYyhrZXlQYXRoKSAmJiBleGlzdHNTeW5jKGNlcnRQYXRoKSkge1xyXG4gIGRldlNlcnZlck9wdGlvbnMuaHR0cHMgPSB7XHJcbiAgICBrZXk6IHJlYWRGaWxlU3luYyhyZXNvbHZlKF9fZGlybmFtZSwgJy4vY2VydHMva2V5LnBlbScpKSxcclxuICAgIGNlcnQ6IHJlYWRGaWxlU3luYyhyZXNvbHZlKF9fZGlybmFtZSwgJy4vY2VydHMvY2VydC5wZW0nKSksXHJcbiAgfTtcclxufVxyXG5cclxuLy8gSWYgbWtjZXJ0IC1pbnN0YWxsIGNhbm5vdCBiZSB1c2VkIG9uIFdpbmRvd3MgbWFjaGluZXMgKGluIHBpcGVsaW5lLCBmb3IgZXhhbXBsZSksIHRoZVxyXG4vLyBzY3JpcHQgYXQgc2NyaXB0cy9nZW5lcmF0ZS1jZXJ0LnBzMSBjYW4gYmUgdXNlZCB0byBjcmVhdGUgYSAucGZ4IGNlcnRcclxuaWYgKGV4aXN0c1N5bmMocGZ4UGF0aCkpIHtcclxuICAvLyB1c2UgcGZ4IGZpbGUgaWYgaXQncyBmb3VuZFxyXG4gIGRldlNlcnZlck9wdGlvbnMuaHR0cHMgPSB7XHJcbiAgICBwZng6IHJlYWRGaWxlU3luYyhwZnhQYXRoKSxcclxuICAgIHBhc3NwaHJhc2U6ICdhYmMxMjMnLFxyXG4gIH07XHJcbn1cclxuXHJcbmNvbnN0IGNsaWVudFNlcnZlQ29uZmlnID0gKCkgPT5cclxuICBkZWZpbmVDb25maWcoe1xyXG4gICAgLy8gQHRzLWlnbm9yZTogVW5yZWFjaGFibGUgY29kZSBlcnJvclxyXG4gICAgcGx1Z2luczogW2FsaWFzKCksIHJlYWN0KCldLFxyXG4gICAgc2VydmVyOiBkZXZTZXJ2ZXJPcHRpb25zLFxyXG4gICAgcm9vdDogY2xpZW50Um9vdCxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHJlc29sdmUocHJvamVjdFJvb3REaXIsICdzcmMvY2xpZW50JyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuY29uc3QgY2xpZW50QnVpbGRDb25maWcgPSAoe1xyXG4gIGNsaWVudEVudHJ5cG9pbnRSb290LFxyXG4gIHRlbXBsYXRlLFxyXG59OiB7XHJcbiAgY2xpZW50RW50cnlwb2ludFJvb3Q6IHN0cmluZztcclxuICB0ZW1wbGF0ZTogc3RyaW5nO1xyXG59KSA9PlxyXG4gIGRlZmluZUNvbmZpZyh7XHJcbiAgICBwbHVnaW5zOiBbcmVhY3QoKSwgdml0ZVNpbmdsZUZpbGUoeyB1c2VSZWNvbW1lbmRlZEJ1aWxkQ29uZmlnOiB0cnVlIH0pXSxcclxuICAgIHJvb3Q6IHJlc29sdmUoX19kaXJuYW1lLCBjbGllbnRSb290LCBjbGllbnRFbnRyeXBvaW50Um9vdCksXHJcbiAgICBidWlsZDoge1xyXG4gICAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgICB3cml0ZTogZmFsc2UsIC8vIGRvbid0IHdyaXRlIHRvIGRpc2tcclxuICAgICAgb3V0RGlyLFxyXG4gICAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgZXh0ZXJuYWw6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ2dhcy1jbGllbnQnLCAnQHR5cGVzL3JlYWN0J10sXHJcbiAgICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgICBmb3JtYXQ6ICdpaWZlJywgLy8gbmVlZGVkIHRvIHVzZSBnbG9iYWxzIGZyb20gVU1EIGJ1aWxkc1xyXG4gICAgICAgICAgZGlyOiBvdXREaXIsXHJcbiAgICAgICAgICBnbG9iYWxzOiB7XHJcbiAgICAgICAgICAgIHJlYWN0OiAnUmVhY3QnLFxyXG4gICAgICAgICAgICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJyxcclxuICAgICAgICAgICAgJ2dhcy1jbGllbnQnOiAnR0FTQ2xpZW50JyxcclxuICAgICAgICAgICAgJ0B0eXBlcy9yZWFjdCc6ICdAdHlwZXMvcmVhY3QnLFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlucHV0OiByZXNvbHZlKF9fZGlybmFtZSwgY2xpZW50Um9vdCwgdGVtcGxhdGUpLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxpYXM6IHtcclxuICAgICAgICAnQCc6IHJlc29sdmUocHJvamVjdFJvb3REaXIsICdzcmMvY2xpZW50JyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0pO1xyXG5cclxuY29uc3Qgc2VydmVyQnVpbGRDb25maWc6IEJ1aWxkT3B0aW9ucyA9IHtcclxuICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICBtaW5pZnk6IGZhbHNlLCAvLyBuZWVkZWQgdG8gd29yayB3aXRoIGZvb3RlclxyXG4gIGxpYjoge1xyXG4gICAgZW50cnk6IHJlc29sdmUoX19kaXJuYW1lLCBzZXJ2ZXJFbnRyeSksXHJcbiAgICBmaWxlTmFtZTogJ2NvZGUnLFxyXG4gICAgbmFtZTogJ2dsb2JhbFRoaXMnLFxyXG4gICAgZm9ybWF0czogWydpaWZlJ10sXHJcbiAgfSxcclxuICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICBvdXRwdXQ6IHtcclxuICAgICAgZW50cnlGaWxlTmFtZXM6ICdjb2RlLmpzJyxcclxuICAgICAgZXh0ZW5kOiB0cnVlLFxyXG4gICAgICBmb290ZXI6IChjaHVuaykgPT5cclxuICAgICAgICBjaHVuay5leHBvcnRzXHJcbiAgICAgICAgICAubWFwKChleHBvcnRlZEZ1bmN0aW9uKSA9PiBgZnVuY3Rpb24gJHtleHBvcnRlZEZ1bmN0aW9ufSgpIHt9O2ApXHJcbiAgICAgICAgICAuam9pbignXFxuJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn07XHJcblxyXG5jb25zdCBidWlsZENvbmZpZyA9ICh7IG1vZGUgfTogeyBtb2RlOiBzdHJpbmcgfSkgPT4ge1xyXG4gIGNvbnN0IHRhcmdldHMgPSBbXHJcbiAgICB7IHNyYzogY29weUFwcHNjcmlwdEVudHJ5LCBkZXN0OiAnLi8nIH0sXHJcbiAgICB7IHNyYzogc3RhdGljRmlsZXNFbnRyeSArICcvWyEuXSonLCBkZXN0OiAnLi8nIH0sXHJcbiAgXTtcclxuICBpZiAobW9kZSA9PT0gJ2RldmVsb3BtZW50Jykge1xyXG4gICAgdGFyZ2V0cy5wdXNoKFxyXG4gICAgICAuLi5jbGllbnRFbnRyeXBvaW50cy5tYXAoKGVudHJ5cG9pbnQpID0+ICh7XHJcbiAgICAgICAgc3JjOiBkZXZTZXJ2ZXJXcmFwcGVyLFxyXG4gICAgICAgIGRlc3Q6ICcuLycsXHJcbiAgICAgICAgcmVuYW1lOiBgJHtlbnRyeXBvaW50LmZpbGVuYW1lfS5odG1sYCxcclxuICAgICAgICB0cmFuc2Zvcm06IChjb250ZW50czogc3RyaW5nKSA9PlxyXG4gICAgICAgICAgY29udGVudHNcclxuICAgICAgICAgICAgLnRvU3RyaW5nKClcclxuICAgICAgICAgICAgLnJlcGxhY2UoL19fUE9SVF9fL2csIFN0cmluZyhQT1JUKSlcclxuICAgICAgICAgICAgLnJlcGxhY2UoL19fRklMRV9OQU1FX18vZywgZW50cnlwb2ludC50ZW1wbGF0ZSksXHJcbiAgICAgIH0pKVxyXG4gICAgKTtcclxuICB9XHJcbiAgcmV0dXJuIGRlZmluZUNvbmZpZyh7XHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHZpdGVTdGF0aWNDb3B5KHtcclxuICAgICAgICB0YXJnZXRzLFxyXG4gICAgICB9KSxcclxuICAgICAgLyoqXHJcbiAgICAgICAqIFRoaXMgYnVpbGRzIHRoZSBjbGllbnQgcmVhY3QgYXBwIGJ1bmRsZXMgZm9yIHByb2R1Y3Rpb24sIGFuZCB3cml0ZXMgdGhlbSB0byBkaXNrLlxyXG4gICAgICAgKiBCZWNhdXNlIG11bHRpcGxlIGNsaWVudCBlbnRyeXBvaW50cyAoZGlhbG9ncykgYXJlIGJ1aWx0LCB3ZSBuZWVkIHRvIGxvb3AgdGhyb3VnaFxyXG4gICAgICAgKiBlYWNoIGVudHJ5cG9pbnQgYW5kIGJ1aWxkIHRoZSBjbGllbnQgYnVuZGxlIGZvciBlYWNoLiBWaXRlIGRvZXNuJ3QgaGF2ZSBncmVhdCB0b29saW5nIGZvclxyXG4gICAgICAgKiBidWlsZGluZyBtdWx0aXBsZSBzaW5nbGUtcGFnZSBhcHBzIGluIG9uZSBwcm9qZWN0LCBzbyB3ZSBoYXZlIHRvIGRvIHRoaXMgbWFudWFsbHkgd2l0aCBhXHJcbiAgICAgICAqIHBvc3QtYnVpbGQgY2xvc2VCdW5kbGUgaG9vayAoaHR0cHM6Ly9yb2xsdXBqcy5vcmcvZ3VpZGUvZW4vI2Nsb3NlYnVuZGxlKS5cclxuICAgICAgICovXHJcbiAgICAgIG1vZGUgPT09ICdwcm9kdWN0aW9uJyAmJiB7XHJcbiAgICAgICAgbmFtZTogJ2J1aWxkLWNsaWVudC1wcm9kdWN0aW9uLWJ1bmRsZXMnLFxyXG4gICAgICAgIGNsb3NlQnVuZGxlOiBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnQnVpbGRpbmcgY2xpZW50IHByb2R1Y3Rpb24gYnVuZGxlcy4uLicpO1xyXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXJlc3RyaWN0ZWQtc3ludGF4XHJcbiAgICAgICAgICBmb3IgKGNvbnN0IGNsaWVudEVudHJ5cG9pbnQgb2YgY2xpZW50RW50cnlwb2ludHMpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJ0J1aWxkaW5nIGNsaWVudCBidW5kbGUgZm9yJywgY2xpZW50RW50cnlwb2ludC5uYW1lKTtcclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWF3YWl0LWluLWxvb3BcclxuICAgICAgICAgICAgY29uc3QgYnVpbGRPdXRwdXQgPSBhd2FpdCBidWlsZChcclxuICAgICAgICAgICAgICBjbGllbnRCdWlsZENvbmZpZyh7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRFbnRyeXBvaW50Um9vdDogY2xpZW50RW50cnlwb2ludC5maWxlbmFtZSxcclxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiBjbGllbnRFbnRyeXBvaW50LnRlbXBsYXRlLFxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXHJcbiAgICAgICAgICAgIGF3YWl0IHdyaXRlRmlsZShcclxuICAgICAgICAgICAgICByZXNvbHZlKF9fZGlybmFtZSwgb3V0RGlyLCBgJHtjbGllbnRFbnRyeXBvaW50LmZpbGVuYW1lfS5odG1sYCksXHJcbiAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciAtIG91dHB1dCBpcyBhbiBhcnJheSBvZiBSb2xsdXBPdXRwdXRcclxuICAgICAgICAgICAgICBidWlsZE91dHB1dC5vdXRwdXRbMF0uc291cmNlXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygnRmluaXNoZWQgYnVpbGRpbmcgY2xpZW50IGJ1bmRsZXMhJyk7XHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gICAgYnVpbGQ6IHNlcnZlckJ1aWxkQ29uZmlnLFxyXG4gIH0pO1xyXG59O1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHsgY29tbWFuZCwgbW9kZSB9OiB7IGNvbW1hbmQ6IHN0cmluZzsgbW9kZTogc3RyaW5nIH0pID0+IHtcclxuICBpZiAoY29tbWFuZCA9PT0gJ3NlcnZlJykge1xyXG4gICAgLy8gZm9yICdzZXJ2ZScgbW9kZSwgd2Ugb25seSB3YW50IHRvIHNlcnZlIHRoZSBjbGllbnQgYnVuZGxlIGxvY2FsbHlcclxuICAgIHJldHVybiBjbGllbnRTZXJ2ZUNvbmZpZygpO1xyXG4gIH1cclxuICBpZiAoY29tbWFuZCA9PT0gJ2J1aWxkJykge1xyXG4gICAgLy8gZm9yICdidWlsZCcgbW9kZSwgd2UgaGF2ZSB0d28gcGF0aHM6IGJ1aWxkIGFzc2V0cyBmb3IgbG9jYWwgZGV2ZWxvcG1lbnQsIGFuZCBidWlsZCBmb3IgcHJvZHVjdGlvblxyXG4gICAgcmV0dXJuIGJ1aWxkQ29uZmlnKHsgbW9kZSB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHt9O1xyXG59O1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQ0EsU0FBUyxlQUFlO0FBQ3hCLFNBQXNDLE9BQU8sb0JBQW9CO0FBQ2pFLFNBQVMsWUFBWSxvQkFBb0I7QUFDekMsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsc0JBQXNCO0FBQy9CLFNBQVMsc0JBQXNCO0FBQy9CLFNBQVMsaUJBQWlCO0FBQzFCLE9BQU8sV0FBVztBQVJsQixJQUFNLG1DQUFtQztBQVV6QyxJQUFNLE9BQU87QUFDYixJQUFNLGFBQWE7QUFDbkIsSUFBTSxTQUFTO0FBQ2YsSUFBTSxjQUFjO0FBQ3BCLElBQU0scUJBQXFCO0FBQzNCLElBQU0sbUJBQW1CO0FBQ3pCLElBQU0sbUJBQW1CO0FBRXpCLElBQU0saUJBQWlCLFFBQVEsZ0NBQVM7QUFFeEMsSUFBTSxvQkFBb0I7QUFBQSxFQUN4QjtBQUFBLElBQ0UsTUFBTTtBQUFBLElBQ04sVUFBVTtBQUFBLElBQ1YsVUFBVTtBQUFBLEVBQ1o7QUFDRjtBQUVBLElBQU0sVUFBVSxRQUFRLGtDQUFXLGlCQUFpQjtBQUNwRCxJQUFNLFdBQVcsUUFBUSxrQ0FBVyxrQkFBa0I7QUFDdEQsSUFBTSxVQUFVLFFBQVEsa0NBQVcsa0JBQWtCO0FBRXJELElBQU0sbUJBQWtDO0FBQUEsRUFDdEMsTUFBTTtBQUNSO0FBR0EsSUFBSSxXQUFXLE9BQU8sS0FBSyxXQUFXLFFBQVEsR0FBRztBQUMvQyxtQkFBaUIsUUFBUTtBQUFBLElBQ3ZCLEtBQUssYUFBYSxRQUFRLGtDQUFXLGlCQUFpQixDQUFDO0FBQUEsSUFDdkQsTUFBTSxhQUFhLFFBQVEsa0NBQVcsa0JBQWtCLENBQUM7QUFBQSxFQUMzRDtBQUNGO0FBSUEsSUFBSSxXQUFXLE9BQU8sR0FBRztBQUV2QixtQkFBaUIsUUFBUTtBQUFBLElBQ3ZCLEtBQUssYUFBYSxPQUFPO0FBQUEsSUFDekIsWUFBWTtBQUFBLEVBQ2Q7QUFDRjtB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
