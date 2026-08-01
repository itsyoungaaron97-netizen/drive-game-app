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
  cars,
} from "../data/cars";

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

           