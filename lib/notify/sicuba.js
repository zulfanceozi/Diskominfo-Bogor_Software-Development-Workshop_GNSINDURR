/**
 * SiCuba WhatsApp API Service
 * Menggantikan Twilio untuk mengirim notifikasi WhatsApp
 */

/**
 * Send WhatsApp message using SiCuba API
 * @param {Object} params - Parameters for sending WhatsApp
 * @param {string} params.to - Recipient phone number (format: +628xxxxxxxxx or 628xxxxxxxxx)
 * @param {string} params.name - Recipient name
 * @param {string} params.campaign_id - SiCuba campaign ID
 * @param {Object} params.customFields - Additional custom fields
 * @returns {Promise<Object>} SiCuba API response
 */
async function sendWhatsApp({ to, name, campaign_id, customFields = {} }) {
  try {
    // Remove + from phone number for SiCuba API (SiCuba doesn't support + format)
    const cleanPhone = to.replace(/^\+/, '');
    
    console.log(`📱 Sending WhatsApp to: ${to} -> ${cleanPhone}`);
    
    const response = await fetch('https://app.sicuba.in/api/sendMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SICUBA_API_TOKEN}`,
      },
      body: JSON.stringify([
        {
          campaign_id: campaign_id,
          phone: cleanPhone,
          name: name,
          ...customFields
        }
      ])
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`SiCuba API error: ${response.status} - ${JSON.stringify(result)}`);
    }

    console.log(`SiCuba WhatsApp message sent successfully:`, result);
    
    return {
      success: true,
      messageId: result[0]?.customer_id || 'unknown',
      status: result[0]?.status || 'sent',
      response: result
    };
  } catch (error) {
    console.error("Error sending WhatsApp message via SiCuba:", error);
    return {
      success: false,
      error: error.message,
      response: null
    };
  }
}

/**
 * Send status update notification via WhatsApp using SiCuba
 * @param {Object} submission - Submission object
 * @param {string} newStatus - New status
 * @returns {Promise<Object>} Result of sending notification
 */
async function sendStatusUpdateNotification(submission, newStatus) {
  const statusText = getStatusText(newStatus);
  const trackingUrl = `${process.env.APP_BASE_URL}/public?tab=status&tracking_code=${submission.tracking_code}`;
  
  // Custom fields yang akan dikirim ke SiCuba
  const customFields = {
    tracking_code: submission.tracking_code,
    jenis_layanan: submission.jenis_layanan,
    status: statusText,
    tracking_url: trackingUrl
  };

  return await sendWhatsApp({
    to: submission.no_wa,
    name: submission.nama,
    campaign_id: process.env.SICUBA_CAMPAIGN_ID,
    customFields: customFields
  });
}

/**
 * Send initial submission notification via WhatsApp using SiCuba
 * @param {Object} submission - Submission object
 * @returns {Promise<Object>} Result of sending notification
 */
async function sendInitialSubmissionNotification(submission) {
  const trackingUrl = `${process.env.APP_BASE_URL}/public?tab=status&tracking_code=${submission.tracking_code}`;
  
  const customFields = {
    tracking_code: submission.tracking_code,
    jenis_layanan: submission.jenis_layanan,
    status: "Pengajuan Baru",
    tracking_url: trackingUrl
  };

  return await sendWhatsApp({
    to: submission.no_wa,
    name: submission.nama,
    campaign_id: process.env.SICUBA_CAMPAIGN_ID,
    customFields: customFields
  });
}

/**
 * Get human-readable status text
 * @param {string} status - Status code
 * @returns {string} Human-readable status
 */
function getStatusText(status) {
  switch (status) {
    case "PENGAJUAN_BARU":
      return "Pengajuan Baru";
    case "DIPROSES":
      return "Sedang Diproses";
    case "SELESAI":
      return "Selesai";
    case "DITOLAK":
      return "Ditolak";
    default:
      return status;
  }
}

module.exports = {
  sendWhatsApp,
  sendStatusUpdateNotification,
  sendInitialSubmissionNotification,
};
