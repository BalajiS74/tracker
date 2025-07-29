import React, { useState } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text,  // Added missing Text import
  Dimensions  // Added for responsive design
} from 'react-native';
import Markdown from 'react-native-markdown-renderer';
import { Card, Divider } from 'react-native-paper';

const TermsPrivacyScreen = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const windowWidth = Dimensions.get('window').width;

  // Markdown content
  const termsContent = `
  ## 1. Acceptance of Terms  
  By using this app, you agree to these terms. If you disagree, please uninstall immediately.

  ## 2. Service Description  
  Provides real-time college bus tracking. Routes managed by your institution.

  ## 3. User Responsibilities  
  - Use only for legitimate transportation  
  - No GPS manipulation  
  - Report suspicious activity
  `;

  const privacyContent = `
  ## 1. Data Collection  
  We collect:  
  - Device location (during use)  
  - App usage statistics  

  ## 2. Data Usage  
  Used for:  
  - Real-time tracking  
  - Performance improvement  

  ## 3. Third-Party Sharing  
  Never sold. Shared only with:  
  - College transport department  
  - Firebase Analytics (anonymous)
  `;

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.tabContainer}>
        <TabButton 
          label="Terms" 
          active={activeTab === 'terms'} 
          onPress={() => setActiveTab('terms')} 
        />
        <TabButton 
          label="Privacy" 
          active={activeTab === 'privacy'} 
          onPress={() => setActiveTab('privacy')} 
        />
      </View>

      <Card style={[styles.card, { marginTop: windowWidth * 0.03 }]}>
        <Card.Content>
          {activeTab === 'terms' ? (
            <Markdown style={markdownStyles}>{termsContent}</Markdown>
          ) : (
            <Markdown style={markdownStyles}>{privacyContent}</Markdown>
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const TabButton = ({ label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.activeTab]}
    onPress={onPress}
    activeOpacity={0.7}  // Added for better touch feedback
  >
    <Text style={[styles.tabText, active && styles.activeTabText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

// Custom markdown styling
const markdownStyles = StyleSheet.create({
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginVertical: 10,
  },
  heading2: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginVertical: 8,
  },
  paragraph: {
    marginVertical: 4,
  },
  bullet_list: {
    marginTop: 5,
    marginBottom: 10,
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  text: {
    color: '#7F8C8D',
    fontSize: 14,
    lineHeight: 22,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30, // Added extra padding at bottom
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#4b0082', // Changed to match your app's theme
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
  },
  card: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 1,
  },
});

export default React.memo(TermsPrivacyScreen); // Added memo for performance