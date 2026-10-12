import { Component } from '@angular/core';

import { PageHeaderComponent } from '../theme/shared/components/page-header/page-header.component';
@Component({
  imports: [PageHeaderComponent],
  selector: 'app-providers',
  standalone: true,
  templateUrl: './providers.component.html',
  styleUrls: ['./providers.component.css']
})
export class ProvidersComponent {}
