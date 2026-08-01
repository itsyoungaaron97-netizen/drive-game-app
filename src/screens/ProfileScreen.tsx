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
  getMostDrivenCar,
} from "../services/cars";

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


  const [mostDriven,setMostDriven] =
    useState<string | null>(null);


  const [loading,setLoading] =
    useState(true);



  useEffect(() => {


    const user =
      auth.currentUser;


    if (!user) return;



    (async()=>{


      const [
        p,
        t,
        most
      ] =
      await Promise.all([

        getUserProfile(user.uid),

        getUserTrips(
          user.uid,
          10
        ),

        getMostDrivenCar(
          user.uid
        ),

      ]);



      setProfile(p);

      setTrips(t);



      if(most){

        setMostDriven(
          most[0]
        );

      }



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


        <Text style={styles.name}>
          {profile?.displayName || "Driver"}
        </Text>


        <Text style={styles.email}>
          {profile?.email}
        </Text>



        <Text style={styles.section}>
          🚗 Current Car
        </Text>


        <Text style={styles.car}>
          {
            profile?.selectedCar
            ?
            `${profile.selectedCar.brand} ${profile.selectedCar.model}`
            :
            "No car selected"
          }
        </Text>




        <Text style={styles.section}>
          🏆 Most Driven Car
        </Text>


        <Text style={styles.car}>
          {
            mostDriven
            ||
            "No drives yet"
          }
        </Text>





        <View style={styles.xpBox}>


          <Text style={styles.level}>
            Level {profile?.level || 1}
          </Text>


          <Text style={styles.xp}>
            {profile?.totalXP || 0} XP
          </Text>


        </View>





        <View style={styles.statsRow}>


          <View style={styles.stat}>

            <Text style={styles.statValue}>
              {(profile?.totalKm || 0).toFixed(1)}
            </Text>


            <Text style={styles.statLabel}>
              KM
            </Text>


          </View>



          <View style={styles.stat}>


            <Text style={styles.statValue}>
              {profile?.totalTrips || 0}
            </Text>


            <Text style={styles.statLabel}>
              Trips
            </Text>


          </View>




          <View style={styles.stat}>


            <Text style={styles.statValue}>
              {profile?.maxSpeed || 0}
            </Text>


            <Text style={styles.statLabel}>
              Max
            </Text>


          </View>



        </View>


      </View>





      <Text style={styles.sectionTitle}>
        Recent Drives
      </Text>




      {
        trips.length === 0 ?

        (

          <Text style={styles.empty}>
            No trips yet. Hit START DRIVE!
          </Text>

        )

        :

        trips.map((trip)=>(


          <View
            key={trip.id}
            style={styles.tripCard}
          >


            <Text style={styles.tripDistance}>
              {trip.distanceKm.toFixed(2)} km
            </Text>


            <Text style={styles.tripMeta}>
              {trip.city || "Unknown"} • max {trip.maxSpeedKmh} km/h
            </Text>


            <Text style={styles.tripDate}>

              {format(
                new Date(trip.startedAt),
                "MMM d, yyyy • HH:mm"
              )}

            </Text>


          </View>


        ))

      }





      <TouchableOpacity

        style={styles.logoutBtn}

        onPress={handleLogout}

      >

        <Text style={styles.logoutText}>
          Log Out
        </Text>


      </TouchableOpacity>



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
color:colors.text,
fontSize:28,
fontWeight:"800",
marginBottom:spacing.md,
},


card:{
backgroundColor:colors.surface,
borderRadius:16,
padding:spacing.lg,
marginBottom:spacing.lg,
},


name:{
color:colors.text,
fontSize:22,
fontWeight:"800",
},


email:{
color:colors.textSecondary,
marginBottom:spacing.md,
},


section:{
color:colors.primary,
fontSize:16,
fontWeight:"800",
marginTop:10,
},


car:{
color:colors.text,
fontSize:18,
marginTop:5,
},


xpBox:{
backgroundColor:colors.surfaceLight,
padding:spacing.md,
borderRadius:12,
marginTop:spacing.md,
alignItems:"center",
},


level:{
color:colors.primary,
fontSize:20,
fontWeight:"800",
},


xp:{
color:colors.textSecondary,
},


statsRow:{
flexDirection:"row",
justifyContent:"space-between",
marginTop:spacing.md,
},


stat:{
alignItems:"center",
},


statValue:{
color:colors.primary,
fontSize:20,
fontWeight:"800",
},


statLabel:{
color:colors.textSecondary,
},


sectionTitle:{
color:colors.text,
fontSize:18,
fontWeight:"700",
},


tripCard:{
backgroundColor:colors.surface,
padding:spacing.md,
borderRadius:12,
marginTop:spacing.sm,
},


tripDistance:{
color:colors.primary,
fontWeight:"800",
},


tripMeta:{
color:colors.text,
},


tripDate:{
color:colors.textSecondary,
fontSize:12,
},


empty:{
color:colors.textSecondary,
},


logoutBtn:{
marginTop:spacing.xl,
borderWidth:1,
borderColor:colors.danger,
padding:spacing.md,
borderRadius:12,
alignItems:"center",
},


logoutText:{
color:colors.danger,
fontWeight:"700",
},


});