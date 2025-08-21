// Angular import
import {Component, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';

// third party import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import {UserSession} from '../../../../../core/user-session';

@Component({
  selector: 'app-nav-right',
  imports: [RouterModule, SharedModule],
  templateUrl: './nav-right.component.html',
  styleUrls: ['./nav-right.component.scss']
})
export class NavRightComponent implements OnInit {


  user:any = UserSession.getUser();

  ngOnInit() {

  }

  logout()
  {
    UserSession.logout();
    window.location.reload();
  }
}
