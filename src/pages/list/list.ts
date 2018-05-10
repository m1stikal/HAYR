import { Component, state } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFireDatabase, AngularFireList } from 'angularfire2/database';
import {AngularFireAuth} from 'angularfire2/auth';
import {man_checks,dep_checks,checkStates,checkColor} from './qnames';

@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {
  selectedItem: any;
  uploadCount = 0; 
  dep_items: Array<{title: string, status: string, state: number, color: string}>;
  man_items: Array<{title: string, status: string, state: number, color: string}>;
  day_items: Array<{title: string, status: string, state: number, color: string}>;
  dep_state = [];
  man_state =[];
  newDayItem = '' ;
  theDay: String  = this.formatDate(Date());
  pickedDate: String  = this.formatDate(Date());
  uid = '/daydata/';
  testVal = '';
  man_items_loaded = false;
  dep_items_loaded = false;


  constructor(private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase,
    public navCtrl: NavController, public navParams: NavParams) {

    
    // for (let i = 0; i < 16; i++) {
    //   this.man_items.push({
    //     title: man_checks[i],
    //     status: 'No',
    //     state: 1,
    //     color: 'secondary'

    //   });
    //}
    this.man_items = [];
    this.dep_items = [];
  
    this.day_items = [];
    
    this.afDatabase.list(this.uid);


  }
  upload(toDate){
    var up_dep = [];
    var up_man = [];
    for (var i = 0; i < this.dep_items.length; i++) {
      up_dep.push(this.dep_items[i].state)
    }
    for (var i = 0; i < this.man_items.length; i++) {
      up_man.push(this.man_items[i].state)
    }
    this.afDatabase.database.ref(this.uid+'/'+toDate).set({dep: up_dep,man:up_man}).then(_ => {
      console.log('Data Uploaded to ' + toDate);
      console.log('new date set from ' + this.theDay + ' to ' + this.pickedDate);
      this.theDay = this.pickedDate;});
  }
  
  itemTapped(event, item) {
    item.state += 1;
    if (item.state > 3) {
      item.state=1;
    }
    item.status = checkStates[item.state];
    item.color =  checkColor[item.state];
  
  this.uploadCount += 1;
  if (this.uploadCount>5){
    this.upload(this.theDay);
    this.uploadCount = 0;
  }
  }
  addNewAction(){
    
    this.day_items.push({
      title: this.newDayItem,
      status: 'No',
      state: 1,
      color: 'danger'
    });
  }

  dailyCheck(event, item) {
    item.state += 1;
    if (item.state > 3) {
      item.state=1;
    }
    item.status = checkStates[item.state];
    item.color =  checkColor[item.state];
  
  this.uploadCount += 1;
  if (this.uploadCount>5){
    this.upload(this.theDay);
    this.uploadCount = 0;
  }
  }
  ionViewWillLoad(){
    this.afAuth.authState.subscribe(data =>{
      this.uid = '/daydata/'+data.uid+'/';
      this.getStates(this.theDay);
    });
    }
    
  
  public formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
  
  public getStates(dateIn){



    let man_snapshot = function(snapshot){
      if (snapshot.val()){
        this.man_items = [];
      snapshot.val().forEach((state,index) => {
        this.man_items.push({
        title: man_checks[index],
       status: checkStates[state],
       state: state,
       color: checkColor[state]
      })
    });
    this.man_items_loaded =true;
    } else {
      this.man_items = [];
    man_checks.forEach((name)=>{
      this.man_items.push({
        title: name,
        status: checkStates[1],
        state: 1,
        color: checkColor[1]
      })
    });
    this.man_items_loaded =true;
    }
    }

    let dep_snapshot = function(snapshot){
      if (snapshot.val()){
        this.dep_items = [];
      snapshot.val().forEach((state,index) => {
        this.dep_items.push({
        title: dep_checks[index],
       status: checkStates[state],
       state: state,
       color: checkColor[state]
      })
    });
    this.dep_items_loaded =true;
    } else {
      this.dep_items = [];
    dep_checks.forEach((name)=>{
      this.dep_items.push({
        title: name,
        status: checkStates[1],
        state: 1,
        color: checkColor[1]
      })
    });
    this.dep_items_loaded =true;
    }
    }

    man_snapshot = man_snapshot.bind(this);
    dep_snapshot = dep_snapshot.bind(this);
    var loc_man_state = this.afDatabase.database.ref(this.uid+dateIn+'/man/');
    loc_man_state.on('value', man_snapshot);
    
    var loc_dep_state = this.afDatabase.database.ref(this.uid+dateIn+'/dep/');
    loc_dep_state.on('value', dep_snapshot);
  }

  datePicked(){
    this.upload(this.theDay);
    this.man_items_loaded = false;
    this.dep_items_loaded = false;
    this.getStates(this.pickedDate);

    
  }


  

  
}
