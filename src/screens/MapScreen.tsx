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
// SEARCH ADDRESS
// ===============================


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



    if(
      !data ||
      !data.length
    ){

      return null;

    }



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


 try{


  const url =


  `https://router.project-osrm.org/route/v1/driving/${start.longitude},${start.latitude};${end.longitude},${end.latitude}?overview=full&geometries=geojson`;




  const response =
    await fetch(url);



  const data =
    await response.json();



  if(
    !data.routes ||
    !data.routes.length
  ){

    return [];

  }



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






// ===============================
// ROAD REPORT
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
useRef<number>(0);







const [loading,setLoading] =
useState(true);



const [location,setLocation] =
useState<{

 latitude:number;

 longitude:number;

}|null>(null);




const [selectedReportLocation,setSelectedReportLocation] =
useState<{

 latitude:number;

 longitude:number;

}|null>(null);




const [search,setSearch] =
useState("");



const [route,setRoute] =
useState<any[]>([]);



const [destination,setDestination] =
useState<any>(null);



const [points,setPoints] =
useState<TripPoint[]>([]);



const [distanceKm,setDistanceKm] =
useState(0);



const [speed,setSpeed] =
useState(0);



const [tracking,setTracking] =
useState(false);




const [feed,setFeed] =
useState<RoadReport[]>([]);const sendToMap = (
data:any
)=>{


webRef.current?.postMessage(

JSON.stringify(data)

);


};







// ===============================
// LOAD LOCATION
// ===============================


useEffect(()=>{


const load = async()=>{


try{


const permission =
await requestLocationPermissions();



if(!permission){


Alert.alert(

"Location disabled",

"Please enable location permission"

);


return;


}




const position =
await getCurrentPosition();



if(position){



const current = {


latitude:
position.coords.latitude,


longitude:
position.coords.longitude,


};



setLocation(current);



sendToMap({

type:"location",

...current,

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


}


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

"Could not find destination"

);


return;


}



setDestination(result);



if(location){


const routeData =
await getRoute(

location,

result

);



setRoute(routeData);



sendToMap({

type:"route",

points:routeData,


});



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


const updated = [

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












// ===============================
// STOP DRIVE
// ===============================


const stopDrive =
async()=>{


if(watchRef.current){


watchRef.current.remove();


watchRef.current=null;


}



setTracking(false);



if(points.length < 2){


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

(endedAt -
startTime.current)
/1000

);





const maxSpeed =
calculateMaxSpeedKmh(
points
);




const avgSpeed =
calculateAvgSpeedKmh(

distanceKm,

duration

);





const user =
auth.currentUser;



if(!user)
return;







let place:any = {};



try{


place =
await reverseGeocode(

points[0].latitude,

points[0].longitude

) || {};



}catch(e){


console.log(
"Reverse geocode failed"
);


}








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
place.city || "",


state:
place.state || "",


country:
place.country || "",


});





const result =
await updateUserStats(

user.uid,

distanceKm,

maxSpeed

);





Alert.alert(

"Drive Saved",

`${distanceKm.toFixed(2)} km\n+${result.xpGained} XP`

);




}catch(error:any){


Alert.alert(

"Save failed",

error.message ||
"Unknown error"

);


}





setPoints([]);

setDistanceKm(0);

setSpeed(0);



};








// ===============================
// CREATE REPORT
// ===============================


const createReport =
(type:
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




const report:RoadReport = {


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

...old

]);




sendToMap({

type:"report",

report,

});




setSelectedReportLocation(null);



Alert.alert(

"Report sent",

type.toUpperCase()

);



};








const reportMenu =
()=>{


Alert.alert(

"Road report",

"Choose event",

[


{

text:"🚗 Traffic",

onPress:()=>createReport("traffic"),

},


{

text:"🚓 Police",

onPress:()=>createReport("police"),

},


{

text:"💥 Crash",

onPress:()=>createReport("crash"),

},


{

text:"Cancel",

style:"cancel",

},


]

);


};const html = `

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
.setView(
[0,0],
15
);



L.tileLayer(

"https://tile.openstreetmap.org/{z}/{x}/{y}.png",

{

maxZoom:19

}

).addTo(map);





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
.addTo(map);





function carIcon(){


return L.divIcon({

html:"🚗",

className:"",

iconSize:[40,40]

});


}







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

icon:carIcon()

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



let emoji="⚠️";



if(r.type==="traffic")
emoji="🚗";

if(r.type==="police")
emoji="🚓";

if(r.type==="crash")
emoji="💥";




L.marker(

[

r.latitude,

r.longitude

]

)

.addTo(reports)

.bindPopup(

emoji+" "+r.type

);


}





}


);



</script>


</body>

</html>

`;









const handleMapMessage =
(event:any)=>{


try{


const data =
JSON.parse(

event.nativeEvent.data

);




if(data.type==="mapClick"){



setSelectedReportLocation({

latitude:
data.latitude,


longitude:
data.longitude,


});



Alert.alert(

"Report location",

"Use this location?",

[


{

text:"Yes",

onPress:reportMenu,

},


{

text:"Cancel",

style:"cancel",

},


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








if(loading){


return (

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





<View

style={[

styles.searchBox,

{

top:
insets.top+10

}

]

}


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


<Text style={styles.searchText}>

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

}

>


<Text style={styles.stat}>

{distanceKm.toFixed(2)} km

</Text>



<Text style={styles.stat}>

{speed} km/h

</Text>


</View>







<TouchableOpacity

style={styles.reportButton}

onPress={reportMenu}

>


<Text style={styles.buttonText}>

⚠️ REPORT

</Text>


</TouchableOpacity>







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






<View style={styles.feed}>


<Text style={styles.feedTitle}>

🌍 Live Feed

</Text>



<FlatList

data={feed}

keyExtractor={
item=>item.id
}


renderItem={({item})=>(

<View style={styles.feedItem}>


<Text style={styles.feedText}>

{item.type}

{" - "}

{item.user}

</Text>


</View>


)}


/>


</View>





</View>

);

}








const styles = StyleSheet.create({


container:{

flex:1,

backgroundColor:"#000",

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

paddingHorizontal:10,

},



searchButton:{

backgroundColor:colors.primary,

padding:12,

borderRadius:10,

},



searchText:{

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

padding:18,

paddingHorizontal:40,

borderRadius:20,

},



stopButton:{

backgroundColor:colors.danger,

},



buttonText:{

fontWeight:"900",

color:"#000",

},



feed:{

position:"absolute",

left:10,

bottom:130,

width:230,

backgroundColor:"rgba(0,0,0,0.7)",

padding:10,

borderRadius:15,

},



feedTitle:{

color:colors.primary,

fontWeight:"900",

},



feedItem:{

paddingVertical:5,

},



feedText:{

color:"#fff",

},



});