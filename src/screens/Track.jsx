import  { useState, useEffect, useCallback, memo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  
  Dimensions,
  FlatList
} from "react-native";
import BusCard from "../components/BusCards"; 
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";

const MemoBusCard = memo(({ bus, windowWidth, onPress }) => (
  <BusCard bus={bus} windowWidth={windowWidth} onPress={onPress} />
));

const Track = () => {
  const navigation = useNavigation();
  const [busData, setBusData] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions(Dimensions.get('window'));
    };
    
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => {
      subscription?.remove();
    };
  }, []);

  const fetchBusData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(
        `https://bus-tracking-school-92dd9-default-rtdb.asia-southeast1.firebasedatabase.app/gps.json`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("Response is not JSON");
      }
      
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

  const handleBusPress = useCallback(
    (busID) => navigation.navigate("BusDetails", { busID }),
    [navigation]
  );

  // Responsive scaling functions
  const wp = (percentage) => {
    return windowDimensions.width * (percentage / 100);
  };

  const hp = (percentage) => {
    return windowDimensions.height * (percentage / 100);
  };

  return (
    <LinearGradient
      colors={['#f5f7fa', '#e4e8f0']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f7fa" />
        
        {/* Header Section */}
        <View style={[styles.headerContainer, {
          paddingHorizontal: wp(6),
          paddingTop: hp(8),
          paddingBottom: hp(1)
        }]}>
          <Text style={[styles.headerTitle, { fontSize: wp(7) }]}>Bus Tracker</Text>
          <TouchableOpacity 
            onPress={fetchBusData} 
            style={styles.refreshButton}
          >
            <Ionicons 
              name={refreshing ? "refresh" : "refresh-outline"} 
              size={wp(6)} 
              color="#4b0082" 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, {
          marginHorizontal: wp(6),
          marginVertical: hp(2),
          paddingHorizontal: wp(4),
          paddingVertical: hp(1)
        }]}>
          <Ionicons 
            name="search" 
            size={wp(5)} 
            color="#7a7a7a" 
            style={styles.searchIcon} 
          />
          <TextInput
            placeholder="Search bus number..."
            placeholderTextColor="#7a7a7a"
            style={[styles.searchInput, { fontSize: wp(4) }]}
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity 
              onPress={() => setSearch("")} 
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={wp(5)} color="#7a7a7a" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Bus List */}
        <FlatList
          data={filteredBuses}
          keyExtractor={(bus, idx) => bus.busID ? bus.busID.toString() : idx.toString()}
          renderItem={({ item }) => (
            <MemoBusCard
              bus={item}
              windowWidth={windowDimensions.width}
              onPress={() => handleBusPress(item.busID)}
            />
          )}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: hp(3), paddingHorizontal: wp(4) }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchBusData}
              tintColor="#4b0082"
              colors={['#4b0082']}
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyState, { paddingTop: hp(15) }]}>
              <Ionicons 
                name="bus-outline" 
                size={wp(15)} 
                color="#4b0082" 
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyText, { fontSize: wp(4.5) }]}>No buses found</Text>
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
          }
        />
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
    backgroundColor: 'transparent',
  },
  headerTitle: {
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
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    opacity: 0.7,
    marginBottom: 16,
  },
  emptyText: {
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