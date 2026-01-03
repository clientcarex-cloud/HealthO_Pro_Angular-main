import { Component, Injector, OnDestroy, OnInit, AfterViewInit } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { NgbModal, NgbModalOptions, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ThemeService } from "ng2-charts";
import { Observable } from "rxjs";

import { SubSink } from "subsink";
import Swal, { SweetAlertIcon, SweetAlertResult } from "sweetalert2";
import { AlertService } from "../service/alert.service";
import { ApiResponse } from "./base.response";
import * as Util from './utils';

@Component({
    template: ''
})

export abstract class BaseComponent<T> implements OnInit, AfterViewInit, OnDestroy {
    breadCrumbItems!: Array<{}>;
    subsink = new SubSink();
    modalRef!: NgbModalRef;
    modalTitle: string = "";

    submitted = false;
    isNewRecord = true;
    baseForm!: UntypedFormGroup;
    baseFormId!: string;

    // Table data
    dataList$!: Observable<T[]>;
    total$!: Observable<number>;
    data!: T[];

    constructor(private injector: Injector) {
        this.baseFormId = this.getRandomString(10);
    }

    ngOnInit(): void {
    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        this.subsink.unsubscribe();

        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    get form() {
        return this.baseForm.controls;
    }

    /**
        Alert Service
     */
    private alertSrvc!: AlertService;
    public get alertService(): AlertService {
        if (this.alertSrvc == null || this.alertSrvc == undefined) {
            this.alertSrvc = this.injector.get(AlertService);
        }

        return this.alertSrvc;
    }

    /**
       Generic api response handling
    */
    handleApiResponse(response: ApiResponse, successMessage: string): boolean {
        if (response && response.isError) {
            this.alertService.showError(response.errorMessage);
            return false;
        }
        else {
            this.closeModal();
            this.alertService.showSuccess(successMessage);
        }

        return true;
    }

    /**
       Modal Service
    */
    private modalSrvc!: NgbModal;
    public get modalService(): NgbModal {
        if (this.modalSrvc == null || this.modalSrvc == undefined) {
            this.modalSrvc = this.injector.get(NgbModal);
        }

        return this.modalSrvc;
    }

    closeModal() {
        if (this.modalRef) {
            this.modalRef.close();
        }
    }

    openModal(content: any, options?: NgbModalOptions): NgbModalRef {
        if (options) {
            options.backdrop = "static";
            return this.modalService.open(content, options);
        }

        return this.modalService.open(content, { size: 'md', centered: true });
    }

    /**
       Sweet Alert Service
    */
    confirmationModal(
        userAction: (result: SweetAlertResult) => void,
        title: string = 'Neuzan',
        text: string = 'Are you Sure You want to delete this record?',
        icon: SweetAlertIcon = 'warning',
        showCancelButton: boolean = true,
        confirmButtonColor: string = '#f46a6a',
        confirmButtonText: string = 'Yes, delete it!',
        cancelButtonText: string = 'Close'
    ): void {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            showCancelButton: showCancelButton,
            confirmButtonColor: confirmButtonColor,
            confirmButtonText: confirmButtonText,
            cancelButtonText: cancelButtonText
        }).then(result => {
            if (userAction !== null) {
                userAction(result);
            }
        });
    }

    /**
        add item
     */
    addItem(content: any, options?: NgbModalOptions): void {
        this.submitted = false;
        this.baseForm.reset();
        this.isNewRecord = true;
        this.clearData();
        this.modalRef = this.openModal(content, options);
    }

    clearData(): void {
    }

    /**
        update item
     */
    oldItemName: string = "";
    updateItem(
        content: any,
        data: any,
        oldItemName: string,
        options?: NgbModalOptions): void {
        this.submitted = false;
        this.baseForm.reset();
        this.isNewRecord = false;
        this.clearData();
        this.setFormValues(data);
        this.oldItemName = oldItemName;
        this.modalRef = this.openModal(content, options);
    }

    setFormValues(data: any): void {
    }

    /**
        save item
     */
    saveItem(): void {
        if (this.baseForm.valid) {
            if (this.isNewRecord) {
                this.saveApiCall();
            } else {
                this.updateApiCall();
            }
        }

        this.submitted = true;
    }

    saveApiCall(): void {
    }

    updateApiCall(): void {
    }

    deleteItem(model: any): void {
        this.confirmationModal((result) => {
            if (result.value) {
                this.deleteApiCall(model);
            }
        });
    }

    deleteApiCall(model: any): void {
    }

    getRandomString(length: number) {
        return Util.getRandomString(length);
    }

    keepOnlyNumbers(val: string) {
        return Util.keepOnlyNumbers(val);
    }

    keepOnlyLetterss(val: string, allowUnderScore: boolean = false) {
        return Util.keepOnlyLetters(val, allowUnderScore);
    }


    showBaseFormErrors(inputForm = this.baseForm) {
        this.submitted = true;
        Object.keys(inputForm.controls).forEach(key => {
            const control = inputForm.get(key);
            if (control && !control.valid) {
                key = key.replace(/_/g, ' ');
                if (key === 'mobile_number') {
                    this.alertService.showError("", `Enter Valid Mobile Number`)
                } else {
                    this.alertService.showError("", `Enter ${this.formatCamelCase(key)}`)
                }
            }
        });
    }

    formatCamelCase(input: string) {
        return input.replace(/[^a-zA-Z0-9\s+.,()-]/g, '') // Remove non-letter, non-digit, and non-space characters except '+'
            .replace(/(^|\s)([a-zA-Z0-9+.,()-])/g, (match, p1, p2) => p1 + p2.toUpperCase()); // Capitalize first letter of each word
    }

    showAPIError(error: any) {
        this.alertService.showError(error?.error?.Error || error?.error?.error || error)
    }

    getFloat(num: any) {
        return parseFloat(num.replace(/,/g, ''))
    }

    numberToCurrency(number: number): string {
        const formattedNumber = new Intl.NumberFormat('en-IN', {
          maximumFractionDigits: 2,
        }).format(number);
        return formattedNumber;
    }

}