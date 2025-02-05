global.self = global;
const anvaad = require('anvaad-js');

// Import the IPA module directly
const ipaModule = require('./node_modules/anvaad-js/src/translit_modules/ipa.js');

// Debug the IPA module
console.log('IPA Module structure:', ipaModule);
console.log('IPA Module type:', typeof ipaModule);

// Test text
const text = 'ਸਤਿਗੁਰੂ';

// Convert to ASCII first
console.log('\nConverting to ASCII:');
const asciiText = anvaad.unicode(text, true);  // true means convert TO ASCII
console.log('Original:', text);
console.log('ASCII:', asciiText);

// Test IPA conversion
console.log('\nTesting IPA conversion:');
console.log('IPA result:', ipaModule(asciiText));

// Test single character
const singleChar = 'ਸ';
const asciiChar = anvaad.unicode(singleChar, true);
console.log('\nTesting single character:');
console.log('Original:', singleChar);
console.log('ASCII:', asciiChar);
console.log('IPA:', ipaModule(asciiChar));

// Test through anvaad-js
console.log('\nTesting through anvaad-js:');
console.log('All translits:', JSON.stringify(anvaad.translit(text, 'all'), null, 2)); 