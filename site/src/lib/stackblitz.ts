import sdk, { Project } from "@stackblitz/sdk";

const isProduction = true;

const project: Project = {
  title: "title",
  description: "description",
  template: "html",
  files: {
    "index.html": "hi",
    "index.js": "hi",
  },
  dependencies: {
    "date-fns": "^2", // If production deployment, use distributed NPM package, else if development, don't need any deps - include local built files
  },
};

export function openProject() {
  sdk.openProject(project, {
    openFile: "index.js",
  });
}
