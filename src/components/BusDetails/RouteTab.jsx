import { FlatList } from 'react-native';
import StopItem from './StopItem';

const RouteTab = ({ stops, currentStopIdx, blinkAnim, pulseAnim }) => {
  const renderStopItem = ({ item, index }) => (
    <StopItem
      item={item}
      index={index}
      currentStopIdx={currentStopIdx}
      stopsLength={stops.length}
      blinkAnim={blinkAnim}
      pulseAnim={pulseAnim}
    />
  );

  return (
    <FlatList
      data={stops}
      keyExtractor={(_, idx) => idx.toString()}
      renderItem={renderStopItem}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    />
  );
};

export default RouteTab;