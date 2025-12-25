import {inject, Injectable} from "@angular/core";
import { ToastrService } from "ngx-toastr";
import {MessageService} from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class NotificationService
{
    private static instance: NotificationService;

  // messageService =  inject(MessageService)
    constructor(private toastr: ToastrService, private messageService: MessageService) {
        NotificationService.instance = this;
    }

    public static successMessage(message: string, title: string)
    {
        NotificationService.instance.toastr.success(message, title);
    }

    public static errorMessage(message: string, title: string)
    {
        NotificationService.instance.toastr.error(message, title);
    }

    public static infoMessage(message: string, title: string)
    {
        NotificationService.instance.toastr.info(message, title);
    }

    public static warningMessage(message: string, title: string)
    {
        NotificationService.instance.toastr.warning(message, title);
    }

    public static success(message: string, title?:string)
    {
      NotificationService.instance.messageService.add({
        severity: 'success',
        summary: title || 'Success',
        detail: message,
        life: 5000
      });
    }

    public static error(message: string, title?:string)
    {
        // this.toastr.error(message,title);

      NotificationService.instance.messageService.add({
        severity: 'error',
        summary: title || 'Error',
        detail: message,
        life: 5000
      });
    }

    public static warning(message: string)
    {
        NotificationService.instance.toastr.warning(message);
    }

    public static info(message: string)
    {
        NotificationService.instance.toastr.info(message);
    }

    // Instance methods for backward compatibility
    public successMessage(message: string, title: string) { NotificationService.successMessage(message, title); }
    public errorMessage(message: string, title: string) { NotificationService.errorMessage(message, title); }
    public infoMessage(message: string, title: string) { NotificationService.infoMessage(message, title); }
    public warningMessage(message: string, title: string) { NotificationService.warningMessage(message, title); }
    public success(message: string, title?:string) { NotificationService.success(message, title); }
    public error(message: string, title?:string) { NotificationService.error(message, title); }
    public warning(message: string) { NotificationService.warning(message); }
    public info(message: string) { NotificationService.info(message); }
}
