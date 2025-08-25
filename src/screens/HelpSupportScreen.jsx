import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Linking,
  TouchableOpacity,
} from "react-native";
import { Card } from "react-native-paper";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";

const HelpSupportScreen = () => {
  const [expanded, setExpanded] = useState(null);

  const toggleExpand = (index) => {
    if (expanded === index) {
      setExpanded(null);
    } else {
      setExpanded(index);
    }
  };

  const faqs = [
    {
      question: "Why isn't my bus showing on the map?",
      answer:
        "This could be due to:\n- GPS signal issues on the bus\n- The bus isn't in service\n- Your app needs an update",
    },
    {
      question: "How accurate is the real-time tracking?",
      answer:
        "Tracking is 90-95% accurate but depends on:\n- Cellular network strength\n- GPS hardware in buses\n- Traffic conditions",
    },
    {
      question: "How do I report an issue with the app?",
      answer:
        "You can report any issues through the 'Contact Support' section below or email us directly at support@collegebustracker.com",
    },
    {
      question: "Is my data being stored?",
      answer:
        "We only store necessary data to provide the service. Your location data is only used while the app is active and is not stored long-term.",
    },
  ];

  const contactMethods = [
    {
      name: "Email Support",
      description: "Get help via email",
      icon: "email",
      color: "#6C63FF",
      action: () => Linking.openURL("mailto:support@collegebustracker.com"),
    },
    {
      name: "Call Transport Office",
      description: "Speak directly with our team",
      icon: "phone",
      color: "#4CAF50",
      action: () => Linking.openURL("tel:+1234567890"),
    },
  ];

  const resources = [
    {
      title: "User Guide",
      icon: "menu-book",
      action: () => console.log("Open user guide"),
    },
    {
      title: "Video Tutorials",
      icon: "ondemand-video",
      action: () => console.log("Open video tutorials"),
    },
    {
      title: "Service Status",
      icon: "network-check",
      action: () => console.log("Check service status"),
    },
  ];

  return (
    <View style={styles.container}>
      {/* Absolute positioned header */}
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Help & Support</Text>
        <Text style={styles.subHeader}>
          We're here to help you with any issues
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Content starts after the header space */}
        <View style={styles.headerSpacer} />

        {/* Quick Resources */}
        <View style={styles.quickResources}>
          <Text style={styles.sectionHeader}>Quick Resources</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.resourcesScroll}
          >
            {resources.map((resource, index) => (
              <TouchableOpacity
                key={index}
                style={styles.resourceCard}
                onPress={resource.action}
              >
                <MaterialIcons
                  name={resource.icon}
                  size={hp("4%")}
                  color="#6C63FF"
                />
                <Text style={styles.resourceText}>{resource.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Getting Started Section */}
        <Card style={styles.sectionCard} elevation={3}>
          <Card.Title
            title="Getting Started"
            titleStyle={styles.sectionTitle}
            left={(props) => (
              <MaterialIcons
                {...props}
                name="directions-bus"
                size={hp("3.5%")}
                color="#6C63FF"
              />
            )}
          />
          <Card.Content>
            <Step number={1} title="Enable Location">
              Allow location permissions for accurate tracking
            </Step>
            <Step number={2} title="Select Your Route">
              Choose your regular bus route from the Routes tab
            </Step>
            <Step number={3} title="Set Notifications">
              Enable push notifications for arrival alerts
            </Step>
          </Card.Content>
        </Card>

        {/* FAQ Section */}
        <Card style={styles.sectionCard} elevation={3}>
          <Card.Title
            title="Frequently Asked Questions"
            titleStyle={styles.sectionTitle}
            left={(props) => (
              <MaterialIcons
                {...props}
                name="help-outline"
                size={hp("3.5%")}
                color="#6C63FF"
              />
            )}
          />
          <Card.Content>
            {faqs.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => toggleExpand(index)}
                style={[
                  styles.faqItem,
                  expanded === index && styles.faqItemActive,
                ]}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <View style={styles.faqIcon}>
                    <MaterialIcons
                      name={expanded === index ? "help" : "help-outline"}
                      size={hp("2.5%")}
                      color={expanded === index ? "#6C63FF" : "#666"}
                    />
                  </View>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <MaterialIcons
                    name={
                      expanded === index
                        ? "keyboard-arrow-up"
                        : "keyboard-arrow-down"
                    }
                    size={hp("3%")}
                    color="#666"
                  />
                </View>
                {expanded === index && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Contact Section */}
        <Card style={styles.sectionCard} elevation={3}>
          <Card.Title
            title="Contact Support"
            titleStyle={styles.sectionTitle}
            left={(props) => (
              <MaterialIcons
                {...props}
                name="support-agent"
                size={hp("3.5%")}
                color="#6C63FF"
              />
            )}
          />
          <Card.Content>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactMethod}
                onPress={method.action}
                activeOpacity={0.7}
              >
                <View
                  style={[styles.contactIcon, { backgroundColor: method.color }]}
                >
                  <MaterialIcons
                    name={method.icon}
                    size={hp("3%")}
                    color="white"
                  />
                </View>
                <View style={styles.contactTextContainer}>
                  <Text style={styles.contactName}>{method.name}</Text>
                  <Text style={styles.contactDescription}>
                    {method.description}
                  </Text>
                </View>
                <MaterialIcons
                  name="chevron-right"
                  size={hp("3%")}
                  color="#999"
                />
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>

        {/* Emergency Contact */}
        <View style={styles.emergencyContainer}>
          <FontAwesome5
            name="exclamation-triangle"
            size={hp("3%")}
            color="#ffffffff"
          />
          <Text style={styles.emergencyText}>Emergency contact: </Text>
          <Text
            style={styles.emergencyNumber}
            onPress={() => Linking.openURL("tel:911")}
          >
            911
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const Step = ({ number, title, children }) => (
  <View style={styles.stepContainer}>
    <View style={styles.stepNumber}>
      <Text style={styles.stepNumberText}>{number}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{children}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: hp("10%"),
    paddingBottom: hp("2.5%"),
    borderBottomLeftRadius: wp("5%"),
    borderBottomRightRadius: wp("5%"),
    backgroundColor: "#6C63FF",
    zIndex: 10,
    paddingHorizontal: wp("4%"),
  },
  header: {
    fontSize: hp("3.5%"),
    fontWeight: "800",
    color: "white",
    marginBottom: hp("0.5%"),
  },
  subHeader: {
    fontSize: hp("2%"),
    color: "rgba(255, 255, 255, 0.8)",
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: wp("4%"),
    paddingBottom: hp("2%"),
  },
  headerSpacer: {
    height: hp("18%"), // Space for the absolute header
  },
  sectionHeader: {
    fontSize: hp("2.2%"),
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: hp("1.5%"),
  },
  sectionCard: {
    marginBottom: hp("2.5%"),
    borderRadius: wp("4%"),
    overflow: "hidden",
    backgroundColor: "white",
  },
  sectionTitle: {
    fontSize: hp("2.4%"),
    fontWeight: "700",
    color: "#2C3E50",
  },
  quickResources: {
    marginBottom: hp("3%"),
  },
  resourcesScroll: {
    marginHorizontal: wp("-6%"),
    paddingHorizontal: wp("4%"),
  },
  resourceCard: {
    width: wp("30%"),
    height: hp("12%"),
    backgroundColor: "white",
    borderRadius: wp("4%"),
    marginRight: wp("3%"),
    justifyContent: "center",
    alignItems: "center",
    padding: wp("3%"),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  resourceText: {
    marginTop: hp("1%"),
    fontSize: hp("1.6%"),
    fontWeight: "600",
    color: "#6C63FF",
    textAlign: "center",
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: hp("2.5%"),
    alignItems: "flex-start",
  },
  stepNumber: {
    width: wp("8%"),
    height: wp("8%"),
    borderRadius: wp("4%"),
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
    marginTop: hp("0.4%"),
  },
  stepNumberText: {
    color: "white",
    fontWeight: "bold",
    fontSize: hp("2%"),
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: hp("2.1%"),
    fontWeight: "600",
    marginBottom: hp("0.5%"),
    color: "#2C3E50",
  },
  stepDescription: {
    fontSize: hp("1.8%"),
    color: "#7F8C8D",
    lineHeight: hp("2.6%"),
  },
  faqItem: {
    paddingVertical: hp("1.8%"),
    borderBottomWidth: 1,
    borderBottomColor: "#EAEDED",
  },
  faqItemActive: {
    backgroundColor: "#f0e6ff",
    marginHorizontal: wp("-4%"),
    paddingHorizontal: wp("4%"),
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  faqIcon: {
    marginRight: wp("2%"),
  },
  faqQuestion: {
    fontSize: hp("2%"),
    fontWeight: "500",
    color: "#2C3E50",
    flex: 1,
    marginRight: wp("2%"),
  },
  answerContainer: {
    marginTop: hp("1.5%"),
    paddingLeft: wp("6%"),
  },
  faqAnswer: {
    fontSize: hp("1.8%"),
    color: "#7F8C8D",
    lineHeight: hp("2.6%"),
  },
  contactMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hp("2%"),
    borderBottomWidth: 1,
    borderBottomColor: "#EAEDED",
  },
  contactIcon: {
    width: wp("10%"),
    height: wp("10%"),
    borderRadius: wp("5%"),
    justifyContent: "center",
    alignItems: "center",
    marginRight: wp("3%"),
  },
  contactTextContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: hp("2.1%"),
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: hp("0.3%"),
  },
  contactDescription: {
    fontSize: hp("1.7%"),
    color: "#7F8C8D",
  },
  emergencyContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: hp("2%"),
    backgroundColor: "#cd2f2fff",
    borderRadius: wp("4%"),
    marginBottom: hp("2%"),
    borderWidth: 1,
    borderColor: "#FFE0E0",
  },
  emergencyText: {
    fontSize: hp("1.8%"),
    color: "#ffffffff",
    marginLeft: wp("2%"),
  },
  emergencyNumber: {
    fontSize: hp("2%"),
    fontWeight: "bold",
    color: "#ffffffff",
    textDecorationLine: "underline",
  },
});

export default HelpSupportScreen;