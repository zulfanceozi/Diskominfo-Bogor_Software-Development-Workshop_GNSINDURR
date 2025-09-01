require('dotenv').config();
const { Submission, initializeDatabase } = require('../lib/sequelize');

async function checkSubmissions() {
  try {
    await initializeDatabase();
    
    console.log('🔍 Checking submissions in database...\n');
    
    const submissions = await Submission.findAll({
      attributes: ['id', 'nama', 'email', 'no_wa', 'tracking_code', 'status', 'jenis_layanan']
    });
    
    console.log(`📊 Total submissions: ${submissions.length}\n`);
    
    if (submissions.length === 0) {
      console.log('❌ No submissions found in database');
      return;
    }
    
    console.log('📋 Submissions with email addresses:');
    const submissionsWithEmail = submissions.filter(s => s.email);
    console.log(`✅ ${submissionsWithEmail.length} submissions have email addresses\n`);
    
    submissionsWithEmail.forEach((submission, index) => {
      console.log(`${index + 1}. ID: ${submission.id}`);
      console.log(`   Nama: ${submission.nama}`);
      console.log(`   Email: ${submission.email}`);
      console.log(`   WhatsApp: ${submission.no_wa}`);
      console.log(`   Tracking Code: ${submission.tracking_code}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Layanan: ${submission.jenis_layanan}`);
      console.log('');
    });
    
    console.log('📋 Submissions WITHOUT email addresses:');
    const submissionsWithoutEmail = submissions.filter(s => !s.email);
    console.log(`❌ ${submissionsWithoutEmail.length} submissions don't have email addresses\n`);
    
    submissionsWithoutEmail.forEach((submission, index) => {
      console.log(`${index + 1}. ID: ${submission.id}`);
      console.log(`   Nama: ${submission.nama}`);
      console.log(`   Email: ${submission.email || 'NOT SET'}`);
      console.log(`   WhatsApp: ${submission.no_wa}`);
      console.log(`   Tracking Code: ${submission.tracking_code}`);
      console.log(`   Status: ${submission.status}`);
      console.log(`   Layanan: ${submission.jenis_layanan}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error checking submissions:', error);
  }
}

checkSubmissions();
