import firebase from '@react-native-firebase/app';
import messaging from '@react-native-firebase/messaging';

let firebaseInitialized = false;

/**
 * Khởi tạo Firebase một cách rõ ràng để tránh lỗi "[runtime not ready]"
 * Lỗi này thường xảy ra khi Firebase chưa được khởi tạo đúng cách trước khi sử dụng
 */
export const initializeFirebase = async () => {
  if (firebaseInitialized) {
    return true;
  }
  try {
    console.log('Khởi tạo Firebase...');
    // Dựa vào cấu hình native: GoogleService-Info.plist (iOS) và google-services.json (Android)
    if (!firebase.apps.length) {
      await firebase.initializeApp();
    }
    
    firebaseInitialized = true;
    return true;
  } catch (error) {
    console.error('Lỗi khởi tạo Firebase:', error);
    return false;
  }
};

/**
 * Kiểm tra trạng thái khởi tạo Firebase
 */
export const isFirebaseInitialized = () => {
  return firebaseInitialized;
};