const main = () => {
  // standard global constiables
  let container, scene, camera, renderer, controls, light;

  const toRadians = (angle) => {
    return angle * (Math.PI / 180);
  };

  const getPointCoords = (theta, phi, radius) => {
    const x = radius * Math.cos(toRadians(theta)) * Math.sin(toRadians(phi));
    const y = radius * Math.sin(toRadians(theta)) * Math.sin(toRadians(phi));
    const z = radius * Math.cos(toRadians(phi));
    return [x, y, z];
  };

  // custom global variables
  let x = 45,
    y = 45,
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
    light.position.set(xyz[0], xyz[1], xyz[2] + 75);
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

    // point
    const pointGeometry = new THREE.SphereGeometry(2, 8, 8);
    const pointMaterial = new THREE.MeshBasicMaterial({ color: '#680cea' });
    point = new THREE.Mesh(pointGeometry, pointMaterial);

    point.position.x = xyz[0];
    point.position.y = xyz[1];
    point.position.z = xyz[2];

    scene.add(point);
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
      x++;
      y++;
    }
    xyz = getPointCoords(x, y, z);
    point.position.x = xyz[0];
    point.position.y = xyz[1];
    point.position.z = xyz[2];
    light.position.set(xyz[0], xyz[1], xyz[2] + 75);

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
