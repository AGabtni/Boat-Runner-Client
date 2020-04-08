import { Component, ViewChild, AfterViewInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroupDirective, NgForm, Validators, ReactiveFormsModule} from '@angular/forms';

import { APIService } from './classes/apiService.service';

import { previewPanel, gameScreen, gameMenu } from '../assets/animations';
//--GAME IMPORTS :
//threeJS imports :
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Water } from 'three/examples/jsm/objects/Water.js';
import { Sky } from 'three/examples/jsm/objects/Sky.js';

//Game classes :
import { CameraController } from './classes/CameraController'
import { ScreenShake } from './classes/ScreenShake';

import { PlayerController } from './classes/PlayerController';
import { ObstaclePooler } from "./classes/ObstaclePooler";
import { GameObjectManager } from './classes/GameObjectManager';
import { InputManager } from './classes/InputManager';

import { globals } from './classes/globals';
//--GAME_CODE-------------------

var renderer;


var scene, camera, screenShaker;
var listener = new THREE.AudioListener();

var water, sky, sunSphere;
var playerGameObject;
var gameObjectManager, obstaclePooler;


let then = 0;
let loadedModels = [];

let upgrades = [false, false, false];
let targetSpeed = [0.6, 0.8, 1.5];
let upgradedDistance = [500, 1500, 5000];


export let inputManager;



//Initialize after models are loaded


export let models = {
  human: { url: '../../assets/models/Male_Casual.gltf', gltf: null, animations: {} },
  boulder: { url: '../../assets/models/Rock.gltf', gltf: null, animations: {} },
  mine: { url: '../../assets/models/Mine.gltf', gltf: null, animations: {} },
  boat: { url: '../../assets/models/Tugboat.gltf', gltf: null, animations: {} },

};

export let soundsLibrary = {

  waves: { url: '../../assets/sound/waves.ogg', clip: null },
  explosion: { url: '../../assets/sound/explosion.ogg', clip: null },
  engine_slow: { url: '../../assets/sound/engine_slow.ogg', clip: null },
  engine_medium: { url: '../../assets/sound/engine_medium.ogg', clip: null },
  engine_fast: { url: '../../assets/sound/engine_fast.ogg', clip: null },

}


function loadAnimations() {
  Object.values(models).forEach(model => {
    const animsByName = {};
    model.gltf.animations.forEach((clip) => {
      animsByName[clip.name] = clip;
      loadedModels.push(model.gltf);
    });
    model.animations = animsByName;

  });
}


function init() {

  const canvas = <HTMLCanvasElement>document.getElementById("c");
  
  //--Renderer Init
  renderer = new THREE.WebGLRenderer({  canvas });


  globals.audioListener = listener;

}




