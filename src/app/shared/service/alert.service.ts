import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root'
})

export class AlertService {

    constructor(private toastr: ToastrService) { }

    showSuccess(message: string, title: string = "") {
        this.toastr.success(message, title)
    }

    showError(message :any, title: any = "",showTitle=true) {
        if(typeof message == 'object'){
            showTitle ? this.toastr.error(message.statusText, title) : this.toastr.error(title)
        }else if(typeof title == 'object'){
            showTitle ? this.toastr.error(message, title.statusText) : this.toastr.error(title)
        }else if(typeof message == 'object' && typeof title == 'object'){
            showTitle ? this.toastr.error(message.statusText, title.statusText) : this.toastr.error(title)
        }else{
            showTitle ? this.toastr.error(message, title) : this.toastr.error(title)
        }
    }

    showInfo(message: string, title: string = "") {
        this.toastr.info(message, title)
    }

    showWarning(message: string, title: string = "Oops !") {
        this.toastr.warning(message, title)
    }
}