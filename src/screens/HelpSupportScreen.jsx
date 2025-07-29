import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Linking, TouchableOpacity } from 'react-native';
import { Card, Divider, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';

const HelpSupportScreen = () => {
  const [expanded, setExpanded] = useState(null);

  const faqs = [
    {
      question: "Why isn't my bus showing on the map?",
      answer: "This could be due to:\n- GPS signal issues on the bus\n- The bus isn't in service\n- Your app needs an update"
    },
    {
      question: "How accurate is the real-time tracking?",
      answer: "Tracking is 90-95% accurate but depends on:\n- Cellular network strength\n- GPS hardware in buses\n- Traffic conditions"
    }
  ];

  const contactMethods = [
    {
      name: "Email Support",
      icon: "email",
      action: () => Linking.openURL('mailto:support@collegebustracker.com')
    },
    {
      name: "Call Transport Office",
      icon: "phone",
      action: () => Linking.openURL('tel:+1234567890')
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Help Center</Text>

      {/* Getting Started Section */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Getting Started" titleStyle={styles.sectionTitle} />
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
      <Card style={styles.sectionCard}>
        <Card.Title title="Frequently Asked Questions" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {faqs.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              onPress={() => setExpanded(expanded === index ? null : index)}
              style={styles.faqItem}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <MaterialIcons 
                  name={expanded === index ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} 
                  size={24} 
                  color="#666" 
                />
              </View>
              {expanded === index && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Contact Section */}
      <Card style={styles.sectionCard}>
        <Card.Title title="Contact Support" titleStyle={styles.sectionTitle} />
        <Card.Content>
          {contactMethods.map((method, index) => (
            <TouchableOpacity
              key={index}
              style={styles.contactMethod}
              onPress={method.action}
            >
              <MaterialIcons name={method.icon} size={24} color="#2E86C1" />
              <Text style={styles.contactText}>{method.name}</Text>
              <View style={{flex: 1}} />
              <MaterialIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
    padding: 15
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#2C3E50'
  },
  sectionCard: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 2
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#34495E'
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start'
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3498DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 3
  },
  stepNumberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  },
  stepContent: {
    flex: 1
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
    color: '#2C3E50'
  },
  stepDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDED'
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    flex: 1,
    marginRight: 10
  },
  faqAnswer: {
    marginTop: 8,
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    paddingLeft: 5
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EAEDED'
  },
  contactText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#2C3E50'
  }
});

export default HelpSupportScreen;