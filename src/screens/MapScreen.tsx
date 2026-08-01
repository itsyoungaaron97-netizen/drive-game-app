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
  ActivityIndicator,
} from "react-native";

import { WebView } from "react-native-webview";
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






// =====================================
// SCREEN
// =====================================

export default function MapScreen(){


const insets =
useSafeAreaInsets();



const webRef =
useRef<any>(null);



const watchRef =
useRef<any>(null);



const webReady =
useRef(false);



const messageQueue =
useRef<any[]>([]);



const startTime =
useRef(0);



const latestPoints =
useRef<TripPoint[]>([]);



const latestDistance =
useRef(0);



const latestLocation =
useRef<LocationPoint|null>(null);





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
feed,
setFeed
]=useState<RoadReport[]>([]);



const [
selectedReportLocation,
setSelectedReportLocation
]=useState<LocationPoint|null>(null);






// =====================================
// SEND DATA TO MAP
// =====================================

const sendToMap =
useCallback(

(data:any)=>{


if(webReady.current){


webRef.current?.postMessage(

JSON.stringify(data)

);


}else{


messageQueue.current.push(data);


}



},

[]


);






const flushMessages = ()=>{


if(!webReady.current)
return;



messageQueue.current.forEach(

(message)=>{


webRef.current?.postMessage(

JSON.stringify(message)

);


}


);



messageQueue.current=[];


};





// =====================================
// LOAD LOCATION
// =====================================

useEffect(()=>{


const loadLocation =
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




sendToMap({

type:"location",

...current,

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




loadLocation();




return()=>{


if(watchRef.current){


watchRef.current.remove();


watchRef.current=null;


}



};


},[]);// =====================================
// SEARCH DESTINATION
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



const route =
await getRoute(

current,

result

);



sendToMap({

type:"route",

points:route,

});


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

point,

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



sendToMap({

type:"location",

latitude:
point.latitude,

longitude:
point.longitude,

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

(

endedAt -

startTime.current

)

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


console.log(

"Reverse geocode error",

error

);


}







try{


await saveTrip({


userId:

user.uid,



userDisplayName:

user.displayName ||
"Driver",



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

error.message ||

"Unknown error"

);



}





latestPoints.current=[];

latestDistance.current=0;



setDistanceKm(0);

setSpeed(0);



};








// =====================================
// ROAD REPORTS
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





setFeed(old=>[

report,

...old,

]);





sendToMap({

type:"report",

report,

});





setSelectedReportLocation(null);


};







const showReportMenu = ()=>{


Alert.alert(

"Road report",

"Select event",

[


{

text:"🚗 Traffic",

onPress:

()=>createReport("traffic"),

},



{

text:"🚓 Police",

onPress:

()=>createReport("police"),

},



{

text:"💥 Crash",

onPress:

()=>createReport("crash"),

},



{

text:"Cancel",

style:"cancel",

},


]


);


};







// =====================================
// LEAFLET MAP HTML
// =====================================

const html = `

<!DOCTYPE html>

<html>

<head>

<meta name="viewport" content="width=device-width,initial-scale=1.0">


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

.setView([41.0,14.3],15);



L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{

maxZoom:19,

attribution:"OpenStreetMap"

}

).addTo(map);



setTimeout(()=>{

map.invalidateSize();

},1000);




let marker=null;


let routeLine =

L.polyline(

[],

{

color:"#00ff99",

weight:5

}

).addTo(map);



let reports =

L.layerGroup()

.addTo(map);const carIcon =

L.divIcon({

html:"🚗",

className:"",

iconSize:[40,40]

});





map.on(

"click",

(e)=>{


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

(event)=>{


try{


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



const r=data.report;



let icon="⚠️";



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

]

)

.addTo(reports)

.bindPopup(

icon+" "+r.type

);



}




}catch(e){

console.log(e);

}


}


);



</script>


</body>

</html>

`;







// =====================================
// WEBVIEW MESSAGE
// =====================================

const handleMapMessage =
(event:any)=>{


try{


const data =

JSON.parse(

event.nativeEvent.data

);



if(data.type==="mapClick"){



setSelectedReportLocation({

latitude:data.latitude,

longitude:data.longitude,

});




Alert.alert(

"Report location",

"Use this location?",

[

{

text:"Yes",

onPress:showReportMenu,

},


{

text:"Cancel",

style:"cancel",

}


]


);



}



}catch(error){


console.log(

"Map message error",

error

);


}


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


<WebView

ref={webRef}


source={{

html

}}



javaScriptEnabled


originWhitelist={["*"]}



onLoad={()=>{


webReady.current=true;



setTimeout(()=>{


flushMessages();


},500);



}}



onMessage={handleMapMessage}


style={styles.map}


/>






<View

style={[

styles.searchBox,

{

top:

insets.top+10

}

]


}>


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


<Text style={styles.buttonText}>

GO

</Text>


</TouchableOpacity>


</View>







<View

style={[

styles.stats,

{

top:

insets.top+80

}

]


}>


<Text style={styles.stat}>

{distanceKm.toFixed(2)} km

</Text>


<Text style={styles.stat}>

{speed} km/h

</Text>


</View>








<View style={styles.feed}>


<Text style={styles.feedTitle}>

🌍 Live Feed

</Text>




<FlatList

data={feed}

keyExtractor={item=>item.id}


renderItem={({item})=>(


<Text style={styles.feedText}>

{item.type} - {item.user}

</Text>


)}


/>


</View>







<TouchableOpacity

style={styles.reportButton}

onPress={showReportMenu}

>


<Text style={styles.buttonText}>

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


<Text style={styles.buttonText}>

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


loading:{

flex:1,

backgroundColor:"#000",

justifyContent:"center",

alignItems:"center",

},


loadingText:{

color:"#fff",

marginTop:10,

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

paddingHorizontal:10,

},


searchButton:{

backgroundColor:colors.primary,

padding:12,

borderRadius:10,

},


buttonText:{

fontWeight:"900",

color:"#000",

},


stats:{

position:"absolute",

right:15,

},


stat:{

color:colors.primary,

fontSize:22,

fontWeight:"900",

},


feed:{

position:"absolute",

left:10,

bottom:140,

width:230,

backgroundColor:"rgba(0,0,0,0.75)",

padding:10,

borderRadius:15,

},


feedTitle:{

color:colors.primary,

fontWeight:"900",

},


feedText:{

color:"#fff",

paddingVertical:4,

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

paddingVertical:18,

paddingHorizontal:40,

borderRadius:20,

},


stopButton:{

backgroundColor:colors.danger,

},


});