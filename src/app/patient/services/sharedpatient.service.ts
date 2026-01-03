import { Injectable } from '@angular/core';
import { BaseSearchService } from 'src/app/shared/base/base.search.service';
import { AddPatientEndpoint } from '../endpoints/addpatient.endpoint';
import { SubSink } from 'subsink';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';
import { LoyaltyCardEndpoint } from 'src/app/loyaltycard/loyaltycard.enpoint';
import { PrintService } from '@sharedcommon/service/print.service';
import { AlertService } from '@sharedcommon/service/alert.service';
import { Router } from '@angular/router';
import { TimeConversionService } from '@sharedcommon/service/time-conversion.service';

@Injectable({
  providedIn: 'root'
})

export class SharedPatientsService extends BaseSearchService {

    subsink = new SubSink();

    constructor(
        private router: Router,
        private endPoint: AddPatientEndpoint,
        private loyaltyCardEndpoint: LoyaltyCardEndpoint,
        private cookieSrvc: CookieStorageService,
        private printSrvc: PrintService,
        private timeSrvc: TimeConversionService,
        private alertService: AlertService
    ) { super() }

    formatCurrency(num : any , showCurr: boolean = false): any{
      if(num){
        const curr = num.toLocaleString('en-IN', {
          style: 'currency',
          currency: 'INR'
        });
        
        if(!showCurr) return curr.substring(1) ;
        return curr;
      }else{
        return "0.00"
      }
    }


    setInputElementFocus(elementId: any){
      setTimeout(()=>{
        const element = document.getElementById(elementId);
        element?.focus();
      }, 100)
    }

    formatToTwoDecimals(value:any) {
      const numberValue = parseFloat(value);
      if (!isNaN(numberValue)) {
          return numberValue.toFixed(2);
      } else {

          throw new Error("Invalid input");
      }
    }
  

    removeDigitsAfterPlus(inputString: string): string {
      const plusIndex = inputString.indexOf("//++");
      if (plusIndex !== -1) {
        return inputString.substring(0, plusIndex);
      } else {
        return inputString;
      }
    }

    sortByAddedOn(labTests: any): any {

        function parseDate(dateString: string): Date {
          // Handle different date formats
          if (dateString.includes('T')) {
            // ISO format
            return new Date(dateString);
          } else {
            // Custom format: "DD-MM-YYYY, h:mmA"
            const [datePart, timePart] = dateString.split(', ');
            const [day, month, year] = datePart.split('-').map(Number);
            const [time, modifier] = timePart.split(/(AM|PM)/);
            let [hours, minutes] = time.split(':').map(Number);
            if (modifier === 'PM' && hours < 12) hours += 12;
            if (modifier === 'AM' && hours === 12) hours = 0;
            return new Date(year, month - 1, day, hours, minutes);
          }
        }
    
        return labTests.sort((a: any, b: any) => {
          const dateA = parseDate(a.added_time).getTime();
          const dateB = parseDate(b.added_time).getTime();
          return dateA - dateB;
        });
    }

    checkPNDT(selectedTests: any, gender: any) {
   
        const hasUltraTest = selectedTests.some((item: any) => {
          if (item.package) {
            return item.package_tests.some((test: any) =>
              test.department.toLowerCase().includes("ultra")
            );
          } else {
            return item.department.toLowerCase().includes("ultra");
          }
        });
    
        if (gender.toString() == "2") {
            return hasUltraTest;
        } else {
            return false;
        }
    
    }

    paidAmountCheck(payModesCount: any, paidAmount: any, secondPaidAmount: any): boolean {
        if (payModesCount === 2) {
          return !!paidAmount || !!secondPaidAmount;
        } else {
          return paidAmount && paidAmount.replace(/[^\d.]/g, '') !== ""
        }
    }

    extractNumbers(input: string): number {
        const trimmedInput = input.trim(); // Remove leading and trailing whitespace
        const numberPattern = /^(\d+(\.\d+)?)/;  // Match digits with optional decimal part, ignoring leading zeros
        const match = trimmedInput.match(numberPattern);
        if (match) {
          return parseFloat(match[1]);
        } else {
          return 0;
        }
    }

