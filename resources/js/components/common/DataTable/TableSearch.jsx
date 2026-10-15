import { useEffect, useState } from 'react';
import { Box, IconButton, Input } from '@chakra-ui/react';
import { LuSearch, LuX } from 'react-icons/lu';
import useDebounce from '@/hooks/useDebounce';

// Search box. Waits 400 ms after typing stops before searching.
export default function TableSearch({ value, placeholder, onChange }) {
    const [text, setText] = useState(value);
    const debouncedText = useDebounce(text, 400);

    // Send the search to the URL when the user stops typing
    useEffect(() => {
        if (debouncedText !== value) {
            onChange(debouncedText);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedText]);

    // If the URL changes (back button, reset), show the new value
    useEffect(() => {
        setText(value);
    }, [value]);

    return (
        <Box position="relative" w={{ base: 'full', sm: '64' }}>
            <Box position="absolute" left="3" top="50%" transform="translateY(-50%)" color="app.muted" zIndex="1">
                <LuSearch />
            </Box>
            <Input
                size="sm"
                ps="9"
                pe="8"
                value={text}
                placeholder={placeholder}
                onChange={(event) => setText(event.target.value)}
            />
            {text && (
                <IconButton
                    size="2xs"
                    variant="ghost"
                    aria-label="Clear search"
                    position="absolute"
                    right="1"
                    top="50%"
                    transform="translateY(-50%)"
                    onClick={() => setText('')}
                >
                    <LuX />
                </IconButton>
            )}
        </Box>
    );
}
