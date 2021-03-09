import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse  } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import {CacheService} from 'ionic-cache';
import { AbstractControl } from '@angular/forms';
import { EventsService } from '../events.service';
import { ComponentsService } from '../components/components.service';
import { ApiService } from '../api/api.service';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Instagram } from '@ionic-native/instagram/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import * as watermark from 'watermarkjs';
import { Platform } from '@ionic/angular';
import * as PIXI from 'pixi.js'
// import { EventsService } from '../events.service';

@Injectable({
 providedIn: 'root'
})
export class ShareService {

  constructor(
    public events: EventsService,  
    public file: File,
    public facebook: Facebook,
    public share: SocialSharing,
    public instagram: Instagram,
    public platform: Platform,
  ) { }

  // FILE HANDLING FUNCTIONS
  // Functions are based from a test project.

  // Simply detect the file system then return some directory data.
  // We could chain the directory creation here, since if this resolves,
  // it means that the device storage is accessible.
  async detectFilesystem() {
    return new Promise(resolve => {
      this.file.getFreeDiskSpace().then(response => {
        // console.log('Disk space available: ', response);
        this.createFolder('GetStylin');   // call the directory creator function
        resolve({diskSpace: response});
      }).catch(readDiskSpaceError => {
        resolve(readDiskSpaceError);
      });
    });
  }

  // Do we run this function on first load?
  // Create app data directory in specified location.
  // Will check first if the directory exists; if true, do nothing;
  // if false, create the directory.
  async createFolder(name) {
    let sdcard = this.file.externalRootDirectory;   // maps to the internal SD card (at least for Android)
    // TODO: dynamic directory switching depending on platform
    // since Android and iOS has different directory structures.
    // if (this.platform.is('android')) {
    //   sdcard = this.file.externalRootDirectory;
    // }
    // else if (this.platform.is('ios')) {
    //   // TODO: map one of the suitable directories for iOS
    //   // non-synced? synced?
    // }

    // Check if the folder exists first.
    let path = sdcard + name;
    console.log('Checking folder existence.');
    await this.file.checkDir(sdcard, name).then(response => {
      // This promise will reject if the directory is non-existing, hence
      // we could safely assume that if it returns a non-error response, this
      // means that the directory exists. We could chain the createFile function
      // here, but we only call it if and only if the blob and filename are received by
      // the controller. These two must always be sent together before a file could be
      // created. If no blob or filename is received, simply do nothing.
      return new Promise(resolve => {
        if (response) {
          console.log(path, ': directory exists.');
          resolve({ path: path, status: response });
        }
      })

      // File creation method is moved outside this function.
    }).catch(folderNotExisting => {
      // If the checkDir Promise rejects, create the directory under the path
      // specified using the name given. This will only be called if the checkDir
      // Promise is rejected, and the createDir Promise itself also rejects itself
      // if the directory is already existing in the given path.
      console.log('Error caught: ', folderNotExisting);

      // The createDirectory function
      console.log('Creating directory.');
      return new Promise(resolve => {
        this.file.createDir(sdcard, name, false).then(response => {
          console.log(response);
          resolve({ error: 0, trace: response });
        }).catch(createDirError => {
          console.log('Error creating directory at specified location: ', createDirError);
          resolve({ error: 1, trace: createDirError });
        });
      })
    });
  }

  // This function is for the actual file writes.
  // The check for directory existence is also included here.
  async createFile(path, fileData, fileName) {
    console.log('Creating file with the following params: ', path, fileData, fileName);
    let options: IWriteOptions = { replace: true };
  }

  // WATERMARK ASSETS
  // 72ppi
  public wmSm72:any = 'assets/imgs/watermark/72ppi/gs-wm-sm.png';
  public wmMd72:any = 'assets/imgs/watermark/72ppi/gs-wm-md.png';
  public wmLg72:any = 'assets/imgs/watermark/72ppi/gs-wm-lg.png';

