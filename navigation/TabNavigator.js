import React from "react";
import { NavigationContainer } from "@react-navigation/native"; 
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import HomeScreen from "../screens/HomeScreen";
import RecordScreen from "../screens/RecordScreen";
import RaveScreen from "../screens/RaveScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <NavigationContainer> 
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Record" component={RecordScreen} />
        <Tab.Screen name="RAVE" component={RaveScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
