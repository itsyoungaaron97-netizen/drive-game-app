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
// MAPLIBRE CONFIG
// =====================================

MapLibreGL.setAccessToken(null);

const MAP_STYLE =
  "https://tiles.openfreemap.org/styles/bright/style.json";


// =====================================
// TYPES
// =====================================

type LocationPoint = {
  latitude: number;
  longitude: number;
};


type RoadReport = {
  id: string;
  type:
    | "traffic"
    | "police"
    | "crash";
  latitude: number;
  longitude: number;
  user: string;
  time: string;
};


// =====================================
// SEARCH ADDRESS
// =====================================

async function searchAddress(address:string){

  try{

    const response =
      await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
        {
          headers:{
            "User-Agent":"DriveGame-App",
          },
        }
      );


    const data =
      await response.json();


    if(!data?.length)
      return null;


    return {
      latitude:Number(data[0].lat),
      longitude:Number(data[0].lon),
      name:data[0].display_name,
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


    return data.routes[0]
      .geometry
      .coordinates
      .map(
        (point:number[])=>({

          latitude:point[1],

          longitude:point[0],

        })
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
]=useState<LocationPoint[]>([]);


const [
reports,
setReports
]=useState<RoadReport[]>([]);


const [
selectedReportLocation,
setSelectedReportLocation
]=useState<LocationPoint|null>(null);



// =====================================
// MUSIC
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


const toggleMusic = ()=>{

Animated.spring(
musicAnimation,
{
toValue:
musicOpen ? 0 : 1,
useNativeDriver:true,
}
).start();


setMusicOpen(!musicOpen);

};const openSpotify = ()=>{

Linking.openURL(
"spotify://"
).catch(()=>{

Linking.openURL(
"https://open.spotify.com"
);

});

};


const openAppleMusic = ()=>{

Linking.openURL(
"music://"
).catch(()=>{

Linking.openURL(
"https://music.apple.com"
);

});

};


const togglePlay = ()=>{

setPlaying(!playing);

};


const nextTrack = ()=>{

setTrack(old=>old+1);

};


const previousTrack = ()=>{

setTrack(old=>Math.max(0,old-1));

};



// =====================================
// LOCATION LOAD
// =====================================

useEffect(()=>{


const load = async()=>{

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

pitch:60,

animationDuration:1000,

});

}


}catch(error){

console.log(error);


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
// DRIVE
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


latestPoints.current=[

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
(point.speed || 0) * 3.6
)
);



cameraRef.current?.setCamera({

centerCoordinate:[
point.longitude,
point.latitude
],

pitch:60,

animationDuration:500,

});

}

);


},[]);




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
(endedAt-startTime.current)/1000
);



const maxSpeed =
calculateMaxSpeedKmh(savedPoints);


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


}catch(error){}



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
// MAP
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

>


<MapLibreGL.Camera

ref={cameraRef}

zoomLevel={16}

pitch={60}

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



{location &&

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



{route.length > 0 &&

<MapLibreGL.ShapeSource

id="route"

shape={{

type:"Feature",

geometry:{

type:"LineString",

coordinates:

route.map(p=>[

p.longitude,
p.latitude

])

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



</MapLibreGL.MapView>


<TouchableOpacity

style={styles.driveButton}

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



const styles =
StyleSheet.create({

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

driveButton:{
position:"absolute",
bottom:40,
alignSelf:"center",
backgroundColor:colors.primary,
paddingHorizontal:40,
paddingVertical:18,
borderRadius:20,
},

});