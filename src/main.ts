import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { CQModule } from './app/cq/cq.module'; 

platformBrowserDynamic()
  .bootstrapModule(CQModule)
  .catch((err) => console.error(err));