function Start() {



  //--Variable inits :
  const canvas = document.querySelector('#c');

  gameObjectManager = new GameObjectManager();
  globals.gameObjectManager = gameObjectManager;
  obstaclePooler = new ObstaclePooler();

  loadAnimations();




  //-Scene init

  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0xf0fff0, 0.01);
  globals.scene = scene;



  //--Camera init
  camera = new THREE.PerspectiveCamera(70, canvas.clientWidth / canvas.clientHeight, 1, 1000);
  camera.position.set(0, 2, 0);
  camera.add(listener);

  globals.camera = camera;
  scene.add(camera);

  screenShaker = ScreenShake();
  globals.screenShaker = screenShaker;





  //-SETTING-UP-ENIVRONMENT

  //--ADDING-SKY
  initSky();


  //--ADDING LIGHTNING
  var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  var light = new THREE.DirectionalLight(0xffffff, 0.8);

  ambientLight.castShadow = true;
  light.castShadow = true;
  scene.add(ambientLight);
  scene.add(light);

  //--ADDING-WATER :

  var waterGeometry = new THREE.PlaneBufferGeometry(5000, 5000);
  water = new Water(
    waterGeometry,
    {
      textureWidth: 100,
      textureHeight: 100,
      waterNormals: new THREE.TextureLoader().load('../../assets/textures/waternormals.jpg', function (texture) {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      }),
      alpha: 1.0,
      sunDirection: light.position.clone().normalize(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: scene.fog !== undefined,

    }
  );
  water.rotation.x = - Math.PI / 2;
  water.material.uniforms['sunDirection'].value.copy(light.position).normalize();
  scene.add(water);


  //GAMEOBJECTS CREATION : 

  //--Camera gameObject and camera info component atteced to it 
  const camGameObject = gameObjectManager.createGameObject(scene, 'camera');
  globals.cameraInfo = camGameObject.addComponent(CameraController);


  playerGameObject = gameObjectManager.createGameObject(scene, 'player');
  playerGameObject.addComponent(PlayerController);

  obstaclePooler.createRocksPool();

  //Set up sound 
  var waterMesh = new THREE.Mesh(water.geometry);


  var clip = new THREE.Audio(listener);

  clip.setBuffer(soundsLibrary.waves.clip);
  clip.setVolume(0.2);
  clip.setLoop(true);
  clip.play();

  waterMesh.add(clip)

  inputManager = new InputManager();

  playerGameObject.getComponent(PlayerController).targetSpeed = 0;
  globals.isPlaying = true;





  requestAnimationFrame(Render);




}


function Restart() {



  $("#messageContent").animate({
    opacity: '0.0',
  });
  $("#messageContent").text("");

  $("#gameOverScreen").animate({

    opacity: '0.0',
    zIndex: '0'
  })


  scene = null;
  camera = null;
  playerGameObject = null;
  upgrades = [false, false, false];
  gameObjectManager = null;
  obstaclePooler = null;
  then = 0;
  screenShaker = null;
  water = null; sky = null; sunSphere = null;

  globals.moveSpeed = 0.4;
  globals.deltaTime = 0;
  globals.time = 0;
  globals.playerPosition = null;
  globals.lastObstaclePosition = null;
  globals.parcouredDistance = 0;
  globals.scene = null;
  globals.camera = null;
  globals.cameraInfo = null;


  Start();
  startCountdown();
}


function startCountdown() {

  $('#messageContent').animate({

    opacity: '1.0',
  });

  $('#messageContent').text("Ready ?");
  //Countdown 
  setTimeout(() => {
    $('#messageContent').text("3");

    setTimeout(() => {
      $('#messageContent').text("2");
      setTimeout(() => {

        $('#messageContent').text("1")
        setTimeout(() => {

          $('#messageContent').text("GO !")

          //Reveal controllers :
          toggleControllers();

          setTimeout(() => {
            $('#messageContent').animate({

              opacity: '0.0',

            }, 500);
            $('#messageContent').text("");

          }, 500)
          playerGameObject.getComponent(PlayerController).targetSpeed = 0.4;

        }, 1000)

      }, 1000)
    }, 1000)

  }, 3000)

}


