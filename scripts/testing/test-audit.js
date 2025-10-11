// Test script để tạo audit logs mẫu
const admin = require('firebase-admin');

// Initialize Firebase Admin (sử dụng service account key nếu cần)
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: 'https://vietexplore-ai-default-rtdb.firebaseio.com'
  });
}

const db = admin.database();

async function createSampleAuditLogs() {
  console.log('Creating sample audit logs...');

  const sampleLogs = [
    {
      timestamp: Date.now(),
      action: 'approve',
      actor: {
        id: 'admin_001',
        name: 'Admin Test',
        role: 'admin',
        email: 'admin@test.com'
      },
      target: {
        type: 'place',
        id: 'place_001',
        name: 'Vịnh Hạ Long Test'
      },
      changes: [
        {
          field: 'status',
          before: 'in_review',
          after: 'published'
        }
      ],
      metadata: {
        reason: 'Test audit log creation',
        ip: '127.0.0.1'
      },
      severity: 'medium'
    },
    {
      timestamp: Date.now() - 60000,
      action: 'create',
      actor: {
        id: 'admin_002',
        name: 'Admin Test 2',
        role: 'admin',
        email: 'admin2@test.com'
      },
      target: {
        type: 'system',
        id: 'test_system',
        name: 'Test System Action'
      },
      metadata: {
        reason: 'System initialization test',
        ip: '192.168.1.1'
      },
      severity: 'low'
    }
  ];

  try {
    for (const log of sampleLogs) {
      const newLogRef = db.ref('audit_logs').push();
      await newLogRef.set({
        ...log,
        id: newLogRef.key
      });
      console.log('Created audit log:', newLogRef.key);
    }
    console.log('Sample audit logs created successfully!');
  } catch (error) {
    console.error('Error creating sample audit logs:', error);
  }
}

// Run the test
createSampleAuditLogs()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });