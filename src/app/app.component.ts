import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MycanvasComponent } from "./mycanvas/mycanvas.component";

@Component({
  selector: 'app-root',
  imports: [MycanvasComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-grafos';
}
