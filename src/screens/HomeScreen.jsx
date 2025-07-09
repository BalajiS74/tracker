import { View, Text, StyleSheet,Image } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import BusCards from "../components/BusCards";
export default function HomeScreen() {
  const adimage = require('../images/scadengg.jpg')
  const profileimage = require('../images/profileimage.jpeg')
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcome}>Tracker</Text>

         
          <View style={styles.profileCard}>
            <View style={styles.profileCardImage}>
              <Image source={profileimage} style={styles.profileImages}></Image>
            </View>
            <View style={styles.profileCardText}>
              <Text style={styles.cardTitle}>Welcome back</Text>
              <Text style={styles.cardSubtitle}>Adam</Text>
            </View>
          </View>

          <View style={styles.adCardImage}>
            <Image source={adimage} style={styles.adimage}></Image>
          </View>

          <View style={styles.recentCardContainer}>
            <View style={styles.recentCardText}>
              <Text style={{fontSize: 15, fontWeight: "bold"}}>Recent search</Text>
            </View>
            <View style={styles.recentCards}>
              <BusCards/>
              <BusCards/>
              <BusCards/>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "#f8f8f8",
  },
  header: {
    flex: 1,
    alignItems: "center",
    marginTop: 30,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "800",
    color: "#333",
    marginBottom: 20,
  },
  profileCard: {
    width: 350,
    height: 100,
    // backgroundColor: "#1e90ff",
    // borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    // shadowColor: "#000",
    // shadowOpacity: 0.2,
    // shadowOffset: { width: 0, height: 2 },
    // shadowRadius: 4,
    // elevation: 5,
  },
  profileCardImage: {
    width: 60,
    height: 60,
    backgroundColor: "#808080",
    borderRadius: 30,
    marginRight: 15,
  },
  profileImages:{
    width:'100%',
    height:"100%",
    borderRadius:30 
  },
  profileCardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#000",
    marginTop: 4,
  },
  adCardImage:{ 
    width:350,
    height:200,
    backgroundColor:'#ff8c00',
    borderRadius:10,
  },
  adimage:{
    width:"100%",
    height:"100%",
    borderRadius:10,
  },
  recentCardContainer:{
    width:350,
    height:200,
    // backgroundColor:'#ff8c00',
    marginTop:50
  },
  recentCardText:{
    marginHorizontal:15,
    marginTop:20
  }
});
