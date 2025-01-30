import * as THREE from 'three';
import { gsap } from "gsap";
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// Definitions:
const screen_front={
    width:800,
    height:800,
    x:0,
    y:6.75,
    z:0.5,
    rotation:{
        x:0,y:0,z:0
    }
}
const screen_bottom={
    width:800,
    height:800,
    x:0,
    y:6.25,
    z:0,
    rotation:{
        x:Math.PI/2,y:0,z:0
    }
}
const screen_left={
    width:800,
    height:800,
    x:-.5,
    y:6.75,
    z:0,
    rotation:{
        x:0,y:-Math.PI/2,z:0
    }
}
const screen_right={
    width:800,
    height:800,
    x:.5,
    y:6.75,
    z:0,
    rotation:{
        x:0,y:Math.PI/2,z:0
    }
}

// DIMENSIONS - to use mainly in the renderers (we're associating them with a const just in case we want to force the renderers sizes so we don't want to find all relevant instances of window.innerWidth, for example, and change them manually)
const sizes = {
    width: window.innerWidth,
    height:window.innerHeight
}

//scale will be used to rescale the size of the rendered object and the screen.
const scale_group = 0.25;

// the canvas is where the renderer draws its output and it corresponds to the domElement property. If it's not indicated a new canvas is created. (more info at https://threejs.org/docs/#api/en/renderers/WebGLRenderer )
const canvas = document.querySelector('.bodycanvas')

const scene = new THREE.Scene(); // Where the objects will be placed in order to be displayed
const scenebg = new THREE.Scene() // for css3d background elements

// GRID for reference for a "ground" (horizontal plane at y=0)
const grid = new THREE.GridHelper(6,12);
scenebg.add(grid);

// Creating a group so it's easier to move various elements around if necessary
const group = new THREE.Group

// WebGL Renderer
const rendererwebgl = new THREE.WebGLRenderer({canvas:canvas}); // standard renderer for 3JS
const rendererwebglbg = new THREE.WebGLRenderer({}); // renderer for webgl elements that will be placed in the background (this is needed because we want to create css3D elements that will be behind some webgl elements in the "first" webglrenderer and then put some more webgl elements behind those background css3d ones, so four layers will be necessary in total)
rendererwebgl.setClearColor(0xeeeeee,0.0) // this sets the "background color" and its transparency for the rendererwebgl element.
rendererwebgl.setSize( sizes.width, sizes.height); // calling the const defined earlier to set the size for the renderer
rendererwebgl.domElement.style.position = 'absolute' // keeps the renderer from being pushed downwards by other DOM html elements on the page
rendererwebgl.domElement.style.top = 0 // places the renderer at the top of the page
rendererwebgl.domElement.style.zIndex = 0; // just to make sure the z-index of the WebGL Renderer

//Next do the same for the BG webgl renderer 
rendererwebglbg.setClearColor(0x010101,0.1)
rendererwebglbg.setSize( sizes.width, sizes.height);
rendererwebglbg.domElement.style.position = 'absolute'
rendererwebglbg.domElement.style.top = 0 
rendererwebglbg.domElement.style.zIndex = 0;


//CSS3d Renderer - basically the same as WebGL renderer
const renderercss3d = new CSS3DRenderer({canvas:canvas});
renderercss3d.setSize( sizes.width, sizes.height );
renderercss3d.domElement.style.position = 'absolute'
const renderercss3dbg = new CSS3DRenderer({canvas:canvas});
renderercss3dbg.setSize( sizes.width, sizes.height );
renderercss3dbg.domElement.style.position = 'absolute'

// placing both renderers on the page
// ORDER IS IMPORTANT, as we want the elements on the CSS3D Renderer to be interactive, so they need to be "on top" of the WebGL ones.
document.body.appendChild( rendererwebglbg.domElement );
document.body.appendChild( renderercss3dbg.domElement );
document.body.appendChild( rendererwebgl.domElement );
document.body.appendChild( renderercss3d.domElement );

