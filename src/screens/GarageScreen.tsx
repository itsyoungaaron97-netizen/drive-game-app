import React from "react";

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import {
  cars,
  Car,
} from "../data/cars";

import {
  colors,
  spacing,
} from "../constants/theme";

import {
  auth,
} from "../services/firebase";

import {
  saveSelectedCar,
} from "../services/cars";



export default function GarageScreen() {


  const selectCar = async (car: Car) => {


    const user =
      auth.currentUser;


    if (!user) {

      Alert.alert(
        "Not logged in",
        "Please login first."
      );

      return;

    }



    try {


      await saveSelectedCar(
        user.uid,
        car
      );


      Alert.alert(
        "Car Selected",
        `${car.brand} ${car.model} is now your driving car`
      );


    } catch (error) {


      Alert.alert(
        "Error",
        "Could not save car."
      );


    }


  };




  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        My Garage
      </Text>



      <FlatList

        data={cars}

        keyExtractor={(item) =>
          item.id
        }


        renderItem={({ item }) => (


          <TouchableOpacity

            style={styles.card}

            onPress={() =>
              selectCar(item)
            }

          >


            <Text style={styles.brand}>
              {item.brand}
            </Text>


            <Text style={styles.model}>
              {item.model}
            </Text>


            <Text style={styles.info}>
              {item.years} • {item.category}
            </Text>


            <Text style={styles.select}>
              SELECT CAR
            </Text>


          </TouchableOpacity>


        )}

      />


    </View>

  );

}




const styles = StyleSheet.create({


  container: {

    flex: 1,

    backgroundColor:
      colors.background,

    padding:
      spacing.md,

  },


  title: {

    color:
      colors.primary,

    fontSize:
      28,

    fontWeight:
      "bold",

    marginBottom:
      spacing.md,

  },


  card: {

    backgroundColor:
      "#1c1c1c",

    padding:
      spacing.md,

    borderRadius:
      12,

    marginBottom:
      spacing.sm,

  },


  brand: {

    color:
      colors.primary,

    fontSize:
      18,

    fontWeight:
      "bold",

  },


  model: {

    color:
      "#fff",

    fontSize:
      20,

    fontWeight:
      "700",

  },


  info: {

    color:
      "#aaa",

    marginTop:
      5,

  },


  select: {

    color:
      colors.primary,

    marginTop:
      10,

    fontWeight:
      "900",

  },


});