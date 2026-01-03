import { Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { HIMSSetupEndpoint } from '../services-hims/hmis.endpoint';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { CookieStorageService } from 'src/app/core/services/cookie-storage.service';

@Component({
  selector: 'app-add-packages',
  templateUrl: './add-packages.component.html'
})

export class AddPackagesComponent extends BaseComponent<any> {

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,

    private spinner: NgxSpinnerService,
    private cookieSrvc: CookieStorageService,

    private endPoint: HIMSSetupEndpoint,
    private masterEndpoint: MasterEndpoint
  ) { super(injector) };

  @Input() package: any = null;
  @Output() saved: EventEmitter<any> = new EventEmitter<any>();

  timer: any;
  searchLoading: boolean = false;
  searchData: any = [];
  selectedData: any = {
    lab_tests: [],
    consultations: [],
    services: [],
    rooms: []
  };

  counter: number = 1;
  testTerm: any = '';

  discountLimitText: string = "";
  OfferPriceText: string = "";

  override ngOnInit(): void {
    this.initializeForm();

    if (this.package) {

      if (this.package?.consultations.length > 0) {

        this.package.consultations.forEach((item: any) => {
          item['type'] = 'consultations';
          item['showName'] = `${item.labdoctors.name} - ${item.case_type.name}, ${item.is_online ? 'Online' : 'Walk-In'}`
          item['quantity'] = item?.quantity || 1;
          item['totalAmount'] = item.quantity * parseFloat(item.consultation_fee);
          this.onItemSelected(item);
        })
      }

      if (this.package?.lab_tests.length > 0) {

        this.package.lab_tests.forEach((item: any) => {
          item['type'] = 'lab_tests';
          item['showName'] = item.name;
          item['quantity'] = item?.quantity || 1;
          item['totalAmount'] = item.quantity * parseFloat(item.price);
          this.onItemSelected(item);
        })
      }

      if (this.package?.services.length > 0) {

        this.package.services.forEach((item: any) => {
          item['type'] = 'services';
          item['showName'] = item.name;
          item['quantity'] = item?.quantity || 1;
          item['totalAmount'] = item.quantity * parseFloat(item.price);
          this.onItemSelected(item);
        })
      }

      if (this.package?.rooms.length > 0) {

        this.package.rooms.forEach((item: any) => {
          item['type'] = 'rooms';
          item['showName'] = `${item.name} - ${item.room_number}, ${item?.room_type?.name}` ;
          item['quantity'] = item?.quantity || 1;
          item['totalAmount'] = item.quantity * parseFloat(item.charges_per_bed);
          this.onItemSelected(item);
        })
      }

    }
  }

  initializeForm() {
    this.baseForm = this.formBuilder.group({
      name: [this.package?.name || null, Validators.required],
      description: [this.package?.description || null],
      offer_price: [this.package?.offer_price || null, Validators.required],
      total_amount: [this.package?.total_amount || null, Validators.required],
      total_discount: [this.package?.total_discount || null, Validators.required],
      is_disc_percentage: [this.package?.is_disc_percentage || null],
      lab_tests: [[]],
      consultations: [[]],
      services: [[]],
      rooms: [[]],
    });
  }

  getSearches(query: any) {
    clearTimeout(this.timer);
    this.searchData = [];
    
    this.timer = setTimeout(() => {

      this.spinner.show();
      this.searchLoading = true;
      this.subsink.sink = this.endPoint.getAllSearches(query).subscribe((data: any) => {

        if (data.lab_tests?.length > 0) {
          data.lab_tests.map((d: any) => {
            d['showName'] = d.name;
            d['quantity'] = 1;
            d['totalAmount'] = parseFloat(d.price);
            d['type'] = 'lab_tests'; // Add the type field for lab_tests
          });
        }

        if (data.services?.length > 0) {
          data.services.map((d: any) => {
            d['showName'] = d.name;
            d['quantity'] = 1;
            d['totalAmount'] = parseFloat(d.price);
            d['type'] = 'services'; // Add the type field for services
          });
        }

        if (data.rooms?.length > 0) {
          data.rooms.map((d: any) => {
            d['showName'] = `${d.name} - ${d.room_number}, ${d?.room_type?.name}` ;
            d['quantity'] = 1;
            d['totalAmount'] = parseFloat(d.charges_per_bed);
            d['type'] = 'rooms'; // Add the type field for rooms
          });
        }

        if (data.doctor_consultations?.length > 0) {
          data.doctor_consultations.map((d: any) => {
            d['showName'] = `${d.labdoctors.name} - ${d.case_type.name}, ${d.is_online ? 'Online' : 'Walk-In'}`;
            d['quantity'] = 1;
            d['totalAmount'] = parseFloat(d.consultation_fee);
            d['type'] = 'consultations'; // Add the type field for doctor consultations
          });
        }

        // Combine all data into a single array, each with a type field
        this.searchData = [
          ...data.lab_tests,
          ...data.services,
          ...data?.doctor_consultations,
          ...data.rooms
        ];

        this.searchLoading = false;
        this.spinner.hide();

      }, (error)=>{
        this.spinner.hide() ;
        this.showAPIError(error)
      });

    }, 500); // Adjust the delay as needed
  }

  getModel() {
    const model: any = {
      name: this.baseForm.get('name')?.value,
      description: this.baseForm.get('description')?.value,
      offer_price: this.baseForm.get('offer_price')?.value,
      total_amount: this.baseForm.get('total_amount')?.value,
      total_discount: this.baseForm.get('total_discount')?.value,
      is_disc_percentage: this.baseForm.get('is_disc_percentage')?.value || false,
      lab_tests: [],
      consultations: [],
      services: [],
      rooms: []
    };

    // Handling lab_tests
    if (this.selectedData.lab_tests?.length > 0) {
      this.selectedData.lab_tests.forEach((data: any) => {
        model.lab_tests.push({
          lab_test_id: data.id,  // assuming `id` is the unique identifier for lab tests
          quantity: data.quantity || 1  // setting default quantity to 1 if not provided
        });
      });
    }

    // Handling consultations
    if (this.selectedData.consultations?.length > 0) {
      this.selectedData.consultations.forEach((data: any) => {
        model.consultations.push({
          consultation_id: data.id,  // assuming `id` is the unique identifier for consultations
          quantity: data.quantity || 1  // setting default quantity to 1 if not provided
        });
      });
    }

    // Handling services
    if (this.selectedData.services?.length > 0) {
      this.selectedData.services.forEach((data: any) => {
        model.services.push({
          service_id: data.id,  // assuming `id` is the unique identifier for services
          quantity: data.quantity || 1  // setting default quantity to 1 if not provided
        });
      });
    }

    // Handling rooms
    if (this.selectedData.rooms?.length > 0) {
      this.selectedData.rooms.forEach((data: any) => {
        model.rooms.push({
          room_id: data.id,  // assuming `id` is the unique identifier for rooms
          quantity: data.quantity || 1  // setting default quantity to 1 if not provided
        });
      });
    }

    return model;
  }

  override saveApiCall(): void {
    if (this.baseForm.valid) {

      const model = this.getModel();
      model[this.package ? 'last_updated_by' : 'created_by'] = this.cookieSrvc.getCookieData().lab_staff_id;

      if (this.package) {
        model['id'] = this.package.id;
        this.updatePackage(model);
      } else {
        this.savePackage(model);
      }
    } else {
      this.showBaseFormErrors();
    }
  }

  savePackage(model: any) {
    this.subsink.sink = this.endPoint.postPackage(model)?.subscribe((res: any) => {
      this.alertService.showSuccess(`${model.name} saved.`);
      this.saved.emit({})
    }, (error) => {
      this.showAPIError(error)
    })
  }

  updatePackage(model: any) {
    this.subsink.sink = this.endPoint.updatePackage(model)?.subscribe((res: any) => {
      this.alertService.showSuccess(`${model.name} updated.`);
      this.saved.emit({})

    }, (error) => {
      this.showAPIError(error);
    })
  }

  // utilities 

  // Method to update the quantity of an item (increase/decrease)
  changeQuantity(item: any, delta: number): void {
    // Update quantity
    item.quantity = Math.max(1, item.quantity + delta); // Ensure quantity doesn't go below 1

    // Update the totalAmount for that item
    item.totalAmount = item.quantity * (item.price || item.consultation_fee || item.charges_per_bed);

    // Optionally, update the total amount for all selected items
    this.updateTotalAmount();

    this.resetDiscount();
  }

  // Method to calculate the total amount
  totalAmount(): any {
    let total = 0;

    // Sum the total amount for each selected item based on their type
    this.selectedData.lab_tests.forEach((item: any) => total += item.totalAmount);
    this.selectedData.consultations.forEach((item: any) => total += item.totalAmount);
    this.selectedData.services.forEach((item: any) => total += item.totalAmount);
    this.selectedData.rooms.forEach((item: any) => total += item.totalAmount);

    return total;
  }

  // Optionally, use this to update the total amount dynamically when quantity changes
  updateTotalAmount() {
    this.totalAmount(); // Recalculate total amount
  }

  onItemSelected(event: any) {
    // Check the type of the event and push into the corresponding array if not already present
    switch (event.type) {
      case 'lab_tests':
        if (!this.selectedData.lab_tests.some((item: any) => item.id === event.id)) {
          this.selectedData.lab_tests.push(event);
        }else{
          this.alertService.showInfo(`${event.showName} already included.`)
        }
        break;
      case 'consultations':
        if (!this.selectedData.consultations.some((item: any) => item.id === event.id)) {
          this.selectedData.consultations.push(event);
        }else{
          this.alertService.showInfo(`${event.showName} already included.`)
        }
        break;
      case 'services':
        if (!this.selectedData.services.some((item: any) => item.id === event.id)) {
          this.selectedData.services.push(event);
        }else{
          this.alertService.showInfo(`${event.showName} already included.`)
        }
        break;
      case 'rooms':
        if (!this.selectedData.rooms.some((item: any) => item.id === event.id)) {
          this.selectedData.rooms.push(event);
        }else{
          this.alertService.showInfo(`${event.showName} already included.`)
        }
        break;
      default:
        console.log('Unknown type');
        break;
    }

    this.searchData = [] ;
    this.baseForm.get('total_amount')?.setValue(this.totalAmount());
  }

  deleteRow(category: string, index: number): void {
    // Remove the item from the appropriate category in selectedData
    this.selectedData[category].splice(index, 1);
    this.resetDiscount();
  }


  // Function to get the serial number based on category and item index
  getSerialNumber(categoryIndex: number, itemIndex: number): number {
    let serialNumber = 0;

    switch (categoryIndex) {
      case 0: // lab_tests
        serialNumber = 1 + itemIndex;
        break;
      case 1: // consultations
        serialNumber = this.selectedData.lab_tests.length + 1 + itemIndex; // Start from after lab_tests
        break;
      case 2: // services
        serialNumber = this.selectedData.lab_tests.length + this.selectedData.consultations.length + 1 + itemIndex; // Start after consultations
        break;
      case 3: // rooms
        serialNumber = this.selectedData.lab_tests.length + this.selectedData.consultations.length + this.selectedData.services.length + 1 + itemIndex; // Start after services
        break;
      default:
        serialNumber = itemIndex + 1;
        break;
    }

    return serialNumber;
  }


  validatePrice(e: any) {

    if (this.isTestsServicesRoomsAdded()) {
      const priceLimit = parseFloat(this.totalAmount());
      this.discountLimitText = ""
      this.baseForm.get('total_discount')?.setValue("");
      this.baseForm.get('is_disc_percentage')?.setValue(false);

      e.target.value = e.target.value.replace(/[^\d.]/g, '')
      const input_number = e.target.value.replace(/[^\d.]/g, '');

      if (input_number <= 0) {
        this.baseForm.get('offer_price')?.setValue("");
        this.baseForm.get('total_discount')?.setValue("");
        this.OfferPriceText = "";
      } else if (input_number > priceLimit) {
        this.baseForm.get('offer_price')?.setValue(priceLimit?.toFixed(2));
        this.baseForm.get('total_discount')?.setValue(0);
        this.OfferPriceText = "Offer Price can't be more than the Tests Price";
      } else {
        this.baseForm.get('total_discount')?.setValue((priceLimit - input_number)?.toFixed(2));
        this.OfferPriceText = "";
      }

    } else {
      this.baseForm.get('offer_price')?.setValue("");
      this.OfferPriceText = "Select atleast one test/service/room/doctor consultation.";
    }

  }

  formatCurrency(bill: any): any {
    if (bill) {
      const curr = parseInt(bill).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR'
      });
      return curr;
    } else {
      return 0
    }
  }

  validateDiscount(e: any) {

    if (this.isTestsServicesRoomsAdded()) {
      if (!this.baseForm.get('is_disc_percentage')?.value) {
        this.baseForm.get('offer_price')?.setValue("");
        this.OfferPriceText = "";
        const priceLimit = parseFloat(this.totalAmount());

        e.target.value = e.target.value.replace(/[^\d.]/g, '')
        const input_number = e.target.value.replace(/[^\d.]/g, '');

        if (input_number <= 0) {
          this.baseForm.get('total_discount')?.setValue("");
          this.baseForm.get('offer_price')?.setValue("");
          this.OfferPriceText = "";
          this.discountLimitText = ""
        } else if (input_number > priceLimit) {
          this.baseForm.get('total_discount')?.setValue(priceLimit?.toFixed(2));
          this.baseForm.get('offer_price')?.setValue(0);
          this.discountLimitText = "Discount can't be more than the Tests Price"
        } else {
          this.baseForm.get('offer_price')?.setValue((priceLimit - input_number)?.toFixed(2));
          this.discountLimitText = ""
        }
      } else {
        const priceLimit = parseFloat(this.totalAmount());
        this.baseForm.get('offer_price')?.setValue("")

        e.target.value = e.target.value.replace(/[^\d.]/g, '')
        const input_number = e.target.value.replace(/[^\d.]/g, '');

        if (input_number <= 0) {
          this.baseForm.get('total_discount')?.setValue("");
          this.baseForm.get('offer_price')?.setValue("");
          this.discountLimitText = ""
        } else if (input_number > 100) {
          this.baseForm.get('total_discount')?.setValue(100);
          this.baseForm.get('offer_price')?.setValue(0);
          this.discountLimitText = "Maximum Limit Reached"
        } else {
          this.baseForm.get('total_discount')?.setValue(input_number);
          this.discountLimitText = ""
          const amt = priceLimit - (priceLimit * (input_number / 100))
          this.baseForm.get('offer_price')?.setValue(amt.toString().includes(".") ? amt.toFixed(2) : amt)
        }
      }
    } else {
      this.baseForm.get('total_discount')?.setValue("");
      this.discountLimitText = "Add atleast one lab test"
      // this.alertService.showError("", "Add atleast one lab test");
    }
  }

  getDiscount(): number | undefined {
    const totalAmount = parseFloat(this.totalAmount()); // Parse total amount
    const offerPrice = this.baseForm.get('offer_price')?.value || 0; // Get offer price

    if (this.baseForm.get('lab_tests')?.value && totalAmount && offerPrice) {
      const discount = totalAmount - offerPrice; // Calculate discount
      return parseFloat(discount.toFixed(2)) > 0 ? parseFloat(discount.toFixed(2)) : 0; // Return discount with only up to two decimal places
    }

    return 0; // Return undefined if any necessary value is missing
  }

  getPrice() {
    const totalAmount = parseFloat(this.totalAmount()); // Parse total amount
    return totalAmount || 0
  }

  getFormatedVal(num: any) {
    return parseFloat(num.replace(/,/g, ''))
  }

  resetDiscount() {
    this.baseForm.get('total_discount')?.setValue("");
    this.baseForm.get('offer_price')?.setValue("")
  }

  isTestsServicesRoomsAdded() {
    return this.selectedData.lab_tests.length != 0 || this.selectedData.consultations.length != 0 || this.selectedData.services.length != 0 || this.selectedData.rooms.length != 0
  }

}
