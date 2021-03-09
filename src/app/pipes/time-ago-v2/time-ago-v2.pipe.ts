import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';


@Pipe({
  name: 'timeAgoV2'
})
export class TimeAgoV2Pipe implements PipeTransform {

  transform(value: any, ...args) {
    // let timestamp = new Date(value);
    // let date = new Date(timestamp);
    // console.log("FIRST VALUE",value)
    value = moment(value).subtract(13, "hours")
    // value  = moment(value).tz(environment.server_timezone).format("MMM DD, YYYY hh:mm A");
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const thisMonth = monthNames[(new Date(value)).getMonth()];
    const thisDay = new Date(value).getDate();
    const thisYear = new Date(value).getFullYear();
    if (value) {
      let seconds = Math.floor((+new Date() - +new Date(value)) / 1000);
      // console.log("NEW DATE VALUE", new Date(value))
      // console.log("NEW DATE", new Date())
      // console.log("SECONDS: ", seconds)
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
            return counter + i + ''; 
          }
        }
      }
    }
    return value;
    // return result;
  }

}
