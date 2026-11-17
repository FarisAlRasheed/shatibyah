/** True in the build that ships inside the iOS and Android apps (`npm run build:app`). */
export const NATIVE = import.meta.env.MODE === 'app'

// Lets the styles tell the app from the web page (styles.css, «In the app»).
if (NATIVE) document.documentElement.classList.add('native')
