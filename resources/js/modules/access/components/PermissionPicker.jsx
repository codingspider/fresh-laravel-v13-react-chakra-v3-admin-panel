import { Box, Button, Checkbox, Flex, Heading, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';

/*
 * Pick permissions for a role.
 * Permissions are grouped (Users, Roles, ...) inside modules (Access, HR, ...).
 * Every group has "Select all" / "Unselect all" buttons, and there is one pair for everything.
 *
 * <PermissionPicker modules={modulesFromApi} value={['access.users.view']} onChange={(names) => ...} />
 */
export default function PermissionPicker({ modules, value = [], onChange }) {
    const selected = new Set(value);
    const allNames = modules.flatMap((module) =>
        module.groups.flatMap((group) => group.permissions.map((permission) => permission.name)),
    );

    // Tick (checked = true) or untick (checked = false) many permissions at once
    const setMany = (names, checked) => {
        const next = new Set(selected);
        names.forEach((name) => (checked ? next.add(name) : next.delete(name)));
        onChange([...next]);
    };

    if (allNames.length === 0) {
        return <Text color="app.muted">No permissions found. Run the module seeders first.</Text>;
    }

    return (
        <Stack gap="6">
            {/* Select / unselect everything */}
            <Flex justify="space-between" align="center" gap="3" wrap="wrap">
                <Text fontSize="sm" color="app.muted">
                    {selected.size} of {allNames.length} permissions selected
                </Text>
                <HStack gap="2">
                    <Button
                        size="xs"
                        variant="outline"
                        colorPalette="brand"
                        disabled={selected.size === allNames.length}
                        onClick={() => setMany(allNames, true)}
                    >
                        Select all
                    </Button>
                    <Button
                        size="xs"
                        variant="outline"
                        disabled={selected.size === 0}
                        onClick={() => setMany(allNames, false)}
                    >
                        Unselect all
                    </Button>
                </HStack>
            </Flex>

            {modules.map((module) => (
                <Box key={module.module}>
                    <Heading size="xs" mb="3" color="app.muted" textTransform="uppercase" letterSpacing="wider">
                        {module.label}
                    </Heading>

                    <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap="4">
                        {module.groups.map((group) => (
                            <PermissionGroup key={group.key} group={group} selected={selected} onSetMany={setMany} />
                        ))}
                    </SimpleGrid>
                </Box>
            ))}
        </Stack>
    );
}

// One group, e.g. "Users": View / Create / Edit / Delete + select / unselect all
function PermissionGroup({ group, selected, onSetMany }) {
    const names = group.permissions.map((permission) => permission.name);
    const selectedCount = names.filter((name) => selected.has(name)).length;
    const allSelected = selectedCount === names.length;

    return (
        <Box
            borderWidth="1px"
            borderColor={selectedCount > 0 ? 'brand.emphasized' : 'app.border'}
            rounded="md"
            overflow="hidden"
        >
            <Flex
                px="3"
                py="2"
                gap="2"
                align="center"
                justify="space-between"
                bg="app.bg"
                borderBottomWidth="1px"
                borderColor="app.border"
            >
                <Text fontWeight="semibold" fontSize="sm">
                    {group.label}{' '}
                    <Text as="span" color="app.muted" fontWeight="normal">
                        ({selectedCount}/{names.length})
                    </Text>
                </Text>

                <HStack gap="1">
                    <Button
                        size="2xs"
                        variant="ghost"
                        colorPalette="brand"
                        disabled={allSelected}
                        onClick={() => onSetMany(names, true)}
                    >
                        Select all
                    </Button>
                    <Button
                        size="2xs"
                        variant="ghost"
                        disabled={selectedCount === 0}
                        onClick={() => onSetMany(names, false)}
                    >
                        Unselect all
                    </Button>
                </HStack>
            </Flex>

            <SimpleGrid columns={2} gap="3" p="3">
                {group.permissions.map((permission) => (
                    <Checkbox.Root
                        key={permission.name}
                        size="sm"
                        colorPalette="brand"
                        checked={selected.has(permission.name)}
                        onCheckedChange={({ checked }) => onSetMany([permission.name], checked === true)}
                    >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>{permission.label}</Checkbox.Label>
                    </Checkbox.Root>
                ))}
            </SimpleGrid>
        </Box>
    );
}
