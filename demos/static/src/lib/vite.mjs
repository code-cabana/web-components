/*
  Vite plugin
  Refresh the page if any public/web-components/dist/browser
  files change
  
  These files are imported via inline script tags, so vite 
  doesn't know about them
  
  https://vitejs.dev/guide/api-plugin.html#handlehotupdate
*/
export function watchPublic() {
  const pathMatch =
    "web-components/demos/static/public/web-components/dist/browser/";
  return {
    name: "watch-public",
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
