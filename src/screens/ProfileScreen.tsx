import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  logout,
  getUserProfile,
  getUserTrips,
  auth,
} from "../services/firebase";

import {
  sendFriendRequest,
} from "../services/friends";

import {
  UserProfile,
  Trip,
} from "../types";

import {
  colors,
  spacing,
} from "../constants/theme";

import { format } from "date-fns";


export default function ProfileScreen() {

  const insets = useSafeAreaInsets();


  const [profile, setProfile] =
    useState<UserProfile | null>(null);

  const [trips, setTrips] =
    useState<Trip[]>([]);

  const [loading, setLoading] =
    useState(true);


  const [friendUid, setFriendUid] =
    useState("");



  useEffect(() => {

    const user = auth.currentUser;

    if (!user) return;


    (async () => {

      const [p, t] =
        await Promise.all([

          getUserProfile(user.uid),

          getUserTrips(user.uid, 10),

        ]);


      setProfile(p);

      setTrips(t);

      setLoading(false);

    })();


  }, []);




  const handleAddFriend = async () => {

    const user = auth.currentUser;


    if (!user || !profile) return;


    if (!friendUid.trim()) {

      Alert.alert(
        "Enter UID",
        "Enter the driver UID first"
      );

      return;

    }


    try {

      await sendFriendRequest(

        user.uid,

        friendUid.trim(),

        profile.displayName,

        "Driver"

      );


      Alert.alert(
        "Sent",
        "Friend request sent"
      );


      setFriendUid("");


    } catch (error) {

      Alert.alert(
        "Error",
        "Could not send request"
      );

    }

  };




  const handleLogout = () => {

    Alert.alert(
      "Log out",
      "Are you sure?",
      [

        {
          text: "Cancel",
          style: "cancel",
        },

        {
          text: "Log out",
          style: "destructive",
          onPress: () => logout(),
        },

      ]
    );

  };



  if (loading) {

    return (

      <View style={[styles.container, styles.center]}>

        <ActivityIndicator color={colors.primary}/>

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
              Total km
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
              Max km/h
            </Text>

          </View>


        </View>


      </View>




      <Text style={styles.sectionTitle}>
        Add Friend
      </Text>



      <View style={styles.friendBox}>


        <TextInput

          placeholder="Enter driver UID"

          placeholderTextColor={colors.textSecondary}

          value={friendUid}

          onChangeText={setFriendUid}

          style={styles.input}

        />



        <TouchableOpacity

          style={styles.friendButton}

          onPress={handleAddFriend}

        >

          <Text style={styles.friendText}>
            Send Request
          </Text>


        </TouchableOpacity>


      </View>





      <Text style={styles.sectionTitle}>
        Recent Drives
      </Text>



      {trips.length === 0 ? (

        <Text style={styles.empty}>
          No trips yet. Hit START DRIVE!
        </Text>


      ) : (

        trips.map((trip) => (

          <View
            key={trip.id}
            style={styles.tripCard}
          >

            <Text style={styles.tripDistance}>
              {trip.distanceKm.toFixed(2)} km
            </Text>


            <Text style={styles.tripMeta}>
              {trip.city || "Unknown"}, {trip.country || ""}
              {" • "}
              max {trip.maxSpeedKmh} km/h
            </Text>


            <Text style={styles.tripDate}>
              {format(
                new Date(trip.startedAt),
                "MMM d, yyyy • HH:mm"
              )}
            </Text>


          </View>

        ))

      )}





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
    marginTop:4,
    marginBottom:spacing.md,
  },

  xpBox:{
    backgroundColor:colors.surfaceLight,
    borderRadius:12,
    padding:spacing.md,
    alignItems:"center",
    marginBottom:spacing.md,
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
    fontSize:12,
  },


  sectionTitle:{
    color:colors.text,
    fontSize:18,
    fontWeight:"700",
    marginBottom:spacing.sm,
  },


  friendBox:{
    backgroundColor:colors.surface,
    padding:spacing.md,
    borderRadius:12,
    marginBottom:spacing.lg,
  },


  input:{
    color:colors.text,
    borderWidth:1,
    borderColor:colors.border,
    borderRadius:10,
    padding:12,
    marginBottom:10,
  },


  friendButton:{
    backgroundColor:colors.primary,
    padding:12,
    borderRadius:10,
    alignItems:"center",
  },


  friendText:{
    fontWeight:"800",
    color:"#000",
  },


  empty:{
    color:colors.textSecondary,
  },


  tripCard:{
    backgroundColor:colors.surface,
    borderRadius:12,
    padding:spacing.md,
    marginBottom:spacing.sm,
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


  logoutBtn:{
    marginTop:spacing.xl,
    borderWidth:1,
    borderColor:colors.danger,
    borderRadius:12,
    padding:spacing.md,
    alignItems:"center",
  },


  logoutText:{
    color:colors.danger,
    fontWeight:"700",
  },

});