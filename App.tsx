import React, { useEffect, useState } from "react";

import {
  StatusBar,
} from "expo-status-bar";

import {
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import {
  SafeAreaProvider,
} from "react-native-safe-area-context";

import {
  User,
} from "firebase/auth";

import {
  subscribeToAuth,
} from "./src/services/firebase";

import AuthScreen from "./src/screens/AuthScreen";

import AppNavigator from "./src/navigation/AppNavigator";

import {
  colors,
} from "./src/constants/theme";


// =====================================
// APP START
// =====================================


export default function App() {


  const [
    user,
    setUser
  ] = useState<User | null>(null);



  const [
    initializing,
    setInitializing
  ] = useState(true);



  useEffect(() => {


    const unsubscribe =
      subscribeToAuth(
        (currentUser) => {


          setUser(currentUser);


          setInitializing(false);


        }
      );



    return unsubscribe;


  }, []);




  if (initializing) {


    return (

      <View style={styles.boot}>


        <ActivityIndicator

          size="large"

          color={colors.primary}

        />


      </View>

    );


  }




  return (

    <SafeAreaProvider>


      <StatusBar

        style="light"

      />



      {

        user

        ?

        <AppNavigator />

        :

        <AuthScreen />

      }



    </SafeAreaProvider>

  );


}




const styles = StyleSheet.create({


  boot:{


    flex:1,


    backgroundColor:
    colors.background,


    justifyContent:
    "center",


    alignItems:
    "center",


  },


});