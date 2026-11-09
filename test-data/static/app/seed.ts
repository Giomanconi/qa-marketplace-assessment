/**
 * Items the main (exploration) account's shop should always have, so there is
 * something to explore. Titles are fixed so the seed script can tell whether
 * an item already exists. All text is synthetic.
 */
export const SEED_PRODUCTS = [
    {
        title: 'Seed Item One',
        description: 'Fixed item for exploration, created by the seed script',
        categoryId: 'c1',
        price: 19.9,
        stock: 50,
        status: 'active',
        art: { icon: 'Keyboard', hue: 121 },
    },
    {
        title: 'Seed Item Two',
        description: 'Fixed item for exploration, created by the seed script',
        categoryId: 'c2',
        price: 34.5,
        stock: 50,
        status: 'active',
        art: { icon: 'Lamp', hue: 223 },
    },
    {
        title: 'Seed Item Three',
        description: 'Fixed item for exploration, created by the seed script',
        categoryId: 'c3',
        price: 59,
        stock: 50,
        status: 'active',
        art: { icon: 'Shirt', hue: 9 },
    },
] as const;