//Skybox creation: 
function initSky() {
  // Add Sky
  sky = new Sky();
  sky.scale.setScalar(450000);
  scene.add(sky);

  // Add Sun Helper
  sunSphere = new THREE.Mesh(
    new THREE.SphereBufferGeometry(20000, 16, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  sunSphere.position.y = - 700000;
  sunSphere.visible = false;
  scene.add(sunSphere);

  var effectController = {
    turbidity: 10,
    rayleigh: 2,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.8,
    luminance: 0.9,
    inclination: 0.49, // elevation / inclination
    azimuth: 0.125, // Facing front,
    sun: ! true
  };
  var distance = 400000;

  var uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = effectController.turbidity;
  uniforms["rayleigh"].value = effectController.rayleigh;
  uniforms["mieCoefficient"].value = effectController.mieCoefficient;
  uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;
  uniforms["luminance"].value = effectController.luminance;

  var theta = Math.PI * (effectController.inclination - 0.5);
  var phi = 2 * Math.PI * (effectController.azimuth - 0.5);
  sunSphere.position.x = distance * Math.cos(phi);
  sunSphere.position.y = distance * Math.sin(phi) * Math.sin(theta);
  sunSphere.position.z = distance * Math.sin(phi) * Math.cos(theta);
  sunSphere.visible = effectController.sun;
  uniforms["sunPosition"].value.copy(sunSphere.position);


  renderer.render(scene, camera);
}

//Update frame loop : 
function Update() {


  if (!globals.isPlaying)
    return;



  //Stop updating when no health left
  if (playerGameObject.getComponent(PlayerController).health <= 0) {

    globals.isPlaying = false;
    toggleControllers();

    $("#gameOverScreen").animate({

      opacity: '1.0',
      zIndex: '99',
    });




    return;
  }

  //Check if player still alive
  if (playerGameObject.getComponent(PlayerController).health <= 0 && globals.isPlaying) {

    $("#messageContent").animate({
      opacity: '1.0',
    })
    $("#messageContent").text("GAME OVER");



  }

  if (Math.abs(globals.parcouredDistance) > upgradedDistance[0]) {
    upgrade(0);

  }

  if (Math.abs(globals.parcouredDistance) > upgradedDistance[1]) {
    upgrade(1);


  }
  if (Math.abs(globals.parcouredDistance) > upgradedDistance[2]) {
    upgrade(2);

  }

  water.position.set(globals.parcouredDistance, 0, globals.parcouredDistance)
  gameObjectManager.update();
  obstaclePooler.update();
  inputManager.update();
  screenShaker.update(camera);
}

//Draws scene : 
function Render(now) {


  // convert to seconds
  globals.time = now * 0.001;
  // make sure delta time isn't too big.
  globals.deltaTime = Math.min(globals.time - then, 1 / 20);
  then = globals.time;


  water.material.uniforms['time'].value += 1.0 / 60.0;
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  //Update UI :
  $("#score span").text(Math.abs(Math.floor(globals.parcouredDistance)));



  Update();

  renderer.render(scene, camera);
  requestAnimationFrame(Render);


}


//Up the player target speed
function upgrade(index) {
  if (upgrades[index])
    return;

  playerGameObject.getComponent(PlayerController).targetSpeed = targetSpeed[index];
  upgrades[index] = true

  console.log("Applied upgrade " + index);



}


function toggleControllers() {

  $("#ui").toggleClass("visible");
  if ($("#ui").hasClass("visible")) {
    $("#ui").animate({

      opacity: "1.0",
      zIndex: "2",
    })

  } else {
    $("#ui").animate({

      opacity: "0.0",
      zIndex: "-1",
    })
  }


}
function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = document.body.clientWidth;
  const height = document.body.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);




  }
  return needResize;
}






//--END_GAME_CODE-------------------


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [APIService],
  styleUrls: ['./app.component.css'],
  animations: [previewPanel, gameMenu, gameScreen]
})
export class AppComponent implements AfterViewInit {
  @ViewChild('videoPlayer', { static: true }) videoplayer: any;

  public scores;

  public score;
  scoreForm;
  nameControl = new FormControl('', [Validators.required]);

  apiMessage;

  //Animation variables
  isPreviewVisible;
  isLoading;

  isStartScreenVisible;
  isHomeMenuVisible;
  isPauseMenuVisible;
  isGameOverMenuVisible;




  constructor(private formBuilder : FormBuilder, private _apiservice: APIService) {

    this.isPreviewVisible = true;
    this.isPauseMenuVisible = false;
    this.isLoading = true;
    this.isStartScreenVisible = false;


    this.isHomeMenuVisible = false;
    this.isGameOverMenuVisible = true;
    this.score = 0;

    this.scoreForm = this.formBuilder.group({
      'name' : this.nameControl,
     
  });
    this.apiMessage = "";
  }

