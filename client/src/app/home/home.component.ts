import { Component, OnInit } from '@angular/core';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(
    private http: HttpClient
  ) { }

  res : any;
  taak : any;

  ngOnInit() {
    this.getData();
  }

  alertId(id :any) {
    alert(id);
  };

  checkUndefined(vak: any) {
    if(vak.taken == 0) {
      return false;
    } else if(vak.taken != 0) {
      return true;
    } else {
      alert("error");
    }
  }

  getData() {
    return this.http.get("http://localhost:3000/find")
      .subscribe(data => {
        this.res = data;
        console.log(this.res);
      });
  };

}
