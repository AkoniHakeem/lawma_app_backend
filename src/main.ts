import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import processEnvObj from './config/envs';
import { Logger, VersioningType } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v1',
  });

  // prefix for api
  app.setGlobalPrefix('v1');

  // enable cors
  app.enableCors({
    origin: '*',
  });

  // update this to serve fronted files in /public/spa
  // Serve static files from /public/spa
  const spaPath = join(__dirname, '..', '/public', 'spa');
  app.use(express.static(spaPath));

  // Serve index.html for SPA routes not handled by the backend
  app.use('*', (req, res, next) => {
    const url = req.originalUrl;

    // Check if the request is for an API route
    if (url.startsWith('/v1')) {
      // This is an API route, pass control to the next middleware
      return next();
    }

    // For all other routes, serve the SPA's index.html
    res.sendFile(join(spaPath, 'index.html'), (err) => {
      if (err) {
        next(err);
      }
    });
  });
  const appName = processEnvObj.PROJECT_NAME || 'Nest Js app';
  const port =
    process.env.PORT ||
    process.env.HTTP_PORT ||
    process.env.SERVER_PORT ||
    '3000';
  await app.listen(port);
  Logger.log('', `${appName} started on port ${port}`);

  // Get the HTTP server instance
  const httpServer = app.getHttpServer();

  // Get the router instance from the HTTP server
  const router = httpServer._events.request._router;

  const availableRoutes: [] = router.stack
    .map((layer) => {
      if (layer.route) {
        return {
          route: {
            path: layer.route?.path,
            method: layer.route?.stack[0].method,
          },
        };
      }
    })
    .filter((item) => item !== undefined);
  Logger.log(availableRoutes, 'Available routes');
}
bootstrap();
