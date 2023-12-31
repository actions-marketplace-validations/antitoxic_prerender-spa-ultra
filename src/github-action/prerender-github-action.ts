import { Server } from 'node:http';
import * as path from 'node:path';

import * as core from '@actions/core';

import { createStaticFileServer } from '../prerenderer/http-server';
import { preRenderSite } from '../prerenderer/prerender';

void (async () => {
  let httpServer: Server | null = null;
  try {
    const websiteRoot = core.getInput('website_root');
    const maxConcurrentPages = core.getInput('max_concurrent_pages');

    httpServer = createStaticFileServer(websiteRoot);

    const crawled = await preRenderSite({
      startingUrl: 'http://localhost:8080',
      maxConcurrentPages: Number(maxConcurrentPages),
      outputDir: path.join(process.cwd(), websiteRoot),
      extraBrowserLaunchOptions: {
        /**
         * GitHub actions run as root and chrome won't start unless we disable sandboxing
         */
        args: ['--no-sandbox'],
      },
    });

    core.setOutput('crawled', crawled);
  } catch (error) {
    core.setFailed((error as Error).message);
  } finally {
    httpServer?.close();
  }
})();
