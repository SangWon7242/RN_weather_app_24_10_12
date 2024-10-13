import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, Button } from "react-native";
import React, { useState } from "react";

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: "red" }}></View>
      <View style={{ flex: 2, backgroundColor: "darkorange" }}></View>
      <View style={{ flex: 2.5, backgroundColor: "green" }}></View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({});
