import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

async function prepareApp(): Promise<void> {
  if (environment.mock) {
    const { worker } = await import('./mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  }
}

prepareApp()
  .then(() => {
    // eslint-disable-next-line no-console
    bootstrapApplication(App, appConfig).catch((err) => console.error(err));
  })
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));
