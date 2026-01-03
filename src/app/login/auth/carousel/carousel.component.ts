import { Component, OnInit } from '@angular/core';
import { AppAuthService } from 'src/app/core/services/appauth.service';


@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  constructor(private appAuth: AppAuthService) { }

  ngOnInit(): void {

    this.getPics();
  }
  
    pics: any[] = [];
  
    getPics(){
      this.appAuth.getSliders().subscribe(
        Response =>{
          this.pics = Response.results; 
        },(error)=>{

        }
      )
    }

}
