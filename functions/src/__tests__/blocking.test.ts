// functions/src/__tests__/blocking.test.ts
import * as functionsTest from 'firebase-functions-test';

const test = functionsTest.default({
  projectId: 'demo-test-project',
});

describe('Blocking Functions', () => {
  afterAll(() => {
    test.cleanup();
  });

  describe('beforeCreate', () => {
    it('should block registration from banned domains', async () => {
      const { beforeCreate } = require('../auth/beforeCreate');
      
      const mockEvent = {
        data: {
          email: 'test@mailinator.com',
          ipAddress: '192.168.1.1'
        }
      };

      await expect(beforeCreate(mockEvent)).rejects.toThrow('Domain email này không được phép đăng ký');
    });

    it('should allow registration from valid domains', async () => {
      const { beforeCreate } = require('../auth/beforeCreate');
      
      const mockEvent = {
        data: {
          email: 'test@gmail.com',
          ipAddress: '192.168.1.1'
        }
      };

      // Should not throw any error
      await expect(beforeCreate(mockEvent)).resolves.not.toThrow();
    });

    it('should block invalid email format', async () => {
      const { beforeCreate } = require('../auth/beforeCreate');
      
      const mockEvent = {
        data: {
          email: 'invalid-email',
          ipAddress: '192.168.1.1'
        }
      };

      await expect(beforeCreate(mockEvent)).rejects.toThrow('Định dạng email không hợp lệ');
    });
  });

  describe('beforeSignIn', () => {
    it('should block disabled users', async () => {
      // Mock Firestore to return disabled user
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ disabled: true })
      });
      
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
      const mockFirestore = jest.fn().mockReturnValue({ doc: mockDoc });
      
      jest.doMock('firebase-admin', () => ({
        firestore: mockFirestore
      }));

      const { beforeSignIn } = require('../auth/beforeSignIn');
      
      const mockEvent = {
        data: {
          uid: 'disabled-user-uid',
          email: 'disabled@example.com',
          emailVerified: true
        }
      };

      await expect(beforeSignIn(mockEvent)).rejects.toThrow('Tài khoản đã bị vô hiệu hóa');
    });

    it('should allow sign-in for active users', async () => {
      // Mock Firestore to return active user
      const mockGet = jest.fn().mockResolvedValue({
        exists: true,
        data: () => ({ disabled: false })
      });
      
      const mockDoc = jest.fn().mockReturnValue({ get: mockGet });
      const mockFirestore = jest.fn().mockReturnValue({ doc: mockDoc });
      
      jest.doMock('firebase-admin', () => ({
        firestore: mockFirestore
      }));

      const { beforeSignIn } = require('../auth/beforeSignIn');
      
      const mockEvent = {
        data: {
          uid: 'active-user-uid',
          email: 'active@example.com',
          emailVerified: true
        }
      };

      // Should not throw any error
      await expect(beforeSignIn(mockEvent)).resolves.not.toThrow();
    });
  });
});
