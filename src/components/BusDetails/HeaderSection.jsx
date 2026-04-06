import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getBusStatus } from '../../helpers/calculations';

const HeaderSection = ({ busId, routeName, busInfo, isOnline }) => {
  const status = getBusStatus(busInfo?.speed || 0, isOnline);
  
  return (
    <LinearGradient
      colors={['#0bc1bf', '#089b99']}
      style={styles.headerGradient}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="bus" size={24} color="#fff" />
          <View>
            <Text style={styles.headerTitle}>{routeName || `Bus ${busId}`}</Text>
            <Text style={styles.busId}>ID: {busId}</Text>
          </View>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: status.color }
          ]}
        >
          <Ionicons name={status.icon} size={14} color="#fff" />
          <Text style={styles.statusText}>{status.text}</Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  busId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default HeaderSection;