//Models


//Light

 //Ambient light
const light = new THREE.AmbientLight( 0x404040,10 ); // soft white light
light.castShadow = false;

scene.add( light );

//Directional Light
const directionalLight = new THREE.DirectionalLight(0x404040,50)
directionalLight.position.y = 3;
directionalLight.position.z = -1.5;
directionalLight.position.x = 2;
directionalLight.castShadow = true
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.left = -5;
directionalLight.shadow.camera.right = 5;
directionalLight.shadow.camera.top = 5;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.bias = -0.01;
scene.add(directionalLight);

//Directional Light2
const directionalLight2 = new THREE.DirectionalLight(0x404040, 20)
directionalLight2.position.y = 3;
directionalLight2.position.z = 1.5;
directionalLight2.position.x = -2;
directionalLight2.castShadow = true
directionalLight2.shadow.mapSize.width = 1024;
directionalLight2.shadow.mapSize.height = 1024;
directionalLight2.shadow.camera.left = -5;
directionalLight2.shadow.camera.right = 5;
directionalLight2.shadow.camera.top = 5;
directionalLight2.shadow.camera.bottom = -10;
directionalLight2.shadow.camera.near = 0.1;
directionalLight2.shadow.camera.far = 100;
directionalLight2.shadow.bias = -0.001;
scene.add(directionalLight2);


// Target
directionalLight.target.position.set(0, 1, 0)
directionalLight2.target.position.set(directionalLight.target.position)
directionalLight.target.updateWorldMatrix()

scene.add(directionalLight)
scene.add(directionalLight2)


rendererwebgl.shadowMap.enabled = true;
rendererwebgl.shadowMap.type = true;



// Building walls around our stage/set
const wall_01 = planeBuilder(4, 2, '#ccccdd',false)
wall_01.position.x = -1;
wall_01.position.y = 1;
wall_01.position.z = -0.15;
const textureLoader = new THREE.TextureLoader();
const fachadaTexture = textureLoader.load('public/fachada.jpg');
const wallMaterial = new THREE.MeshBasicMaterial({ map: fachadaTexture });
wall_01.material = wallMaterial;
scenebg.add(wall_01);

const wall_02 = planeBuilder(6, 3, '#efeeef',false)
wall_02.position.x = -3
wall_02.position.y = 1.5;
wall_02.position.z = 0;
wall_02.rotation.y = Math.PI/2;
scenebg.add(wall_02);

const wall_03 = planeBuilder(6, 3, '#efeeee',false)
wall_03.position.x = 3
wall_03.position.y = 1.5;
wall_03.position.z = 0;
wall_03.rotation.y = -Math.PI/2;
scenebg.add(wall_03);

const floor = planeBuilder(6,6, '#dddddd', false)
floor.rotation.x=-Math.PI/2;
floor.position.y=-0.01
scenebg.add(floor);

// const boxtv = boxBuilder(1.1,0.6,0.25,'#343434', false);
// // boxtv.position.set(2,1.5,-2.2);
// boxtv.position.set(2.35,2,-2.2);
// // 
// boxtv.x=Math.PI*0.15;
// boxtv.rotation.y=-Math.PI*.2;
// boxtv.rotation.z=-Math.PI*.015;
// // scenebg.add(boxtv);



// const frametv_01 = planeBuilder (1.04,1.81,'#404040',false)
// frametv_01.position.set(1,1.26,-2.49);
// scenebg.add(frametv_01);


// const frametv_02 = planeBuilder (1.94,1.04,'#404040',false)
// frametv_02.position.set(-1,1.6,-2.49);
// scenebg.add(frametv_02);

