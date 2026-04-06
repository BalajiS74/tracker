import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBusStatus, formatETA } from '../../helpers/calculations';

const BusInfoCard = ({ busInfo, isOnline, eta, distanceToNext, currentStopIdx, nextStop }) => {
  const status = getBusStatus(busInfo?.speed || 0, isOnline);
  const formattedETA = formatETA(eta);
  const speed = (busInfo?.speed || 0).toFixed(1);
  const distance = distanceToNext ? (distanceToNext * 1000).toFixed(0) : '--';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0bc1bf', '#089b99']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Ionicons name="bus-outline" size={24} color="#fff" />
        <Text style={styles.title}>Live Bus Status</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Status Row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusIcon, { backgroundColor: status.color + '20' }]}>
            <Ionicons name={status.icon} size={24} color={status.color} />
          </View>
          <View>
            <Text style={styles.statusLabel}>Current Status</Text>
            <Text style={[styles.statusValue, { color: status.color }]}>{status.text}</Text>
          </View>
          <View style={styles.speedContainer}>
            <Text style={styles.speedValue}>{speed}</Text>
            <Text style={styles.speedUnit}>km/h</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="navigate-circle-outline" size={20} color="#0bc1bf" />
            <Text style={styles.infoLabel}>Next Stop</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {nextStop?.name || '--'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={20} color="#0bc1bf" />
            <Text style={styles.infoLabel}>ETA</Text>
            <Text style={styles.infoValue}>{formattedETA}</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="resize-outline" size={20} color="#0bc1bf" />
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{distance} m</Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#0bc1bf" />
            <Text style={styles.infoLabel}>Stop No.</Text>
            <Text style={styles.infoValue}>{currentStopIdx + 1 || '--'}</Text>
          </View>
        </View>

        {/* Last Updated */}
        <View style={styles.updateRow}>
          <Ionicons name="refresh-outline" size={14} color="#94A3B8" />
          <Text style={styles.updateText}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
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
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  speedContainer: {
    marginLeft: 'auto',
    alignItems: 'center',
  },
  speedValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
  },
  speedUnit: {
    fontSize: 10,
    color: '#64748B',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  updateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    gap: 6,
  },
  updateText: {
    fontSize: 10,
    color: '#94A3B8',
  },
});

export default BusInfoCard;