import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
  Animated,
} from "react-native";

import MapLibreGL from "@maplibre/maplibre-react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  auth,
  saveTrip,
  updateUserStats,
} from "../services/firebase";

import {
  requestLocationPermissions,
  getCurrentPosition,
  watchPosition,
  calculateDistanceKm,
  calculateMaxSpeedKmh,
  calculateAvgSpeedKmh,
  reverseGeocode,
} from "../services/location";

import { TripPoint } from "../types";
import { colors } from "../constants/theme";


// =====================================
// MAPLIBRE 3D CONFIG
// =====================================


const MAP_STYLE =
"https://tiles.openfreemap.org/styles/liberty";


// =====================================
// TYPES
// =====================================

type LocationPoint = {
  latitude:number;
  longitude:number;
};


type RoadReport = {

  id:string;

  type:
  | "traffic"
  | "police"
  | "crash";

  latitude:number;

  longitude:number;

  user:string;

  time:string;

};


// =====================================
// SEARCH ADDRESS
// =====================================

async function searchAddress(
  address:string
){

  try{

    const response =
      await fetch(

        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,

        {
          headers:{
            "User-Agent":
            "DriveGame-App",
          },
        }

      );


    const data =
      await response.json();


    if(!data?.length)
      return null;


    return {

      latitude:
      Number(data[0].lat),

      longitude:
      Number(data[0].lon),

      name:
      data[0].display_name,

    };


  }catch(error){

    console.log(
      "Search error",
      error
    );

    return null;

  }

}



// =====================================
// ROUTE SERVICE
// =====================================

