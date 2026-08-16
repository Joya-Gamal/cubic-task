import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss'
})
export class EmptyStateComponent {

  icon = input<string>('pi pi-folder-open');
  title = input<string>('No records found');
  description = input<string>('');
  actionLabel = input<string>('');
  actionIcon = input<string>('');


  actionClick = output<void>();
}
