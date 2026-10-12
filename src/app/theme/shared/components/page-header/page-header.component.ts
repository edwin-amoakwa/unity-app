import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

/**
 * Common page header: title, an optional description line below it, and a
 * right-aligned `page-actions` slot.
 *
 * Usage:
 *   <app-page-header title="Sender IDs" description="Register the names your SMS are sent from">
 *     <button page-actions pButton label="New"></button>
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgClass],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;

  // Plain-text line below the title. For richer markup, project content instead.
  @Input() description?: string;

  // PrimeIcons class shown before the title, e.g. "pi pi-send"
  @Input() icon?: string;
}
