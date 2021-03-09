#!/bin/bash

ionic cordova build android --prod --release &&
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore getstylin.jks platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk getstylin &&
zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk platforms/android/app/build/outputs/apk/release/Getstylin-prod-ionic-4-2.1.65.apk