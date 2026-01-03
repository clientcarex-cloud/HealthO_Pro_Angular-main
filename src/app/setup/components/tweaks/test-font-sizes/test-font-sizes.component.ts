import { Component, Injector } from '@angular/core';
import { BaseComponent } from '@sharedcommon/base/base.component';
import { MasterEndpoint } from 'src/app/setup/endpoint/master.endpoint';

@Component({
  selector: 'app-test-font-sizes',
  templateUrl: './test-font-sizes.component.html',
})

export class TestFontSizesComponent extends BaseComponent<any>{

  constructor(
    injector: Injector,
    private endPoint: MasterEndpoint
  ){ super(injector) }

  timer: any ;
  fontSizes: any = [] ;
  alignments: any = [
    { value: 'left', label: "Left"},
    { value: 'center', label: "Center"},
    { value: 'right', label: "Right"},
  ]
  fontWeights: any = [
    { value: 100, label: 'Thin' },
    { value: 200, label: 'Extra Light' },
    { value: 300, label: 'Light' },
    { value: 400, label: 'Normal' },
    { value: 500, label: 'Medium' },
    { value: 600, label: 'Semi Bold' },
    { value: 700, label: 'Bold' },
    { value: 800, label: 'Extra Bold' },
    { value: 900, label: 'Black' }
  ];
  

  settings: any ;
  override ngOnInit(): void {

    for( let i = 5; i < 22 ; i++){
      const model = {
        value: i,
        label: `${i} px`
      }

      this.fontSizes.push(model) ;
    }

    this.getData();

  }

  getData(){
    this.subsink.sink = this.endPoint.getTestFontSizes().subscribe((res: any)=>{
      this.settings = res[0] ;
    })
  }

  updateSettings(){
    this.subsink.sink = this.endPoint.updateTestRepotFontSize(this.settings)?.subscribe((res: any)=>{
      this.alertService.showSuccess('Saved.') ;
      this.settings = res ;
    }, (error)=>{
      this.showAPIError(error);
    })
  }


  changeValue(event: any, type: any){
    this.settings[type] = event.value ;

    clearTimeout(this.timer) ;
    this.timer = setTimeout(() => {
      this.updateSettings();
    }, 500);
  }

  changeDisplayName(event: any, type: any){
    
    this.settings[type] = event ;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.updateSettings();
    }, 500);
  
  }

  returnParamterStyle(){
    const style = `font-weight: ${this.settings.parameter_weight}; font-size: ${this.settings.parameter_size}px`
    return style;
  }
}
