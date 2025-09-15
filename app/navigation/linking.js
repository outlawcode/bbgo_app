
const config = {
    screens: {
        ProductDetail: {
            path: 'product/:slug',
            parse: {
                slug: (slug) => `${slug}`,
            },
        },
        PostDetail: {
            path: 'post/:slug',
            parse: {
                slug: (slug) => `${slug}`,
            },
        },
        OrderDetail: {
            path: 'order/:id',
            parse: {
                id: (id) => `${id}`,
            },
        },
    }
}

const linking = {
    prefixes: ['smemart://app'],
    config
}

export default linking
