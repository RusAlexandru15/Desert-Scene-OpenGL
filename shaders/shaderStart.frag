#version 410 core

in vec3 fNormal;
in vec4 fPosEye;
in vec2 fTexCoords; //coordonate UV ale texturii
in vec3 fPosition;

//pt umbra
in vec4 fragPosLightSpace;

out vec4 fColor;

//lighting
uniform	vec3 lightDir;
uniform	vec3 lightColor;
uniform vec3 lightPosEye;
uniform float punctiforma;

//harta de adancimi
uniform sampler2D shadowMap;

//texture
uniform sampler2D diffuseTexture;
uniform sampler2D specularTexture;

vec3 ambient;
float ambientStrength = 0.2f;
vec3 diffuse;
vec3 specular;
float specularStrength = 0.5f;
float shininess = 32.0f;

vec3 ambient2;
vec3 diffuse2;
vec3 specular2;


//ceata 
vec4 fogColor=vec4(0.9f,0.6f,0.3f,1.0f);
//vec4 fogColor=vec4(0.5f,0.5f,0.5f,1.0f);
uniform int ceata;

//lumina directionala

void computeDirLight()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	
	//transform normal
	vec3 normalEye = normalize(fNormal);	
	
	//compute light direction
	vec3 lightDirN = normalize(lightDir);
	
	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye - fPosEye.xyz);

	//Blinn
    vec3 halfVector = normalize(lightDirN + viewDirN);

		
	//compute ambient light
	ambient = ambientStrength * lightColor;
	
	//compute diffuse light
	diffuse = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	
	
	 //compute specular light
     float specCoeff = pow(max(dot(normalEye, halfVector), 0.0f), shininess);
     specular = specularStrength * specCoeff * lightColor;

}



void computeDotLight()
{		
	vec3 cameraPosEye = vec3(0.0f);//in eye coordinates, the viewer is situated at the origin
	
	
	//transform normal
	vec3 normalEye = normalize(fNormal);	
	
	//compute light direction
	vec3 lightDirN = normalize(-lightPosEye  + fPosition);    

	
	//compute view direction 
	vec3 viewDirN = normalize(cameraPosEye + fPosition);   
		
	//compute ambient light
	ambient2 = ambientStrength * lightColor;
	
	//compute diffuse light
	diffuse2 = max(dot(normalEye, lightDirN), 0.0f) * lightColor;
	
	//compute specular light
	vec3 reflection = reflect(-lightDirN, normalEye);
	float specCoeff = pow(max(dot(viewDirN, reflection), 0.0f), shininess);
	specular2 = specularStrength * specCoeff * lightColor;
}


float computeAtenuation()
{
    float constant = 1.0f;
    float linear = 0.0045f;
    float quadratic = 0.0075f;

	//compute from vertex distance to light
    float dist = length(lightPosEye - fPosition);

    //compute attenuation
    float att = 1.0f / (constant + linear * dist + quadratic * (dist * dist));
	//att=att*10;
	

	return att;
}



//umbra
float computeShadow(){

   float bias  =  0.005f;
 
   //fragPosLighttSpace e din vertex POZITIA FRAGMENTULUI CURENT IN INTERVALUL [-1,1]
   vec3 normalizedCoords = fragPosLightSpace.xyz / fragPosLightSpace.w; 

  
   // Transform to [0,1] range
   normalizedCoords = normalizedCoords * 0.5 + 0.5;
    
   //supra-esantionare (podeaua e umbrita)
   if (normalizedCoords.z > 1.0f)
       return 0.0f;

  
   //adancimea cea mai apropiata d.p.d.v al luminii
   float closestDepth = texture(shadowMap, normalizedCoords.xy).r;

   //adancimea 
   float currentDepth = normalizedCoords.z;

   //comparare intre adancimea curenta si cea mai apropiata de lumina
   float shadow = currentDepth -bias > closestDepth ? 1.0f : 0.0f;

  

   return shadow;
}


//ceata
float computeFog()
{
 float fogDensity = 0.02f;
 float fragmentDistance = length(fPosEye);
 float fogFactor = exp(-pow(fragmentDistance * fogDensity, 2));

 return clamp(fogFactor, 0.0f, 1.0f);
}




void main() 
{
   
	computeDirLight();
	computeDotLight();
	float shadow = computeShadow();
	float reducingLight=0.4f;

	float fogFactor = computeFog();
	float att=computeAtenuation();
	att*=punctiforma;
    
	ambient*=reducingLight;
	diffuse*=reducingLight;
	specular*=reducingLight;
	
	ambient2*=att;
	diffuse2*=att;
	specular2*=att;

	ambient=ambient+ambient2;
	diffuse=diffuse+diffuse2;
	specular=specular+specular2;

	ambient *= texture(diffuseTexture, fTexCoords).rgb;
	diffuse *= texture(diffuseTexture, fTexCoords).rgb;
	specular *= texture(specularTexture, fTexCoords).rgb;

	
	vec3 color = min((ambient + (1.0f-shadow)*diffuse) + (1.0f-shadow)*specular, 1.0f);
    
    
	vec4 colorFromTexture = texture(diffuseTexture, fTexCoords);
    if(colorFromTexture.a < 0.65) //modific conturul copacilor
         discard;

   
	if(ceata==1)
	  fColor=fogColor*(1-fogFactor) + vec4(color* fogFactor,1.0f);
    else 
	  fColor = vec4(color,1.0f);

  

}
