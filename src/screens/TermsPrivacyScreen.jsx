import React, { useState } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text,
  SafeAreaView
} from 'react-native';
import Markdown from "react-native-markdown-display";
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const TermsPrivacyScreen = () => {
  const [activeTab, setActiveTab] = useState('terms');

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

  ## 4. Account Usage
  Your account is personal and should not be shared with others. You are responsible for all activities that occur under your account.

  ## 5. Service Availability
  We strive to maintain service availability but cannot guarantee uninterrupted access. Scheduled maintenance may occasionally limit availability.
  `;

  const privacyContent = `
  ## 1. Data Collection  
  We collect:  
  - Device location (during use)  
  - App usage statistics  
  - Device information for troubleshooting

  ## 2. Data Usage  
  Used for:  
  - Real-time tracking  
  - Performance improvement  
  - Personalized experience

  ## 3. Third-Party Sharing  
  Never sold. Shared only with:  
  - College transport department  
  - Firebase Analytics (anonymous)

  ## 4. Data Retention
  We retain your data only for as long as necessary to provide our services and comply with legal obligations.

  ## 5. Your Rights
  You have the right to access, correct, or delete your personal data. Contact us at privacy@collegebus.com for any requests.
  `;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms & Privacy</Text>
        <Text style={styles.headerSubtitle}>
          Understand our policies and your rights
        </Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
          onPress={() => setActiveTab('terms')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="document-text-outline" 
            size={wp('5%')} 
            color={activeTab === 'terms' ? '#fff' : '#6C63FF'} 
          />
          <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
            Terms of Service
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="shield-checkmark-outline" 
            size={wp('5%')} 
            color={activeTab === 'privacy' ? '#fff' : '#6C63FF'} 
          />
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.cardContent}>
            {activeTab === 'terms' ? (
              <Markdown style={markdownStyles}>{termsContent}</Markdown>
            ) : (
              <Markdown style={markdownStyles}>{privacyContent}</Markdown>
            )}
          </View>
          
          <View style={styles.footer}>
            <Ionicons name="information-circle" size={wp('4.5%')} color="#6C63FF" />
            <Text style={styles.footerText}>
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Custom markdown styling with responsive units
const markdownStyles = StyleSheet.create({
  heading1: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
    lineHeight: hp('3.5%'),
  },
  heading2: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#6C63FF',
    marginTop: hp('2%'),
    marginBottom: hp('1%'),
    lineHeight: hp('3%'),
  },
  body: {
    fontSize: wp('4%'),
    lineHeight: hp('2.8%'),
    color: '#555',
  },
  paragraph: {
    marginVertical: hp('1%'),
    lineHeight: hp('2.8%'),
  },
  bullet_list: {
    marginTop: hp('1%'),
    marginBottom: hp('1.5%'),
  },
  list_item: {
    flexDirection: 'row',
    marginBottom: hp('0.8%'),
  },
  text: {
    color: '#555',
    fontSize: wp('4%'),
    lineHeight: hp('2.8%'),
  },
  link: {
    color: '#6C63FF',
    textDecorationLine: 'underline',
  },
});

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: wp('5%'),
    paddingTop: hp('10%'),
    paddingBottom: hp('2.5%'),
    borderBottomLeftRadius: wp('5%'),
    borderBottomRightRadius: wp('5%'),
  },
  headerTitle: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#fff',
    marginBottom: hp('0.5%'),
  },
  headerSubtitle: {
    fontSize: wp('4%'),
    color: 'rgba(255, 255, 255, 0.8)',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: wp('4%'),
    paddingBottom: hp('4%'),
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: wp('4%'),
    marginTop: hp('-2%'), // Positioned slightly over the header
    borderRadius: wp('3%'),
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: wp('1%'),
    elevation: 3,
    zIndex: 10, // Ensure it appears above other content
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: hp('1.8%'),
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp('2%'),
  },
  activeTab: {
    backgroundColor: '#6C63FF',
  },
  tabText: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#7F8C8D',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wp('3%'),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: wp('1.5%'),
    elevation: 3,
    marginBottom: hp('2%'),
    marginTop: hp('1%'),
  },
  cardContent: {
    padding: wp('5%'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('4%'),
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: wp('2%'),
  },
  footerText: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
});

export default TermsPrivacyScreen;