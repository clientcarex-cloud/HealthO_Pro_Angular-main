import { Component, Injector } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { StateModel } from '../../models/state.model';
import { StateService } from '../../services/state.service';
import { StateEndpoint } from '../../endpoints/state.endpoint';
import { BaseComponent } from 'src/app/shared/base/base.component';
import { CountryEndpoint } from '../../endpoints/country.endpoint';
import { CountryModel } from '../../models/country.model';

@Component({
  selector: 'app-state',
  templateUrl: './state.component.html',
  styleUrls: ['./state.component.scss'],
  providers: [StateService]
})
export class StateComponent extends BaseComponent<StateModel> {

  constructor(
    injector: Injector,
    public service: StateService,
    private formBuilder: FormBuilder,
    private endPoint: StateEndpoint,
    private countryEndPoint: CountryEndpoint) {
    super(injector);
  }

  override ngOnInit(): void {
    /** Form Validation **/
    this.baseForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      country: ['', [Validators.required]]
    });

    this.dataList$ = this.service.states$;
    this.total$ = this.service.total$;

    this.subsink.sink = this.endPoint.getStates().subscribe((data) => {
      this.service.states = data;
    });

    this.countryEndPoint.getActiveCountries().subscribe((data) => {
      this.countries = data;
    });
  }

  override clearData(): void {
    if (this.isNewRecord) {
      this.modalTitle = "Add State";
    } else {
      this.modalTitle = "Update State";
    }
  }

  override setFormValues(data: any): void {
    this.baseForm.get('name')?.setValue(data.name);
    this.baseForm.get('country')?.setValue(data.country);
  }

  /**
  * save state
  */
  override saveApiCall(): void {
    const name = this.baseForm.get('name')?.value;
    const country = this.baseForm.get('country')?.value;

    this.subsink.sink = this.endPoint.addState(name, country).subscribe((response) => {
      if (this.handleApiResponse(response, `State (${name}) added successfully.`)) {
        this.service.addState("", name, country);
      }
    });
  }

  /**
  * update state
  */
  override updateApiCall(): void {
    const name = this.baseForm.get('name')?.value;
    const country = this.baseForm.get('country')?.value;

    this.subsink.sink = this.endPoint.updateState(name, this.oldItemName, country).subscribe((response) => {
      if (this.handleApiResponse(response, `State (${name}) updated successfully.`)) {
        this.service.updateState(name, this.oldItemName, country);
      }
    });
  }

  /**
  * Update state staus
  */
  updateStateStatus(data: any) {
    this.subsink.sink = this.endPoint.updateStateStatus(data).subscribe(response => {
      if (!this.handleApiResponse(response, `State (${data.name}) status updated successfully.`)) {
        data.status = !data.status;
      }
    }, (err) => {
      data.status = !data.status;
    });
  }

  /**
  * delete state
  */
  override deleteApiCall(model: any) {
    this.subsink.sink = this.endPoint.deleteState(model).subscribe((response) => {
      if (this.handleApiResponse(response, `State (${model.name}) deleted successfully.`)) {
        this.service.deleteState(model.name);
      }
    });
  }

  /**
  * Loading countries
  */
  countries: CountryModel[] = [];
}