  // 150ppi
  public wmSm150:any = 'assets/imgs/watermark/gs-wm-sm.png';
  public wmMd150:any = 'assets/imgs/watermark/gs-wm-md.png';
  public wmLg150:any = 'assets/imgs/watermark/gs-wm-lg.png';

  // 300ppi
  public wmSm300:any = 'assets/imgs/watermark/300ppi/gs-wm-sm.png';
  public wmMd300:any = 'assets/imgs/watermark/300ppi/gs-wm-md.png';
  public wmLg300:any = 'assets/imgs/watermark/300ppi/gs-wm-lg.png';

  // IMAGE PREPARATION
  // Bind a variable to the canvas; this will be used to reference to its contents later.
  // Moved from prompt-modal controller; returns a Promise containing the base64 data of the original image.
  public target: any;    // target social platform
  public  picasso: any;   // target canvas for adding the filter
  public original: any;  // original image/canvas
  public watermarkDecal: any;  // the watermark size to be used depending on the image size
  async prepareImage(targetPlatform, srcImage, destCanvas) {
    console.log('Sharing to: ', targetPlatform);
    // console.log('img tag from source (unmodded): ', srcImage);
    // console.log("Photo full URL: ", this.item["photo"]);
    // console.log("Photo file name: ", this.item["photo_filename"]);

    // Set target platform.
    this.target = targetPlatform;

    return new Promise(resolve => {
      // Refer to the elements needed.
      // srcImage.setAttribute('crossOrigin', 'anonymous');
      var imagery = srcImage;
      var canvas = destCanvas;

      // console.log('Origin: ', srcImage);
      // console.log('Imagery: ', imagery);
      // console.log('Destination: ', destCanvas);

      imagery.height = srcImage.naturalHeight;
      imagery.width = srcImage.naturalWidth;

      // if (this.platform.is('ios')) {
      //   imagery = srcImage;
      //   // var imagery = srcImage;
      //   console.log('iOS: ', imagery);
      //   // imagery.height = imagery.naturalHeight;
      //   // imagery.width = imagery.naturalWidth;
      //   imagery.parentNode.insertBefore(canvas, imagery);
      // }
      // else {
      //   imagery = new Image();
      //   imagery.crossOrigin = 'anonymous';
      //   imagery.src = srcImage.src;
      //   console.log('Android: ', imagery);
      //   imagery.height = srcImage.naturalHeight;
      //   imagery.width = srcImage.naturalWidth;
      // }

      // var imagery = new Image();
      // imagery.crossOrigin = 'anonymous';
      // srcImage.crossOrigin = 'anonymous';
      // imagery.src = srcImage.src;

      // Prepare image attributes.
      // imagery.setAttribute('crossOrigin', 'anonymous');
      // imagery.crossOrigin = 'anonymous';
      // imagery.height = imagery.naturalHeight;
      // imagery.width = imagery.naturalWidth;


      // Draw the current iamge in the imagery variable to the blank destination canvas.
      // Prepare the canvas.
      imagery.parentNode.insertBefore(canvas, imagery);

      // CHECK IF THESE VALUES ONLY CAUSE ERROR FOR RAW FILES SENT FOR DOWNLOADING.
      // canvas.width = imagery.width;
      // canvas.height = imagery.height;
      console.log('Image dimensions (w, h): ', imagery.width, imagery.height);
      if (imagery.width > 4096 || imagery.height > 4096) {
        // We get only 80% of the image dimension if they exceed 4096 since MAX_TEXTURE_SIZE
        // for Chrome and most GPUs are capped at 4096; greater values will throw an out-of-range
        // error and WebGL/GLFXJS will throw an incomplete framebuffer error.
        canvas.width = imagery.width * 0.8;
        canvas.height = imagery.height * 0.8;

        if (canvas.width > canvas.height) {
          console.log('Using 300ppi small watermark.');
          this.watermarkDecal = this.wmSm300;  // let's set this by default to use the largest watermark size.
        }
        else {
          console.log('Using 300ppi medium watermark.');
          this.watermarkDecal = this.wmMd300;  // let's set this by default to use the largest watermark size.
        }
      }
      else {
        canvas.width = imagery.width;
        canvas.height = imagery.height;

        if (imagery.width > 2000 && imagery.height > 2000) {
          this.watermarkDecal = this.wmSm300;
          console.log('Using 300ppi small watermark.');
        }
        else if (imagery.width > 1500 && imagery.height > 1500) {
          this.watermarkDecal = this.wmSm150;
          console.log('Using 150ppi small watermark.');
        }
        else {
          this.watermarkDecal = this.wmSm72;
          console.log('Using 72ppi small watermark.');
        }
      }

      // Get canvas context then draw the image.
      // context.drawImage(imgSrc, 0, 0, srcRectX, srcRectY, 0, 0, destRectX, destRectY)
      var ctx = canvas.getContext('2d');
      ctx.drawImage(imagery, 0, 0, imagery.naturalWidth, imagery.naturalHeight, 0, 0, canvas.width, canvas.height);

      // Try getting the base64 data from the canvas. If the canvas is empty or undrawn,
      // this will resolve with an error.
      try {
        // this.picasso = canvas;
        this.picasso = canvas;
        var picassoBase64 = this.picasso.toDataURL();
        // console.log('Picasso Base64: ', picassoBase64);
        resolve({error: 0, targetPlatform: this.target, data: picassoBase64}); // the base64 of the source image; unfiltered.
      }
      catch (imagePrepError) {
        resolve({error: 1, trace: imagePrepError});
      }
    });
  }

