import { Center, Spinner } from '@chakra-ui/react';

// Full-screen spinner, shown while the app checks who is logged in
export default function Loader() {
    return (
        <Center minH="100vh">
            <Spinner size="lg" color="brand.solid" />
        </Center>
    );
}
