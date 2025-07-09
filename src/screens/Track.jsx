import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar
} from "react-native";
import BusCard from "../components/BusCards";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const Track = () => {
  const navigation = useNavigation();
  const [busData, setBusData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBusData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps.json`
      );
      const data = await response.json();
      const buses = Array.isArray(data) ? data : Object.values(data);
      setBusData(buses);
    } catch (error) {
      console.error("Error fetching bus data:", error);
    } finally {
      setRefreshing(false);
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
    <LinearGradient
      colors={['#f5f7fa', '#e4e8f0']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
        
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Bus Tracker</Text>
          <TouchableOpacity 
            onPress={fetchBusData} 
            style={styles.refreshButton}
          >
            <Ionicons 
              name={refreshing ? "refresh" : "refresh-outline"} 
              size={24} 
              color="#4b0082" 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons 
            name="search" 
            size={20} 
            color="#7a7a7a" 
            style={styles.searchIcon} 
          />
          <TextInput
            placeholder="Search bus number..."
            placeholderTextColor="#7a7a7a"
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity 
              onPress={() => setSearch("")} 
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#7a7a7a" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Bus List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchBusData}
              tintColor="#4b0082"
              colors={['#4b0082']}
            />
          }
        >
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
            <View style={styles.emptyState}>
              <Ionicons 
                name="bus-outline" 
                size={60} 
                color="#4b0082" 
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyText}>No buses found</Text>
              {search ? (
                <TouchableOpacity 
                  onPress={() => setSearch("")}
                  style={styles.clearSearchButton}
                >
                  <Text style={styles.clearSearchText}>Clear search</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={fetchBusData}
                  style={styles.retryButton}
                >
                  <Text style={styles.retryText}>Try again</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4b0082',
    letterSpacing: 0.5,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 24,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyIcon: {
    opacity: 0.7,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    fontWeight: '600',
    marginBottom: 8,
  },
  clearSearchButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
    borderRadius: 8,
  },
  clearSearchText: {
    color: '#4b0082',
    fontWeight: '600',
  },
  retryButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
    borderRadius: 8,
  },
  retryText: {
    color: '#4b0082',
    fontWeight: '600',
  },
});

export default Track;