// Add this to browser console to force token refresh
console.log('🔄 Force refreshing Firebase Auth token...');

if (firebase.auth().currentUser) {
  firebase.auth().currentUser.getIdToken(true)
    .then(token => {
      console.log('✅ Token refreshed successfully');
      return firebase.auth().currentUser.getIdTokenResult();
    })
    .then(result => {
      console.log('🔐 Current Claims:', result.claims);
      if (result.claims.role === 'admin') {
        console.log('✅ Admin role confirmed! Reloading page...');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        console.log('❌ Admin role not found in claims');
      }
    })
    .catch(error => {
      console.error('❌ Error refreshing token:', error);
    });
} else {
  console.log('❌ No user logged in');
}
