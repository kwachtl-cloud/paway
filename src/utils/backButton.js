import { App } from '@capacitor/app';

/**
 * Initialize Android back button handler
 * This should be called once in your App component
 */
export const initializeBackButtonHandler = (goBackFunction) => {
  // Register back button listener
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      // If there's navigation history, use the app's goBack
      goBackFunction();
    } else {
      // If at root, minimize app instead of closing
      App.minimizeApp();
    }
  });
};

/**
 * Remove back button listeners (call on unmount)
 */
export const removeBackButtonHandler = () => {
  App.removeAllListeners();
};