  // Filter image
  // From API
  public brightness: number;
  public contrast: number;
  public saturation: number;

  // GLFXJS filter variables
  public  glfxBrightness: number = 0;
  public glfxContrast: number = 0;
  public glfxHue: number = 0;
  public glfxSaturation: number = 0;
  async filterImage(cssFilterOptions, imageData, imageElement) {
    // console.log('Filter Image received: ', imageData, imageElement);
    return new Promise(resolve => {
      let filterData = cssFilterOptions;

      this.brightness = this.convertFilterData(filterData['brightness']);
      this.contrast = this.convertFilterData(filterData['contrast']);
      this.saturation = this.convertFilterData(filterData['saturation']);

      // Try to draw a filtering canvas, then sequence in the filter application.
      try {
        var canvas = (<any>window).fx.canvas();
        // if (this.platform.is('ios')) {
        //   canvas.rotate(30 * Math.PI / 180);
        // }

        // Draw the image on the canvas with filters.
        try {
          var imgElement = imageElement;
          var texture = canvas.texture(imgElement);

          // Filter application
          // Resets filter values prior to application.
          this.glfxBrightness = this.brightness;
          this.glfxContrast = this.contrast;
          this.glfxSaturation = this.saturation;

          // Draw the filtered image onto the canvas generated by GLFXJS.
          canvas.draw(texture).hueSaturation(this.glfxHue / 100, this.glfxSaturation / 100).brightnessContrast(this.glfxBrightness / 100, this.glfxContrast / 100).update();

          // Then convert the canvas into a data URL.
          var filteredImageData = canvas.toDataURL();

          // Destroy the texture in order to free up resources.
          texture.destroy();

          // Then resolve this Promise.
          resolve({error: 0, data: filteredImageData});
        }
        catch (applyGlfxFilterError) {
          resolve({error: 1, trace: applyGlfxFilterError, message: 'Cannot apply GLFX filters.'});
        }
      }
      catch (drawGlfxCanvasError) {
        resolve({error: 1, trace: drawGlfxCanvasError, message: 'Cannot create a canvas for filter application.'});
      }
    });
  }

  // Filter data conversion
  convertFilterData(filter) {
    let conversion = (filter * 100) - 100;
    // if (conversion > 70) {
    //   conversion -= 40;
    // }

    return (conversion);
  }

