import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlainComponent } from './theme/layout/plain/plain.component';
import { SenderIdComponent } from './sender-id/sender-id.component';
import { AuthGuard } from './core/auth.guard';
import { PaymentsComponent } from './payments/payments.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { PasswordResetComponent } from './auth/password-reset/password-reset.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ProvidersComponent } from './providers/providers.component';

// Eagerly loaded (no lazy loading)
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { ApplicationsComponent } from './applications/applications.component';
import { DistributionGroupsComponent } from './distribution-groups/distribution-groups.component';
import { SmsComponent } from './sms/sms.component';
import { SmsRecordsComponent } from './sms-records/sms-records.component';
import { ProfileComponent } from './profile/profile.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'sender-id', component: SenderIdComponent },
      { path: 'add-funds', component: PaymentsComponent },

      { path: 'providers', component: ProvidersComponent },
      { path: 'users', component: UsersComponent },
      { path: 'applications', component: ApplicationsComponent },
      { path: 'group-contacts', component: DistributionGroupsComponent },
      { path: 'send-sms', component: SmsComponent },
      { path: 'sms-records', component: SmsRecordsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'update-password', component: UpdatePasswordComponent },
    ]
  },
  {
    path: '',
    component: PlainComponent,
    children: [
      { path: 'password-reset', component: PasswordResetComponent },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutes {}
