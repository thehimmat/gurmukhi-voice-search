global.self = global;

const express = require('express');
const cors = require('cors');
const anvaad = require('anvaad-js');

// Import transliteration modules directly
const ipaModule = require('./node_modules/anvaad-js/src/translit_modules/ipa.js');
const devnagriModule = require('./node_modules/anvaad-js/src/translit_modules/devnagri.js');
const shahmukhiModule = require('./node_modules/anvaad-js/src/translit_modules/shahmukhi.js');
const englishModule = require('./node_modules/anvaad-js/src/translit_modules/english.js');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.post('/transliterate', (req, res) => {
    try {
        const { text, format } = req.body;
        console.log('Received request:', { text, format });
        
        if (!text) {
            throw new Error('No text provided');
        }

        let result;
        if (format === 'unicode') {
            // Convert ASCII to Unicode
            result = anvaad.unicode(text);
        } else {
            // Convert to ASCII first for other formats
            console.log('Converting to ASCII:', text);
            const asciiText = anvaad.unicode(text, true);
            console.log('ASCII text:', asciiText);

            if (!asciiText) {
                throw new Error('Failed to convert to ASCII');
            }

            switch (format) {
                case 'english':
                    result = englishModule(asciiText);
                    break;
                case 'ipa':
                    result = ipaModule(asciiText);
                    break;
                case 'devnagri':
                    result = devnagriModule(asciiText);
                    break;
                case 'shahmukhi':
                    result = shahmukhiModule(asciiText);
                    break;
                default:
                    throw new Error(`Unsupported format: ${format}`);
            }
        }

        console.log('Result:', result);

        if (!result) {
            throw new Error(`Failed to transliterate. Format: ${format}, Text: ${text}`);
        }

        res.json({ result });
    } catch (error) {
        console.error('Transliteration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Test the transliteration on startup
const testText = 'ਸਤਿਗੁਰੂ';
const testAscii = anvaad.unicode(testText, true);
console.log('\nTesting transliteration on startup:');
console.log('Original:', testText);
console.log('ASCII:', testAscii);
console.log('English:', englishModule(testAscii));
console.log('IPA:', ipaModule(testAscii));
console.log('Devnagri:', devnagriModule(testAscii));
console.log('Shahmukhi:', shahmukhiModule(testAscii));

app.listen(port, () => {
    console.log(`Transliteration service running on port ${port}`);
}); 