  // IMAGE FILTERING METHOD 2 USING PixiJS
  // This is really promising! If it plays nice in mobile, we will definitely use this
  // instead of GLFX.js. Yay! And Fairy Tail references abound!
  // renderer: any;
  // stage: any;
  public pixiBrightness: number = 0;
  public  pixiContrast: number = 0;
  public  pixiHue: number = 0;
  public pixiSaturation: number = 0;
  fairyDraw(cssFilterOptions?, imageData?, imageElement?) {
    console.log('Image Data: ', imageData);

    // this.pixiBrightness = this.convertFilterData(cssFilterOptions['brightness']);
    // this.pixiContrast = this.convertFilterData(cssFilterOptions['contrast']);
    // this.pixiSaturation = this.convertFilterData(cssFilterOptions['saturation']);

    this.pixiBrightness = parseFloat(cssFilterOptions['brightness']);
    this.pixiContrast = parseFloat(cssFilterOptions['contrast']);
    this.pixiSaturation = parseFloat(cssFilterOptions['saturation']);
    console.log(this.pixiBrightness, this.pixiContrast, this.pixiSaturation);

    return new Promise(resolve => {
      // Canvas sizes
      // let rendererWidth = imageData.naturalWidth;
      // let rendererHeight = imageData.naturalHeight;
      let rendererWidth;
      let rendererHeight;

      if (imageData.naturalWidth > 4096 || imageData.naturalHeight > 4096) {
        // This part is taken from the original GLFX.js-based canvas and filter function.
        rendererWidth = imageData.naturalWidth * 0.8;
        rendererHeight = imageData.naturalHeight * 0.8;
        console.log("Width ", rendererWidth , "Height", rendererHeight)
        if (rendererWidth > rendererHeight) {
          console.log('Using 300ppi small watermark.');
          this.watermarkDecal = this.wmSm300;  // let's set this by default to use the largest watermark size.
        }
        else {
          console.log('Using 300ppi medium watermark.');
          this.watermarkDecal = this.wmMd300;  // let's set this by default to use the largest watermark size.
        }
      }
      else {
        rendererWidth = imageData.naturalWidth;
        rendererHeight = imageData.naturalHeight;
        console.log("Width ", rendererWidth , "Heiaght", rendererHeight)
        if (imageData.naturalWidth > 2000 && imageData.naturalHeight > 2000) {
          this.watermarkDecal = this.wmSm300;
          console.log('Using 300ppi small watermark.');
        }
        else if (imageData.naturalWidth > 1500 && imageData.naturalHeight > 1500) {
          this.watermarkDecal = this.wmSm150;
          console.log('Using 150ppi small watermark.');
        }
        else {
          this.watermarkDecal = this.wmSm72;
          console.log('Using 72ppi small watermark.');
        }
      }

      try {
        // Initialize Pixi renderer with the following parameters.
        // This is the whole PixiJS stage. This will hold the entire Pixi scenario.
        var stage = new PIXI.Container();
        console.log('Stage: ', stage);

        // This is the PixiJS renderer. This will basically create a canvas using the stage in which
        // we could apply textures, sprites, and filters and then have it converted to base64.
        var renderer = PIXI.autoDetectRenderer({
          transparent: true,
          width: rendererWidth,
          height: rendererHeight,
          resolution: 1,
          preserveDrawingBuffer: true
        });
        console.log('Renderer: ', renderer);

        // Draw the source image onto the stage.
        var src = imageData.src;
        var pixSprite = PIXI.Sprite.from(src);
        // Position the sprite in the canvas.
        pixSprite.anchor.x = 0;
        pixSprite.anchor.y = 0;
        pixSprite.position.x = 0;
        pixSprite.position.y = 0;

        // Before adding the stage onto the canvas,
        // apply the filters first IF AND ONLY IF the filters are adjusted.
        if (this.pixiContrast != 1 || this.pixiBrightness != 1 || this.pixiSaturation != 1) {
          var rgbaMatrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
          ]
          // var colorMatrix = new PIXI.filters.ColorMatrixFilter();
          var colorMatrix = new PIXI.filters.ColorMatrixFilter();
          var colorMatrix2 = new PIXI.filters.ColorMatrixFilter();
          var colorMatrix3 = new PIXI.filters.ColorMatrixFilter();
          pixSprite.filters = [colorMatrix, colorMatrix2, colorMatrix3];
          colorMatrix.brightness(this.pixiBrightness, false);
          if(this.pixiContrast > 1){
            colorMatrix2.contrast(this.pixiContrast - 1, false);
          }else if(this.pixiContrast == 1){
            colorMatrix2.contrast(0, false)
          }else{
            colorMatrix2.contrast(this.pixiContrast, false);
          }
          // colorMatrix3.saturate(this.pixiSaturation,false)
          if (this.pixiSaturation == 0) {
              colorMatrix3.greyscale(0.45, false);
              console.log("if")
            }else if(this.pixiSaturation < 1){
              colorMatrix3.greyscale(this.pixiSaturation + 0.05, false)
              console.log("else if")
            }else if(this.pixiSaturation == 1){
              colorMatrix3.saturate(0, false)
            }else{
              colorMatrix3.saturate(this.pixiSaturation - 0.2, false)
            }
          // colorMatrix3.saturate(this.pixiSaturation, false);
          // colorMatrix.matrix = rgbaMatrix;
          // pixSprite.filters = [colorMatrix];
          // colorMatrix.contrast(this.pixiContrast, false);
          // colorMatrix.brightness(this.pixiBrightness, false);
          console.log("BRIGHTNESS",this.pixiBrightness) 
          console.log("CONTRAST",this.pixiContrast)
          console.log("SATURATION",this.pixiSaturation)
          // Saturation controls
          // Since 0 saturation basically produces a grayscale image,
          // let's set it to grayscale filters, then switch to saturate
          // when it has a non-zero value.
          // 
          // else if (this.pixiSaturation > 1) {
          //   // Since the saturate accepts values between 0 and 1 only,
          //   // we limit it back to 1 once the value exceeds it.
          //   colorMatrix3.saturate(1, false);
          //   console.log("else if")
          // }else if(this.pixiSaturation == 1){
          //   colorMatrix3.saturate(0, false);
          //   console.log("else")
          // }else {
          //   colorMatrix3.saturate(this.pixiSaturation, false);
          //   console.log("else")
          // }
        }

        // Add the stage onto the canvas.
        stage.addChild(pixSprite);

        // Then when all is done, render the stage.
        renderer.render(stage);

        // Once the stage is rendered, convert the view (which is a canvas)
        // to base64 then return it back to the share controller.
        var canvasData = renderer.view.toDataURL('image/png');
        console.log("CANVASDATAAA ",canvasData)
        resolve({error: 0, message: 'PixiJS canvas completed.', canvas: canvasData});
      }
      catch (pixiJsError) {
        resolve({error: 1, trace: pixiJsError, request: 'fairyDraw'});
      }
    });
  }

  // Simply destroys the last renderer.
  // This one could possibly break any canvasses that the watermarker needs so we should
  // only invoke this after the watermark has done its job.
  // fairyLaw() { 
  //   return new Promise(resolve => {
  //     try {
  //       setTimeout(() => {
  //         this.renderer.destroy();
  //         resolve({error: 0, message: 'Fairy Law successfully invoked.'});
  //       }, 10000);
  //     }
  //     catch (pixiDestroyError) {
  //       resolve({error: 1, trace: pixiDestroyError, request: 'fairyLaw'});
  //     }
  //   });
  // }

  // The watermark image assets are at the top.
  async addWatermark(image) {
    console.log('Watermarking image data received: ', image);

    return await new Promise(resolve => {
      watermark([image, this.watermarkDecal]).dataUrl(watermark.image.lowerLeft(0.8)).then(data => {
        resolve(data);
      }).catch(ex => {
        resolve({error: 1, trace: ex, request: 'addImageWatermark'});
      });
    });
  }

  // SOCIAL SHARING FUNCTIONS //

  // SHARE TO FACEBOOK
  // This feature will have 2 variants: one using the Facebook Plugin, and two using the Social Sharing Plugin.
  // Both will access the user currently logged in the Facebook app installed on the device.
  async fbShareUsingPlugin(imageUrl) {
    // Share using the FB plugin
    return new Promise(resolve => {
      this.facebook.showDialog({
        method: 'feed',
        link: '',
        source: imageUrl
      }).then(response => {
        resolve(response);
      }).catch(ex => {
        resolve(ex);
      });
    });
  }

  async fbShareUsingSocialShare(imageUrl) {
    //Share using the Social Share plugin
    return await new Promise(resolve => {
      this.share.shareViaFacebook(null, imageUrl, null).then((response) => {
        resolve(response);
      }).catch(shareError => {
        resolve(shareError);
      }).then(() => {
        this.events.publish('shared-external', 'Facebook');
      });
    });
 
  }

  // Share to Instagram
  async igShareUsingSocialShare(imageUrl) {
    return new Promise(resolve => {
      // this.share.canShareVia('instagram', imageUrl).then(() => {
      //   this.share.shareViaInstagram(null, imageUrl).then(response => {
      //     resolve(response);
      //   }).catch(shareError => {
      //     resolve(shareError);
      //   });
      // }).catch(canShareError => {
      //   resolve(canShareError);
      // });

      // this.share.shareViaInstagram(null, imageUrl).then(response => {
      //   this.events.publish('shared-external', 'Instagram');
      //   resolve(response);
      // }).catch(shareError => {
      //   resolve(shareError);
      // });

      this.instagram.share(imageUrl, null).then(response => {
        resolve(response);
      }).catch(igShareError => {
        resolve({error: 1, trace: igShareError, request: 'igShareUsingSocialShare'});
      }).then(() => {
        this.events.publish('shared-external', 'Instagram');
      });
    });
  }

  // Share to Twitter
  async twShareUsingSocialShare(imageUrl) {
    return new Promise(resolve => {
      // this.share.canShareVia('twitter', imageUrl).then(() => {
      //   this.share.shareViaTwitter(null, imageUrl, null).then(response => {
      //     resolve(response);
      //   }).catch(shareError => {
      //     resolve(shareError);
      //   });
      // }).catch(canShareError => {
      //   resolve(canShareError);
      // });
      this.share.shareViaTwitter(null, imageUrl, null).then(response => {
        resolve(response);
      }).catch(shareError => {
        resolve(shareError);
      }).then(() => {
        this.events.publish('shared-external', 'Twitter');
      });
    });
  }

  // Share to Email
  async emailShareUsingSocialShare(imageUrl) {
    return new Promise(resolve => {
      this.share.canShareViaEmail().then(() => {
        this.share.shareViaEmail(null, null, null, null, null, imageUrl).then(response => {
          resolve(response);
        }).catch(shareError => {
          resolve(shareError);
        }).then(() => {
          this.events.publish('shared-external', 'email');
        });
      }).catch(canShareError => {
        resolve(canShareError);
      });
    });
  }

  // UPDATE: These functions are now used in conjunction with the codes above.
  // Social Sharing, version 2.0
  //
  // We will now be using the following function sets for a more
  // polished feel when sharing something from the app.
  // Share using Share Sheet from Social Sharing plugin
  // Facebook: photo itself, URL (optional)
  // Instagram, Twitter: photo itself
  // Email: subject, photo itself (either URL or base64 (if working))
  // canShareVia(appName, message, subject, image, url)

  // canShareVia checks
  // We do this before calling the share sheet so that we could block
  // or alert the user if a certain platform is unavailable on their device.

  // Check for Facebook
  async canShareViaFacebook(imageData) {
    // console.log('Image data to share to Facebook: ', imageData);
    return await new Promise(resolve => {
      if (this.platform.is('android')) {
        this.share.canShareVia('com.facebook.katana', null, null, imageData, null).then(response => {
          resolve(response);
        }).catch(ex => {
          resolve({error: 1, trace: ex, request: 'canShareViaFacebookAndroid'});
        });
      }
      else if (this.platform.is('ios')) {
        // this.share.canShareVia('com.apple.social.facebook', null, null, imageData, null).then(response => {
        //   resolve(response);
        // }).catch(ex => {
        //   resolve({error: 1, trace: ex, request: 'canShareViaFacebookiOS'});
        // });
        this.openShareSheet(imageData);
      }
      else {
        this.share.canShareVia('facebook', null, null, imageData, null).then(response => {
          resolve(response);
        }).catch(ex => {
          resolve({error: 1, trace: ex, request: 'canShareViaFacebook'});
        });
      }
    });
  }

  // Check for Instagram
  async canShareViaInstagram(imageData) {
    return await new Promise(resolve => {
      if (this.platform.is('android')) {
        this.share.canShareVia('com.instagram.android', null, null, imageData, null).then(response => {
          resolve(response);
        }).catch(ex => {
          resolve({error: 1, trace: ex, request: 'canShareViaInstagramAndroid'});
        });
      }
      else if (this.platform.is('ios')) {
        // this.share.canShareVia('com.apple.social.instagram', null, null, imageData, null).then(response => {
        //   resolve(response);
        // }).catch(ex => {
        //   resolve({error: 1, trace: ex, request: 'canShareViaInstagramiOS'});
        // });
        this.openShareSheet(imageData);
        // this.openShareSheet(imageData);
        // resolve('OK');
      }
      else {
        this.share.canShareVia('instagram', null, null, imageData, null).then(response => {
          resolve(response);
        }).catch(ex => {
          resolve({error: 1, trace: ex, request: 'canShareViaInstagram'});
        });
      }
    });
  }

  // Check Twitter
  async canShareViaTwitter(imageData) {
    return await new Promise(resolve => {
      if (this.platform.is('android')) {
        this.share.canShareVia('com.twitter.android', null, null, imageData, null).then(response => {
          resolve(response);
        }).catch(ex => {
          resolve({error: 1, trace: ex, request: 'canShareViaTwitterAndroid'});
        });
      }
      else if (this.platform.is('ios')) {
        // this.share.canShareVia('com.apple.social.twitter', null, null, imageData, null).then(response => {
        //   resolve(response);
        // }).catch(ex => {
        //   resolve({error: 1, trace: ex, request: 'canShareViaTwitteriOS'});
        // });
        this.openShareSheet(imageData);
      }
      else {
        this.share.canShareVia('twitter', null, null, imageData, null).then(response => {
          resolve(response);
        }).catch(ex => {
          resolve({error: 1, trace: ex, request: 'canShareViaTwitter'});
        });
      }
    });
  }

  // Check Email
  async canShareViaEmail() {
    return await new Promise(resolve => {
      this.share.canShareViaEmail().then(() => {
        resolve({error: 0});
      }).catch(ex => {
        // resolve({error: 1, trace: ex, request: 'canShareViaEmail'});
        resolve({error: 0});
      });
    });
  }

  // Open the Social Sharing plugin's Share Sheet
  // Please note that the Share Sheet will display multiple sharing options
  // at once, not just the targeted social platform. While unavailable platforms
  // may be caught during the canShareVia check, it may not be caught in the
  // Share Sheet function.
  async openShareSheet(imageData) {
    // Sharing options for the Share Sheet
    // @params
    // subject: email subject (if email is selected); unavailable for FB, IG, TW
    // files: array of images/files
    // chooserTitle: Android only, title of share sheet
    return await new Promise(resolve => {
      var shareOptions = {
        subject: 'Check out this style from GetStylin\'!',
        files: [imageData],
        chooserTitle: 'Share with',
      };

      this.share.shareWithOptions(shareOptions).then(response => {
        resolve(response);
      }).catch(ex => {
        resolve({error: 1, trace: ex, request: 'openShareSheet'});
      });
    });
  }
}
