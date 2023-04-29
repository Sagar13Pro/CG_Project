let program = 0, gl = 0, canvas, src;

let vertexText, fragmentText, currentShade = "0";

const numTeapotPatches = 32, numDivisions = 3;

// Teapot wireframe let
let pointsTW = [], indexTW = 0, flagTW = false, thetaTW = [0, 0, 0], axisTW = 0, xAxisTW = 0, yAxisTW = 1, zAxisTW = 2;

// Teapot Gourand And Phoung let
let pointsTGP = [], normalsTGP = [], indexTGP = 0, flagTGP = false, thetaTGP = [0, 0, 0], axisTGP = 0, xAxisTGP = 0, yAxisTGP = 1, zAxisTGP = 2;

let selectedTransform = "0";

// Controls Color 
let TWObjectColor = vec4(1.0, 0.0, 0.0, 1.0);
let objectColor = vec4(1.0, 1.0, 1.0, 1.0);
let lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
let lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

let materialAmbient = vec4(1.0, 0.0, 1.0, 1.0);
let materialDiffuse = vec4(1.0, 0.8, 0.0, 1.0);
let materialSpecular = vec4(1.0, 0.8, 0.0, 1.0);
let shininessColor = vec3(0.0, 1.0, 0.0);

let normalMatrixLoc;
let materialShininess = 10.0;

// Control Position
let lightPosition = vec4(0.0, 0.0, 20.0, 0.0);
let eyePosition = vec4(1.0, 0.0, 0.0, 1.0);

let at = vec3(0.0, 0.0, 0.0);
let up = vec3(0.0, 1.0, 0.0);

let left = 4;
let right = -4;
let ytop = -4;
let bottom = 4;
let near = -200;
let far = 200;

let theta = 0.0;
let phi = 0.0;
let dr = 5.0 * Math.PI / 180.0;

// ! Texture Var

let texture;

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

let texCoordsArray = [];


// color converting
const HEXtoRGB = hex => {
    if (hex.length == 0) {
        throw "No hex value is provided."
    }
    hex = hex.slice(1)
    let aRgbHex = hex.match(/.{1,2}/g);
    let aRgb = {
        'r': parseInt(aRgbHex[0], 16) / 256,
        'g': parseInt(aRgbHex[1], 16) / 256,
        'b': parseInt(aRgbHex[2], 16) / 256
    }
    return aRgb;
}

const initShaders = () => {

    if (program) {
        gl.deleteProgram(program)
        gl.deleteShader(vertShdr);
        gl.deleteShader(fragShdr);
        canvas = 0;
    }
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    vertShdr = gl.createShader(gl.VERTEX_SHADER);
    fragShdr = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertShdr, vertexText);
    gl.shaderSource(fragShdr, fragmentText);

    gl.compileShader(vertShdr);
    gl.compileShader(fragShdr);

    program = gl.createProgram();
    gl.attachShader(program, vertShdr);
    gl.attachShader(program, fragShdr);
    gl.linkProgram(program);

    if (!gl.getShaderParameter(vertShdr, gl.COMPILE_STATUS)) {
        let msg = "Vertex shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog(vertShdr) + "</pre>";
        alert(msg);
        return -1;
    }

    if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
        let msg = "Fragment shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog(fragShdr) + "</pre>";
        alert(msg);
        return -1;
    }

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        let msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog(program) + "</pre>";
        alert(msg);
        return -1;
    }
    // ! Mouse 
    canvas.addEventListener("mousedown", function (event) {
        if (selectedTransform == "rotate") {
            let x = 2 * event.clientX / canvas.width - 1;
            let y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
            startMotion(x, y);
        }
        else if (selectedTransform == "translate") {
            mouseDown(event);
        }
        else if (selectedTransform == "scale") {
            startScaling(event);
        }
    });

    canvas.addEventListener("mouseup", function (event) {
        if (selectedTransform == "rotate") {
            let x = 2 * event.clientX / canvas.width - 1;
            let y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
            stopMotion(x, y);
        } else if (selectedTransform == "translate") {
            mouseUp(event);
        } else if (selectedTransform == "scale") {
            stopScaling(event);
        }
    });

    canvas.addEventListener("mousemove", function (event) {
        if (selectedTransform == "rotate") {
            let x = 2 * event.clientX / canvas.width - 1;
            let y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
            mouseMotion(x, y);
        } else if (selectedTransform == "translate") {
            mouseMove(event)
        } else if (selectedTransform == "scale") {
            mouseScale(event)
        }
    });

    canvas.addEventListener("mousedown", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        startMotion(x, y);
    });

    canvas.addEventListener("mouseup", function (event) {
        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        stopMotion(x, y);
    });

    canvas.addEventListener("mousemove", function (event) {

        var x = 2 * event.clientX / canvas.width - 1;
        var y = 2 * (canvas.height - event.clientY) / canvas.height - 1;
        mouseMotion(x, y);
    });
}

