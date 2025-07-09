import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

export default function BusCArd(){
    <TouchableOpacity>
        <View style={styles.card}>
            <View style={styles.cardItems}>
                <View style={styles.busNumber}>
                    <Text> TN 76 A2562</Text>
                </View>
            </View>
        </View>
    </TouchableOpacity>
}
const styles =  StyleSheet.create({
    card:{
        width:100,
        height:100,
        backgroundColor:"90ee90"
    }
})