// const frametv_03 = planeBuilder (0.98,0.55,'#404040',false)
// frametv_03.position.set(2.3,2,-2.1);
// frametv_03.rotation.x=Math.PI*0.1;
// frametv_03.rotation.y=-Math.PI*.2;
// frametv_03.rotation.z=Math.PI*.05;
// scenebg.add(frametv_03);
// group_03.position.set(2.3,2,-2.1);
// group_03.rotation.x=Math.PI*0.1;
// group_03.rotation.y=-Math.PI*.2;
// group_03.rotation.z=Math.PI*.05;


// Creating elements that will be placed in the CSS3D Renderer
const iframe_front = document.createElement( 'iframe' );
iframe_front.style.width = `${screen_front.width}px`;
iframe_front.style.height = `${screen_front.height}px`;
// iframe.style.height = '3px';
iframe_front.style.border = '1px solid black';
iframe_front.style.zIndex = 2;
iframe_front.style.pointerEvents = 'auto';
// iframe.src = './iframe3dcontent.html';
iframe_front.src = './frente.html';
iframe_front.style.backfaceVisibility = 'hidden'
// div3d.appendChild( iframe );

const iframe_bottom = document.createElement( 'iframe' );
iframe_bottom.style.width = `${screen_front.width}px`;
iframe_bottom.style.height = `${screen_front.height}px`;
// iframe.style.height = '3px';
iframe_bottom.style.border = '1px solid black';
iframe_bottom.style.zIndex = 2;
iframe_bottom.style.pointerEvents = 'auto';
// iframe.src = './iframe3dcontent.html';
iframe_bottom.src = './fundo.html';
iframe_bottom.style.backfaceVisibility = 'hidden'
// div3d.appendChild( iframe );

const iframe_left = document.createElement( 'iframe' );
iframe_left.style.width = `${screen_front.width}px`;
iframe_left.style.height = `${screen_front.height}px`;
// iframe.style.height = '3px';
iframe_left.style.border = '1px solid black';
iframe_left.style.zIndex = 2;
iframe_left.style.pointerEvents = 'auto';
// iframe.src = './iframe3dcontent.html';
iframe_left.src = './esq.html';
iframe_left.style.backfaceVisibility = 'hidden'
// div3d.appendChild( iframe );

const iframe_right = document.createElement( 'iframe' );
iframe_right.style.width = `${screen_front.width}px`;
iframe_right.style.height = `${screen_front.height}px`;
// iframe.style.height = '3px';
iframe_right.style.border = '1px solid black';
iframe_right.style.zIndex = 2;
iframe_right.style.pointerEvents = 'auto';
// iframe.src = './iframe3dcontent.html';
iframe_right.src = './dir.html';
iframe_right.style.backfaceVisibility = 'hidden'
// div3d.appendChild( iframe );



function css3dElementBuilder(type,width,height){
    let cssobject = document.createElement(type);
    cssobject.style.width = `${width}px`;
    cssobject.style.height = `${height}px`;
    cssobject.style.pointerEvents = 'auto';
    cssobject.style.border = 'none';
    cssobject.style.backfaceVisibility = 'hidden';
    return cssobject;
}


// scene.add(bgscene);
// bgscene.add(display_01_3d)




const object_front = new CSS3DObject( iframe_front );
const object_bottom = new CSS3DObject( iframe_bottom );
const object_left = new CSS3DObject( iframe_left );
const object_right = new CSS3DObject( iframe_right );

object_front.scale.set(1/screen_front.width,1/screen_front.width)
object_bottom.scale.set(1/screen_front.width,1/screen_front.width)
object_left.scale.set(1/screen_front.width,1/screen_front.width)
object_right.scale.set(1/screen_front.width,1/screen_front.width)

object_front.position.set( screen_front.x, screen_front.y, screen_front.z );
object_front.rotateX(screen_front.rotation.x)
object_front.rotateY(screen_front.rotation.y)
object_front.rotateZ(screen_front.rotation.z)

object_bottom.position.set( screen_bottom.x, screen_bottom.y, screen_bottom.z );
object_bottom.rotateX(screen_bottom.rotation.x)
object_bottom.rotateY(screen_bottom.rotation.y)
object_bottom.rotateZ(screen_bottom.rotation.z)