// Teapot Start
// ? function for both
let bezier = function (u) {
    let b = new Array(4);
    let a = 1 - u;
    b[3] = a * a * a;
    b[2] = 3 * a * a * u;
    b[1] = 3 * a * u * u;
    b[0] = u * u * u;
    return b;
}

let nbezier = function (u) {
    let b = [];
    b.push(3 * u * u);
    b.push(3 * u * (2 - 3 * u));
    b.push(3 * (1 - 4 * u + 3 * u * u));
    b.push(-3 * (1 - u) * (1 - u));
    return b;
}

// Extra Credit Block Start
// ! Texture Adding 

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}
function configureTexture(src) {

    texture = gl.createTexture();

    const image = new Image();
    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    }
    image.src = src
    gl.uniform1i(gl.getUniformLocation(program, "texture"), 0);
}
// Extra Credit Block End

// ! Wireframe

const TeapotWireframe = (vertices, indices) => {
    let h = 1.0 / numDivisions;

    let patch = new Array(numTeapotPatches);
    for (let i = 0; i < numTeapotPatches; i++) patch[i] = new Array(16);
    for (let i = 0; i < numTeapotPatches; i++)
        for (j = 0; j < 16; j++) {
            patch[i][j] = vec4([vertices[indices[i][j]][0],
            vertices[indices[i][j]][2],
            vertices[indices[i][j]][1], 1.0]);
        }

    for (let n = 0; n < numTeapotPatches; n++) {
        let data = new Array(numDivisions + 1);
        for (let j = 0; j <= numDivisions; j++) data[j] = new Array(numDivisions + 1);
        for (let i = 0; i <= numDivisions; i++) for (let j = 0; j <= numDivisions; j++) {
            data[i][j] = vec4(0, 0, 0, 1);
            let u = i * h;
            let v = j * h;
            let t = new Array(4);
            for (let ii = 0; ii < 4; ii++) t[ii] = new Array(4);
            for (let ii = 0; ii < 4; ii++) for (let jj = 0; jj < 4; jj++)
                t[ii][jj] = bezier(u)[ii] * bezier(v)[jj];

            for (let ii = 0; ii < 4; ii++) for (let jj = 0; jj < 4; jj++) {
                let temp = vec4(patch[n][4 * ii + jj]);
                temp = scale(t[ii][jj], temp);
                data[i][j] = add(data[i][j], temp);
            }
        }

        for (let i = 0; i < numDivisions; i++) for (let j = 0; j < numDivisions; j++) {
            pointsTW.push(data[i][j]);
            pointsTW.push(data[i + 1][j]);
            pointsTW.push(data[i + 1][j + 1]);
            pointsTW.push(data[i][j]);
            pointsTW.push(data[i + 1][j + 1]);
            pointsTW.push(data[i][j + 1]);
            indexTW += 6;
        }
    }
    gl.useProgram(program);

    let vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsTW), gl.STATIC_DRAW);

    let vPositionTW = gl.getAttribLocation(program, "vPositionTW");
    gl.vertexAttribPointer(vPositionTW, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionTW);

    projection = ortho(-2, 2, -2, 2, -20, 20);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Projection"), false, flatten(projection));

    TWrender();
}
const TWrender = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    modelViewTW = mat4();
    if (trackballMove && selectedTransform == "rotate") {
        axis = normalize(axis);
        modelViewTW = mult(modelViewTW, rotate(angle, axis));
    } else if (selectedTransform == "translate") {
        modelViewTW = mult(modelViewTW, translate(translateX, translateY, translateZ));
    } else if (selectedTransform == "scale") {
        let scaleMatrix = scalem(scaled, scaled, scaled);
        modelViewTW = mult(modelViewTW, scaleMatrix);
    } else if (flagTW) {
        thetaTW[axisTW] += 0.5;
        modelViewTW = mult(modelViewTW, rotate(thetaTW[xAxisTW], [1, 0, 0]));
        modelViewTW = mult(modelViewTW, rotate(thetaTW[yAxisTW], [0, 1, 0]));
        modelViewTW = mult(modelViewTW, rotate(thetaTW[zAxisTW], [0, 0, 1]));
    }


    gl.uniformMatrix4fv(gl.getUniformLocation(program, "ModelView"), false, flatten(modelViewTW));
    gl.uniform4fv(gl.getUniformLocation(program, "TWObjectColor"), flatten(TWObjectColor))

    for (let i = 0; i < indexTW; i += 3)
        gl.drawArrays(gl.LINE_LOOP, i, 3);

    requestAnimFrame(TWrender);
}
// ! Gourand and Phoung
const TeapotGourandAndPhoung = (vertices, indices) => {

    let sum = [0, 0, 0];
    for (let i = 0; i < 306; i++) for (j = 0; j < 3; j++)
        sum[j] += vertices[i][j];
    for (j = 0; j < 3; j++) sum[j] /= 306;
    for (let i = 0; i < 306; i++) for (j = 0; j < 2; j++)
        vertices[i][j] -= sum[j] / 2
    for (let i = 0; i < 306; i++) for (j = 0; j < 3; j++)
        vertices[i][j] *= 2;

    let h = 1.0 / numDivisions;

    let patch = new Array(numTeapotPatches);
    for (let i = 0; i < numTeapotPatches; i++) patch[i] = new Array(16);
    for (let i = 0; i < numTeapotPatches; i++)
        for (j = 0; j < 16; j++) {
            patch[i][j] = vec4([vertices[indices[i][j]][0],
            vertices[indices[i][j]][2],
            vertices[indices[i][j]][1], 1.0]);
        }
    for (let n = 0; n < numTeapotPatches; n++) {
        let data = new Array(numDivisions + 1);
        for (let j = 0; j <= numDivisions; j++)
            data[j] = new Array(numDivisions + 1);
        for (let i = 0; i <= numDivisions; i++)
            for (let j = 0; j <= numDivisions; j++) {
                data[i][j] = vec4(0, 0, 0, 1);
                let u = i * h;
                let v = j * h;
                let t = new Array(4);
                for (let ii = 0; ii < 4; ii++)
                    t[ii] = new Array(4);
                for (let ii = 0; ii < 4; ii++)
                    for (let jj = 0; jj < 4; jj++)
                        t[ii][jj] = bezier(u)[ii] * bezier(v)[jj];
                for (let ii = 0; ii < 4; ii++) for (let jj = 0; jj < 4; jj++) {
                    temp = vec4(patch[n][4 * ii + jj]);
                    temp = scale(t[ii][jj], temp);
                    data[i][j] = add(data[i][j], temp);
                }
            }

        let ndata = new Array(numDivisions + 1);
        for (let j = 0; j <= numDivisions; j++) ndata[j] = new Array(numDivisions + 1);
        let tdata = new Array(numDivisions + 1);
        for (let j = 0; j <= numDivisions; j++) tdata[j] = new Array(numDivisions + 1);
        let sdata = new Array(numDivisions + 1);
        for (let j = 0; j <= numDivisions; j++) sdata[j] = new Array(numDivisions + 1);
        for (let i = 0; i <= numDivisions; i++) for (let j = 0; j <= numDivisions; j++) {
            ndata[i][j] = vec4(0, 0, 0, 0);
            sdata[i][j] = vec4(0, 0, 0, 0);
            tdata[i][j] = vec4(0, 0, 0, 0);
            let u = i * h;
            let v = j * h;
            let tt = new Array(4);
            for (let ii = 0; ii < 4; ii++) tt[ii] = new Array(4);
            let ss = new Array(4);
            for (let ii = 0; ii < 4; ii++) ss[ii] = new Array(4);
            for (let ii = 0; ii < 4; ii++)
                for (let jj = 0; jj < 4; jj++) {
                    tt[ii][jj] = nbezier(u)[ii] * bezier(v)[jj];
                    ss[ii][jj] = bezier(u)[ii] * nbezier(v)[jj];
                }
            for (let ii = 0; ii < 4; ii++) for (let jj = 0; jj < 4; jj++) {
                let temp = vec4(patch[n][4 * ii + jj]);;
                temp = scale(tt[ii][jj], temp);
                tdata[i][j] = add(tdata[i][j], temp);
                let stemp = vec4(patch[n][4 * ii + jj]);;
                stemp = scale(ss[ii][jj], stemp);
                sdata[i][j] = add(sdata[i][j], stemp);
            }
            temp = cross(tdata[i][j], sdata[i][j])
            ndata[i][j] = normalize(vec4(temp[0], temp[1], temp[2], 0));
        }
        for (let i = 0; i < numDivisions; i++) for (let j = 0; j < numDivisions; j++) {
            pointsTGP.push(data[i][j]);
            normalsTGP.push(ndata[i][j]);
            texCoordsArray.push(texCoord[0]);

            pointsTGP.push(data[i + 1][j]);
            normalsTGP.push(ndata[i + 1][j]);
            texCoordsArray.push(texCoord[1]);

            pointsTGP.push(data[i + 1][j + 1]);
            normalsTGP.push(ndata[i + 1][j + 1]);
            texCoordsArray.push(texCoord[2]);

            pointsTGP.push(data[i][j]);
            normalsTGP.push(ndata[i][j]);
            texCoordsArray.push(texCoord[0]);

            pointsTGP.push(data[i + 1][j + 1]);
            normalsTGP.push(ndata[i + 1][j + 1]);
            texCoordsArray.push(texCoord[2]);

            pointsTGP.push(data[i][j + 1]);
            normalsTGP.push(ndata[i][j + 1]);
            texCoordsArray.push(texCoord[3]);

            indexTGP += 6;
        }
    }
    gl.useProgram(program);

    let vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsTGP), gl.STATIC_DRAW);

    let vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    let nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsTGP), gl.STATIC_DRAW);

    let vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var vTexCoord = gl.getAttribLocation(program, "vTexCoord");
    gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vTexCoord);

    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    TGPrender();
}
const TGPrender = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let modelViewTGP = mat4();
    if (trackballMove && selectedTransform == "rotate") {
        axis = normalize(axis);
        modelViewTGP = mult(modelViewTGP, rotate(angle, axis));
    } else if (selectedTransform == "translate") {
        modelViewTGP = mult(modelViewTGP, translate(translateX, translateY, translateZ));
    } else if (selectedTransform == "scale") {
        let scaleMatrix = scalem(scaled, scaled, scaled);
        modelViewTGP = mult(modelViewTGP, scaleMatrix);
    } else if (flagTGP) {
        thetaTGP[axisTGP] += 0.5;
        modelViewTGP = mult(modelViewTGP, rotate(thetaTGP[xAxisTGP], [1, 0, 0]));
        modelViewTGP = mult(modelViewTGP, rotate(thetaTGP[yAxisTGP], [0, 1, 0]));
        modelViewTGP = mult(modelViewTGP, rotate(thetaTGP[zAxisTGP], [0, 0, 1]));
    }
    else {
        eye = vec3(Math.sin(phi), Math.sin(theta), Math.cos(phi));
        modelViewTGP = lookAt(eye, at, up);
    }

    gl.uniformMatrix4fv(gl.getUniformLocation(program, "modelViewTGP"), false, flatten(modelViewTGP));

    projectionMatrix = ortho(-4, 4, -4, 4, -200, 200);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix));

    normalMatrix = [
        vec3(modelViewTGP[0][0], modelViewTGP[0][1], modelViewTGP[0][2]),
        vec3(modelViewTGP[1][0], modelViewTGP[1][1], modelViewTGP[1][2]),
        vec3(modelViewTGP[2][0], modelViewTGP[2][1], modelViewTGP[2][2])
    ];
    gl.uniformMatrix3fv(normalMatrixLoc, false, flatten(normalMatrix));

    let ambientProduct = mult(lightAmbient, materialAmbient);
    let diffuseProduct = mult(lightDiffuse, materialDiffuse);
    let specularProduct = mult(lightSpecular, materialSpecular);

    gl.uniform4fv(gl.getUniformLocation(program, "objectColor"), flatten(objectColor))
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform3f(gl.getUniformLocation(program, "shininessColor"), shininessColor[0], shininessColor[1], shininessColor[2]);
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), materialShininess);

    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));
    gl.uniform4fv(gl.getUniformLocation(program, "eyePosition"), flatten(eyePosition));
    gl.drawArrays(gl.TRIANGLES, 0, indexTGP);
    requestAnimFrame(TGPrender);
}
// Teapot End