    getDateTime() {
      const date = new Date()
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      const seconds = date.getUTCSeconds().toString().padStart(2, '0');
      const milliseconds = date.getUTCMilliseconds().toString().padStart(3, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
    }

    getMultiPaymodesAmount(payModes: any) {
        if (payModes.length === 1) {
          return payModes[0].paid_amount;
        } else {
          return payModes.map((mode: any) => mode.paid_amount).join(' + ');
        }
    }

    getMultiPaymodes(payModes: any) {
        if (payModes.length === 1) {
          return payModes[0].pay_mode;
        } else {
          return payModes.map((mode: any) => mode.pay_mode).join(' and ');
        }
    }

    getStatuses(e: any, all_status: any): any {
        if (e.toLowerCase().includes('authorization pending')) {
          let model = all_status.find((status: any) => status.name === 'Authorization Pending');
          let emerModel = all_status.find((status: any) => status.name === 'Emergency (Authorization Pending)');
    
          if (model && emerModel) {
            return [model, emerModel];
          }
        }
        else if (e.toLowerCase().includes('pending')) {
          let model = all_status.find((status: any) => status.name === 'Pending');
          let emerModel = all_status.find((status: any) => status.name === 'Emergency (Pending)');
    
          if (model && emerModel) {
            return [model, emerModel];
          }
        }
        else if (e.toLowerCase().includes('processing')) {
          let model = all_status.find((status: any) => status.name === 'Processing');
          let emerModel = all_status.find((status: any) => status.name === 'Emergency (Processing)');
    
          if (model && emerModel) {
            return [model, emerModel];
          }
        }
        else if (e.toLowerCase().includes('sample')) {
          let model = all_status.find((status: any) => status.name === 'Sample Collected');
          let emerModel = all_status.find((status: any) => status.name === 'Emergency (Sample Collected)');
          if (model && emerModel) {
            return [model, emerModel];
          }
        }
    
    }

    getDisLimit(input_number: any, isPercentage: any, user_permissions: any, tests_amt: any, preTestsCost: any, ptn: any) {
    
        if (isPercentage) {
          // Calculate the maximum percentage limit
          if (input_number < user_permissions.number) {
            return 100;
          } else {
            return user_permissions.number;
          }
        } else {
          // Calculate the maximum limit for absolute discount
          const discLimit = (tests_amt + preTestsCost
            - parseFloat(ptn.invoice?.total_discount.replace(/,/g, ''))
            - parseFloat(ptn.invoice?.total_paid.replace(/,/g, ''))
            + parseFloat(ptn.invoice?.total_refund.replace(/,/g, '')))
            * (user_permissions.number / 100);
    
          // Return the calculated maximum limit
          return discLimit;
        }
    }

    updateServiceModel(item: any){
      const model = {
        name: item.name,
        date: this.timeSrvc.decodeTimestamp(item.added_on),
        cost: item.price,
        cost_true: false,
        total: item?.status_id !== "Cancelled" ? item.price : item.price,
        added_on: this.timeSrvc.decodeTimestamp(item.added_on),
        canRemove: false,
        department: item?.department ? item.department : ""
      }

      return model ;
    }

    updateMedicineModel(item: any, updateBool: boolean ){
      const model: any = {
        stock: item, 
        is_strips: updateBool ? item?.is_strips : false,
        quantity: updateBool ? item.userQuantity : 1,
        total_med_bill: 0,
        added_on: updateBool ? this.timeSrvc.decodeTimestamp(item.added_on) : this.timeSrvc.getCurrentDateTime(),
        canRemove: !updateBool
      }

      return model ;
    }

    // *****************
    // API RESPONSE HERE 
    // *****************

    printCard(e: any) {
        const model = {
          membership_id: e.id,
          client_id: this.cookieSrvc.getCookieData().client_id
        }
    
        this.subsink.sink = this.loyaltyCardEndpoint.PostnGetCardPrint(model).subscribe((res: any) => {
          this.printSrvc.printer(res.html_content);
        }, (error) => {
            this.showAPIError(error) ;
        //   this.alertService.showError("Failed to get print.", error?.error?.Error || error?.error?.error || error)
        })
    }


    print_patient_refund_slip(refund: any, ptnId: any) {
        const model = {
          client_id: this.cookieSrvc.getCookieData().client_id,
          patient_id: ptnId,
          refund_id: refund.id,
          printed_by: this.cookieSrvc.getCookieData().lab_staff_id
        }
    
        this.subsink.sink = this.endPoint.PostAndGetPatientRefundSlip(model).subscribe((data: any) => {
          this.printSrvc.print(data.html_content)
        }, (error) => {
        //   this.alertService.showError(error)
            this.showAPIError(error) ;
        })
    }


    serverErrors(error: any, name: any) {
      if(error?.error?.email){
        this.alertService.showError(error?.error?.email[0])
      }else if (error?.error[0]?.includes("already") && error?.error[0]?.includes("Patient")) {
        this.alertService.showError( name + " Patient Already Registered Today.")
      } else if(error?.error[0]?.includes("Please Save Again")){
        this.alertService.showError("", "Please Save Again.")
      } else if(error?.error[0]?.includes("already") && error?.error[0]?.includes("Card")){
        this.alertService.showError("Privilege Card Benefits for Lab Tests already used! Please remove Card!")
      } else {
        this.alertService.showError(error.error[0]);
      }
    }

    getAddedOnTime(Ymd: any) {
      const date = new Date(); // Get the current date and time
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${Ymd}T${hours}:${minutes}:${seconds}`;
    }



  // utilities 
  showAPIError(error: any) {
      this.alertService.showError(error?.error?.Error || error?.error?.error || error)
  }

  newSessionReceiptPrint(ptnId: any, staffId: any) {
    return new Promise((resolve, reject)=>{
      this.subsink.sink = this.endPoint.getPaymentHistory(ptnId).subscribe((data: any) => {

        const model = {
          patient_id: ptnId,
          client_id: this.cookieSrvc.getCookieData().client_id,
          receipt_id: data[data.length - 1].id,
          printed_by: staffId || this.cookieSrvc.getCookieData().lab_staff_id,
        }
  
        this.subsink.sink = this.endPoint.getPatientPrintReport(model).subscribe((response: any) => {
          this.printSrvc.printRcpts(response.html_content);
          resolve({})
        }, (error: any) => {
          resolve({})
          this.showAPIError(error);
          this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptnId } });
        })
      }, (error) => {
        resolve({})
        this.alertService.showError("Failed to get receipt information", "");
        this.router.navigate(['/patient/patient_standard_view/'], { queryParams: { patient_id: ptnId } });
      })
    })
  }

}