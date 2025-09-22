// Test script to check database connectivity and profile data
import { supabase } from './lib/supabase';

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth user:', user?.id || 'No user');
    console.log('Auth error:', authError);
    
    // Test profiles table access
    console.log('\nTesting profiles table...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, is_active')
      .limit(10);
    
    console.log('Profiles error:', profilesError);
    console.log('Profiles found:', profiles?.length || 0);
    console.log('Profiles data:', profiles);
    
    // Test active profiles
    if (user) {
      console.log('\nTesting active profiles query...');
      const { data: activeProfiles, error: activeError } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)
        .eq('is_active', true)
        .limit(5);
      
      console.log('Active profiles error:', activeError);
      console.log('Active profiles found:', activeProfiles?.length || 0);
      console.log('Active profiles data:', activeProfiles);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testDatabase();