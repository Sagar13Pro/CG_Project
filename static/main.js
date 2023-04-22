
let program, gl;

let vertexText, fragmentText;

const numTeapotPatches = 32, numDivisions = 3;

// Teapot wireframe var
let pointsTW = [], indexTW = 0; flagTW = true; thetaTW = [0, 0, 0], axisTW = 0, xAxisTW = 0, yAxisTW = 1, zAxisTW = 2;

const initShaders = () => {

    if (program) {
        gl.deleteProgram(program);
        gl.deleteShader(vertShdr);
        gl.deleteShader(fragShdr);
    }
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
        var msg = "Vertex shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog(vertShdr) + "</pre>";
        alert(msg);
        return -1;
    }

    if (!gl.getShaderParameter(fragShdr, gl.COMPILE_STATUS)) {
        var msg = "Fragment shader failed to compile.  The error log is:"
            + "<pre>" + gl.getShaderInfoLog(fragShdr) + "</pre>";
        alert(msg);
        return -1;
    }

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var msg = "Shader program failed to link.  The error log is:"
            + "<pre>" + gl.getProgramInfoLog(program) + "</pre>";
        alert(msg);
        return -1;
    }
}

// Teapot Start
// ? function for both
var bezier = function (u) {
    var b = new Array(4);
    var a = 1 - u;
    b[3] = a * a * a;
    b[2] = 3 * a * a * u;
    b[1] = 3 * a * u * u;
    b[0] = u * u * u;
    return b;
}

var nbezier = function (u) {
    var b = [];
    b.push(3 * u * u);
    b.push(3 * u * (2 - 3 * u));
    b.push(3 * (1 - 4 * u + 3 * u * u));
    b.push(-3 * (1 - u) * (1 - u));
    return b;
}

// ! Wireframe

const Teapot_Wireframe = (vertices, indices) => {
    var h = 1.0 / numDivisions;

    var patch = new Array(numTeapotPatches);
    for (var i = 0; i < numTeapotPatches; i++) patch[i] = new Array(16);
    for (var i = 0; i < numTeapotPatches; i++)
        for (j = 0; j < 16; j++) {
            patch[i][j] = vec4([vertices[indices[i][j]][0],
            vertices[indices[i][j]][2],
            vertices[indices[i][j]][1], 1.0]);
        }


    for (var n = 0; n < numTeapotPatches; n++) {
        var data = new Array(numDivisions + 1);
        for (var j = 0; j <= numDivisions; j++) data[j] = new Array(numDivisions + 1);
        for (var i = 0; i <= numDivisions; i++) for (var j = 0; j <= numDivisions; j++) {
            data[i][j] = vec4(0, 0, 0, 1);
            var u = i * h;
            var v = j * h;
            var t = new Array(4);
            for (var ii = 0; ii < 4; ii++) t[ii] = new Array(4);
            for (var ii = 0; ii < 4; ii++) for (var jj = 0; jj < 4; jj++)
                t[ii][jj] = bezier(u)[ii] * bezier(v)[jj];

            for (var ii = 0; ii < 4; ii++) for (var jj = 0; jj < 4; jj++) {
                var temp = vec4(patch[n][4 * ii + jj]);
                temp = scale(t[ii][jj], temp);
                data[i][j] = add(data[i][j], temp);
            }
        }

        for (var i = 0; i < numDivisions; i++) for (var j = 0; j < numDivisions; j++) {
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

    var vBufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsTW), gl.STATIC_DRAW);

    var vPositionTW = gl.getAttribLocation(program, "vPositionTW");
    gl.vertexAttribPointer(vPositionTW, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionTW);

    var projection = ortho(-2, 2, -2, 2, -20, 20);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "Projection"), false, flatten(projection));

    TW_render();
}
var TW_render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (flagTW)
        thetaTW[axisTW] += 0.5;
    modelView = mat4();
    modelView = mult(modelView, rotate(thetaTW[xAxisTW], [1, 0, 0]));
    modelView = mult(modelView, rotate(thetaTW[yAxisTW], [0, 1, 0]));
    modelView = mult(modelView, rotate(thetaTW[zAxisTW], [0, 0, 1]));
    gl.uniformMatrix4fv(gl.getUniformLocation(program, "ModelView"), false, flatten(modelView));

    for (var i = 0; i < indexTW; i += 3)
        gl.drawArrays(gl.LINE_LOOP, i, 3);

    requestAnimFrame(TW_render);
}
// ! Gourand
const Teapot_Gourand = () => {

}
// Teapot End

//  Initial Setting

let btn_button = document.getElementById("btn-load")
let loaded_file = document.getElementById("file")

const LoadVertices = () => {
    const file = loaded_file.files[0]
    fetch(`http://localhost:8000/static/vertices/${file ? file.name : 'teapot.js'}`)
        .then(res => res.text())
        .then(data => {
            eval(data)
            if (currentShade == "1")
                Teapot_Wireframe(vertices, indices)
            else
                Teapot_Gourand(vertices, indices)
        })
        .catch(err => console.log(err))
}

document.getElementById("shading").onchange = e => {
    if (e.target.value != "0") {
        currentShade = e.target.value
        if (currentShade == "1") {
            vertexText = TeapotWireframeText.vert
            fragmentText = TeapotWireframeText.frag
        }
        else {
            vertexText = TeapotGourandText.vert
            fragmentText = TeapotGourandText.frag
        }
    }

    initShaders()
    LoadVertices()
}

window.onload = () => {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) {
        alert("WebGL isn't available");
        return
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    vertexText = TeapotWireframeText.vert
    fragmentText = TeapotWireframeText.frag
}
