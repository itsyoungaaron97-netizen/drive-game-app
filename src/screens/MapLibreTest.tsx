import React from "react";
import { StyleSheet, View } from "react-native";
import { Map } from "@maplibre/maplibre-react-native";

export default function MapLibreTest() {
  return (
    <View style={styles.container}>

      <Map
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        logoEnabled={false}
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
  },

  map: {
    flex: 1,
  },

});