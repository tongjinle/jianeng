async function init() {
  // 场景
  var scene = new THREE.Scene();

  // 摄像机
  var camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // 精灵

  let sp = await createSprite();
  sp.material.map = await getVideoTexture();
  scene.add(sp);

  //
  let textureList = await Promise.all([
    getTexture(0),
    getTexture(1),
    getTexture(2),
    getTexture(3)
  ]);

  // 渲染
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  let index = 0;
  let len = textureList.len;
  let count = 10;
  function render() {
    // sp.rotation.x += 0.01;
    sp.rotation.y += 0.01;
    // console.log("frame");

    // sp.material.map = textureList[2];
    // sp.material.map = textureList[index];
    renderer.render(scene, camera);

    // count--;
    // if (count == 0) {
    //   index++;
    //   index = index % len;
    //   count = 10;
    // }

    requestAnimationFrame(render);
  }
  render();
}

async function createSprite() {
  // let texture = await getTexture(3);
  // console.log("texture:", texture);

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  var rst = new THREE.Mesh(geometry, material);
  console.log("create sprite end");
  console.log("material:", material);
  console.log("sprite:", rst);

  return rst;
}

function getTexture(index) {
  var loader = new THREE.TextureLoader();
  return new Promise(resolve => {
    // 加载一个资源
    loader.load(
      // 资源链接
      "/three.js/examples/jy" + index + ".jpg",
      // 资源加载完成后的回调函数
      function(texture) {
        resolve(texture);
      },
      // 资源加载过程中的回调函数
      function(xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // 资源下载出错时的回调函数
      function(xhr) {
        console.log("An error happened");
      }
    );
  });
}

async function getVideoTexture() {
  let video = document.getElementById("video");
  let texture = new THREE.VideoTexture(video);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.format = THREE.RGBFormat;
  return texture;
}

window.onload = init;
