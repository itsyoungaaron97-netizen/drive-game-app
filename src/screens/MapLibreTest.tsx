import React from "react";
import { StyleSheet, View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";

MapLibreGL.setAccessToken(null);

export default function MapLibreTest() {
  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
      >
        <MapLibreGL.Camera
          zoomLevel={14}
          centerCoordinate={[
            14.2681,
            40.8518,
          ]}
          pitch={45}
          heading={0}
        />
      </MapLibreGL.MapView>
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