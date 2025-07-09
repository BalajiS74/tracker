import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function BusCards() {
  return (
    <TouchableOpacity>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.busNumber}>TN 76 A 2562</Text>
          <Text style={styles.route}>SCAD ➝ Alangulam</Text>
          <Text style={styles.icon}>🚌</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    marginVertical: 10,
    padding: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    fontSize: 22,
    color: "#333",
    paddingHorizontal: 5,
  },
  busNumber: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "#5675F0",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    textAlign: "center",
  },
  route: {
    fontSize: 14,
    color: "#37474f",
    flexShrink: 1,
    textAlign: "center",
    marginHorizontal: 10,
  },
});
