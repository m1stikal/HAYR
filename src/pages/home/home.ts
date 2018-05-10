import { Component,ViewChild } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import {ListPage} from '../../pages/list/list';
import {AngularFireAuth} from 'angularfire2/auth';
import { AngularFireDatabase} from 'angularfire2/database';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  @ViewChild('WeeklyCanvas') WeeklyCanvas;
 
  uid = '/daydata/';
  hist_dep: Array<{date: string, score: number}>;
  hist_man: Array<{date: string, score: number}>;

  constructor(private afAuth: AngularFireAuth, private afDatabase: AngularFireDatabase,
    public navCtrl: NavController) {
      
      this.afDatabase.list(this.uid);
      this.hist_dep =[];
      this.hist_man = [];

  }
  ionViewWillLoad(){
    this.afAuth.authState.subscribe(data =>{
      this.uid = '/daydata/'+data.uid+'/';
      this.getHistoricData(7);//Parameter specifies number of days to gather data for
    });
  }

  questions(){
    this.navCtrl.push(ListPage);
  
  }
  getHistoricData(days){
    var dates = new Array();
    var dt = new Date();


    console.log(this.uid);
    let man_snapshot = function(snapshot){
      var dayscore = 0;
      if (snapshot.val()){
      snapshot.val().forEach((state) => {
        dayscore = dayscore + state;//do something creative with data

      }) 
      }
      this.hist_man.push({date : snapshot.ref.path.pieces_[2], score : dayscore});
      this.hist_man.sort(function(a, b){
        var keyA = new Date(a.date),
            keyB = new Date(b.date);
        // Compare the 2 dates
        if(keyA < keyB) return -1;
        if(keyA > keyB) return 1;
        return 0;
      });
      console.log(this.hist_man);

    }

    let dep_snapshot = function(snapshot){
      var dayscore = 0;
      if (snapshot.val()){
      snapshot.val().forEach((state) => {
        dayscore = dayscore + state; //do something creative with data
        
      }) 
      }
      this.hist_dep.push({date : snapshot.ref.path.pieces_[2], score : dayscore});
      this.hist_dep.sort(function(a, b){
        var keyA = new Date(a.date),
            keyB = new Date(b.date);
        // Compare the 2 dates
        if(keyA < keyB) return -1;
        if(keyA > keyB) return 1;
        return 0;
      });
      console.log(this.hist_dep);

    }

    man_snapshot = man_snapshot.bind(this);
    dep_snapshot = dep_snapshot.bind(this);

    for (var i = 0; i < days; i++) {
      dates.push(this.formatDate(dt));
      dt.setDate(dt.getDate() - 1);

      var loc_man_state = this.afDatabase.database.ref(this.uid+dates[i]+'/man/');
      loc_man_state.on('value', man_snapshot);
    
      var loc_dep_state = this.afDatabase.database.ref(this.uid+dates[i]+'/dep/');
      loc_dep_state.on('value', dep_snapshot);
    }
    console.log(this.hist_dep);
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
  
  

}
