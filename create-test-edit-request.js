// Script to create test edit request in database directly
const admin = require('firebase-admin');

// Initialize Firebase Admin (mock for testing)
const serviceAccount = {
  type: "service_account",
  project_id: "viet-explore-ai",
  private_key_id: "dummy",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5K8Qj...\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-xxx@viet-explore-ai.iam.gserviceaccount.com",
  client_id: "dummy",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs"
};

// Create test data for moderation queue
async function createTestEditRequest() {
  console.log('Creating test edit request data...');
  
  // This creates a test moderation queue entry that looks like an edit request
  const testQueueItem = {
    id: 'test-edit-123',
    itemType: 'place_edit',
    itemId: 'original-place-456',
    status: 'pending',
    submittedBy: 'test-user-789',
    submittedAt: new Date().toISOString(),
    priority: 'medium',
    queueType: 'contributor_queue',
    
    // Original data (what was published)
    originalData: {
      name: 'Phong Nha Cave - Original',
      shortDescription: 'A beautiful cave in Quang Binh province',
      description: 'Phong Nha Cave is a cave in Phong Nha-Kẻ Bàng National Park...',
      type: 'bien',
      region: 'trung-bo',
      province: 'Quang Binh',
      address: 'Phong Nha, Bo Trach, Quang Binh',
      coordinates: { lat: 17.5827, lng: 106.2651 }
    },
    
    // Edited data (what user wants to change to)
    editedData: {
      name: 'Phong Nha Cave - Updated Name',
      shortDescription: 'An amazing limestone cave in Quang Binh province - updated description',
      description: 'Phong Nha Cave is a spectacular cave in Phong Nha-Kẻ Bàng National Park with updated details...',
      type: 'nui',  // Changed from 'bien' to 'nui'
      region: 'trung-bo',
      province: 'Quang Binh',
      address: 'Phong Nha, Bo Trach, Quang Binh',
      coordinates: { lat: 17.5827, lng: 106.2651 }
    },
    
    metadata: {
      editDraftId: 'draft-edit-789',
      reason: 'User requested edit to improve accuracy'
    },
    
    submitter: {
      id: 'test-user-789',
      fullName: 'Test User',
      email: 'testuser@example.com',
      role: 'contributor'
    }
  };
  
  console.log('Test edit request created:');
  console.log('- Item Type:', testQueueItem.itemType);
  console.log('- Original Name:', testQueueItem.originalData.name);
  console.log('- New Name:', testQueueItem.editedData.name);
  console.log('- Type Change:', testQueueItem.originalData.type, '→', testQueueItem.editedData.type);
  
  // Save this as a JSON file that can be imported
  const fs = require('fs');
  fs.writeFileSync('test-edit-request.json', JSON.stringify(testQueueItem, null, 2));
  console.log('\nTest data saved to test-edit-request.json');
  
  // Instructions for manual testing
  console.log('\n📋 Manual Testing Instructions:');
  console.log('1. Copy the test data from test-edit-request.json');
  console.log('2. Manually add it to Firebase moderation_queue collection');
  console.log('3. Or use Firebase Admin panel to create the document');
  console.log('4. Visit http://localhost:9002/admin/moderation to see the edit request');
  console.log('5. Click "Xem xét" to see the comparison view');
  
  return testQueueItem;
}

// Run the script
createTestEditRequest().catch(console.error);