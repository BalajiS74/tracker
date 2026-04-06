import { ScrollView, View } from 'react-native';
import BusInfoCard from './BusInfoCard';
import DriverCard from './DriverCard';

const DetailsTab = ({ busInfo, isOnline, eta, distanceToNext, currentStopIdx, nextStop, driver }) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <BusInfoCard
        busInfo={busInfo}
        isOnline={isOnline}
        eta={eta}
        distanceToNext={distanceToNext}
        currentStopIdx={currentStopIdx}
        nextStop={nextStop}
      />
      <DriverCard driver={driver} />
    </ScrollView>
  );
};

export default DetailsTab;