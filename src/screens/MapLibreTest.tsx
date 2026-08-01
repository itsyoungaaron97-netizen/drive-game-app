import React from "react";
import { StyleSheet, View } from "react-native";
import { Map, Camera } from "@maplibre/maplibre-react-native";

export default function MapLibreTest() {
  return (
    <View style={styles.container}>
      <Map
        style={styles.map}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
      >
        <Camera
          zoom={14}
          centerCoordinate={[14.2681, 40.8518]}
          pitch={45}
          bearing={0}
        />
      </Map>
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