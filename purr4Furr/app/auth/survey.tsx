import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ScrollView,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { supabase } from '@/lib/supabase';

interface SurveyData {
  // Basic Info
  firstName: string;
  lastName: string;
  pronouns: string;
  age: string;
  height: string;
  
  // Identity
  gender: string;
  sexuality: string;
  interestedIn: string[];
  ethnicity: string;
  zodiac: string;
  fursona: string;
  
  // Professional
  work: string;
  jobTitle: string;
  school: string;
  education: string;
  
  // Personal Beliefs
  religion: string;
  politics: string;
  
  // Dating
  datingIntentions: string;
  relationshipType: string;
  
  // Interests
  interests: string[];
}

const SURVEY_STEPS = [
  'Basic Info',
  'Identity',
  'Professional',
  'Beliefs',
  'Dating Goals',
  'Interests'
];

const PRONOUNS_OPTIONS = ['He/Him', 'She/Her', 'They/Them', 'He/They', 'She/They', 'Other'];
const GENDER_OPTIONS = ['Man', 'Woman', 'Non-binary', 'Genderfluid', 'Transgender', 'Other'];
const SEXUALITY_OPTIONS = ['Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Other'];
const INTERESTED_IN_OPTIONS = ['Men', 'Women', 'Non-binary people', 'Everyone'];
const ETHNICITY_OPTIONS = ['Asian', 'Black/African American', 'Hispanic/Latino', 'White', 'Native American', 'Middle Eastern', 'Pacific Islander', 'Mixed', 'Other', 'Prefer not to say'];
const ZODIAC_OPTIONS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const EDUCATION_OPTIONS = ['High School', 'Some College', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Trade School', 'Other'];
const RELIGION_OPTIONS = ['Christian', 'Catholic', 'Jewish', 'Muslim', 'Buddhist', 'Hindu', 'Atheist', 'Agnostic', 'Spiritual', 'Other', 'Prefer not to say'];
const POLITICS_OPTIONS = ['Liberal', 'Conservative', 'Moderate', 'Progressive', 'Libertarian', 'Socialist', 'Other', 'Prefer not to say'];
const DATING_INTENTIONS = ['Serious relationship', 'Casual dating', 'Hookups', 'Friends first', 'Not sure yet'];
const RELATIONSHIP_TYPES = ['Monogamous', 'Polyamorous', 'Open relationship', 'Friends with benefits', 'It\'s complicated'];
const INTEREST_OPTIONS = [
  'Art', 'Music', 'Gaming', 'Movies', 'Books', 'Hiking', 'Fitness', 'Cooking', 'Travel',
  'Photography', 'Dancing', 'Sports', 'Technology', 'Science', 'Animals', 'Fashion',
  'Fursuit making', 'Convention going', 'Role playing', 'Drawing/Digital art', 'Writing',
  'Cosplay', 'Anime/Manga', 'Board games', 'Outdoor activities', 'Volunteering'
];

export default function SurveyScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [surveyData, setSurveyData] = useState<SurveyData>({
    firstName: '',
    lastName: '',
    pronouns: '',
    age: '',
    height: '',
    gender: '',
    sexuality: '',
    interestedIn: [],
    ethnicity: '',
    zodiac: '',
    fursona: '',
    work: '',
    jobTitle: '',
    school: '',
    education: '',
    religion: '',
    politics: '',
    datingIntentions: '',
    relationshipType: '',
    interests: []
  });

  // Load existing profile data if user is updating
  useEffect(() => {
    loadExistingProfile();
  }, []);

  const loadExistingProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        // Pre-populate with existing data
        setSurveyData({
          firstName: profile.first_name || '',
          lastName: profile.last_name || '',
          pronouns: profile.pronouns || '',
          age: profile.age?.toString() || '',
          height: profile.height || '',
          gender: profile.gender || '',
          sexuality: profile.sexuality || '',
          interestedIn: Array.isArray(profile.interested_in) ? profile.interested_in : (profile.interested_in ? [profile.interested_in] : []),
          ethnicity: profile.ethnicity || '',
          zodiac: profile.zodiac || '',
          fursona: profile.fursona || '',
          work: profile.work || '',
          jobTitle: profile.job_title || '',
          school: profile.school || '',
          education: profile.education || '',
          religion: profile.religion || '',
          politics: profile.politics || '',
          datingIntentions: profile.dating_intentions || '',
          relationshipType: profile.relationship_type || '',
          interests: Array.isArray(profile.interests) ? profile.interests : (typeof profile.interests === 'string' ? JSON.parse(profile.interests || '[]') : [])
        });
      }
    } catch (error) {
      console.log('No existing profile found, starting fresh');
    } finally {
      setLoading(false);
    }
  };

  const updateSurveyData = (field: keyof SurveyData, value: any) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof SurveyData, value: string) => {
    const currentArray = surveyData[field] as string[];
    const updatedArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateSurveyData(field, updatedArray);
  };

  const nextStep = () => {
    if (currentStep < SURVEY_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeSurvey = async () => {
    try {
      console.log('Saving survey data to Supabase...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        Alert.alert('Error', 'You must be logged in to complete the survey.');
        return;
      }

      // Prepare data for Supabase (convert to snake_case)
      const profileData = {
        id: user.id,
        first_name: surveyData.firstName,
        last_name: surveyData.lastName,
        pronouns: surveyData.pronouns,
        age: parseInt(surveyData.age),
        height: surveyData.height,
        gender: surveyData.gender,
        sexuality: surveyData.sexuality,
        interested_in: surveyData.interestedIn,
        ethnicity: surveyData.ethnicity,
        zodiac: surveyData.zodiac,
        fursona: surveyData.fursona,
        work: surveyData.work,
        job_title: surveyData.jobTitle,
        school: surveyData.school,
        education: surveyData.education,
        religion: surveyData.religion,
        politics: surveyData.politics,
        dating_intentions: surveyData.datingIntentions,
        relationship_type: surveyData.relationshipType,
        interests: surveyData.interests,
        profile_completed: true
      };

      // Save to Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) {
        Alert.alert('Error', 'Failed to save profile. Please try again.');
        return;
      }

      console.log('Profile saved successfully!');
      Alert.alert('Success', 'Profile completed successfully!', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const MultiSelectOptions = ({ 
    options, 
    selected, 
    onToggle, 
    maxSelections 
  }: { 
    options: string[], 
    selected: string[], 
    onToggle: (value: string) => void,
    maxSelections?: number 
  }) => (
    <View style={styles.optionsContainer}>
      {options.map((option) => {
        const isSelected = selected.includes(option);
        const canSelect = !maxSelections || selected.length < maxSelections || isSelected;
        
        return (
          <Pressable
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor: isSelected 
                  ? Colors[theme].tint 
                  : Colors[theme].background,
                borderColor: Colors[theme].tint,
                opacity: canSelect ? 1 : 0.5
              }
            ]}
            onPress={() => canSelect && onToggle(option)}
            disabled={!canSelect}
          >
            <Text style={[
              styles.optionText,
              { color: isSelected ? Colors[theme].background : Colors[theme].text }
            ]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const SingleSelectOptions = ({ 
    options, 
    selected, 
    onSelect 
  }: { 
    options: string[], 
    selected: string, 
    onSelect: (value: string) => void 
  }) => (
    <View style={styles.optionsContainer}>
      {options.map((option) => {
        const isSelected = selected === option;
        return (
          <Pressable
            key={option}
            style={[
              styles.optionButton,
              {
                backgroundColor: isSelected 
                  ? Colors[theme].tint 
                  : Colors[theme].background,
                borderColor: Colors[theme].tint
              }
            ]}
            onPress={() => onSelect(option)}
          >
            <Text style={[
              styles.optionText,
              { color: isSelected ? Colors[theme].background : Colors[theme].text }
            ]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Basic Info
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Let's start with the basics</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>First Name *</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.firstName}
                onChangeText={(text) => updateSurveyData('firstName', text)}
                placeholder="Enter your first name"
                placeholderTextColor={Colors[theme].icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Last Name *</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.lastName}
                onChangeText={(text) => updateSurveyData('lastName', text)}
                placeholder="Enter your last name"
                placeholderTextColor={Colors[theme].icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Pronouns *</ThemedText>
              <SingleSelectOptions
                options={PRONOUNS_OPTIONS}
                selected={surveyData.pronouns}
                onSelect={(value) => updateSurveyData('pronouns', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Age *</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.age}
                onChangeText={(text) => updateSurveyData('age', text)}
                placeholder="Enter your age"
                placeholderTextColor={Colors[theme].icon}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Height</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.height}
                onChangeText={(text) => updateSurveyData('height', text)}
                placeholder="e.g., 5'10&quot;, 175cm"
                placeholderTextColor={Colors[theme].icon}
              />
            </View>
          </View>
        );

      case 1: // Identity
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Tell us about your identity</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Gender *</ThemedText>
              <SingleSelectOptions
                options={GENDER_OPTIONS}
                selected={surveyData.gender}
                onSelect={(value) => updateSurveyData('gender', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Sexual Orientation *</ThemedText>
              <SingleSelectOptions
                options={SEXUALITY_OPTIONS}
                selected={surveyData.sexuality}
                onSelect={(value) => updateSurveyData('sexuality', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Interested In (select all that apply) *</ThemedText>
              <MultiSelectOptions
                options={INTERESTED_IN_OPTIONS}
                selected={surveyData.interestedIn}
                onToggle={(value) => toggleArrayItem('interestedIn', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Ethnicity</ThemedText>
              <SingleSelectOptions
                options={ETHNICITY_OPTIONS}
                selected={surveyData.ethnicity}
                onSelect={(value) => updateSurveyData('ethnicity', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Zodiac Sign</ThemedText>
              <SingleSelectOptions
                options={ZODIAC_OPTIONS}
                selected={surveyData.zodiac}
                onSelect={(value) => updateSurveyData('zodiac', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Fursona/Spirit Animal</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.fursona}
                onChangeText={(text) => updateSurveyData('fursona', text)}
                placeholder="e.g., Wolf, Fox, Dragon"
                placeholderTextColor={Colors[theme].icon}
              />
            </View>
          </View>
        );

      case 2: // Professional
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Professional background</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Current Work/Company</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.work}
                onChangeText={(text) => updateSurveyData('work', text)}
                placeholder="Where do you work?"
                placeholderTextColor={Colors[theme].icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Job Title</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.jobTitle}
                onChangeText={(text) => updateSurveyData('jobTitle', text)}
                placeholder="What's your job title?"
                placeholderTextColor={Colors[theme].icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>School/University</ThemedText>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: Colors[theme].background,
                  borderColor: Colors[theme].icon + '40',
                  color: Colors[theme].text
                }]}
                value={surveyData.school}
                onChangeText={(text) => updateSurveyData('school', text)}
                placeholder="Where did you study?"
                placeholderTextColor={Colors[theme].icon}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Education Level</ThemedText>
              <SingleSelectOptions
                options={EDUCATION_OPTIONS}
                selected={surveyData.education}
                onSelect={(value) => updateSurveyData('education', value)}
              />
            </View>
          </View>
        );

      case 3: // Beliefs
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>Personal beliefs (optional)</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Religious Beliefs</ThemedText>
              <SingleSelectOptions
                options={RELIGION_OPTIONS}
                selected={surveyData.religion}
                onSelect={(value) => updateSurveyData('religion', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Political Views</ThemedText>
              <SingleSelectOptions
                options={POLITICS_OPTIONS}
                selected={surveyData.politics}
                onSelect={(value) => updateSurveyData('politics', value)}
              />
            </View>
          </View>
        );

      case 4: // Dating Goals
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>What are you looking for?</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Dating Intentions *</ThemedText>
              <SingleSelectOptions
                options={DATING_INTENTIONS}
                selected={surveyData.datingIntentions}
                onSelect={(value) => updateSurveyData('datingIntentions', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={styles.label}>Relationship Type *</ThemedText>
              <SingleSelectOptions
                options={RELATIONSHIP_TYPES}
                selected={surveyData.relationshipType}
                onSelect={(value) => updateSurveyData('relationshipType', value)}
              />
            </View>
          </View>
        );

      case 5: // Interests
        return (
          <View style={styles.stepContainer}>
            <ThemedText style={styles.stepTitle}>What are your interests?</ThemedText>
            <ThemedText style={styles.subtitle}>Select up to 10 interests that represent you</ThemedText>
            
            <View style={styles.inputGroup}>
              <MultiSelectOptions
                options={INTEREST_OPTIONS}
                selected={surveyData.interests}
                onToggle={(value) => toggleArrayItem('interests', value)}
                maxSelections={10}
              />
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return surveyData.firstName && surveyData.lastName && surveyData.pronouns && surveyData.age;
      case 1:
        return surveyData.gender && surveyData.sexuality && surveyData.interestedIn.length > 0;
      case 2:
        return true; // Professional info is optional
      case 3:
        return true; // Beliefs are optional
      case 4:
        return surveyData.datingIntentions && surveyData.relationshipType;
      case 5:
        return surveyData.interests.length > 0;
      default:
        return false;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText style={{ fontSize: 18, marginBottom: 16 }}>Loading your profile...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[theme].background }}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress Header */}
        <View style={[styles.header, { borderBottomColor: Colors[theme].icon + '20' }]}>
          <View style={styles.headerTop}>
            <Pressable 
              style={styles.closeButton}
              onPress={() => {
                Alert.alert(
                  'Cancel Profile Update',
                  'Are you sure you want to cancel? Your changes will not be saved.',
                  [
                    { text: 'Continue Editing', style: 'cancel' },
                    { text: 'Cancel', style: 'destructive', onPress: () => router.back() }
                  ]
                );
              }}
            >
              <IconSymbol name="xmark" size={24} color={Colors[theme].icon} />
            </Pressable>
            <ThemedText style={styles.headerTitle}>Complete Your Profile</ThemedText>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: Colors[theme].icon + '20' }]}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    backgroundColor: Colors[theme].tint,
                    width: `${((currentStep + 1) / SURVEY_STEPS.length) * 100}%`
                  }
                ]}
              />
            </View>
            <ThemedText style={styles.progressText}>
              {currentStep + 1} of {SURVEY_STEPS.length}: {SURVEY_STEPS[currentStep]}
            </ThemedText>
          </View>
        </View>

        {/* Survey Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={[styles.footer, { borderTopColor: Colors[theme].icon + '20' }]}>
          <View style={styles.buttonRow}>
            {currentStep > 0 && (
              <Pressable
                style={[styles.button, styles.backButton, { borderColor: Colors[theme].icon }]}
                onPress={prevStep}
              >
                <IconSymbol name="chevron.left" size={20} color={Colors[theme].icon} />
                <Text style={[styles.buttonText, { color: Colors[theme].icon }]}>Back</Text>
              </Pressable>
            )}
            
            <Pressable
              style={[
                styles.button,
                styles.nextButton,
                { backgroundColor: isStepValid() ? Colors[theme].tint : Colors[theme].icon + '40' }
              ]}
              onPress={currentStep === SURVEY_STEPS.length - 1 ? completeSurvey : nextStep}
              disabled={!isStepValid()}
            >
              <Text style={[styles.buttonText, { color: Colors[theme].background }]}>
                {currentStep === SURVEY_STEPS.length - 1 ? 'Complete' : 'Next'}
              </Text>
              {currentStep < SURVEY_STEPS.length - 1 && (
                <IconSymbol name="chevron.right" size={20} color={Colors[theme].background} />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 14,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
    gap: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: -16,
  },
  inputGroup: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  backButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  nextButton: {
    flex: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});