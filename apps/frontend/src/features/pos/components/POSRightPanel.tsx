import { useState, useEffect } from 'react';
import { Button, Row, Col, Card, Spin } from 'antd';
import { ShopOutlined, ArrowLeftOutlined, AppstoreOutlined } from '@ant-design/icons';
import { departmentsApi } from '../../../services/departmentsApi';
import type { Department } from '../../../services/departmentsApi';
import { productsApi } from '../../../services/productsApi';
import type { Product } from '../../../services/productsApi';
import { usePOSStore } from '../../../store/posStore';

export const POSRightPanel = () => {
    const { addItem, preferredSecondaryCurrency, exchangeRate } = usePOSStore();

    // Navigation State
    const [viewMode, setViewMode] = useState<'ROOT' | 'DEPT' | 'SUBDEPT'>('ROOT');
    const [currentDept, setCurrentDept] = useState<Department | null>(null);
    const [currentSubDept, setCurrentSubDept] = useState<Department | null>(null);

    // Data State
    const [departments, setDepartments] = useState<Department[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);

    // Initial Load: Get Department Tree
    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const data = await departmentsApi.getTree();
            setDepartments(data);
        } finally {
            setLoading(false);
        }
    };

    // Load Products for specific level
    const loadProducts = async (deptId: string, subDeptId?: string) => {
        setLoading(true);
        try {
            const data = await productsApi.getAll({
                categoryId: deptId,
                subcategoryId: subDeptId,
                active: true
            });
            setProducts(data);
        } finally {
            setLoading(false);
        }
    };

    // Handlers
    const handleDeptClick = async (dept: Department) => {
        setCurrentDept(dept);
        setViewMode('DEPT');
        // If we want to show products mixed with subdepts in Level 1 (Dept), we'd fetch here.
        // For now, Level 1 shows SubDepts. Level 2 shows Products.
        // User requested "load subdepartments and products of that department".
        // So we will try to load products for this dept too, to mix them if needed.
        await loadProducts(dept.id);
    };

    const handleSubDeptClick = async (subDept: Department) => {
        setCurrentSubDept(subDept);
        setViewMode('SUBDEPT');
        await loadProducts(currentDept!.id, subDept.id);
    };

    const handleProductClick = (product: Product) => {
        addItem(product, false);
    };

    const handleBack = () => {
        if (viewMode === 'SUBDEPT') {
            setViewMode('DEPT');
            setCurrentSubDept(null);
            loadProducts(currentDept!.id); // Reload Level 1 products
        } else if (viewMode === 'DEPT') {
            setViewMode('ROOT');
            setCurrentDept(null);
            setProducts([]); // Clear products
        }
    };

    // Render Logic
    const renderContent = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>;
        }

        // VIEW: ROOT (Departments)
        if (viewMode === 'ROOT') {
            return departments.map(dept => (
                <Col span={6} key={dept.id}>
                    <Card
                        hoverable
                        onClick={() => handleDeptClick(dept)}
                        style={{ background: '#e6f7ff', borderColor: '#91caff', textAlign: 'center', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <ShopOutlined style={{ fontSize: 24, color: '#1890ff' }} />
                        <div style={{ fontWeight: 'bold', marginTop: 5 }}>{dept.name}</div>
                    </Card>
                </Col>
            ));
        }

        // VIEW: DEPT (SubDepartments + Direct Products)
        if (viewMode === 'DEPT' && currentDept) {
            // Show SubDepts (children) AND Products
            const subDepts = currentDept.children || [];

            const subDeptNodes = subDepts.map(sub => (
                <Col span={6} key={sub.id}>
                    <Card
                        hoverable
                        onClick={() => handleSubDeptClick(sub)}
                        style={{ background: '#f9f0ff', borderColor: '#d3adf7', textAlign: 'center', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <AppstoreOutlined style={{ fontSize: 24, color: '#722ed1' }} />
                        <div style={{ fontWeight: 'bold', marginTop: 5 }}>{sub.name}</div>
                    </Card>
                </Col>
            ));

            const productNodes = products.map(prod => (
                <Col span={6} key={prod.id}>
                    <Card
                        hoverable
                        onClick={() => handleProductClick(prod)}
                        style={{ textAlign: 'center', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ fontSize: 12, fontWeight: 'bold', overflow: 'hidden', maxHeight: 40 }}>{prod.name}</div>
                        <TagPrice price={prod.salePrice} />
                    </Card>
                </Col>
            ));

            return [...subDeptNodes, ...productNodes];
        }

        // VIEW: SUBDEPT (Products only)
        if (viewMode === 'SUBDEPT') {
            return products.map(prod => (
                <Col span={6} key={prod.id}>
                    <Card
                        hoverable
                        onClick={() => handleProductClick(prod)}
                        style={{ textAlign: 'center', height: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <div style={{ fontSize: 12, fontWeight: 'bold', overflow: 'hidden', maxHeight: 40 }}>{prod.name}</div>
                        <TagPrice price={prod.salePrice} />
                    </Card>
                </Col>
            ));
        }
    };

    const TagPrice = ({ price }: { price: number }) => {
        const secondaryPrice = exchangeRate > 0 ? price / exchangeRate : 0;
        return (
            <div style={{ marginTop: 5, textAlign: 'center' }}>
                <div style={{ background: '#f6ffed', border: '1px solid #b7eb8f', color: '#52c41a', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
                    Bs {price.toFixed(2)}
                </div>
                {preferredSecondaryCurrency && exchangeRate > 0 && (
                    <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>
                        {preferredSecondaryCurrency.symbol} {secondaryPrice.toFixed(2)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Navegación Superior */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', background: 'white', padding: 5, borderRadius: 4 }}>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                    disabled={viewMode === 'ROOT'}
                >
                    Regresar
                </Button>
                <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
                    {viewMode === 'ROOT' && 'Departamentos'}
                    {viewMode === 'DEPT' && currentDept?.name}
                    {viewMode === 'SUBDEPT' && `${currentDept?.name} > ${currentSubDept?.name}`}
                </div>
                <div style={{ display: 'flex', gap: 5 }}>
                    <Button disabled>Más...</Button>
                </div>
            </div>

            {/* Grid de Productos */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 5 }}>
                <Row gutter={[10, 10]}>
                    {renderContent()}
                    {!loading && viewMode !== 'ROOT' && products.length === 0 && (!currentDept?.children?.length) && (
                        <div style={{ width: '100%', textAlign: 'center', color: '#999', padding: 20 }}>No hay items</div>
                    )}
                </Row>
            </div>
        </div>
    );
};
