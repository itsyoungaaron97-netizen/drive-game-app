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
  FlatList,
} from "react-native";

import { WebView } from "react-native-webview";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

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

import {
  TripPoint,
} from "../types";

import {
  colors,
} from "../constants/theme";



// ===============================
// MAP SEARCH SERVICE
// ===============================


async function searchAddress(
  address:string
){

  const url =
  `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;


  const response =
    await fetch(
      url,
      {
        headers:{
          "User-Agent":
          "DriveGame-App",
        },
      }
    );


  const data =
    await response.json();



  if(!data.length)
    return null;



  return {

    latitude:
      Number(data[0].lat),

    longitude:
      Number(data[0].lon),

    name:
      data[0].display_name,

  };

}




// ===============================
// ROUTE SERVICE
// ===============================


async function getRoute(

 start:{
  latitude:number;
  longitude:number;
 },

 end:{
  latitude:number;
  longitude:number;
 }

){


 const url =

 `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;



 const response =
 await fetch(url);



 const data =
 await response.json();



 if(
 !data.routes ||
 !data.routes.length
 )
 return [];



 return data.routes[0]
 .geometry
 .coordinates
 .map(
 (c:number[])=>({

 latitude:c[1],

 longitude:c[0],

 })
 );


}





// ===============================
// REPORT TYPES
// ===============================


type RoadReport = {

 id:string;

 type:
 "traffic"
 |
 "police"
 |
 "crash";

 latitude:number;

 longitude:number;

 user:string;

 time:string;

};






