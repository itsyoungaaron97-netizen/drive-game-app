import React from "react";
import { View } from "react-native";
import MapLibreGL from "@maplibre/maplibre-react-native";


export default function MapLibreTest(){

  return (

    <View style={{flex:1}}>

      <MapLibreGL.MapView
        style={{flex:1}}
      >

        <MapLibreGL.Camera
          zoomLevel={14}
          centerCoordinate={[
            14.2681,
            40.8518
          ]}
        />

      </MapLibreGL.MapView>

    </View>

  );

}