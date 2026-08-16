import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss'
})
export class StatCardComponent {
  title = input<string>('');
  value = input<string>('');
  icon = input<string>('pi pi-chart-bar');
  iconColorClass = input<string>('icon-blue');
  subtitle = input<string>('');
  badgeText = input<string>('');
  badgeClass = input<string>('badge-up');
  highlight = input<boolean>(false);
}