object_left.position.set( screen_left.x, screen_left.y, screen_left.z );
object_left.rotateX(screen_left.rotation.x)
object_left.rotateY(screen_left.rotation.y)
object_left.rotateZ(screen_left.rotation.z)

object_right.position.set( screen_right.x, screen_right.y, screen_right.z );
object_right.rotateX(screen_right.rotation.x)
object_right.rotateY(screen_right.rotation.y)
object_right.rotateZ(screen_right.rotation.z)



group.add(object_front)
group.add(object_bottom)
group.add(object_left)
group.add(object_right)

scene.add(group)

group.scale.set(scale_group, scale_group,scale_group);

//CAMERA
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000); // the camera is where the "viewer" is. Has the parameters (vertical angle, aspect ratio, min distance for viewing something, maximum distance for viewing something - objects farther away will not be displayed)
// const camerabg = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10000);



scene.add(camera);
scenebg.add(camera);

let camera_initial_position={
    x: object_front.position.x+3,
    y: object_front.position.y-2,
    z: object_front.position.z+5
};
camera.position.set(camera_initial_position.x*scale_group,camera_initial_position.y*scale_group, camera_initial_position.z*scale_group);
let camerafocus = new THREE.Vector3(object_front.position.x*scale_group,object_front.position.y*scale_group,object_front.position.z*scale_group-0.2);
// camerafocus = (new THREE.Vector3(2.35,2,-2.2))

// camera.lookAt(camerafocus);


// CONTROLS 
const controls = new OrbitControls(camera, renderercss3d.domElement)
// const controlsbg = new OrbitControls(camera, renderercss3dbg.domElement)
// const controls = new TrackballControls(camera, renderercss3d.domElement)
// const controls = new ArcballControls(camera, renderercss3d.domElement)
controls.movementSpeed = 0.1;
// console.log(screenhtml.rotation.x);
const initcontrols={minpolar:Math.PI/2,
    maxpolar: Math.PI,
    minazimuth: -Math.PI/2.1,
    maxazimuth: Math.PI/2.1,
    maxdist: 2.3
}
controls.minPolarAngle = initcontrols.minpolar;
controls.maxPolarAngle = initcontrols.maxpolar;
controls.minAzimuthAngle = initcontrols.minazimuth;
controls.maxAzimuthAngle = initcontrols.maxazimuth;
controls.maxDistance = initcontrols.maxdist;

controls.target.set(camerafocus.x,camerafocus.y,camerafocus.z);
console.log('setcontrols target');

// const controls = new TrackballControls(camera,canvas)
controls.enableDamping = true;

function animate() {
    // camera.lookAt(camerafocus);
	requestAnimationFrame( animate );
    
    rendererwebglbg.render( scenebg, camera );
    renderercss3dbg.render( scenebg, camera);
    rendererwebgl.render( scene, camera );
    renderercss3d.render( scene, camera );
    
    // forcing camera position
    // if(camera.position.y<object3d.position.y*scale_group){
    //     camera.position.y=object3d.position.y*scale_group+0.25;
    // }
    // if(camera.position.z<object3d.position.z*scale_group){
    //     camera.position.z=object3d.position.z*scale_group+0.25;
    // }

    controls.update();

        if(camera.position.z<=(object_front.position.z*scale_group-zposB(object_front.position.y,camera.position.y,screen_front.rotation.x,scale_group))){
            
            iframe_front.style.visibility='hidden';
        }else{
            iframe_front.style.visibility='visible';
        }
}
animate();


// Nav btns - this will make the buttons in the interface active a function for rotating the camera when clicked



