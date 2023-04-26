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
        uniform vec4 TWObjectColor;
        void main()
        {
            gl_FragColor = TWObjectColor;
        }`
}

const TeapotGourandText = {
    'vert': `
        attribute  vec4 vPosition;
        attribute  vec4 vNormal;
        varying vec4 fColor;

        uniform mat4 modelViewTGP;
        uniform mat3 normalMatrix;
        uniform mat4 projectionMatrix;
        
        uniform vec4 objectColor;
        uniform vec4  diffuseProduct, specularProduct,ambientProduct;
        uniform float shininess;
        uniform vec3 shininessColor;

        uniform vec4 lightPosition, eyePosition;

        uniform vec4 atDirection;
        uniform vec4 upDirection;
        uniform vec4 leftPosition;
        uniform vec4 rightPosition;
        uniform vec4 topPosition;
        uniform vec4 bottomPosition;

        void main() 
        {
            vec3 pos = (modelViewTGP * vPosition).xyz;

            vec3 light = lightPosition.xyz;

            vec3 L = normalize( light - pos );

            vec3 E = normalize(eyePosition.xyz - pos );
            vec3 H = normalize( L + E );

            // Transform vertex normal into eye coordinates
            vec3 N = normalize( normalMatrix*vNormal.xyz);

            // Compute terms in the illumination equation
            // vec4 ambient = vec4(Ka * ambientProduct,1.0);

            float Kd = max( dot(L, N), 0.0 );
            vec4  diffuse = Kd*diffuseProduct;
            float Ks = pow( max(dot(N, H), 0.0), shininess );
            vec4  specular = Ks * specularProduct * vec4(shininessColor,1.0);
            if( dot(L, N) < 0.0 ) {
            specular = vec4(0.0, 0.0, 0.0, 1.0);
            } 

            gl_Position = projectionMatrix * modelViewTGP * vPosition;

            // Transform vertex position into clip coordinates
            // gl_Position = projMatrix * viewMatrix * modelViewTGP * vPosition;
            
            fColor = objectColor * (ambientProduct + diffuse + specular);
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
const TeapotPhongText = {
    'vert': `
        attribute  vec4 vPosition;
        attribute  vec4 vNormal;
        varying vec3 N, L, E, H;

        uniform mat4 modelViewTGP;
        uniform mat3 normalMatrix;
        uniform mat4 projectionMatrix;

        uniform vec4 objectColor;
        uniform vec4 ambientProduct, diffuseProduct, specularProduct;
        uniform float shininess;
        uniform vec3 shininessColor;

        uniform vec4 lightPosition, eyePosition;

        

        void main() 
        {
            vec3 pos = (modelViewTGP * vPosition).xyz;

            vec3 light = lightPosition.xyz;
            L = normalize( light - pos );
            E = normalize( eyePosition.xyz - pos );
            H = normalize( L + E );

            // Transform vertex normal into eye coordinates
            N = normalize( normalMatrix*vNormal.xyz);

            gl_Position = projectionMatrix * modelViewTGP * vPosition;
        }`,
    'frag': `
            precision mediump float;
            varying vec3 N, L, E, H;
            uniform vec4 objectColor,ambientProduct, diffuseProduct, specularProduct;
            uniform float shininess;
            uniform vec3 shininessColor;


            uniform vec4 atDirection;
            uniform vec4 upDirection;
            uniform vec4 leftPosition;
            uniform vec4 rightPosition;
            uniform vec4 topPosition;
            uniform vec4 bottomPosition;
            void main()
            {
                vec4 ambient = ambientProduct;
                
                float Kd = max( dot(L, N), 0.0 );
                vec4 diffuse = Kd*diffuseProduct;

                float Ks = pow( max(dot(N, H), 0.0), shininess );

                vec4 specular = Ks * specularProduct * vec4(shininessColor, 1.0);

                if( dot(L, N) < 0.0 ) {
                    specular = vec4(0.0, 0.0, 0.0, 1.0);
                } 

                gl_FragColor = objectColor * (ambient + diffuse +specular);
                gl_FragColor.a = 1.0;
            }`
};

