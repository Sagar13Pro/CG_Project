const TeapotWireframeText = {
    'vert': `
        attribute  vec4 vPositionTW;
        uniform mat4 Projection, ModelView;
        void main() 
        {
            gl_Position = Projection*ModelView*vPositionTW;
        } 
    `,
    'frag': `
        precision mediump float;
        void main()
        {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }`
}

let TeapotGourandText = {
    'vert': `
        attribute  vec4 vPosition;
        attribute  vec4 vNormal;
        varying vec4 fColor;

        uniform vec4 ambientProduct, diffuseProduct, specularProduct;
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform vec4 lightPosition;
        uniform float shininess;
        uniform mat3 normalMatrix;

        void main() 
        {
            vec3 pos = (modelViewMatrix * vPosition).xyz;
            vec3 light = lightPosition.xyz;
            vec3 L = normalize( light - pos );
            vec3 E = normalize( -pos );
            vec3 H = normalize( L + E );

            // Transform vertex normal into eye coordinates
            vec3 N = normalize( normalMatrix*vNormal.xyz);

            // Compute terms in the illumination equation
            vec4 ambient = ambientProduct;

            float Kd = max( dot(L, N), 0.0 );
            vec4  diffuse = Kd*diffuseProduct;
            float Ks = pow( max(dot(N, H), 0.0), shininess );
            vec4  specular = Ks * specularProduct;
            if( dot(L, N) < 0.0 ) {
            specular = vec4(0.0, 0.0, 0.0, 1.0);
            } 
            gl_Position = projectionMatrix * modelViewMatrix * vPosition;
            fColor = ambient + diffuse +specular;
            fColor.a = 1.0;
        }`,
    'frag': `
            precision mediump float;
            varying vec4 fColor;
            void main()
            {
                gl_FragColor = fColor;
            }`
}