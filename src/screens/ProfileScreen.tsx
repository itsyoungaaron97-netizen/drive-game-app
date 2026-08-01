import React, {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";

import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import {
  logout,
  getUserProfile,
  getUserTrips,
  auth,
} from "../services/firebase";



import {
  UserProfile,
  Trip,
} from "../types";

import {
  colors,
  spacing,
} from "../constants/theme";

import {
  format,
} from "date-fns";



export default function ProfileScreen() {


  const insets =
    useSafeAreaInsets();


  const [profile,setProfile] =
    useState<UserProfile | null>(null);


  const [trips,setTrips] =
    useState<Trip[]>([]);


  const [loading,setLoading] =
    useState(true);



  useEffect(()=>{


    const user =
      auth.currentUser;


    if(!user) return;



    (async()=>{


      const [
        p,
        t
      ] =
      await Promise.all([

        getUserProfile(user.uid),

        getUserTrips(
          user.uid,
          20
        ),

      ]);



      setProfile(p);

      setTrips(t);

      setLoading(false);



    })();



  },[]);





  const handleLogout = ()=>{


    Alert.alert(

      "Log out",

      "Are you sure?",

      [

        {
          text:"Cancel",
          style:"cancel",
        },

        {
          text:"Log out",
          style:"destructive",
          onPress:()=>logout(),
        },

      ]

    );


  };




  const places = Array.from(

    new Set(

      trips.map(

        t =>

        `${t.city || "Unknown"}, ${t.country || ""}`

      )

    )

  );




  const drivenCars = Object.entries(

    profile?.carsDriven || {}

  )

  .sort(

    (a,b)=>b[1]-a[1]

  );





  if(loading){


    return (

      <View style={[
        styles.container,
        styles.center
      ]}>

        <ActivityIndicator
          color={colors.primary}
        />

      </View>

    );

  }





  return (

    <ScrollView

      style={styles.container}

      contentContainerStyle={{

        paddingTop:
        insets.top + spacing.md,

        paddingBottom:
        insets.bottom + 80,

        paddingHorizontal:
        spacing.md,

      }}

    >



      <Text style={styles.title}>
        Profile
      </Text>




      <View style={styles.card}>


        {
          profile?.photoURL ?

          (

            <Image

              source={{
                uri:profile.photoURL
              }}

              style={styles.avatar}

            />

          )

          :

          (

            <View style={styles.avatarPlaceholder}>

              <Text style={styles.avatarText}>
                🚗
              </Text>

            </View>

          )

        }



        <Text style={styles.name}>
          {profile?.displayName || "Driver"}
        </Text>


        <Text style={styles.email}>
          {profile?.email}
        </Text>




        <View style={styles.xpBox}>


          <Text style={styles.level}>
            Level {profile?.level || 1}
          </Text>


          <Text style={styles.xp}>
            {profile?.totalXP || 0} XP
          </Text>


        </View>





        <Text style={styles.section}>
          🚗 Selected Car
        </Text>


        {
          profile?.selectedCar ?

          (

            <>

            {
              profile.selectedCar.image &&

              <Image

                source={profile.selectedCar.image}

                style={styles.carImage}

              />

            }


            <Text style={styles.car}>
              {profile.selectedCar.brand}{" "}
              {profile.selectedCar.model}
            </Text>

            </>

          )

          :

          <Text style={styles.empty}>
            No car selected
          </Text>

        }






        <Text style={styles.section}>
          🏆 Cars Driven Most
        </Text>



        {
          drivenCars.length === 0 ?

          (

            <Text style={styles.empty}>
              No drives yet
            </Text>

          )

          :

          drivenCars.slice(0,5).map(
            ([carId,count])=>(

              <View
                key={carId}
                style={styles.carRow}
              >

                <Text style={styles.carName}>
                  {carId}
                </Text>

                <Text style={styles.carCount}>
                  {count} drives
                </Text>

              </View>

            )

          )

        }




        <Text style={styles.section}>
          🌍 Places Visited
        </Text>



        {
          places.length === 0 ?

          (

            <Text style={styles.empty}>
              No places visited
            </Text>

          )

          :

          places.map((place,index)=>(

            <Text
              key={index}
              style={styles.place}
            >
              📍 {place}
            </Text>

          ))

        }





        <Text style={styles.section}>
          🛣️ Recent Drives
        </Text>



        {
          trips.length === 0 ?

          (

            <Text style={styles.empty}>
              No trips yet
            </Text>

          )

          :

          trips.map((trip)=>(

            <View
              key={trip.id}
              style={styles.tripCard}
            >

              <Text style={styles.tripTitle}>
                {trip.city || "Unknown"}
              </Text>


              <Text style={styles.tripText}>
                {trip.distanceKm.toFixed(2)} km
              </Text>


              <Text style={styles.tripText}>
                {format(
                  new Date(trip.startedAt),
                  "dd MMM yyyy HH:mm"
                )}
              </Text>


            </View>

          ))

        }




        <TouchableOpacity

          style={styles.logout}

          onPress={handleLogout}

        >

          <Text style={styles.logoutText}>
            LOG OUT
          </Text>


        </TouchableOpacity>



      </View>


    </ScrollView>

  );

}






const styles = StyleSheet.create({

container:{
  flex:1,
  backgroundColor:colors.background,
},


center:{
  justifyContent:"center",
  alignItems:"center",
},


title:{
  color:"#fff",
  fontSize:30,
  fontWeight:"900",
  marginBottom:20,
},


card:{
  backgroundColor:"#111",
  borderRadius:20,
  padding:20,
},


avatar:{
  width:90,
  height:90,
  borderRadius:45,
  alignSelf:"center",
},


avatarPlaceholder:{
  width:90,
  height:90,
  borderRadius:45,
  backgroundColor:"#333",
  justifyContent:"center",
  alignItems:"center",
  alignSelf:"center",
},


avatarText:{
  fontSize:40,
},


name:{
  color:"#fff",
  fontSize:22,
  fontWeight:"900",
  textAlign:"center",
  marginTop:10,
},


email:{
  color:"#aaa",
  textAlign:"center",
},


xpBox:{
  marginTop:20,
  backgroundColor:"#222",
  padding:15,
  borderRadius:15,
},


level:{
  color:colors.primary,
  fontSize:20,
  fontWeight:"900",
},


xp:{
  color:"#fff",
},


section:{
  color:colors.primary,
  fontSize:18,
  fontWeight:"900",
  marginTop:25,
  marginBottom:10,
},


carImage:{
  width:"100%",
  height:160,
  borderRadius:15,
},


car:{
  color:"#fff",
  fontSize:18,
  fontWeight:"800",
},


empty:{
  color:"#888",
},


carRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  paddingVertical:8,
  borderBottomWidth:1,
  borderColor:"#333",
},


carName:{
  color:"#fff",
},


carCount:{
  color:colors.primary,
},


place:{
  color:"#ddd",
  marginVertical:5,
},


tripCard:{
  backgroundColor:"#222",
  padding:12,
  borderRadius:12,
  marginBottom:8,
},


tripTitle:{
  color:"#fff",
  fontWeight:"900",
},


tripText:{
  color:"#aaa",
},


logout:{
  marginTop:30,
  backgroundColor:colors.danger,
  padding:16,
  borderRadius:15,
  alignItems:"center",
},


logoutText:{
  color:"#000",
  fontWeight:"900",
},


});
           