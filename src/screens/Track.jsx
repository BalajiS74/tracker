import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, ScrollView } from "react-native";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import BusCard from "../components/BusCards"; // Correctly importing the component
import { useNavigation } from "@react-navigation/native";

export default function Track() {
  const navigation = useNavigation();
  const [busData, setBusData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);

  const fetchBusData = async () => {
    try {
      const response = await fetch(
        `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps.json`
      );
      const data = await response.json();
      const buses = Array.isArray(data) ? data : Object.values(data);
      setBusData(buses);
    } catch (error) {
      console.error("Error fetching bus data:", error);
    }
  };

  useEffect(() => {
    fetchBusData();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredBuses(busData);
    } else {
      setFilteredBuses(
        busData.filter((bus) =>
          (bus.busNumber || "").toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, busData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: "#e0f7fa" }]}>
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

        <ScrollView style={{ width: "100%" }}>
          <View style={styles.cardContainer}>
            {filteredBuses.length > 0 ? (
              filteredBuses.map((bus, idx) => (
                <BusCard
                  key={bus.busID || idx}
                  bus={bus}
                  onPress={() =>
                    navigation.navigate("BusDetails", {
                      busID: bus.busID,
                    })
                  }
                />
              ))
            ) : (
              <Text style={{ color: "#000", padding: 20 }}>No buses found.</Text>
            )}
          </View>
        </ScrollView>
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
  searchContainer: {
    marginTop: 30,
  },
  input: {
    width: 320,
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#000",
    backgroundColor: "#D9D9D9",
    fontWeight: "600",
  },
  cardContainer: {
    width: "100%",
    paddingHorizontal: 20,
    marginTop: 20,
  },
});
