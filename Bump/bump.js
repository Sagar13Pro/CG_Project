var texSize = 256;

// Bump Data

var data = new Array()
for (var i = 0; i <= texSize; i++)  data[i] = new Array();
for (var i = 0; i <= texSize; i++) for (var j = 0; j <= texSize; j++)
    data[i][j] = 0.0;
for (var i = texSize / 4; i < 3 * texSize / 4; i++) for (var j = texSize / 4; j < 3 * texSize / 4; j++)
    data[i][j] = rawData[i * 256 + j]

// Bump Map Normals

var normalst = new Array()
for (var i = 0; i < texSize; i++)  normalst[i] = new Array();
for (var i = 0; i < texSize; i++) for (var j = 0; j < texSize; j++)
    normalst[i][j] = new Array();
for (var i = 0; i < texSize; i++) for (var j = 0; j < texSize; j++) {
    normalst[i][j][0] = data[i][j] - data[i + 1][j];
    normalst[i][j][1] = data[i][j] - data[i][j + 1];
    normalst[i][j][2] = 1;
}

// Scale to Texture Coordinates

for (var i = 0; i < texSize; i++) for (var j = 0; j < texSize; j++) {
    var d = 0;
    for (k = 0; k < 3; k++) d += normalst[i][j][k] * normalst[i][j][k];
    d = Math.sqrt(d);
    for (k = 0; k < 3; k++) normalst[i][j][k] = 0.5 * normalst[i][j][k] / d + 0.5;
}

// Normal Texture Array

var normalsB = new Uint8Array(3 * texSize * texSize);

for (var i = 0; i < texSize; i++)
    for (var j = 0; j < texSize; j++)
        for (var k = 0; k < 3; k++)
            normalsB[3 * texSize * i + 3 * j + k] = 255 * normalst[i][j][k];

var numVertices = 6;

var pointsArray = [];
var texCoordsArray = [];

var texCoord = [
    vec2(0, 0),
    vec2(0, 1),
    vec2(1, 1),
    vec2(1, 0)
];

var normal = vec4(0.0, 1.0, -1.0, 0.0);
var tangent = vec3(1.0, 1.0, 0.0);

function configureTexture(image) {
    var texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, texSize, texSize, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}