import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { SafeAreaView } from "react-native-safe-area-context";

const HelpSupportScreen = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const faqs = [
    {
      question: "Why isn't my bus showing on the map?",
      answer:
        'The bus may be offline, the route may be inactive, or the app may need a refresh. Check your location permissions and network connection.',
    },
    {
      question: "How accurate is real-time tracking?",
      answer:
        'Tracking is generally accurate within 10 meters. Delay may occur during signal drops or heavy traffic.',
    },
    {
      question: "How do I report an issue?",
      answer:
        'Use Contact Support below or email support@collegebustracker.com with bus id and timestamp for fastest response.',
    },
    {
      question: "What data is collected?",
      answer:
        'We collect location and usage data only during app use. Personal data is protected and never sold.',
    },
  ];

  const contactMethods = [
    {
      title: 'Email Support',
      subtitle: 'support@collegebustracker.com',
      icon: 'email',
      action: () => Linking.openURL('mailto:support@collegebustracker.com'),
    },
    {
      title: 'Call Helpdesk',
      subtitle: '+1 234 567 890',
      icon: 'phone',
      action: () => Linking.openURL('tel:+1234567890'),
    },
    {
      title: 'Live Chat',
      subtitle: 'Instant support inside the app',
      icon: 'chat',
      action: () => console.log('Open live chat'),
    },
  ];

  const quickActions = [
    {
      icon: 'menu-book',
      title: 'User Guide',
      action: () => console.log('Open user guide'),
    },
    {
      icon: 'ondemand-video',
      title: 'Tutorial Videos',
      action: () => console.log('Open tutorials'),
    },
    {
      icon: 'network-check',
      title: 'Status Page',
      action: () => console.log('Open status'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0bc1bf", "#0a94ae"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerContainer}
      >
        <Text style={styles.header}>Help & Support</Text>
        <Text style={styles.subHeader}>Fast answers and direct support for your trip.</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSpacer} />

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Get help in 3 steps</Text>
          <Text style={styles.infoText}>Choose the section that fits your issue, or contact us directly.</Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsRow}>
            {quickActions.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.quickAction}
                activeOpacity={0.8}
                onPress={item.action}
              >
                <MaterialIcons name={item.icon} size={hp('3%')} color="#0bc1bf" />
                <Text style={styles.quickActionText}>{item.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqs.map((item, index) => {
            const opened = activeFaq === index;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.faqItem, opened && styles.faqItemOpen]}
                onPress={() => setActiveFaq(opened ? null : index)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <MaterialIcons
                    name={opened ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={hp('3%')}
                    color="#0bc1bf"
                  />
                </View>
                {opened && <Text style={styles.faqAnswer}>{item.answer}</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={[styles.sectionCard, styles.contactCard]}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {contactMethods.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.contactItem}
              onPress={item.action}
              activeOpacity={0.8}
            >
              <View style={styles.contactIcon}>
                <MaterialIcons name={item.icon} size={hp('3%')} color="#fff" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactTitle}>{item.title}</Text>
                <Text style={styles.contactSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={hp('2.5%')} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.emergencyButton}
          activeOpacity={0.8}
          onPress={() => Linking.openURL('tel:911')}
        >
          <FontAwesome5 name="exclamation-triangle" size={hp('2.8%')} color="#fff" />
          <Text style={styles.emergencyText}>Emergency Help: 911</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef9f9',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: hp('10%'),
    paddingBottom: hp('2.5%'),
    paddingHorizontal: wp('4%'),
    borderBottomLeftRadius: wp('5%'),
    borderBottomRightRadius: wp('5%'),
    zIndex: 10,
  },
  header: {
    fontSize: hp('3.5%'),
    fontWeight: '800',
    color: '#fff',
    marginBottom: hp('0.5%'),
  },
  subHeader: {
    fontSize: hp('2.1%'),
    color: 'rgba(255,255,255,0.95)',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp('4%'),
    paddingBottom: hp('2.5%'),
  },
  headerSpacer: {
    height: hp('23%'),
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: wp('3.5%'),
    padding: wp('4%'),
    marginBottom: hp('2%'),
    borderLeftWidth: 4,
    borderLeftColor: '#0bc1bf',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: wp('1%'),
    elevation: 3,
  },
  infoTitle: {
    fontSize: hp('2.2%'),
    fontWeight: '700',
    color: '#1d3f4e',
    marginBottom: hp('0.5%'),
  },
  infoText: {
    fontSize: hp('1.9%'),
    color: '#4c5d67',
    lineHeight: hp('2.8%'),
  },
  sectionCard: {
    marginBottom: hp('2%'),
    borderRadius: wp('4%'),
    backgroundColor: '#fff',
    padding: wp('4%'),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: wp('1.1%'),
    elevation: 3,
  },
  sectionTitle: {
    fontSize: hp('2.2%'),
    fontWeight: '700',
    color: '#1f3f55',
    marginBottom: hp('1%'),
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wp('2%'),
  },
  quickAction: {
    backgroundColor: '#fbffff',
    borderRadius: wp('3%'),
    width: wp('28%'),
    paddingVertical: hp('1.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1eef0',
  },
  quickActionText: {
    marginTop: hp('0.7%'),
    fontSize: hp('1.6%'),
    color: '#0b6f76',
    fontWeight: '600',
    textAlign: 'center',
  },
  faqItem: {
    backgroundColor: '#f6fcfc',
    borderRadius: wp('2.5%'),
    padding: wp('3%'),
    marginBottom: hp('1%'),
  },
  faqItemOpen: {
    backgroundColor: '#e5fbfa',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: hp('2%'),
    fontWeight: '600',
    color: '#1e3f4a',
    flex: 1,
    marginRight: wp('2%'),
  },
  faqAnswer: {
    marginTop: hp('1%'),
    fontSize: hp('1.8%'),
    color: '#4f5f69',
    lineHeight: hp('2.6%'),
  },
  contactCard: {
    paddingVertical: hp('2%'),
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('1.2%'),
    borderBottomWidth: 1,
    borderBottomColor: '#e1eaec',
  },
  contactIcon: {
    width: wp('10%'),
    height: wp('10%'),
    borderRadius: wp('4%'),
    backgroundColor: '#0bc1bf',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('3%'),
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: hp('2%'),
    fontWeight: '700',
    color: '#1f3f55',
  },
  contactSubtitle: {
    fontSize: hp('1.7%'),
    color: '#74848f',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ee2e2e',
    borderRadius: wp('4%'),
    paddingVertical: hp('1.2%'),
    marginBottom: hp('3%'),
    marginHorizontal: wp('2%'),
    borderWidth: 1,
    borderColor: '#fcdada',
  },
  emergencyText: {
    marginLeft: wp('2%'),
    color: '#fff',
    fontWeight: '700',
    fontSize: hp('2%'),
  },
});

export default HelpSupportScreen;
