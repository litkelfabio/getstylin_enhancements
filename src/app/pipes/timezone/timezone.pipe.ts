import { Pipe, PipeTransform } from '@angular/core';
import { environment } from './../../../environments/environment';
import { Platform } from '@ionic/angular';
import * as moment from 'moment-timezone';
@Pipe({
  name: 'timezone'
})
// export class TimezonePipe implements PipeTransform {

//   public plt = Platform;

//   transform(date: Date): any  {
//     var orig_date = new Date(date.toString().replace(' ', 'T'));
//     var invdate = new Date(orig_date.toLocaleString('en-US', {
//       /* timeZone: environment.server_timezone_ios */
//       timeZone: environment.server_timezone
//     }));
//     var diff = orig_date.getTime() - invdate.getTime();
//     return new Date(orig_date.getTime() + diff);
//   }
// }

export class TimezonePipe implements PipeTransform {

  transform(value: string, ...args) {
    // let timestamp = new Date(value);
    // let date = new Date(timestamp);

    // let now = new Date().getTime();

    // let delta = (now - date.getTime()) / 1000;

    // let result;

    // if (delta < 10) {
    //   result = 'now';
    // } else if (delta < 60) { // sent in last minute
    //   result = Math.floor(delta) + 's ago';
    // } else if (delta < 3600) { // sent in last hour
    //   result = Math.floor(delta / 60) + 'm ago';
    // } else if (delta < 86400) { // sent on last day
    //   result = Math.floor(delta / 3600) + 'h ago';
    // } else { // sent more than one day ago
    //   result = Math.floor(delta / 86400) + 'd ago';
    // }

    // return result;



     // let timestamp = new Date(value);
    // let date = new Date(timestamp);
    // console.log("FIRST VALUE",value)
    value  = moment(value).tz(environment.server_timezone).format("MMM DD, YYYY hh:mm A");
    // console.log("TIMEZONE: ",value);
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const thisMonth = monthNames[(new Date(value)).getMonth()];
    const thisDay = new Date(value).getDate();
    const thisYear = new Date(value).getFullYear();
    console.log(thisDay);
    // let now = new Date().getTime();

    // let delta = (now - date.getTime()) / 1000;
    // console.log("datetime: ",date.getTime()/1000);
    // let result;

    // if (delta < 10) {
    //   result = 'now';
    // } else if (delta < 60) { // sent in last minute
    //   result = Math.floor(delta) + 's';
    // } else if (delta < 3600) { // sent in last hour
    //   result = Math.floor(delta / 60) + 'm';
    // } else if (delta < 86400) { // sent on last day
    //   result = Math.floor(delta / 3600) + 'h';
    // } else { // sent more than one day ago
    //   result = Math.floor(delta / 86400) + 'd';
    // }
    
    if (value) {
      const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      if (seconds < 29) // less than 30 seconds ago will show as 'Just now'
        return 'now';
      const intervals = {
        'y': 31536000,
        'M': 2592000,
        'w': 604800,
        'd': 86400,
        'h': 3600,
        'm': 60,
        's': 1
      };
      let counter;
      for (const i in intervals) {
        counter = Math.floor(seconds / intervals[i]);
        if (counter > 0){
         // singular (1 day ago)
          if(i == 'M'){
            return thisMonth + ' ' + thisDay;
          }else if (i == 'y'){
            return thisMonth + ' ' + thisDay + ' ' + thisYear;
          }else{
            if (counter === 1) {
              return counter + i ; // singular (1 day ago)
            } else {
              return counter +  i ; // plural (2 days ago)
            }
          }
        }
      }
    }
    return value;
  }

}
