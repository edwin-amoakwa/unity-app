import {inject, Injectable} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import {MessageService} from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class NotificationService
{
  // messageService =  inject(MessageService)
    constructor(private toastr: ToastrService, private messageService: MessageService) { }

    public successMessage(message: string, title: string)
    {
        this.toastr.success(message, title);
    }

    public errorMessage(message: string, title: string)
    {
        this.toastr.error(message, title);
    }

    public infoMessage(message: string, title: string)
    {
        this.toastr.info(message, title);
    }

    public warningMessage(message: string, title: string)
    {
        this.toastr.warning(message, title);
    }

    public success(message: string)
    {
        this.toastr.success(message);
    }

    public error(message: string, title?:string)
    {
        // this.toastr.error(message,title);

      this.messageService.add({
        severity: 'error',
        summary: title || 'Error',
        detail: message
      });
    }



    public warning(message: string)
    {
        this.toastr.warning(message);
    }

    public info(message: string)
    {
        this.toastr.info(message);
    }

}
