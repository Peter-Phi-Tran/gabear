import { supabase } from '@/lib/supabase';

// Test profiles to add to the database
const testProfiles = [
  {
    first_name: 'Alex',
    last_name: 'Wolf',
    display_name: 'Alex',
    age: 25,
    bio: 'Love hiking and coffee dates 🐺',
    gender: 'Male',
    sexuality: 'Straight',
    interested_in: ['Female'],
    fursona: 'Wolf',
    dating_intentions: 'Long-term relationship',
    relationship_type: 'Monogamous',
    interests: ['Gaming', 'Art', 'Nature'],
    is_active: true,
    profile_completed: true,
    pronouns: 'He/Him'
  },
  {
    first_name: 'Luna',
    last_name: 'Fox',
    display_name: 'Luna',
    age: 23,
    bio: 'Artist and gamer 🦊 Looking for my player 2!',
    gender: 'Female', 
    sexuality: 'Straight',
    interested_in: ['Male'],
    fursona: 'Fox',
    dating_intentions: 'Dating and friendship',
    relationship_type: 'Open to both',
    interests: ['Art', 'Gaming', 'Anime'],
    is_active: true,
    profile_completed: true,
    pronouns: 'She/Her'
  },
  {
    first_name: 'Riley',
    last_name: 'Cat',
    display_name: 'Riley',
    age: 27,
    bio: 'Chill cat who loves music and good vibes 🐱',
    gender: 'Non-binary',
    sexuality: 'Pansexual', 
    interested_in: ['Any'],
    fursona: 'Cat',
    dating_intentions: 'Casual dating',
    relationship_type: 'Open',
    interests: ['Music', 'Reading', 'Travel'],
    is_active: true,
    profile_completed: true,
    pronouns: 'They/Them'
  },
  {
    first_name: 'Max',
    last_name: 'Bear',
    display_name: 'Max',
    age: 29,
    bio: 'Big cuddly bear looking for someone special 🐻',
    gender: 'Male',
    sexuality: 'Gay',
    interested_in: ['Male'],
    fursona: 'Bear',
    dating_intentions: 'Long-term relationship',
    relationship_type: 'Monogamous',
    interests: ['Cooking', 'Movies', 'Outdoors'],
    is_active: true,
    profile_completed: true,
    pronouns: 'He/Him'
  },
  {
    first_name: 'Sage',
    last_name: 'Dragon',
    display_name: 'Sage',
    age: 26,
    bio: 'Wise dragon with a love for fantasy and adventure 🐉',
    gender: 'Female',
    sexuality: 'Bisexual',
    interested_in: ['Male', 'Female'],
    fursona: 'Dragon',
    dating_intentions: 'Long-term relationship',
    relationship_type: 'Monogamous',
    interests: ['Fantasy', 'D&D', 'Writing'],
    is_active: true,
    profile_completed: true,
    pronouns: 'She/Her'
  }
];

export async function createTestProfiles() {
  try {
    console.log('Creating test profiles...');
    
    // First, check if we already have profiles
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('id, first_name')
      .limit(5);
    
    console.log('Existing profiles:', existingProfiles?.length || 0);
    
    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Profiles already exist, updating them to be active...');
      
      // Update existing profiles to be active
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_active: true })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all real profiles
      
      if (updateError) {
        console.error('Error updating existing profiles:', updateError);
      } else {
        console.log('Updated existing profiles to be active');
      }
      
      return;
    }
    
    // Create new test profiles
    for (const profile of testProfiles) {
      // Create a fake auth user ID for each profile
      const fakeUserId = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const profileData = {
        id: fakeUserId,
        ...profile
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();
      
      if (error) {
        console.error('Error creating profile:', error);
      } else {
        console.log('Created profile:', data?.[0]?.first_name);
      }
    }
    
    console.log('Test profiles creation completed');
    
  } catch (error) {
    console.error('Error in createTestProfiles:', error);
  }
}

// Function to check current database state
export async function checkDatabaseState() {
  try {
    console.log('Checking database state...');
    
    // Check total profiles
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('id, first_name, is_active, profile_completed');
    
    console.log('Total profiles in database:', allProfiles?.length || 0);
    console.log('All profiles:', allProfiles);
    
    // Check active profiles
    const { data: activeProfiles, error: activeError } = await supabase
      .from('profiles')
      .select('id, first_name, is_active')
      .eq('is_active', true);
    
    console.log('Active profiles:', activeProfiles?.length || 0);
    console.log('Active profiles data:', activeProfiles);
    
    // Check current user
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Current user:', user?.id || 'No user logged in');
    
    if (user) {
      // Check profiles excluding current user
      const { data: otherProfiles, error: otherError } = await supabase
        .from('profiles')
        .select('id, first_name, is_active')
        .neq('id', user.id)
        .eq('is_active', true);
      
      console.log('Other active profiles (excluding current user):', otherProfiles?.length || 0);
      console.log('Other profiles data:', otherProfiles);
    }
    
  } catch (error) {
    console.error('Error checking database state:', error);
  }
}