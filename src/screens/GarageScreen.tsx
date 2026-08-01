import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { cars, Car } from "../data/cars";
import { colors, spacing } from "../constants/theme";

export default function GarageScreen() {

  const selectCar = (car: Car) => {
    console.log("Selected car:", car);
    // Firebase saving will be added later
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        My Garage
      </Text>

      <FlatList
        data={cars}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={styles.card}
            onPress={() => selectCar(item)}
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

          </TouchableOpacity>

        )}
      />

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  title: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },

  card: {
    backgroundColor: "#1c1c1c",
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },

  brand: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },

  model: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  info: {
    color: "#aaa",
    marginTop: 5,
  },

});