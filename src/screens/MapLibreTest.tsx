import React from "react";
import { StyleSheet, View } from "react-native";
import { MapView, Camera } from "@maplibre/maplibre-react-native";

export default function MapLibreTest() {
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
      >
        <Camera
          zoomLevel={14}
          centerCoordinate={[14.2681, 40.8518]}
          pitch={45}
          heading={0}
        />
      </MapView>
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