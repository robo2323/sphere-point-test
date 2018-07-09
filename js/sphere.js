const main = () => {
  // standard global constiables
  let container, scene, camera, renderer, controls, light;

  //TODO: use three built in function
  const toRadians = (angle) => {
    return angle * (Math.PI / 180);
  };

  const getPointCoords = (theta, phi, radius) => {
    const x = radius * Math.cos(toRadians(theta)) * Math.sin(toRadians(phi));
    const y = radius * Math.sin(toRadians(theta)) * Math.sin(toRadians(phi));
    const z = radius * Math.cos(toRadians(phi));
    return new THREE.Vector3(x, y, z);
  };

  // custom global variables
  //TODO: work out why origin isnt 0,0
  let x = -90,
    y = -90,
    z = 100;
  let xyz = getPointCoords(x, y, z);
  let animateClicked = false;

  const init = () => {
    // SCENE
    scene = new THREE.Scene();
    // CAMERA
    const SCREEN_WIDTH = 800,
      SCREEN_HEIGHT = 800;
    const VIEW_ANGLE = 45,
      ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
      NEAR = 0.1,
      FAR = 20000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);
    camera.position.set(280, 200, 300);
    camera.lookAt(scene.position);

    // RENDERER
    if (Detector.webgl) {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } else {
      renderer = new THREE.CanvasRenderer();
    }
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor('#faf7fc');

    container = document.getElementById('ThreeJS');
    container.appendChild(renderer.domElement);

    // CONTROLS
    controls = new THREE.OrbitControls(camera, renderer.domElement);

    //   LIGHT
    light = new THREE.PointLight(0xffffff);
    light.position.set(xyz.x, xyz.y, xyz.z + 75);
    scene.add(light);

    const sphereRadius = 100;

    scene.add(new THREE.AxesHelper(sphereRadius));

    //sphere
    const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({
      color: 0xfaf7fc,
      transparent: true,
      opacity: 0.3,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 50
    });
    this.sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

    scene.add(sphere);

    //spher wireframe
    const wireSphere = new THREE.SphereGeometry(sphereRadius, 32, 16);
    const edgesGeometry = new THREE.EdgesGeometry(wireSphere);
    const wireMaterial = new THREE.LineBasicMaterial({
      color: 0x888888,
      linewidth: 1,
      transparent: true,
      opacity: 0.3
    });
    const sphereWireframe = new THREE.LineSegments(edgesGeometry, wireMaterial);

    scene.add(sphereWireframe);

    // points for great circles
    const N = new THREE.Vector3(0, sphereRadius, 0);
    const S1 = new THREE.Vector3(1, -sphereRadius, 0);
    const S2 = new THREE.Vector3(-0.01, -sphereRadius, 0);
    const S3 = new THREE.Vector3(0, -sphereRadius, 0.01);
    const S4 = new THREE.Vector3(0, -sphereRadius, -0.01);
    const E = new THREE.Vector3(sphereRadius, 0, 0);
    const W1 = new THREE.Vector3(-sphereRadius, 0, 0.01);
    const W2 = new THREE.Vector3(-sphereRadius, 0, -0.01);
    // great circles
    drawArc(createArc(N, S1), new THREE.Color(0x0000ff));
    drawArc(createArc(N, S2), new THREE.Color(0x0000ff));
    drawArc(createArc(N, S3), new THREE.Color(0xff0000));
    drawArc(createArc(N, S4), new THREE.Color(0xff0000));
    drawArc(createArc(E, W1), new THREE.Color(0x00ff00));
    drawArc(createArc(E, W2), new THREE.Color(0x00ff00));

    // arrow line
    arrowLineGeometry = new THREE.Geometry();
    arrowLineGeometry.vertices = [new THREE.Vector3(0, 0, 0), xyz];
    const arrowLineMaterial = new THREE.LineBasicMaterial({
      color: 0x00aaff,
      linewidth: 5
    });
    const arrowLine = new THREE.Line(arrowLineGeometry, arrowLineMaterial);

    // arrow head
    const pointGeometry = new THREE.ConeGeometry(8, 16, 4);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    point = new THREE.Mesh(pointGeometry, pointMaterial);

    point.position.x = xyz.x;
    point.position.y = xyz.y;
    point.position.z = xyz.z;

    scene.add(point);
    scene.add(arrowLine);
  };

  // functions to create and draw great circles on a sphere
  const greatCircle = (P, Q) => {
    const angle = P.angleTo(Q);
    return function(t) {
      const vector = new THREE.Vector3()
        .addVectors(P.clone().multiplyScalar(Math.sin((1 - t) * angle)), Q.clone().multiplyScalar(Math.sin(t * angle)))
        .divideScalar(Math.sin(angle));
      return vector;
    };
  };

  const createArc = (P, Q) => {
    const sphereArc = new THREE.Curve();
    sphereArc.getPoint = greatCircle(P, Q);
    return sphereArc;
  };

  const drawArc = (curve, color) => {
    const lineGeometry = new THREE.Geometry();
    lineGeometry.vertices = curve.getPoints(100);
    const lineMaterial = new THREE.LineBasicMaterial();
    lineMaterial.color = color;
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
  };

  const animate = () => {
    if (animateClicked) {
      x += 0.5;
      y += 0.5;
    }
    arrowLineGeometry.verticesNeedUpdate = true;

    arrowLineGeometry.vertices = [new THREE.Vector3(0, 0, 0), xyz];

    xyz = getPointCoords(x, y, z);
    point.position.x = xyz.x;
    point.position.y = xyz.y;
    point.position.z = xyz.z;
    point.rotation.set(0.0,THREE.Math.degToRad(y) + Math.PI / 2, THREE.Math.degToRad(x) + Math.PI / 2);

    light.position.set(xyz.x, xyz.y, xyz.z + 75);

    requestAnimationFrame(animate);
    render();
    update();
  };

  const update = () => {
    controls.update();
  };

  function render() {
    renderer.render(scene, camera);
  }

  const xyzInputs = document.getElementById('controls');

  xyzInputs.addEventListener('input', (e) => {
    switch (e.target.name) {
      case 'x':
        x = e.target.value;
        break;
      case 'y':
        y = e.target.value;
        break;
      case 'z':
        z = e.target.value;
        break;
    }
  });

  xyzInputs.addEventListener('submit', (e) => {
    e.preventDefault();
    animateClicked = !animateClicked;
  });

  init();
  animate();
};

document.addEventListener('DOMContentLoaded', main);
