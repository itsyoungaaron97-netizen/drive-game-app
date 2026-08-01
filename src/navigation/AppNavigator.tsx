import React from "react";
import { Text } from "react-native";

import {
  NavigationContainer,
  DarkTheme,
} from "@react-navigation/native";

import {
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";


import MapScreen from "../screens/MapScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import FriendsScreen from "../screens/FriendsScreen";


import { colors } from "../constants/theme";


const Tab = createBottomTabNavigator();



const navTheme = {

  ...DarkTheme,

  colors: {

    ...DarkTheme.colors,

    background: colors.background,

    card: colors.surface,

    primary: colors.primary,

    text: colors.text,

    border: colors.border,

  },

};



export default function AppNavigator() {

  return (

    <NavigationContainer theme={navTheme}>

      <Tab.Navigator

        screenOptions={{

          headerShown: false,

          tabBarStyle: {

            backgroundColor: colors.surface,

            borderTopColor: colors.border,

            height: 60,

            paddingBottom: 8,

          },

          tabBarActiveTintColor: colors.primary,

          tabBarInactiveTintColor: colors.textSecondary,

        }}

      >


        <Tab.Screen

          name="Drive"

          component={MapScreen}

          options={{

            tabBarIcon: ({ color }) => (

              <Text style={{ color, fontSize: 20 }}>
                🚗
              </Text>

            ),

          }}

        />



        <Tab.Screen

          name="Friends"

          component={FriendsScreen}

          options={{

            tabBarIcon: ({ color }) => (

              <Text style={{ color, fontSize: 20 }}>
                👥
              </Text>

            ),

          }}

        />



        <Tab.Screen

          name="Challenges"

          component={ChallengesScreen}

          options={{

            tabBarIcon: ({ color }) => (

              <Text style={{ color, fontSize: 20 }}>
                🎯
              </Text>

            ),

          }}

        />



        <Tab.Screen

          name="Ranks"

          component={LeaderboardScreen}

          options={{

            tabBarIcon: ({ color }) => (

              <Text style={{ color, fontSize: 20 }}>
                🏆
              </Text>

            ),

          }}

        />



        <Tab.Screen

          name="Profile"

          component={ProfileScreen}

          options={{

            tabBarIcon: ({ color }) => (

              <Text style={{ color, fontSize: 20 }}>
                👤
              </Text>

            ),

          }}

        />


      </Tab.Navigator>

    </NavigationContainer>

  );

}