  ngOnInit() {


  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {

    this.refresh();

  }


  getScores() {

    this.isHomeMenuVisible = false;
    this._apiservice.getScores().subscribe(
      data => {
        this.scores = data;
      },
      err => console.error(err),
      () => console.log('get call complete')


    )
  }

  backHome() {

    this.isHomeMenuVisible = true;

  }

  backGameOver() {

    this.isGameOverMenuVisible = true;
    this.apiMessage = "";
    this.scoreForm.reset();
    this.score = 0;
    globals.parcouredDistance = 0;
        
  }

  onSaveScoreClick() {
    this.score = Math.abs(Math.floor(globals.parcouredDistance));
    this.isGameOverMenuVisible = false;


  }
  saveScore(data) {

    this._apiservice.saveScore(data.name, this.score).subscribe(


      val => {
        this.apiMessage = val;
       
        setTimeout(()=>this.backGameOver(), 500);
      },
      response => {
        this.apiMessage = response.error.text;
      },
      () => console.log("put call complete")
    );
  }



  //Called after loading assets
  onLoadFinished() {
    init();
    Start();

  }

  //From preview screen
  onPlayClick() {
    $(document).ready(function () {
      $("app-root").addClass("isPlaying");
    });

    $("footer").animate({
      opacity: '0.0'
    });

    this.isPreviewVisible = false;
    this.isStartScreenVisible = true;
    this.isHomeMenuVisible = true;

    //Scroll to middle of screen
    $([document.documentElement, document.body]).animate({

      scrollTop: $("#gameContainer").offset().top
    })

    $("app-root").css({
      'background-color': 'rgba(0,0,0,0.95)'
    });

    document.body.style.overflowY = "hidden";



    this.loadAssets();

  }


  //From start screen
  onStartClick() {

    this.isStartScreenVisible = false;

    startCountdown();

  }

  //Load models and init scene when finished
  loadAssets() {

    const manager = new THREE.LoadingManager();
    this.isLoading = true;

    //Loading manager
    manager.onLoad = this.onLoadFinished;
    manager.onProgress = (url, itemsLoaded, itemsTotal) => {

      var n = (itemsLoaded / itemsTotal * 100 | 0) + '%';
      $('#progressbar').animate({
        'width': n
      })

      if (itemsLoaded == itemsTotal) {
        this.isLoading = false;
      }

    };

    //Load 3d models
    const gltfLoader = new GLTFLoader(manager);
    for (const model of Object.values(models)) {
      gltfLoader.load(model.url, (gltf) => {
        model.gltf = gltf;
      });
    }

    //Load sounds :
    const audioLoader = new THREE.AudioLoader(manager);
    for (const sound of Object.values(soundsLibrary)) {

      audioLoader.load(sound.url,
        // onLoad callback
        function (buffer) {
          sound.clip = buffer;
        },
        // onProgress callback
        function (xhr) {
          console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },

        // onError callback
        function (err) {
          console.log('An error happened');
        }
      )
    }

  }


  //From pause menu in pauseScreen
  togglePause() {

    toggleControllers();
    this.isPauseMenuVisible = !this.isPauseMenuVisible;
    var icon = '../assets/icons/pause';
    $("#pauseButton").toggleClass("clicked");
    icon += $("#pauseButton").hasClass("clicked") ? 'Filled.svg' : 'Outline.svg';
    $('#pauseButton').find('img').attr('src', icon);

    globals.isPlaying = !globals.isPlaying;

  }

  //Toggle global volume for the audio listener and toggle ui icon
  toggleAudio() {

    var icon = '../assets/icons/audio_';
    $("#audioButton").toggleClass("clicked");
    if ($("#audioButton").hasClass("clicked")) {

      icon += 'off.svg';

      camera.children[0].setMasterVolume(0);

    } else {
      icon += 'on.svg';
      camera.children[0].setMasterVolume(1);
    }

    $('#audioButton').find('img').attr('src', icon);

  }

  //Play video
  toggleVideo() {


  }
  //In both gameOverScreen and pauseScreen
  replay() {

    this.isPauseMenuVisible = false;
    this.isStartScreenVisible = false;

    Restart();
  }





  refresh() {
    window.location.reload();
  }



}