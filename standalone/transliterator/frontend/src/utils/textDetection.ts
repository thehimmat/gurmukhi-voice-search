let legacySpecialChars: Set<string> | null = null;

export const initializeLegacyChars = async () => {
    try {
        const response = await fetch('/api/v1/legacy-characters', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const text = await response.text();
            console.error('API Response:', text);
            throw new Error(`Failed to fetch legacy characters: ${response.status}`);
        }
        
        const data = await response.json();
        legacySpecialChars = new Set(data.characters);
    } catch (error) {
        console.error('Error loading legacy characters:', error);
        legacySpecialChars = new Set();
    }
};

export const detectInputType = (text: string): 'unicode' | 'legacy' | 'unsupported' => {
    if (!legacySpecialChars) {
        console.warn('Legacy characters not initialized');
        // eslint-disable-next-line no-control-regex
        return /[^\u0000-\u007F]/.test(text) ? 'unsupported' : 'legacy';
    }

    // Check if text contains any Gurmukhi Unicode characters
    const gurmukhiUnicodeRegex = /[\u0A00-\u0A7F]/;
    
    // Check each character in the text
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        const isAscii = char.charCodeAt(0) <= 0x7F;
        const isGurmukhi = gurmukhiUnicodeRegex.test(char);
        const isLegacySpecial = legacySpecialChars.has(char);
        
        if (!isAscii && !isGurmukhi && !isLegacySpecial) {
            console.log(`Character '${char}' is not supported:`, {
                isAscii,
                isGurmukhi,
                isLegacySpecial,
                charCode: char.charCodeAt(0)
            });  // Debug log
            return 'unsupported';
        }
    }
    
    if (gurmukhiUnicodeRegex.test(text)) {
        return 'unicode';
    }
    
    return 'legacy';
}; 