//  Initial Setting

let btn_button = document.getElementById("btn-load")
let loaded_file = document.getElementById("file")

btn_button.onclick = () => {
    console.log(currentShade)
    if (currentShade != "0") {
        initShaders()
        LoadVertices()
    } else
        alert("no shading selected")
}
const LoadVertices = () => {
    const file = loaded_file.files[0]
    fetch(`http://localhost:8000/static/vertices/${file ? file.name : "teapot.js"}`)
        .then(res => res.text())
        .then(data => {
            eval(data)
            if (currentShade == "1")
                TeapotWireframe(vertices, indices)
            else if (currentShade == "2")
                TeapotGourandAndPhoung(vertices, indices)
            else
                TeapotGourandAndPhoung(vertices, indices)
        })
        .catch(err => alert("The file is not within the directory"))
}

document.getElementById("shading").onchange = e => {
    if (e.target.value != "0") {
        currentShade = e.target.value
        if (currentShade == "1") {
            vertexText = TeapotWireframeText.vert
            fragmentText = TeapotWireframeText.frag
        }
        else if (currentShade == "2") {
            vertexText = TeapotGourandText.vert
            fragmentText = TeapotGourandText.frag
        } else {
            vertexText = TeapotPhongText.vert
            fragmentText = TeapotPhongText.frag
        }
    }
    initShaders()
    LoadVertices()
}

