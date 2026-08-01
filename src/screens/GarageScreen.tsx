import React, { useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";

import { cars, Car } from "../data/cars";

import {
  colors,
  spacing,
} from "../constants/theme";


export default function GarageScreen() {


  const [selectedCar, setSelectedCar] =
    useState<Car | null>(null);



  const selectCar = (car: Car) => {

    setSelectedCar(car);

    Alert.alert(
      "Car Selected",
      `${car.brand} ${car.model}`
    );

    // Firebase saving will be added next

  };



  return (

    <View style={styles.container}>


      <Text style={styles.title}>
        My Garage
      </Text>



      {selectedCar && (

        <View style={styles.selectedBox}>

          <Text style={styles.selectedTitle}>
            Current Car
          </Text>

          <Text style={styles.selectedCar}>
            {selectedCar.brand} {selectedCar.model}
          </Text>

        </View>

      )}



      <FlatList

        data={cars}

        keyExtractor={(item) => item.id}

        renderItem={({item}) => (


          <TouchableOpacity

            style={styles.card}

            onPress={() => selectCar(item)}

          >


            {item.image ? (

              <Image

                source={item.image}

                style={styles.carImage}

                resizeMode="contain"

              />

            ) : (

              <View style={styles.placeholder}>

                <Text style={styles.placeholderText}>
                  🚗
                </Text>

              </View>

            )}



            <Text style={styles.brand}>
              {item.brand}
            </Text>


            <Text style={styles.model}>
              {item.model}
            </Text>


            <Text style={styles.info}>
              {item.years} • {item.category}
            </Text>



            <TouchableOpacity

              style={styles.button}

              onPress={() => selectCar(item)}

            >

              <Text style={styles.buttonText}>
                Select Car
              </Text>

            </TouchableOpacity>



          </TouchableOpacity>


        )}

      />


    </View>

  );

}



const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:colors.background,
    padding:spacing.md,
  },


  title:{
    color:colors.primary,
    fontSize:28,
    fontWeight:"900",
    marginBottom:spacing.md,
  },


  selectedBox:{
    backgroundColor:colors.surface,
    padding:spacing.md,
    borderRadius:12,
    marginBottom:spacing.md,
  },


  selectedTitle:{
    color:colors.textSecondary,
  },


  selectedCar:{
    color:colors.primary,
    fontSize:18,
    fontWeight:"800",
  },


  card:{
    backgroundColor:colors.surface,
    borderRadius:16,
    padding:spacing.md,
    marginBottom:spacing.md,
  },


  carImage:{
    width:"100%",
    height:160,
  },


  placeholder:{
    height:160,
    justifyContent:"center",
    alignItems:"center",
  },


  placeholderText:{
    fontSize:70,
  },


  brand:{
    color:colors.primary,
    fontSize:18,
    fontWeight:"800",
  },


  model:{
    color:colors.text,
    fontSize:22,
    fontWeight:"900",
  },


  info:{
    color:colors.textSecondary,
    marginTop:5,
  },


  button:{
    marginTop:spacing.md,
    backgroundColor:colors.primary,
    padding:12,
    borderRadius:10,
    alignItems:"center",
  },


  buttonText:{
    color:"#000",
    fontWeight:"900",
  },

});