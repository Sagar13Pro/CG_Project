// ?Rotate 
let angle = 0.0;
let axis = [0, 0, 1];

let trackingMouse = false;
let trackballMove = false;

let lastPos = [0, 0, 0];
let curx, cury;
let startX, startY;

// ? Tran
let translateX = 0.0;
let translateY = 0.0;
let translateZ = 0.0;
let dragging = false;

// ? scale 
let scaled = 1.0;
let lastScale = 1.0;
let scaling = false;
let startScaleY = 0;

function trackballView(x, y) {
    let d, a;
    let v = [];

    v[0] = x;
    v[1] = y;

    d = v[0] * v[0] + v[1] * v[1];
    if (d < 1.0)
        v[2] = Math.sqrt(1.0 - d);
    else {
        v[2] = 0.0;
        a = 1.0 / Math.sqrt(d);
        v[0] *= a;
        v[1] *= a;
    }
    return v;
}

function mouseMotion(x, y) {
    let dx, dy, dz;

    let curPos = trackballView(x, y);
    if (trackingMouse) {
        dx = curPos[0] - lastPos[0];
        dy = curPos[1] - lastPos[1];
        dz = curPos[2] - lastPos[2];

        if (dx || dy || dz) {
            angle = 1000 * Math.sqrt(dx * dx + dy * dy + dz * dz);
            // angle = -45.0;
            axis[0] = lastPos[1] * curPos[2] - lastPos[2] * curPos[1];
            axis[1] = lastPos[2] * curPos[0] - lastPos[0] * curPos[2];
            axis[2] = lastPos[0] * curPos[1] - lastPos[1] * curPos[0];

            lastPos[0] = curPos[0];
            lastPos[1] = curPos[1];
            lastPos[2] = curPos[2];
        }

    }
    if (currentShade == "1")
        TWrender();
    else
        TGPrender();
}

function startMotion(x, y) {
    trackingMouse = true;
    startX = x;
    startY = y;
    curx = x;
    cury = y;

    lastPos = trackballView(x, y);
    trackballMove = true;
}

function stopMotion(x, y) {
    trackingMouse = false;
    if (startX != x || startY != y) {
    }
    else {
        angle = 0.0;
        trackballMove = false;
    }
}

function mouseDown(event) {
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    dragging = true;
}

function mouseMove(event) {
    if (dragging) {
        let deltaX = event.clientX - lastMouseX;
        let deltaY = event.clientY - lastMouseY;
        translateX += deltaX / canvas.width;
        translateY -= deltaY / canvas.height;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        if (currentShade == "1")
            TWrender();
        else
            TGPrender();
    }
}

function mouseUp(event) {
    dragging = false;
}

function startScaling(event) {
    scaling = true;
    startScaleY = event.clientY;
}

function stopScaling() {
    scaling = false;
    lastScale = scaled;
}

function mouseScale(event) {
    console.log(scaling)
    if (!scaling)
        return;
    console.log("scale")
    let delta = event.clientY - startScaleY;
    let rate = 0.01;
    scaled = Math.max(0.1, lastScale + delta * rate);

    if (currentShade == "1")
        TWrender();
    else
        TGPrender();
}