export default function MapScreen(){



const insets =
useSafeAreaInsets();



const webRef =
useRef<WebView>(null);



const watchRef =
useRef<any>(null);



const startTime =
useRef(0);




// ===============================
// STATES
// ===============================


const [location,setLocation] =
useState<{
latitude:number;
longitude:number;
}|null>(null);



const [search,setSearch] =
useState("");



const [destination,setDestination] =
useState<any>(null);



const [route,setRoute] =
useState<any[]>([]);



const [points,setPoints] =
useState<TripPoint[]>([]);



const [distanceKm,setDistanceKm] =
useState(0);



const [speed,setSpeed] =
useState(0);



const [tracking,setTracking] =
useState(false);



const [feed,setFeed] =
useState<RoadReport[]>([

{
id:"1",
type:"traffic",
latitude:0,
longitude:0,
user:"Alex",
time:"2 min ago",
},

{
id:"2",
type:"police",
latitude:0,
longitude:0,
user:"Marco",
time:"5 min ago",
},

]);




// ===============================
// INITIAL LOCATION
// ===============================


useEffect(()=>{


(async()=>{


const allowed =
await requestLocationPermissions();



if(!allowed){

Alert.alert(
"Location required",
"Enable location permission"
);

return;

}



const pos =
await getCurrentPosition();



if(pos){


const loc={

latitude:
pos.coords.latitude,

longitude:
pos.coords.longitude,

};



setLocation(loc);



webRef.current?.postMessage(

JSON.stringify({

type:"location",

...loc,

})

);



}



})();



return()=>{

watchRef.current?.remove();

};


},[]);






// ===============================
// SEARCH DESTINATION
// ===============================


const handleSearch =
async()=>{


if(!search.trim())
return;



const result =
await searchAddress(search);



if(!result){

Alert.alert(
"Not found",
"Address unavailable"
);

return;

}



setDestination(result);



if(location){


const newRoute =
await getRoute(

location,

result

);



setRoute(newRoute);



webRef.current?.postMessage(

JSON.stringify({

type:"route",

points:newRoute,

})

);



}



};




// ===============================
// START DRIVE
// ===============================


const startDrive =
useCallback(async()=>{


setPoints([]);

setDistanceKm(0);

setSpeed(0);



startTime.current =
Date.now();



setTracking(true);




watchRef.current =

await watchPosition(

(point)=>{


setPoints(old=>{


const updated=[

...old,

point

];



setDistanceKm(

calculateDistanceKm(updated)

);



return updated;

});



setSpeed(

Math.round(

(point.speed || 0)

*

3.6

)

);



webRef.current?.postMessage(

JSON.stringify({

type:"location",

latitude:
point.latitude,

longitude:
point.longitude,

})

);



}

);



},[]);// ===============================
// STOP DRIVE
// ===============================


const stopDrive =
async()=>{


watchRef.current?.remove();

watchRef.current = null;


setTracking(false);



if(points.length < 2){

Alert.alert(
"Too short",
"Drive longer before saving"
);

return;

}




const endedAt =
Date.now();



const duration =
Math.round(
(endedAt - startTime.current)
/1000
);



const maxSpeed =
calculateMaxSpeedKmh(points);



const avgSpeed =
calculateAvgSpeedKmh(
distanceKm,
duration
);



const user =
auth.currentUser;



if(!user)
return;




const place =
await reverseGeocode(

points[0].latitude,

points[0].longitude

);




try{


await saveTrip({

userId:
user.uid,

userDisplayName:
user.displayName || "Driver",

startedAt:
startTime.current,

endedAt,

distanceKm,

durationSeconds:
duration,

avgSpeedKmh:
avgSpeed,

maxSpeedKmh:
maxSpeed,

route:
points,

city:
place.city,

state:
place.state,

country:
place.country,

});




const xp =
await updateUserStats(

user.uid,

distanceKm,

maxSpeed

);



Alert.alert(

"Drive Saved",

`${distanceKm.toFixed(2)} km\n+${xp.xpGained} XP\nLevel ${xp.newLevel}`

);



}

catch(error:any){


Alert.alert(

"Error",

error.message ||
"Could not save drive"

);


}



setPoints([]);

setDistanceKm(0);

setSpeed(0);


};







// ===============================
// TAP MAP ROAD REPORT
// ===============================


const createReport =
(type:
"traffic"
|
"police"
|
"crash"
)=>
{


if(!location)
return;



const report:RoadReport = {


id:
Date.now().toString(),


type,


latitude:
location.latitude,


longitude:
location.longitude,


user:
auth.currentUser?.displayName
||
"Driver",


time:
"now",


};





setFeed(old=>[

report,

...old

]);




webRef.current?.postMessage(

JSON.stringify({

type:"report",

report,

})

);



Alert.alert(

"Report sent",

type === "traffic"

?

"🚗 Traffic reported"

:

type === "police"

?

"🚓 Police reported"

:

"💥 Crash reported"

);


};






// ===============================
// REPORT MENU
// ===============================


const showReportMenu =
()=>{


Alert.alert(

"Report road event",

"Choose what is happening",

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





// ===============================
// SEND ROUTE TO MAP
// ===============================


const sendRouteData =
()=>{


webRef.current?.postMessage(

JSON.stringify({

type:"route",

points:route,

})

);


};
// ===============================
// MAP HTML
// ===============================


const html = `

<!DOCTYPE html>

<html>

<head>

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link rel="stylesheet"
href="https://unpkg.com/leaflet/dist/leaflet.css"/>

<style>

html,body,#map{

height:100%;

margin:0;

padding:0;

}

</style>

</head>


<body>

<div id="map"></div>


<script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>


<script>


const map =
L.map("map")
.setView([0,0],15);



L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{

maxZoom:19

}

).addTo(map);




let marker = null;


const carIcon = L.icon({

iconUrl:
"https://cdn-icons-png.flaticon.com/512/744/744465.png",

iconSize:[
45,
45
],

iconAnchor:[
22,
22
],

});


let routeLine =
L.polyline([],
{

color:"#00ff99",

weight:5

}

).addTo(map);



let reports =
L.layerGroup()
.addTo(map);





// MAP TAP REPORT LOCATION


map.on(

"click",

function(e){


window.ReactNativeWebView.postMessage(

JSON.stringify({

type:"mapClick",

latitude:e.latlng.lat,

longitude:e.latlng.lng

})

);



}

);





document.addEventListener(

"message",

function(event){


const data =
JSON.parse(event.data);





if(data.type==="location"){


const pos=[

data.latitude,

data.longitude

];



map.setView(

pos,

16

);



if(marker)

map.removeLayer(marker);



marker =
L.marker(
pos,
{
icon:carIcon
}
)
.addTo(map);



}





if(data.type==="route"){



const coords =

data.points.map(

p=>[

p.latitude,

p.longitude

]

);



routeLine.setLatLngs(coords);



if(coords.length>1)

map.fitBounds(
routeLine.getBounds()
);



}





if(data.type==="report"){



const r =
data.report;



let icon = "⚠️";



if(r.type==="traffic")

icon="🚗";


if(r.type==="police")

icon="🚓";


if(r.type==="crash")

icon="💥";





L.marker(

[

r.latitude,

r.longitude

],

{

title:r.type

}

)

.addTo(reports)

.bindPopup(

icon+" "+r.type

);



}




}



);


</script>

</body>

</html>

`;






// ===============================
// WEBVIEW MESSAGE HANDLER
// ===============================


const handleMapMessage =
(event:any)=>{


const data =
JSON.parse(

event.nativeEvent.data

);



if(data.type==="mapClick"){



const fakeLocation={

latitude:data.latitude,

longitude:data.longitude,

};



Alert.alert(

"Report location",

"Report this point?",

[

{

text:"Traffic",

onPress:()=>{


setFeed(old=>[

{

id:Date.now().toString(),

type:"traffic",

latitude:data.latitude,

longitude:data.longitude,

user:
auth.currentUser?.displayName || "Driver",

time:"now",

},

...old

]);


webRef.current?.postMessage(

JSON.stringify({

type:"report",

report:{

...fakeLocation,

type:"traffic"

}

})

);


}

},


{

text:"Police",

onPress:()=>createReport("police")

},


{

text:"Crash",

onPress:()=>createReport("crash")

},


{

text:"Cancel",

style:"cancel"

}

]

);


}



};






return (

<View style={styles.container}>


<WebView

ref={webRef}

source={{

html

}}

originWhitelist={["*"]}

javaScriptEnabled

onMessage={handleMapMessage}

style={styles.map}

/>






{/* SEARCH */}


<View

style={[

styles.searchBox,

{

top:
insets.top + 10

}

]}

>


<TextInput

value={search}

onChangeText={setSearch}

placeholder="Search destination"

placeholderTextColor="#aaa"

style={styles.input}

/>



<TouchableOpacity

style={styles.searchButton}

onPress={handleSearch}

>


<Text style={styles.searchText}>

GO

</Text>


</TouchableOpacity>


</View>







{/* LIVE FEED */}


<View

style={[

styles.feed,

{

top:
insets.top + 75

}

]}

>


<Text style={styles.feedTitle}>

🌍 Live Road Feed

</Text>



<FlatList

data={feed}

keyExtractor={
item=>item.id
}

renderItem={({item})=>(


<View style={styles.feedItem}>


<Text style={styles.feedUser}>

{item.user}

</Text>


<Text style={styles.feedMessage}>

{item.type==="traffic"
?
"🚗 Traffic"
:
item.type==="police"
?
"🚓 Police"
:
"💥 Crash"}

</Text>


<Text style={styles.feedTime}>

{item.time}

</Text>


</View>


)}


/>



</View>







{/* SPEED */}


<View

style={[

styles.stats,

{

top:
insets.top + 260

}

]}

>


<Text style={styles.stat}>

{distanceKm.toFixed(2)} km

</Text>


<Text style={styles.stat}>

{speed} km/h

</Text>


</View>







{/* REPORT BUTTON */}


<TouchableOpacity

style={styles.reportButton}

onPress={showReportMenu}

>


<Text style={styles.reportText}>

⚠️ REPORT

</Text>


</TouchableOpacity>







{/* DRIVE BUTTON */}


<TouchableOpacity

style={[

styles.driveButton,

tracking &&
styles.stopButton

]}

onPress={

tracking

?

stopDrive

:

startDrive

}

>


<Text style={styles.driveText}>

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

backgroundColor:
colors.background,

},


map:{

flex:1,

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

fontSize:16,

paddingHorizontal:10,

},


searchButton:{

backgroundColor:colors.primary,

paddingHorizontal:15,

paddingVertical:10,

borderRadius:10,

},


searchText:{

color:"#000",

fontWeight:"900",

},


feed:{

position:"absolute",

left:10,

width:260,

maxHeight:180,

backgroundColor:"rgba(0,0,0,0.75)",

borderRadius:15,

padding:10,

},


feedTitle:{

color:colors.primary,

fontWeight:"900",

},


feedItem:{

paddingVertical:6,

borderBottomWidth:1,

borderColor:"#333",

},


feedUser:{

color:"#fff",

fontWeight:"800",

},


feedMessage:{

color:"#ddd",

},


feedTime:{

color:"#888",

fontSize:11,

},


stats:{

position:"absolute",

right:15,

alignItems:"flex-end",

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

paddingHorizontal:18,

paddingVertical:12,

borderRadius:15,

},


reportText:{

color:"#000",

fontWeight:"900",

},


driveButton:{

position:"absolute",

bottom:50,

alignSelf:"center",

backgroundColor:colors.primary,

padding:18,

paddingHorizontal:35,

borderRadius:20,

},


stopButton:{

backgroundColor:colors.danger,

},


driveText:{

color:"#000",

fontWeight:"900",

fontSize:16,

},


});