function rotateMesh (str) {
    if (str === 'reset') {
        gsap.to(camera.position,{
            x:camera_initial_position.x*scale_group,
            y:camera_initial_position.y*scale_group, 
            z:camera_initial_position.z*scale_group,
            duration:.6
        });        
        camerafocus.x = object_front.position.x*scale_group;
        camerafocus.y = object_front.position.y*scale_group;
        camerafocus.z = object_front.position.z*scale_group;
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        });
        controls.minPolarAngle = initcontrols.minpolar;
        controls.maxPolarAngle = initcontrols.maxpolar;
        controls.minAzimuthAngle = initcontrols.minazimuth;
        controls.maxAzimuthAngle = initcontrols.maxazimuth;
        controls.maxDistance = initcontrols.maxdist;        
    }
    if (str === '2') {  //front
        gsap.to(camera.position, {
            x: object_front.position.x*scale_group, 
            y: object_front.position.y*scale_group, 
            z:object_front.position.z+3*scale_group, 
            duration: 1});
            camerafocus.x = object_front.position.x*scale_group;
        camerafocus.y = object_front.position.y*scale_group;
        camerafocus.z = object_front.position.z*scale_group;
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        });
        controls.minPolarAngle = initcontrols.minpolar;
        controls.maxPolarAngle = initcontrols.maxpolar;
        controls.minAzimuthAngle = initcontrols.minazimuth;
        controls.maxAzimuthAngle = initcontrols.maxazimuth;
        controls.maxDistance = initcontrols.maxdist;
    }
    if (str === 'top') { 
        gsap.to(camera.position, {
            x: object_front.position.x*scale_group+0.1, 
            y: object_front.position.y*scale_group+1, 
            z:object_front.position.z*scale_group+0.1, 
            duration: 1});
            camerafocus.x = object_front.position.x*scale_group;
        camerafocus.y = object_front.position.y*scale_group;
        camerafocus.z = object_front.position.z*scale_group;
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        });
        controls.minPolarAngle = initcontrols.minpolar;
        controls.maxPolarAngle = initcontrols.maxpolar;
        controls.minAzimuthAngle = initcontrols.minazimuth;
        controls.maxAzimuthAngle = initcontrols.maxazimuth;
        controls.maxDistance = initcontrols.maxdist;
    }
    if (str === '0') { 
        gsap.to(camera.position, {
            x: object_front.position.x*scale_group+1, 
            y: object_front.position.y*scale_group, 
            z:object_front.position.z*scale_group+0.3, 
            duration: 1});
            camerafocus.x = object_front.position.x*scale_group;
        camerafocus.y = object_front.position.y*scale_group;
        camerafocus.z = object_front.position.z*scale_group;
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        });
        controls.minPolarAngle = initcontrols.minpolar;
        controls.maxPolarAngle = initcontrols.maxpolar;
        controls.minAzimuthAngle = initcontrols.minazimuth;
        controls.maxAzimuthAngle = initcontrols.maxazimuth;
        controls.maxDistance = initcontrols.maxdist;
    }
    if (str === '1') {  
    
        let fc = positionsLookAt(object_front.position,screen_front.rotation,scale_group,0.4);
        gsap.to(
            camera.position, {
                x: fc.x,
                y: fc.y, 
                z: fc.z,
                duration: 1});
        camerafocus.x = object_front.position.x*scale_group;
        camerafocus.y = object_front.position.y*scale_group;
        camerafocus.z = object_front.position.z*scale_group;
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        });
        controls.minPolarAngle = initcontrols.minpolar;
        controls.maxPolarAngle = initcontrols.maxpolar;
        controls.minAzimuthAngle = initcontrols.minazimuth;
        controls.maxAzimuthAngle = initcontrols.maxazimuth;
        controls.maxDistance = initcontrols.maxdist;
    }
    if (str === '5') {
        camerafocus.x = group_CTV.position.x;
        camerafocus.y = group_CTV.position.y;
        camerafocus.z = group_CTV.position.z;
        


        let ctvp = positionsLookAt(group_CTV.position,group_CTV.rotation,1,1.2)

        gsap.to(
            camera.position, {
                x: ctvp.x,
                y: ctvp.y, 
                z: ctvp.z,
                duration: 1});
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        }); 
        controls.minPolarAngle = Math.PI - 1.9;
        controls.maxPolarAngle = Math.PI/1.3;
        controls.minAzimuthAngle = -Math.PI/2.2;
        controls.maxAzimuthAngle = Math.PI/4.2;
        controls.maxDistance = 1

                
    }
    if (str === '3') {
        camerafocus.x = group_MH.position.x;
        camerafocus.y = group_MH.position.y;
        camerafocus.z = group_MH.position.z;

        let mhp = positionsLookAt(group_MH.position,group_MH.rotation,1,1)

        gsap.to(
            camera.position, {
                x: mhp.x,
                y: mhp.y, 
                z: mhp.z,
                duration: 1});
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        }); 

        controls.minPolarAngle = Math.PI - 2;
        controls.maxPolarAngle = Math.PI/1.5;
        controls.minAzimuthAngle = -Math.PI/2.5;
        controls.maxAzimuthAngle = Math.PI/2.5;
        controls.maxDistance = 1.5
                
    }
    if (str === '4') {

        camerafocus.x = group_MV.position.x;
        camerafocus.y = group_MV.position.y;
        camerafocus.z = group_MV.position.z;

        let mvp = positionsLookAt(group_MV.position,group_MV.rotation,1,1)

        gsap.to(
            camera.position, {
                x: mvp.x,
                y: mvp.y, 
                z: mvp.z,
                duration: 1});
        gsap.to(controls.target,{
            x:camerafocus.x,
            y:camerafocus.y, 
            z:camerafocus.z,
            duration:.6
        }); 
        controls.minPolarAngle = Math.PI - 2;
        controls.maxPolarAngle = Math.PI/1.5;
        controls.minAzimuthAngle = -Math.PI/2.5;
        controls.maxAzimuthAngle = Math.PI/2.5;
        controls.maxDistance = 1.5
    }
}

