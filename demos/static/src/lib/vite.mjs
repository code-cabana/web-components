/*
  Vite plugin
  Refresh the page if anything in public directory changes
  
  Needed to watch changes to webcomponents/dist js files
  imported via script tags
  
  https://vitejs.dev/guide/api-plugin.html#handlehotupdate
*/
export function watchPublic() {
  const pathMatch =
    "web-components/demos/static/public/web-components/dist/browser/";
  return {
    name: "custom-hmr",
    enforce: "post",
    handleHotUpdate({ file, server }) {
      if (file.includes(pathMatch)) {
        server.ws.send({
          type: "full-reload",
          path: "*",
        });
      }
    },
  };
}
