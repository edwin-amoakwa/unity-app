import { Injectable } from "@angular/core";
import { ToastrService } from "ngx-toastr";

@Injectable({
    providedIn: 'root'
})
export class NotificationService
{
    constructor(private toastr: ToastrService) { }

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
        this.toastr.error(message,title);
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
