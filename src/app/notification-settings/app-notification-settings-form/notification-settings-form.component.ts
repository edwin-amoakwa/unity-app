
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputSwitchModule } from 'primeng/inputswitch';
import {CoreModule} from '../../core/core.module';


@Component({
  selector: 'app-notification-settings-form',
  standalone: true,
  imports: [CoreModule, InputSwitchModule],
  templateUrl: './notification-settings-form.component.html',
  styleUrls: ['./notification-settings-form.component.scss']
})
export class NotificationSettingsFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() value: any | null = null;
  @Output() submitted = new EventEmitter<any>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [''],
      merchantId: [{ value: '', disabled: true }],
      recipientNumber: [''],
      recipientEmail: ['', [Validators.email]],
      recipientEmailCc: ['', [Validators.email]],
      recipientEmailBcc: ['', [Validators.email]],
      enabled: [false]
    });

    if (this.value) {
      this.form.patchValue(this.value);
    }
  }

  onSubmit() {
    if (this.form.valid) {
      const raw = this.form.getRawValue();
      this.submitted.emit({
        id: raw.id,
        merchantId: raw.merchantId,
        recipientNumber: raw.recipientNumber,
        recipientEmail: raw.recipientEmail,
        recipientEmailCc: raw.recipientEmailCc,
        recipientEmailBcc: raw.recipientEmailBcc,
        enabled: raw.enabled
      });
    } else {
      Object.keys(this.form.controls).forEach(k => this.form.get(k)?.markAsTouched());
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
}
