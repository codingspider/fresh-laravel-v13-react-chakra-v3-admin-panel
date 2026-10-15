import { useEffect, useState } from 'react';
import { Box, Button, Flex, HStack, IconButton, Stack, Text } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LuChevronDown, LuLogOut, LuMenu, LuUser, LuX } from 'react-icons/lu';
import { ColorModeButton } from '@/components/ui/color-mode';
import menu from '@/config/menu';
import usePermission from '@/hooks/usePermission';
import authApi from '@/modules/auth/api/authApi';
import { clearUser } from '@/modules/auth/store/authSlice';
import { getErrorMessage } from '@/utils/errors';
import { toast } from '@/utils/toast';

const SIDEBAR_WIDTH = '240px';

// One link in the sidebar (orange when it is the current page)
function MenuLink({ item, nested = false }) {
    const Icon = item.icon;

    return (
        <NavLink to={item.path}>
            {({ isActive }) => (
                <HStack
                    px="3"
                    py="2"
                    ps={nested ? '9' : '3'}
                    rounded="md"
                    fontWeight="medium"
                    fontSize="sm"
                    bg={isActive ? 'brand.subtle' : 'transparent'}
                    color={isActive ? 'brand.fg' : 'app.text'}
                    _hover={{ bg: 'brand.subtle' }}
                >
                    <Icon />
                    <Text>{item.label}</Text>
                </HStack>
            )}
        </NavLink>
    );
}

// A group with child links, e.g. "User Management" -> Users, Roles & Permissions.
// It opens by itself when one of its pages is the current page.
function MenuGroup({ group, items }) {
    const location = useLocation();
    const hasActiveChild = items.some((item) => location.pathname.startsWith(item.path));
    const [open, setOpen] = useState(hasActiveChild);
    const Icon = group.icon;

    // Open the group when the user moves to one of its pages
    useEffect(() => {
        if (hasActiveChild) setOpen(true);
    }, [hasActiveChild]);

    return (
        <Box>
            <HStack
                as="button"
                type="button"
                w="full"
                px="3"
                py="2"
                rounded="md"
                fontWeight="medium"
                fontSize="sm"
                color={hasActiveChild ? 'brand.fg' : 'app.text'}
                _hover={{ bg: 'brand.subtle' }}
                aria-expanded={open}
                onClick={() => setOpen(!open)}
            >
                <Icon />
                <Text flex="1" textAlign="start">
                    {group.label}
                </Text>
                <Box transform={open ? 'rotate(180deg)' : 'none'} transition="transform 0.2s">
                    <LuChevronDown />
                </Box>
            </HStack>

            {open && (
                <Stack gap="1" mt="1">
                    {items.map((item) => (
                        <MenuLink key={item.path} item={item} nested />
                    ))}
                </Stack>
            )}
        </Box>
    );
}

// Sidebar links and groups, filtered by permission
function SidebarMenu() {
    const { can } = usePermission();

    return (
        <Stack gap="1" px="3">
            {menu.map((entry) => {
                // A group: show only the children the user may see; hide the group if none
                if (entry.children) {
                    const items = entry.children.filter((child) => can(child.permission));
                    if (items.length === 0) return null;

                    return <MenuGroup key={entry.label} group={entry} items={items} />;
                }

                // A plain link
                if (!can(entry.permission)) return null;

                return <MenuLink key={entry.path} item={entry} />;
            })}
        </Stack>
    );
}

// The sidebar box. On mobile it also shows a close (X) button.
function Sidebar({ onClose }) {
    return (
        <Box
            w={SIDEBAR_WIDTH}
            h="100vh"
            bg="app.sidebar"
            borderRightWidth="1px"
            borderColor="app.border"
            py="5"
            overflowY="auto"
        >
            <Flex px="6" mb="6" align="center" justify="space-between">
                <Text fontSize="xl" fontWeight="bold" color="brand.fg">
                    Amar Team
                </Text>

                {onClose && (
                    <IconButton
                        variant="ghost"
                        size="sm"
                        aria-label="Close menu"
                        onClick={onClose}
                    >
                        <LuX />
                    </IconButton>
                )}
            </Flex>

            <SidebarMenu />
        </Box>
    );
}

// Main layout for logged-in pages: sidebar on the left, header on top
export default function AppLayout() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useSelector((state) => state.auth.user);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const openMobileMenu = () => setMobileMenuOpen(true);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    // Close the mobile menu after moving to another page
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Close the mobile menu with the Esc key
    useEffect(() => {
        if (!mobileMenuOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setMobileMenuOpen(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [mobileMenuOpen]);

    const handleLogout = async () => {
        try {
            const response = await authApi.logout();
            toast.success(response.data.message);
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            dispatch(clearUser());
            navigate('/login');
        }
    };

    return (
        <Flex minH="100vh">
            {/* Desktop sidebar — always visible on medium screens and up */}
            <Box
                display={{ base: 'none', md: 'block' }}
                position="fixed"
                insetY="0"
                left="0"
            >
                <Sidebar />
            </Box>

            {/* Mobile sidebar — slides over the page, with a dark background behind it */}
            <Box
                display={{ base: 'block', md: 'none' }}
                position="fixed"
                inset="0"
                zIndex="overlay"
                pointerEvents={mobileMenuOpen ? 'auto' : 'none'}
            >
                {/* Dark background — click it to close */}
                <Box
                    position="absolute"
                    inset="0"
                    bg="blackAlpha.600"
                    opacity={mobileMenuOpen ? 1 : 0}
                    transition="opacity 0.2s"
                    onClick={closeMobileMenu}
                />

                {/* The sidebar itself */}
                <Box
                    position="absolute"
                    insetY="0"
                    left="0"
                    transform={mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'}
                    transition="transform 0.2s"
                    shadow="lg"
                >
                    <Sidebar onClose={closeMobileMenu} />
                </Box>
            </Box>

            <Box flex="1" minW="0" ml={{ base: 0, md: SIDEBAR_WIDTH }}>
                {/* Header */}
                <Flex
                    as="header"
                    h="14"
                    px={{ base: '3', md: '6' }}
                    align="center"
                    justify="space-between"
                    gap="2"
                    bg="app.card"
                    borderBottomWidth="1px"
                    borderColor="app.border"
                    position="sticky"
                    top="0"
                    zIndex="docked"
                >
                    {/* Menu button + app name — only on small screens */}
                    <HStack gap="2" display={{ base: 'flex', md: 'none' }}>
                        <IconButton
                            variant="outline"
                            size="sm"
                            aria-label="Open menu"
                            onClick={openMobileMenu}
                        >
                            <LuMenu />
                        </IconButton>
                        <Text fontWeight="bold" color="brand.fg">
                            Amar Team
                        </Text>
                    </HStack>

                    <HStack gap="1" ml="auto">
                        <ColorModeButton />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/profile')}
                        >
                            <LuUser />
                            {/* Hide the name on very small screens to save space */}
                            <Text as="span" display={{ base: 'none', sm: 'inline' }}>
                                {user?.name}
                            </Text>
                        </Button>
                        <IconButton
                            variant="ghost"
                            size="sm"
                            aria-label="Log out"
                            onClick={handleLogout}
                        >
                            <LuLogOut />
                        </IconButton>
                    </HStack>
                </Flex>

                {/* Page content */}
                <Box as="main" p={{ base: '4', md: '6' }}>
                    <Outlet />
                </Box>
            </Box>
        </Flex>
    );
}
