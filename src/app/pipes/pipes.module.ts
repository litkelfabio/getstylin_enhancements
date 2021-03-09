import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeAgoV2Pipe } from './time-ago-v2/time-ago-v2.pipe';
import { ToArrayPipe } from './to-array/to-array.pipe';
import { LimitToPipe } from './limit-to/limit-to.pipe';
import { CityStatePipe } from './city-state/city-state.pipe';
import { TimeAgoV3Pipe } from './time-ago-v3.pipe';
import { TimezonePipe } from './timezone/timezone.pipe';


@NgModule({
  declarations: [
    TimeAgoV2Pipe,
    ToArrayPipe,
    LimitToPipe,
    CityStatePipe,
    TimeAgoV3Pipe,
    TimezonePipe,
  ],
  imports: [
    CommonModule
  ],
  exports: [
    ToArrayPipe,
    LimitToPipe,
    TimeAgoV2Pipe,
    CityStatePipe,
    TimeAgoV3Pipe,
    TimezonePipe
	]
})
export class PipesModule { 
  static forRoot(){
		return{
			ngModule: PipesModule,
			providers: []
		}
	}
}
