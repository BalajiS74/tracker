// src/screens/Profile.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const Profile = ({ setIsLoggedIn }) => {
  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    joinDate: 'Joined January 2023',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => setIsLoggedIn(false),
          style: 'destructive',
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <Ionicons name="call-outline" size={24} color="#4b0082" />
          <Text style={styles.detailText}>{user.phone}</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={24} color="#4b0082" />
          <Text style={styles.detailText}>{user.joinDate}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="settings-outline" size={24} color="#4b0082" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#4b0082" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={24} color="#4b0082" />
          <Text style={styles.menuText}>Terms & Privacy</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4b0082',
    marginBottom: 15,
  },
  name: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  email: { fontSize: 16, color: '#666' },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailText: { marginLeft: 15, fontSize: 16, color: '#333' },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#333' },
  logoutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff4444',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutButtonText: { color: '#ff4444', fontSize: 16, fontWeight: 'bold' },
});

export default Profile;