function boxBuilder(width=1,height=1,depth=1,color='white',wframe=false){
    let newbox = new THREE.BoxGeometry(width,height,depth);
    let material = new THREE.MeshBasicMaterial({color:color, wireframe:wframe})
    let builtbox = new THREE.Mesh(newbox, material);
    return(builtbox);
}
function planeBuilder(width=1,height=1,color='white',wframe=false){
    let newplane = new THREE.PlaneGeometry(width,height);
    let planematerial = new THREE.MeshBasicMaterial({color:color, wireframe:wframe})
    let builtplane = new THREE.Mesh(newplane, planematerial);
    return(builtplane);
}

function zposB(yp,ycam,ang,scale){
    {
        return(Math.sqrt((Math.tan(ang)*(ycam-yp*scale))**2));
    }
}

function positionsLookAt(targetpos,targetrot,scale,dist){
    let rx = targetpos.x*scale;
    let ry = targetpos.y*scale;
    let rz = targetpos.z*scale;
    
    let sinx = Math.sin((targetrot.x)) * dist;
    let cosx = Math.cos((targetrot.x)) * dist;
    let siny = Math.sin((targetrot.y)) * dist;
    let cosy = Math.cos((targetrot.y)) * dist;
    let sinz = Math.sin((targetrot.z)) * dist;
    let cosz = Math.cos((targetrot.z)) * dist;

    
    let cx = 0;
    let cy = 0;
    let cz = 0;

    // cx = rx + siny - sinz;
    cx = rx + cosy - cosz
    cy = ry - sinx + sinz;
    cz = rz + siny + cosx;

    console.log(ry+ ' ' +rz + ' '+ cy + ' ' +cz);

    let xpos = cx;
    let ypos = cy;
    let zpos = cz;

    return(new THREE.Vector3(xpos,ypos,zpos));
}
function posval(num){
    return(Math.sqrt(num**2));
}