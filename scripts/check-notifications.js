require('dotenv').config();
const { NotificationLog, Submission, initializeDatabase } = require('../lib/sequelize');

async function checkNotifications() {
  try {
    await initializeDatabase();
    
    console.log('🔍 Checking notification logs...\n');
    
    const notifications = await NotificationLog.findAll({
      include: [{
        model: Submission,
        attributes: ['nama', 'tracking_code', 'email', 'no_wa']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`📊 Total notifications: ${notifications.length}\n`);
    
    if (notifications.length === 0) {
      console.log('❌ No notifications found in database');
      return;
    }
    
    console.log('📋 Recent notifications:');
    notifications.forEach((notification, index) => {
      console.log(`${index + 1}. ID: ${notification.id}`);
      console.log(`   Submission: ${notification.Submission?.nama} (${notification.Submission?.tracking_code})`);
      console.log(`   Channel: ${notification.channel}`);
      console.log(`   Status: ${notification.send_status}`);
      console.log(`   Sent to: ${notification.payload?.to}`);
      console.log(`   Created: ${notification.createdAt.toLocaleString()}`);
      
      if (notification.payload?.result) {
        console.log(`   Result: ${JSON.stringify(notification.payload.result, null, 2)}`);
      }
      console.log('');
    });
    
    // Summary by channel
    const whatsappCount = notifications.filter(n => n.channel === 'WHATSAPP').length;
    const emailCount = notifications.filter(n => n.channel === 'EMAIL').length;
    const whatsappSuccess = notifications.filter(n => n.channel === 'WHATSAPP' && n.send_status === 'SUCCESS').length;
    const emailSuccess = notifications.filter(n => n.channel === 'EMAIL' && n.send_status === 'SUCCESS').length;
    
    console.log('📊 Summary:');
    console.log(`   WhatsApp: ${whatsappSuccess}/${whatsappCount} successful`);
    console.log(`   Email: ${emailSuccess}/${emailCount} successful`);
    
  } catch (error) {
    console.error('❌ Error checking notifications:', error);
  }
}

checkNotifications();
