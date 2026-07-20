import { App } from '@capacitor/app';

/**
 * Initialize Android back button handler
 * This should be called once in your App component
 */
export const initializeBackButtonHandler = (goBackFunction) => {
  try {
    // Register back button listener (only works on native platforms)
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        // If there's navigation history, use the app's goBack
        goBackFunction();
      } else {
        // If at root, minimize app instead of closing
        App.minimizeApp();
      }
    });
  } catch (error) {
    // Not on a native platform or Capacitor not available
    console.log('Back button handler not available (web or Capacitor not loaded)');
  }
};

/**
 * Remove back button listeners (call on unmount)
 */
export const removeBackButtonHandler = () => {
  try {
    App.removeAllListeners();
  } catch (error) {
    console.log('Could not remove back button listeners');
  }
};
