import {FormControl} from '@angular/forms';

export class EmailValidator {
 public static regex = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
 static checkEmail(control: FormControl){

   console.log("e-mail check");

   var requiredDomains = ["gmail.com","yahoo.com"];
   var lowercaseValue = control.value.toLowerCase();
   var providedDomain = lowercaseValue.substr(lowercaseValue.indexOf('@')+1);
   var returnVal: any;
   

   for (var i = 0; i < requiredDomains.length; i++) {
     if(requiredDomains[i] != providedDomain) {
       returnVal =  {"invalid_domain": true};
       i = requiredDomains.length;
     }
   }
   
   return returnVal;
 }
    static isValid(control: FormControl){
    
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(control.value);

        if (re){
        return null;
        }

        return {"invalidEmail": true};
    }
    static emailValidator(control) {
        var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;  
        if (emailPattern.test(control.value)) {
            return null;
        } else {
            return { 'invalidEmailAddress': true };
        }
    }

}