import { View, Text, StyleSheet, Image, ScrollView, StatusBar, TouchableOpacity } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';

// Mock BusCard component
const BusCard = ({ route, nextStop, time, onPress }) => (
  <TouchableOpacity style={styles.busCard} onPress={onPress}>
    <View style={styles.busCardIconContainer}>
      <Ionicons name="bus" size={24} color="#4b0082" />
    </View>
    <View style={styles.busCardDetails}>
      <Text style={styles.busCardRoute}>{route}</Text>
      <Text style={styles.busCardStop}>Next: {nextStop}</Text>
    </View>
    <View style={styles.busCardTimeContainer}>
      <Text style={styles.busCardTime}>{time}</Text>
      <Ionicons name="chevron-forward" size={16} color="#999" />
    </View>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  // Mock data - replace with your actual image paths
  const adImage = require('../images/scadengg.jpg');
  const profileImage = require('../images/profileimage.jpeg');

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Campus Transit</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
              <Image source={profileImage} style={styles.profileImage} />
            </TouchableOpacity>
          </View>

          {/* Welcome Card */}
          <View style={styles.welcomeCard}>
            <View>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.userName}>Adam</Text>
            </View>
            <View style={styles.notificationBadge}>
              <Ionicons name="notifications" size={20} color="#fff" />
            </View>
          </View>

          {/* Promo Banner */}
          <TouchableOpacity style={styles.promoBanner}>
            <Image source={adImage} style={styles.promoImage} />
            <View style={styles.promoOverlay}>
              <Text style={styles.promoTitle}>Never Miss Your Bus!</Text>
              <Text style={styles.promoSubtitle}>Real-time tracking for all routes</Text>
            </View>
          </TouchableOpacity>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#e6e6ff' }]}>
                <Ionicons name="map" size={20} color="#4b0082" />
              </View>
              <Text style={styles.actionText}>Map View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#ffe6f2' }]}>
                <Ionicons name="time" size={20} color="#d81b60" />
              </View>
              <Text style={styles.actionText}>Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIcon, { backgroundColor: '#e6ffe6' }]}>
                <Ionicons name="star" size={20} color="#388e3c" />
              </View>
              <Text style={styles.actionText}>Favorites</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Routes */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Routes</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            
            <BusCard 
              route="Route A - Main Campus Loop" 
              nextStop="Library Gate" 
              time="5 min" 
              onPress={() => navigation.navigate('BusDetails')}
            />
            <BusCard 
              route="Route B - Science Complex" 
              nextStop="Engineering Building" 
              time="12 min" 
              onPress={() => navigation.navigate('BusDetails')}
            />
            <BusCard 
              route="Route C - Dormitory Shuttle" 
              nextStop="North Campus" 
              time="18 min" 
              onPress={() => navigation.navigate('BusDetails')}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4b0082',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#4b0082',
  },
  welcomeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },
  notificationBadge: {
    backgroundColor: '#4b0082',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBanner: {
    height: 160,
    borderRadius: 16,
    marginHorizontal: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  promoImage: {
    width: '100%',
    height: '100%',
  },
  promoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(75, 0, 130, 0.8)',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#4b0082',
    fontWeight: '600',
  },
  busCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  busCardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(75, 0, 130, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  busCardDetails: {
    flex: 1,
  },
  busCardRoute: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  busCardStop: {
    fontSize: 14,
    color: '#666',
  },
  busCardTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  busCardTime: {
    fontSize: 14,
    color: '#4b0082',
    fontWeight: '600',
    marginRight: 8,
  },
});