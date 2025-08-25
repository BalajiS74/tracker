import { useState, useEffect, useCallback, memo } from "react";
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
  FlatList,
  Animated,
  Easing
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
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  }, []);

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
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
        
        {/* Header Section */}
        <LinearGradient
          colors={['#6C63FF', '#7B73FF']}
          style={[styles.headerContainer, {
            paddingHorizontal: wp(5),
            paddingTop: hp(4),
            paddingBottom: hp(2)
          }]}
        >
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.headerTitle, { fontSize: wp(6) }]}>Track Buses</Text>
              <Text style={[styles.headerSubtitle, { fontSize: wp(3.5) }]}>
                Real-time bus tracking
              </Text>
            </View>
            <TouchableOpacity 
              onPress={fetchBusData} 
              style={styles.refreshButton}
            >
              <Ionicons 
                name={refreshing ? "refresh" : "refresh-outline"} 
                size={wp(5.5)} 
                color="#fff" 
              />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, {
            marginTop: hp(2),
            paddingHorizontal: wp(4),
          }]}>
            <Ionicons 
              name="search" 
              size={wp(5)} 
              color="#999" 
              style={styles.searchIcon} 
            />
            <TextInput
              placeholder="Search bus number..."
              placeholderTextColor="#999"
              style={[styles.searchInput, { fontSize: wp(4) }]}
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity 
                onPress={() => setSearch("")} 
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={wp(5)} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        </LinearGradient>

        {/* Stats Bar */}
        <View style={[styles.statsContainer, { marginHorizontal: wp(5) }]}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{busData.length}</Text>
            <Text style={styles.statLabel}>Total Buses</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{filteredBuses.length}</Text>
            <Text style={styles.statLabel}>Filtered</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={wp(4.5)} color="#6C63FF" />
            <Text style={styles.statLabel}>Live</Text>
          </View>
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
            { paddingBottom: hp(3), paddingHorizontal: wp(5) }
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchBusData}
              tintColor="#6C63FF"
              colors={['#6C63FF']}
            />
          }
          ListEmptyComponent={
            <View style={[styles.emptyState, { paddingTop: hp(10) }]}>
              <Ionicons 
                name="bus-outline" 
                size={wp(20)} 
                color="#E5E5E5" 
                style={styles.emptyIcon}
              />
              <Text style={[styles.emptyText, { fontSize: wp(4.5) }]}>
                {search ? "No buses found" : "No buses available"}
              </Text>
              <Text style={[styles.emptySubtext, { fontSize: wp(3.8) }]}>
                {search ? "Try a different search term" : "Pull down to refresh"}
              </Text>
              {search ? (
                <TouchableOpacity 
                  onPress={() => setSearch("")}
                  style={[styles.actionButton, { marginTop: hp(2) }]}
                >
                  <Text style={styles.actionButtonText}>Clear search</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  onPress={fetchBusData}
                  style={[styles.actionButton, { marginTop: hp(2) }]}
                >
                  <Text style={styles.actionButtonText}>Refresh</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListHeaderComponent={
            filteredBuses.length > 0 ? (
              <Text style={[styles.listHeader, { fontSize: wp(4) }]}>
                Available Buses ({filteredBuses.length})
              </Text>
            ) : null
          }
        />
      </SafeAreaView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:10

  },
  headerTitle: {
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  refreshButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 50,
    marginTop: 15,
    marginBottom:20
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    color: '#333',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 15,
    marginTop: -25,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6C63FF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingTop: 10,
  },
  listHeader: {
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 15,
    marginTop: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    opacity: 0.5,
    marginBottom: 20,
  },
  emptyText: {
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Track; 