import { memo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StopItem = memo(({ item, index, currentStopIdx, stopsLength, blinkAnim, pulseAnim }) => {
  const isCurrent = index === currentStopIdx;
  
  return (
    <View style={[styles.stopRow, isCurrent && styles.activeStopRow]}>
      <View style={styles.dotContainer}>
        {isCurrent ? (
          <Animated.View
            style={[
              styles.dot,
              styles.currentDot,
              blinkAnim && { opacity: blinkAnim },
              pulseAnim && { transform: [{ scale: pulseAnim }] },
            ]}
          />
        ) : (
          <View
            style={[
              styles.dot,
              index < currentStopIdx ? styles.pastDot : styles.upcomingDot,
            ]}
          />
        )}
        {index !== stopsLength - 1 && (
          <View
            style={[
              styles.line,
              index < currentStopIdx ? styles.pastLine : styles.upcomingLine,
            ]}
          />
        )}
      </View>

      <View style={styles.stopInfo}>
        <Text style={[styles.stopName, isCurrent && styles.activeStopName]}>
          {item.name}
        </Text>
        <Text style={styles.stopDistance}>
          {item?.cumulative_km_to_next ?? '--'} km
        </Text>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.scheduledTime}>{item.scheduled_time || '--:--'}</Text>
        {item.delay_minutes > 0 && (
          <Text style={styles.delayText}>+{item.delay_minutes} min</Text>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeStopRow: {
    backgroundColor: '#f0fdfa',
    borderLeftWidth: 4,
    borderLeftColor: '#0bc1bf',
  },
  dotContainer: {
    width: 36,
    alignItems: 'center',
    marginRight: 12,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    zIndex: 2,
  },
  currentDot: {
    backgroundColor: '#0bc1bf',
    borderColor: '#0bc1bf',
  },
  pastDot: {
    backgroundColor: '#A5B4FC',
    borderColor: '#818CF8',
  },
  upcomingDot: {
    backgroundColor: '#fff',
    borderColor: '#C7D2FE',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 4,
    marginBottom: -20,
  },
  pastLine: {
    backgroundColor: '#A5B4FC',
  },
  upcomingLine: {
    backgroundColor: '#C7D2FE',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  activeStopName: {
    color: '#0bc1bf',
    fontWeight: '700',
  },
  stopDistance: {
    fontSize: 14,
    color: '#64748B',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  scheduledTime: {
    fontSize: 12,
    color: '#1E293B',
    fontWeight: '600',
  },
  delayText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '600',
  },
});

StopItem.displayName = 'StopItem';
export default StopItem;