async function getRoute(

  start:LocationPoint,

  end:LocationPoint

){

  try{

    const url =

    `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;


    const response =
      await fetch(url);


    const data =
      await response.json();


    if(!data.routes?.length)
      return [];


    return (

      data.routes[0]
      .geometry
      .coordinates
      .map(

        (point:number[])=>({

          latitude:
          point[1],

          longitude:
          point[0],

        })

      )

    );


  }catch(error){

    console.log(
      "Route error",
      error
    );

    return [];

  }

}





export default function MapScreen(){

const insets =
useSafeAreaInsets();


const mapRef =
useRef<any>(null);


const cameraRef =
useRef<any>(null);


const watchRef =
useRef<any>(null);


const startTime =
useRef(0);


const latestPoints =
useRef<TripPoint[]>([]);


const latestDistance =
useRef(0);


const latestLocation =
useRef<LocationPoint|null>(null);


// =====================================
// STATE
// =====================================


const [
loading,
setLoading
]=useState(true);


const [
location,
setLocation
]=useState<LocationPoint|null>(null);


const [
search,
setSearch
]=useState("");


const [
distanceKm,
setDistanceKm
]=useState(0);


const [
speed,
setSpeed
]=useState(0);


const [
tracking,
setTracking
]=useState(false);


const [
route,
setRoute
]=useState<LocationPoint[]>();


const [
reports,
setReports
]=useState<RoadReport[]>([]);


const [
selectedReportLocation,
setSelectedReportLocation
]=useState<LocationPoint|null>(null);


// =====================================
// MUSIC DRAWER
// =====================================

const [
musicOpen,
setMusicOpen
]=useState(false);


const [
playing,
setPlaying
]=useState(false);


const [
track,
setTrack
]=useState(0);


const musicAnimation =
useRef(
new Animated.Value(0)
).current;


const toggleMusic =
()=>{

Animated.spring(

musicAnimation,

{
toValue:
musicOpen ? 0 : 1,

useNativeDriver:true,

}

).start();


setMusicOpen(!musicOpen);

};
// =====================================
// MUSIC CONTROLS
// =====================================

const openSpotify =
()=>{

Linking.openURL(
"spotify://"
)
.catch(()=>{

Linking.openURL(
"https://open.spotify.com"
);

});

};


const openAppleMusic =
()=>{

Linking.openURL(
"music://"
)
.catch(()=>{

Linking.openURL(
"https://music.apple.com"
);

});

};


const togglePlay =
()=>{

setPlaying(!playing);

};


const nextTrack =
()=>{

setTrack(
old=>old+1
);

};


const previousTrack =
()=>{

setTrack(
old=>Math.max(0,old-1)
);

};




// =====================================
// LOAD LOCATION
// =====================================

useEffect(()=>{

const load =
async()=>{

try{

const permission =
await requestLocationPermissions();


if(!permission){

Alert.alert(
"Location required",
"Enable location permission"
);

return;

}



const position =
await getCurrentPosition();



if(position){

const current={

latitude:
position.coords.latitude,

longitude:
position.coords.longitude,

};



latestLocation.current =
current;


setLocation(current);



cameraRef.current?.setCamera({

centerCoordinate:[

current.longitude,

current.latitude

],

zoomLevel:16,

pitch:45,

heading:0,

animationDuration:1000,

});


}


}catch(error){

console.log(
"Location error",
error
);


}finally{

setLoading(false);

}


};


load();


return()=>{

if(watchRef.current){

watchRef.current.remove();

watchRef.current=null;

}

};


},[]);




// =====================================
// SEARCH
// =====================================

const handleSearch =
async()=>{


if(!search.trim())
return;



const result =
await searchAddress(search);



if(!result){

Alert.alert(
"Not found",
"Destination unavailable"
);

return;

}



const current =
latestLocation.current;



if(!current)
return;



const newRoute =
await getRoute(

current,

result

);



setRoute(newRoute);



if(newRoute.length){

cameraRef.current?.fitBounds(

[

newRoute[0].longitude,
newRoute[0].latitude

],

[

newRoute[newRoute.length-1].longitude,
newRoute[newRoute.length-1].latitude

],

50

);

}


};




// =====================================
// START DRIVE
// =====================================

const startDrive =
useCallback(async()=>{


latestPoints.current=[];

latestDistance.current=0;


setDistanceKm(0);

setSpeed(0);


startTime.current =
Date.now();


setTracking(true);



watchRef.current =

await watchPosition(

(point)=>{


latestPoints.current = [

...latestPoints.current,

point

];



latestDistance.current =

calculateDistanceKm(

latestPoints.current

);



setDistanceKm(

latestDistance.current

);



setSpeed(

Math.round(

(point.speed || 0)
*
3.6

)

);



cameraRef.current?.setCamera({

centerCoordinate:[

point.longitude,

point.latitude

],

pitch:45,

animationDuration:500,

});


}

);


},[]);




// =====================================
// STOP DRIVE
// =====================================

const stopDrive =
async()=>{


if(watchRef.current){

watchRef.current.remove();

watchRef.current=null;

}



setTracking(false);



const savedPoints =
latestPoints.current;



if(savedPoints.length < 2){

Alert.alert(
"Drive too short",
"Drive longer before saving"
);

return;

}



const endedAt =
Date.now();



const duration =
Math.round(

(endedAt-startTime.current)
/1000

);



const maxSpeed =
calculateMaxSpeedKmh(
savedPoints
);



const avgSpeed =
calculateAvgSpeedKmh(
latestDistance.current,
duration
);



const user =
auth.currentUser;



if(!user)
return;



let place:any={};



try{

place =
await reverseGeocode(

savedPoints[0].latitude,

savedPoints[0].longitude

)
||{};


}catch(error){

console.log(error);

}



try{


await saveTrip({

userId:user.uid,

userDisplayName:
user.displayName || "Driver",

startedAt:
startTime.current,

endedAt,

distanceKm:
latestDistance.current,

durationSeconds:
duration,

avgSpeedKmh:
avgSpeed,

maxSpeedKmh:
maxSpeed,

route:
savedPoints,

city:
place.city || "",

state:
place.state || "",

country:
place.country || "",

});



const result =
await updateUserStats(

user.uid,

latestDistance.current,

maxSpeed

);



Alert.alert(

"Drive Saved",

`${latestDistance.current.toFixed(2)} km\n+${result.xpGained} XP`

);



}catch(error:any){

Alert.alert(
"Save failed",
error.message || "Unknown error"
);

}



latestPoints.current=[];

latestDistance.current=0;

setDistanceKm(0);

setSpeed(0);


};
// =====================================
// REPORTS
// =====================================

const createReport =
(
type:
"traffic"
|
"police"
|
"crash"
)=>{


const target =
selectedReportLocation ||
location;


if(!target)
return;



const report:RoadReport={

id:
Date.now().toString(),

type,

latitude:
target.latitude,

longitude:
target.longitude,

user:
auth.currentUser?.displayName ||
"Driver",

time:
"now",

};



setReports(

old=>[
report,
...old
]

);



setSelectedReportLocation(null);

};





const handleMapPress =
(event:any)=>{


const coords =
event.geometry.coordinates;



setSelectedReportLocation({

longitude:coords[0],

latitude:coords[1],

});


Alert.alert(

"Road Report",

"Choose event",

[

{
text:"🚗 Traffic",
onPress:()=>createReport("traffic")
},

{
text:"🚓 Police",
onPress:()=>createReport("police")
},

{
text:"💥 Crash",
onPress:()=>createReport("crash")
},

{
text:"Cancel",
style:"cancel"
}

]

);


};




// =====================================
// LOADING
// =====================================

if(loading){

return(

<View style={styles.loading}>

<ActivityIndicator
size="large"
color={colors.primary}
/>

<Text style={styles.loadingText}>
Loading map...
</Text>

</View>

);

}





return(

<View style={styles.container}>


<MapLibreGL.MapView

ref={mapRef}

style={styles.map}

styleURL={MAP_STYLE}

onPress={handleMapPress}

>


<MapLibreGL.Camera
ref={cameraRef}

zoomLevel={16}

pitch={60}

bearing={0}

heading={0}

centerCoordinate={
location
?
[
location.longitude,
location.latitude
]
:
[14.3,41.0]
}

/>


<MapLibreGL.FillExtrusionLayer
  id="3d-buildings"
  sourceLayerID="building"
  minZoomLevel={14}
  style={{
    fillExtrusionColor: "#888888",
    fillExtrusionHeight: [
      "coalesce",
      ["get", "render_height"],
      10
    ],
    fillExtrusionBase: [
      "coalesce",
      ["get", "render_min_height"],
      0
    ],
    fillExtrusionOpacity: 0.8,
  }}
/>




{

location &&

<MapLibreGL.PointAnnotation

id="car"

coordinate={[

location.longitude,

location.latitude

]}

>

<View style={styles.carMarker}>

<Text>
🚗
</Text>

</View>


</MapLibreGL.PointAnnotation>

}




{

route &&
route.length > 0 &&

<MapLibreGL.ShapeSource

id="route"

shape={{

type:"Feature",

geometry:{

type:"LineString",

coordinates:

route.map(

p=>[

p.longitude,

p.latitude

]

)

}

}}

>

<MapLibreGL.LineLayer

id="routeLine"

style={{

lineColor:"#00ff99",

lineWidth:5

}}

/>


</MapLibreGL.ShapeSource>

}



{

reports.map(report=>(


<MapLibreGL.PointAnnotation

key={report.id}

id={report.id}

coordinate={[

report.longitude,

report.latitude

]}

>

<Text style={styles.reportIcon}>

{

report.type==="traffic"
?
"🚗"
:
report.type==="police"
?
"🚓"
:
"💥"

}

</Text>


</MapLibreGL.PointAnnotation>


))

}



</MapLibreGL.MapView>





{/* MUSIC */}

<View

style={[

styles.musicContainer,

{

top:
insets.top+20

}

]}

>


<TouchableOpacity

style={styles.musicHeader}

onPress={toggleMusic}

>

<Text style={styles.musicTitle}>
🎵 Music
</Text>


<Text style={styles.musicArrow}>

{
musicOpen
?
"▲"
:
"▼"
}

</Text>

</TouchableOpacity>



{

musicOpen &&

<Animated.View

style={styles.musicBox}

>


<TouchableOpacity

style={styles.musicButton}

onPress={previousTrack}

>

<Text>
⏮ Previous
</Text>

</TouchableOpacity>



<TouchableOpacity

style={styles.musicButton}

onPress={togglePlay}

>

<Text>

{
playing
?
"⏸ Pause"
:
"▶ Play"
}

</Text>

</TouchableOpacity>



<TouchableOpacity

style={styles.musicButton}

onPress={nextTrack}

>

<Text>
⏭ Next
</Text>

</TouchableOpacity>



<TouchableOpacity

style={styles.musicButton}

onPress={openSpotify}

>

<Text>
Spotify
</Text>

</TouchableOpacity>



</Animated.View>

}


</View>






<View

style={[

styles.searchBox,

{

top:
insets.top+80

}

]}

>


<TextInput

value={search}

onChangeText={setSearch}

placeholder="Search destination"

placeholderTextColor="#999"

style={styles.input}

/>



<TouchableOpacity

style={styles.searchButton}

onPress={handleSearch}

>

<Text>
GO
</Text>

</TouchableOpacity>


</View>






<View style={styles.stats}>


<Text style={styles.stat}>
{distanceKm.toFixed(2)} km
</Text>


<Text style={styles.stat}>
{speed} km/h
</Text>


</View>






<TouchableOpacity

style={styles.reportButton}

onPress={()=>createReport("traffic")}

>

<Text>
⚠️ REPORT
</Text>

</TouchableOpacity>





<TouchableOpacity

style={[

styles.driveButton,

tracking && styles.stopButton

]}

onPress={

tracking
?
stopDrive
:
startDrive

}

>

<Text>

{

tracking
?
"END DRIVE"
:
"START DRIVE"

}

</Text>

</TouchableOpacity>



</View>

);

}






const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#000",
},

map:{
flex:1,
},

loading:{
flex:1,
justifyContent:"center",
alignItems:"center",
backgroundColor:"#000",
},

loadingText:{
color:"#fff",
marginTop:10,
},

carMarker:{
backgroundColor:"#111",
padding:8,
borderRadius:30,
},

reportIcon:{
fontSize:28,
},


musicContainer:{
position:"absolute",
right:10,
},


musicHeader:{
backgroundColor:"#111",
padding:14,
borderRadius:20,
flexDirection:"row",
},


musicTitle:{
color:"#00ff99",
fontWeight:"900",
},


musicArrow:{
color:"#fff",
marginLeft:10,
},


musicBox:{
backgroundColor:"rgba(0,0,0,.85)",
padding:10,
borderRadius:15,
marginTop:10,
},


musicButton:{
backgroundColor:"#00ff99",
padding:12,
borderRadius:10,
marginVertical:4,
alignItems:"center",
},


searchBox:{
position:"absolute",
left:10,
right:10,
height:55,
backgroundColor:"#111",
borderRadius:15,
flexDirection:"row",
alignItems:"center",
padding:8,
},


input:{
flex:1,
color:"#fff",
},


searchButton:{
backgroundColor:colors.primary,
padding:12,
borderRadius:10,
},


stats:{
position:"absolute",
right:15,
top:170,
},


stat:{
color:colors.primary,
fontSize:22,
fontWeight:"900",
},


reportButton:{
position:"absolute",
right:15,
bottom:130,
backgroundColor:"#ffcc00",
padding:15,
borderRadius:15,
},


driveButton:{
position:"absolute",
bottom:40,
alignSelf:"center",
backgroundColor:colors.primary,
paddingHorizontal:40,
paddingVertical:18,
borderRadius:20,
},


stopButton:{
backgroundColor:colors.danger,
},

});