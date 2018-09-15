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

  ngOnInit() {
    this.getData();
  }

  alertId(id :any) {
    alert(id);
  };

  getData() {
    return this.http.get("http://localhost:3000/find")
      .subscribe(data => {
        this.res = data;
        console.log(this.res);
      });
  };

}