// Color Selection
document.getElementById("objectColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    if (currentShade == 1)
        TWObjectColor = vec4(r, g, b, 1.0);
    else
        objectColor = vec4(r, g, b, 1.0)
}

document.getElementById("ambientLightColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    lightAmbient = vec4(r, g, b, 1.0)
}

document.getElementById("specularLightColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    lightSpecular = vec4(r, g, b, 1.0)
}

document.getElementById("diffuseLightColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    lightDiffuse = vec4(r, g, b, 1.0)
}

document.getElementById("ambientMaterialColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    materialAmbient = vec4(r, g, b, 1.0)
}
document.getElementById("specularMaterialColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    materialSpecular = vec4(r, g, b, 1.0)
}
document.getElementById("diffuseMaterialColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    materialDiffuse = vec4(r, g, b, 1.0)
}

document.getElementById("shiniessColor").onchange = e => {
    let { r, g, b } = HEXtoRGB(e.target.value)
    shininessColor = vec4(r, g, b, 1.0)
}

// !  light Position
document.getElementById("lightPositionX").onchange = e => lightPosition[0] = parseFloat(e.target.value)
document.getElementById("lightPositionY").onchange = e => lightPosition[1] = parseFloat(e.target.value)
document.getElementById("lightPositionZ").onchange = e => lightPosition[2] = parseFloat(e.target.value)

