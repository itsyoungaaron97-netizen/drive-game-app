import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from "react-native";

import {
  Map,
  Camera,
  UserLocation,
  GeoJSONSource,
  Layer,
  type CameraRef,
} from "@maplibre/maplibre-react-native";

import * as Location from "expo-location";


// =====================================
// MAP STYLE
// =====================================

const MAP_STYLE =
  "https://tiles.openfreemap.org/styles/liberty";


// =====================================
// SCREEN
// =====================================

export default function MapLibreTest(){

const cameraRef =
useRef<CameraRef>(null);



const [
location,
setLocation
]=useState<Location.LocationObject | null>(null);



const [
hasPermission,
setHasPermission
]=useState<boolean | null>(null);



const [
routeGeoJSON,
setRouteGeoJSON
]=useState<any>(null);




// =====================================
// LOCATION
// =====================================

useEffect(()=>{


const loadLocation =
async()=>{


const result =
await Location.requestForegroundPermissionsAsync();



if(result.status !== "granted"){

setHasPermission(false);

return;

}



setHasPermission(true);



const current =
await Location.getCurrentPositionAsync({

accuracy:
Location.Accuracy.High,

});



setLocation(current);



};


loadLocation();


},[]);






// =====================================
// LOADING
// =====================================

if(hasPermission === null){

return(

<View style={styles.center}>

<ActivityIndicator

size="large"

color="#0ea5e9"

/>


<Text style={styles.loadingText}>

Requesting location...

</Text>


</View>

);

}






if(hasPermission === false){

return(

<View style={styles.center}>

<Text style={styles.errorText}>

Location permission is required for driving.

</Text>


</View>

);

}








return(

<View style={styles.container}>


<Map

style={styles.map}

mapStyle={MAP_STYLE}

logo={false}

attribution={true}

compass={true}

compassPosition={{

top:12,

right:12,

}}


>



<Camera

ref={cameraRef}


initialViewState={{

center:

location

?

[

location.coords.longitude,

location.coords.latitude

]

:

[

13.405,

52.52

],


zoom:

15,


pitch:

55,


bearing:

0,


}}


/>





<UserLocation />







{

routeGeoJSON &&

<GeoJSONSource

id="route"

data={routeGeoJSON}

>


<Layer

id="route-line"

type="line"

paint={{

"line-color":

"#0ea5e9",


"line-width":

5,


"line-opacity":

0.9,

}}


layout={{

"line-cap":

"round",


"line-join":

"round",

}}


/>


</GeoJSONSource>

}



</Map>







<View style={styles.overlay}>


<Text style={styles.overlayText}>


{

location

?

`Lat: ${location.coords.latitude.toFixed(5)}
 Lon: ${location.coords.longitude.toFixed(5)}`

:

"Getting location..."

}


</Text>


</View>




</View>

);


}









// =====================================
// STYLES
// =====================================

const styles =
StyleSheet.create({


container:{

flex:1,

backgroundColor:"#000",

},



map:{

flex:1,

},



center:{

flex:1,

justifyContent:"center",

alignItems:"center",

backgroundColor:"#0f172a",

padding:24,

},



loadingText:{

marginTop:12,

color:"#94a3b8",

fontSize:16,

},



errorText:{

color:"#f87171",

fontSize:16,

textAlign:"center",

},



overlay:{

position:"absolute",

top:48,

left:16,

right:16,

backgroundColor:"rgba(15,23,42,0.85)",

paddingVertical:10,

paddingHorizontal:14,

borderRadius:12,

},



overlayText:{

color:"#e2e8f0",

fontSize:13,

fontFamily:"monospace",

},



});