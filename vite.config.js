import { defineConfig } from 'vite';
import url from 'url';
import path from 'path';

// Vite plugin to execute Vercel-style /api/ serverless functions locally
function vercelApiDevPlugin() {
  return {
    name: 'vercel-api-dev-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url.startsWith('/api/')) {
          try {
            const parsedUrl = new url.URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const apiName = parsedUrl.pathname.replace('/api/', '').split('?')[0];
            const apiFilePath = path.resolve(process.cwd(), 'api', `${apiName}.js`);

            const module = await import(`file://${apiFilePath}?t=${Date.now()}`);
            const handler = module.default || module;

            // Mock Vercel req.query & req.headers
            req.query = Object.fromEntries(parsedUrl.searchParams.entries());

            // Polyfill helper methods if missing
            res.status = function (statusCode) {
              res.statusCode = statusCode;
              return res;
            };
            res.json = function (jsonBody) {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(jsonBody));
              return res;
            };
            res.send = function (data) {
              if (typeof data === 'object' && !Buffer.isBuffer(data)) {
                return res.json(data);
              }
              res.end(data);
              return res;
            };

            await handler(req, res);
            return;
          } catch (err) {
            console.error('Local API Dev Handler Error:', err.message);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Local API server error: ' + err.message }));
            return;
          }
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [vercelApiDevPlugin()],
});
