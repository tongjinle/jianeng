async function main() {
  //////////////////////////////////////////////////////////////////////////////////
  //		Init
  //////////////////////////////////////////////////////////////////////////////////

  // init renderer
  var renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(640, 480);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);

  // array of functions for the rendering loop
  var onRenderFcts = [];

  // init scene and camera
  var scene = new THREE.Scene();

  //////////////////////////////////////////////////////////////////////////////////
  //		Initialize a basic camera
  //////////////////////////////////////////////////////////////////////////////////

  // Create a camera
  var camera = new THREE.Camera();
  scene.add(camera);

  ////////////////////////////////////////////////////////////////////////////////
  //          handle arToolkitSource
  ////////////////////////////////////////////////////////////////////////////////

  var arToolkitSource = new THREEx.ArToolkitSource({
    // to read from the webcam
    sourceType: "webcam"

    // // to read from an image
    // sourceType: "image",
    // sourceUrl: THREEx.ArToolkitContext.baseURL + "../data/images/img.jpg"

    // to read from a video
    // sourceType : 'video',
    // sourceUrl : THREEx.ArToolkitContext.baseURL + '../data/videos/headtracking.mp4',
  });

  arToolkitSource.init(function onReady() {
    onResize();
  });

  // handle resize
  window.addEventListener("resize", function() {
    onResize();
  });
  function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
  }
  ////////////////////////////////////////////////////////////////////////////////
  //          initialize arToolkitContext
  ////////////////////////////////////////////////////////////////////////////////

  // create atToolkitContext
  var arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl:
      THREEx.ArToolkitContext.baseURL + "../data/data/camera_para.dat",
    detectionMode: "mono"
  });
  // initialize it
  arToolkitContext.init(function onCompleted() {
    // copy projection matrix to camera
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  // update artoolkit on every frame
  onRenderFcts.push(function() {
    if (arToolkitSource.ready === false) return;

    arToolkitContext.update(arToolkitSource.domElement);

    // update scene.visible if the marker is seen
    scene.visible = camera.visible;
  });

  ////////////////////////////////////////////////////////////////////////////////
  //          Create a ArMarkerControls
  ////////////////////////////////////////////////////////////////////////////////

  // init controls for camera
  var markerControls = new THREEx.ArMarkerControls(arToolkitContext, camera, {
    type: "pattern",
    patternUrl: THREEx.ArToolkitContext.baseURL + "../data/data/patt.hiro",
    // patternUrl: "./pattern-marker.patt",

    // patternUrl : THREEx.ArToolkitContext.baseURL + '../data/data/patt.kanji',
    // as we controls the camera, set changeMatrixMode: 'cameraTransformMatrix'
    changeMatrixMode: "cameraTransformMatrix"
  });
  // as we do changeMatrixMode: 'cameraTransformMatrix', start with invisible scene
  scene.visible = false;

  //////////////////////////////////////////////////////////////////////////////////
  //		add an object in the scene
  //////////////////////////////////////////////////////////////////////////////////

  // add a torus knot
  // var geometry = new THREE.CubeGeometry(1, 1, 1);
  // var material = new THREE.MeshNormalMaterial({
  //   transparent: true,
  //   opacity: 0.5,
  //   side: THREE.DoubleSide
  // });
  // var mesh = new THREE.Mesh(geometry, material);
  // mesh.position.y = geometry.parameters.height / 2;
  // console.log("parameters:", geometry.parameters);
  // scene.add(mesh);

  // var geometry = new THREE.TorusKnotGeometry(0.3, 0.1, 64, 16);
  // var material = new THREE.MeshNormalMaterial();
  // var mesh = new THREE.Mesh(geometry, material);
  // mesh.position.y = 1;
  // scene.add(mesh);

  /**
   * 关于material材料注意点说明
   * MeshBasicMaterial：对光照无感，给几何体一种简单的颜色或显示线框。
   * MeshLambertMaterial：这种材质对光照有反应，用于创建暗淡的不发光的物体。
   * MeshPhongMaterial：这种材质对光照也有反应，用于创建金属类明亮的物体。
   */

  // // var material = new THREE.MeshLambertMaterial({
  // var material = new THREE.MeshBasicMaterial({
  //   // transparent: true,
  //   // opacity: 0.5,
  //   // side: THREE.DoubleSide,
  //   // map: texture
  //   map: await getVideoTexture()
  // });
  let textureList = await getTextureList();
  // // console.log("textureList:", textureList);
  // console.log("material:", material);
  // // var material = new THREE.MeshNormalMaterial();

  // //创建一个立方体
  // var geometry = new THREE.BoxGeometry(1, 1, 1);
  // //将material材料添加到几何体geometry
  // var mesh = new THREE.Mesh(geometry, material);
  // // mesh.position.y = 1;
  let sp = await createSprite();
  sp.material.map = await getVideoTexture();
  // sp.material.map = textureList[3];
  scene.add(sp);

  // let index = 0;
  // let len = textureList.length;
  // onRenderFcts.push(function(delta) {
  //   // mesh.rotation.x += Math.PI * delta;
  //   mesh.material.map = textureList[index];
  //   index = (index + 1) % len;
  // });

  //////////////////////////////////////////////////////////////////////////////////
  //		render the whole thing on the page
  //////////////////////////////////////////////////////////////////////////////////

  // render the scene
  onRenderFcts.push(function() {
    renderer.render(scene, camera);
  });

  // run the rendering loop
  var lastTimeMsec = null;
  requestAnimationFrame(function animate(nowMsec) {
    // keep looping
    requestAnimationFrame(animate);
    // measure time
    lastTimeMsec = lastTimeMsec || nowMsec - 1000 / 60;
    var deltaMsec = Math.min(200, nowMsec - lastTimeMsec);
    lastTimeMsec = nowMsec;
    // call each update function
    onRenderFcts.forEach(function(onRenderFct) {
      onRenderFct(deltaMsec / 1000, nowMsec / 1000);
    });
  });
}
async function getTextureList() {
  let fetch = url =>
    new Promise(resolve => {
      THREE.ImageUtils.loadTexture(url, {}, function(texture) {
        resolve(texture);
      });
    });
  // let urlList = [
  //   "/three.js/examples/jy0.jpg",
  //   "/three.js/examples/jy1.jpg",
  //   "/three.js/examples/jy2.jpg",
  //   "/three.js/examples/jy3.jpg"
  // ];
  let urlList = [
    "/three.js/examples/a3.jpg",
    "/three.js/examples/a3.jpg",
    "/three.js/examples/a3.jpg",
    "/three.js/examples/a3.jpg"
  ];

  return Promise.all(urlList.map(url => fetch(url)));
}
async function getVideoTexture() {
  let video = document.getElementById("video");
  let texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  return texture;
}
async function createSprite() {
  // let texture = await getTexture(3);
  // console.log("texture:", texture);
  var geometry = new THREE.BoxGeometry(1, 0.1, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var rst = new THREE.Mesh(geometry, material);
  console.log("create sprite end");
  console.log("material:", material);
  console.log("sprite:", rst);

  return rst;
}

window.onload = main;

function play() {
  let video = document.getElementById("video");
  console.log(video);
  window.aaa = video;
}
