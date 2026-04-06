import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DriverCard = ({ driver }) => {
  const handleCall = () => {
    if (driver?.phone) {
      Linking.openURL(`tel:${driver.phone}`);
    }
  };

  const handleMessage = () => {
    if (driver?.phone) {
      Linking.openURL(`sms:${driver.phone}`);
    }
  };

  if (!driver) return null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0bc1bf', '#089b99']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Ionicons name="person-circle-outline" size={28} color="#fff" />
        <Text style={styles.title}>Driver Details</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="person-outline" size={18} color="#0bc1bf" />
          <View style={styles.info}>
            <Text style={styles.label}>Driver Name</Text>
            <Text style={styles.value}>{driver.name}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="call-outline" size={18} color="#0bc1bf" />
          <View style={styles.info}>
            <Text style={styles.label}>Phone Number</Text>
            <Text style={styles.value}>{driver.phone}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleCall} style={styles.actionBtn}>
              <Ionicons name="call" size={18} color="#22C55E" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleMessage} style={styles.actionBtn}>
              <Ionicons name="chatbubble-outline" size={18} color="#0bc1bf" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="card-outline" size={18} color="#0bc1bf" />
          <View style={styles.info}>
            <Text style={styles.label}>License Number</Text>
            <Text style={styles.value}>{driver.licenseNumber}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="star-outline" size={18} color="#0bc1bf" />
          <View style={styles.info}>
            <Text style={styles.label}>Experience</Text>
            <Text style={styles.value}>{driver.experience}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{driver.rating}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={18} color="#0bc1bf" />
          <View style={styles.info}>
            <Text style={styles.label}>Joined</Text>
            <Text style={styles.value}>{driver.joiningDate}</Text>
          </View>
          <View style={[styles.statusBadge, driver.status === 'active' && styles.activeStatus]}>
            <Text style={styles.statusText}>
              {driver.status === 'active' ? 'Active' : 'Off Duty'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  info: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  activeStatus: {
    backgroundColor: '#D1FAE5',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#065F46',
  },
});

export default DriverCard;