// ! eyePostion
document.getElementById("eyePositionX").onchange = e => eyePosition[0] = parseFloat(e.target.value)
document.getElementById("eyePositionY").onchange = e => eyePosition[1] = parseFloat(e.target.value)
document.getElementById("eyePositionZ").onchange = e => eyePosition[2] = parseFloat(e.target.value)

// ! At Direction
document.getElementById("atX").onchange = e => at[0] = parseFloat(e.target.value);
document.getElementById("atY").onchange = e => at[1] = parseFloat(e.target.value);
document.getElementById("atZ").onchange = e => at[2] = parseFloat(e.target.value);

// ! Up Direction 
document.getElementById("upX").onchange = e => up[0] = parseFloat(e.target.value);
document.getElementById("upY").onchange = e => up[1] = parseFloat(e.target.value);
document.getElementById("upZ").onchange = e => up[2] = parseFloat(e.target.value);

// ! Position Left, Right, Top and Down
document.getElementById("btnLeft").onclick = function () { phi += dr; };
document.getElementById("btnRight").onclick = function () { phi -= dr; };
document.getElementById("btnTop").onclick = function () { theta += dr; };
document.getElementById("btnBottom").onclick = function () { theta -= dr; };

// ! tranformation

document.getElementById("selectTransform").onchange = e => selectedTransform = e.target.value;

document.getElementById("Autoroto").onchange = e => {
    if (currentShade == "1")
        flagTW = e.target.value
    else
        flagTGP = e.target.value
}

document.getElementById("selectAxis").onchange = e => {
    if (currentShade == "1")
        axisTW = e.target.value
    else
        axisTGP = e.target.value
}
let imageSrc = document.getElementById("texImage")

imageSrc.onchange = e => { configureTexture(e.target.value) }
