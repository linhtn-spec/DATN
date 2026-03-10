import { Client } from '@elastic/elasticsearch';
import { Router } from "express";

const router = Router();

// Build Elasticsearch connection URL based on environment variables
const buildElasticsearchUrl = () => {
    let host = process.env.ELASTICSEARCH_HOST || 'http://localhost:9200';
    const username = process.env.ELASTICSEARCH_USERNAME || 'elastic';
    const password = process.env.ELASTICSEARCH_PASSWORD || '';
    
    // Ensure host has protocol
    if (!host.startsWith('http://') && !host.startsWith('https://')) {
        host = `http://${host}`;
    }
    
    // If password is empty, return host as-is
    if (!password || password.trim() === '') {
        return host;
    }
    
    // Parse and rebuild URL with auth
    try {
        const url = new URL(host);
        url.username = username;
        url.password = password;
        return url.toString();
    } catch (e) {
        // Fallback: simple string building
        const protocol = host.startsWith('https://') ? 'https' : 'http';
        const hostOnly = host.replace(/^https?:\/\//, '');
        return `${protocol}://${username}:${password}@${hostOnly}`;
    }
};

const client = new Client({
    node: buildElasticsearchUrl(),
    tls: {
        rejectUnauthorized: false
    }
});

router.get('/search', async (req, res) => {
    const { searchParam, page } = req.query;
    const limit = 6;
    const skip = page ? limit * (page - 1) : 0
    try {
        const productResult = await client.search({
            index: 'products',
            from: skip,
            size: limit,
            body: {
                query: {
                    multi_match: {
                        query: searchParam,
                        fields: ['name'],
                        fuzziness: "AUTO",
                        operator: "and",
                        auto_generate_synonyms_phrase_query: true
                    }
                }
            }

        });

        const totalItem = productResult.body.hits.total.value;
        const products = productResult.body.hits.hits;

        // Lấy danh sách các productIds từ kết quả tìm kiếm sản phẩm
        const productIds = products.map(product => product._id);

        let sales = [];
        let salesMap = {};

        // Tìm tất cả các sales liên quan đến các productIds
        try {
            const saleResult = await client.search({
                index: 'sales',
                body: {
                    query: {
                        bool: {
                            should: [
                                {
                                    terms: {
                                        'products.productId': productIds
                                    }
                                }
                            ]
                        }
                    }
                }
            });
            sales = saleResult.body.hits.hits;

            // Map productIds đến sales
            salesMap = sales.reduce((map, sale) => {
                sale._source.products.forEach(product => {
                    if (productIds.includes(product.productId)) {
                        if (!map[product.productId]) {
                            map[product.productId] = [];
                        }
                        map[product.productId].push({
                            saleId: sale._id,
                            pricePromotion: product.pricePromotion,
                            applyDate: sale._source.applyDate,
                            dueDate: sale._source.dueDate,
                            isActive: sale._source.isActive
                        });
                    }
                });
                return map;
            }, {});
        } catch (saleError) {
            console.error("Sales index error or missing:", saleError.message);
            // Continue without sales data
        }

        // Gán thông tin sale vào sản phẩm
        const results = products.map(product => {
            const productId = product._id;
            return {
                ...product._source,
                _id: productId,
                sales: salesMap[productId] || []
            };
        });

        return res.status(200).json({ item: results, total: totalItem });
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})
router.get('/suggest', async (req, res) => {
    const { keyword } = req.query;
    if (!keyword) return res.status(200).json([]);

    try {
        const result = await client.search({
            index: 'products',
            size: 10,
            body: {
                query: {
                    multi_match: {
                        query: keyword,
                        fields: ['name'],
                        fuzziness: "AUTO",
                        operator: "and"
                    }
                },
                _source: ['name', 'images', 'price', 'origin']
            }
        });

        const suggestions = result.body.hits.hits.map(hit => ({
            id: hit._id,
            name: hit._source.name,
            image: hit._source.images?.[0] || null,
            price: hit._source.price || 0,
            origin: hit._source.origin || ''
        }));

        return res.status(200).json(suggestions);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
export default router;