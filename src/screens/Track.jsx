import { useState, useEffect } from "react";

import { View, Text, StyleSheet, Image, TextInput } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import BusCards from "../components/BusCards";
export default function Track() {
  const [busData, setBusData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  return (
    <SafeAreaProvider>
      <SafeAreaView>
        <View style={styles.container}>
          <Text style={styles.header}>Tracker</Text>
          <View style={styles.searchContainer}>
          <TextInput
            placeholder="Enter bus number"
            placeholderTextColor="#000"
            style={styles.input}
            value={search}
            onChangeText={setSearch}
          />

        </View>
        <View style={styles.cardContainer}>
            <BusCards/>
        </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    fontWeight: "800",
    fontSize: 22,
    color: "#333",
    marginTop: 30,
  },
  searchContainer:{
    marginTop:30
  },
   input: {
    width:320,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#D9D9D9",
    fontWeight:'600'
  },
  cardContainer:{
    width:'360',
    // backgroundColor:'#7fff00',
    marginTop:20
  }
});
