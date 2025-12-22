import { Modal, Card, Row, Col, Typography, Button, Space, Divider, Tag, Descriptions, message } from 'antd';
import { WhatsAppOutlined, MailOutlined, PrinterOutlined, CloseOutlined } from '@ant-design/icons';
import type { Sale } from '../../../services/salesApi';
import { formatVenezuelanPrice } from '../../../utils/formatters';

const { Title, Text } = Typography;

interface InvoiceModalProps {
    open: boolean;
    sale: Sale | null;
    onClose: () => void;
}

export const InvoiceModal = ({ open, sale, onClose }: InvoiceModalProps) => {
    // Si no hay sale, renderizar un modal vacío que se puede cerrar
    if (!sale) {
        return (
            <Modal
                open={open}
                onCancel={onClose}
                footer={null}
                destroyOnClose
            >
                <div style={{ textAlign: 'center', padding: 20 }}>
                    Cargando datos de factura...
                </div>
            </Modal>
        );
    }

    const clientName = sale.client?.name || 'CONTADO';
    const clientPhone = (sale.client as any)?.phone || null;
    const clientEmail = (sale.client as any)?.email || null;
    const hasWhatsapp = (sale.client as any)?.hasWhatsapp || false;

    const formatWhatsAppUrl = (phone: string) => {
        let cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.startsWith('04')) {
            cleanPhone = '58' + cleanPhone.substring(1);
        } else if (!cleanPhone.startsWith('58') && cleanPhone.length === 10) {
            cleanPhone = '58' + cleanPhone;
        }

        // Build items list
        const itemsList = sale.items?.map(item =>
            `   • ${item.quantity}x ${item.product?.name || 'Producto'} - ${formatVenezuelanPrice(item.total)}`
        ).join('\n') || '';

        const invoiceMessage = encodeURIComponent(
            `🏢 *ZENITH*\n` +
            `RIF: J-00000000-0\n` +
            `━━━━━━━━━━━━━━━━\n\n` +
            `🧾 *FACTURA ${sale.invoiceNumber}*\n\n` +
            `Hola ${clientName}, aquí está el detalle de tu compra:\n\n` +
            `📅 *Fecha:* ${new Date(sale.date).toLocaleDateString('es-VE')}\n` +
            `🕐 *Hora:* ${new Date(sale.date).toLocaleTimeString('es-VE')}\n\n` +
            `📦 *Artículos:*\n${itemsList}\n\n` +
            `━━━━━━━━━━━━━━━━\n` +
            `💵 Subtotal: ${formatVenezuelanPrice(sale.subtotal)}\n` +
            (sale.discount > 0 ? `🏷️ Descuento: -${formatVenezuelanPrice(sale.discount)}\n` : '') +
            `💰 *TOTAL: ${formatVenezuelanPrice(sale.total)}*\n\n` +
            `💳 Método de pago: ${sale.paymentMethod}\n\n` +
            `¡Gracias por tu compra! 🙏\n` +
            `_Zenith ERP_`
        );
        return `https://wa.me/${cleanPhone}?text=${invoiceMessage}`;
    };

    const handleWhatsApp = () => {
        if (clientPhone && hasWhatsapp) {
            window.open(formatWhatsAppUrl(clientPhone), '_blank');
            message.success('Abriendo WhatsApp...');
            onClose();
        } else {
            message.warning('El cliente no tiene WhatsApp registrado');
        }
    };

    const handleEmail = () => {
        if (clientEmail) {
            const subject = encodeURIComponent(`Factura ${sale.invoiceNumber} - Zenith`);
            const body = encodeURIComponent(
                `Estimado/a ${clientName},\n\n` +
                `Adjunto encontrará los detalles de su factura:\n\n` +
                `Número de Factura: ${sale.invoiceNumber}\n` +
                `Fecha: ${new Date(sale.date).toLocaleDateString('es-VE')}\n` +
                `Total: ${formatVenezuelanPrice(sale.total)}\n\n` +
                `¡Gracias por su preferencia!\n\nZenith ERP`
            );
            window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
            message.success('Abriendo cliente de correo...');
            onClose();
        } else {
            message.warning('El cliente no tiene correo electrónico registrado');
        }
    };

    const handlePrint = () => {
        // Create printable invoice content with SENIAT format
        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Factura ${sale.invoiceNumber}</title>
                <style>
                    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .company-name { font-size: 18px; font-weight: bold; }
                    .invoice-title { font-size: 16px; margin-top: 10px; }
                    .fiscal-info { font-size: 10px; margin-top: 5px; color: #666; }
                    .info-section { margin: 15px 0; }
                    .info-row { display: flex; justify-content: space-between; margin: 5px 0; }
                    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f5f5f5; }
                    .totals { text-align: right; margin-top: 15px; }
                    .total-row { margin: 5px 0; }
                    .grand-total { font-size: 16px; font-weight: bold; }
                    .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #666; }
                    .seniat-notice { border: 1px solid #000; padding: 10px; margin-top: 20px; font-size: 9px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="company-name">ZENITH</div>
                    <div class="fiscal-info">RIF: J-00000000-0</div>
                    <div class="fiscal-info">Dirección Fiscal: Venezuela</div>
                    <div class="invoice-title">FACTURA</div>
                    <div style="font-size: 14px; margin-top: 5px;">${sale.invoiceNumber}</div>
                </div>
                
                <div class="info-section">
                    <div class="info-row">
                        <span><strong>Fecha:</strong> ${new Date(sale.date).toLocaleDateString('es-VE')}</span>
                        <span><strong>Hora:</strong> ${new Date(sale.date).toLocaleTimeString('es-VE')}</span>
                    </div>
                    <div class="info-row">
                        <span><strong>Cliente:</strong> ${clientName}</span>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Cant.</th>
                            <th>Descripción</th>
                            <th>P. Unit.</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items?.map(item => `
                            <tr>
                                <td>${item.quantity}</td>
                                <td>${item.product?.name || 'Producto'}</td>
                                <td>${formatVenezuelanPrice(item.unitPrice)}</td>
                                <td>${formatVenezuelanPrice(item.total)}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4">Sin items</td></tr>'}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">Subtotal: ${formatVenezuelanPrice(sale.subtotal)}</div>
                    ${sale.discount > 0 ? `<div class="total-row">Descuento: -${formatVenezuelanPrice(sale.discount)}</div>` : ''}
                    ${sale.tax > 0 ? `<div class="total-row">IVA (16%): ${formatVenezuelanPrice(sale.tax)}</div>` : ''}
                    <div class="total-row grand-total">TOTAL: ${formatVenezuelanPrice(sale.total)}</div>
                </div>
                
                <div class="info-section">
                    <div><strong>Forma de Pago:</strong> ${sale.paymentMethod}</div>
                    ${sale.tendered ? `<div><strong>Pagó con:</strong> ${formatVenezuelanPrice(sale.tendered)}</div>` : ''}
                    ${sale.change ? `<div><strong>Cambio:</strong> ${formatVenezuelanPrice(sale.change)}</div>` : ''}
                </div>
                
                <div class="seniat-notice">
                    <strong>NOTA:</strong> Esta factura cumple con las disposiciones del SENIAT.
                    Documento válido para efectos fiscales según la normativa vigente.
                </div>
                
                <div class="footer">
                    ¡Gracias por su compra!<br>
                    Generado por Zenith ERP
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
        message.success('Preparando impresión...');
        onClose();
    };

    const handleSkip = () => {
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            destroyOnClose
            maskClosable={false}
            title={
                <div style={{ textAlign: 'center' }}>
                    <Title level={4} style={{ margin: 0 }}>
                        🧾 Venta Completada
                    </Title>
                </div>
            }
        >
            <Card style={{ marginBottom: 16 }}>
                <Descriptions column={2} size="small">
                    <Descriptions.Item label="Factura" span={2}>
                        <Tag color="blue" style={{ fontSize: 16 }}>{sale.invoiceNumber}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Fecha">
                        {new Date(sale.date).toLocaleDateString('es-VE')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Hora">
                        {new Date(sale.date).toLocaleTimeString('es-VE')}
                    </Descriptions.Item>
                    <Descriptions.Item label="Cliente" span={2}>
                        <Text strong>{clientName}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="Productos">
                        {sale.items?.length || 0} artículos
                    </Descriptions.Item>
                    <Descriptions.Item label="Método de Pago">
                        {sale.paymentMethod}
                    </Descriptions.Item>
                </Descriptions>

                <Divider style={{ margin: '12px 0' }} />

                <Row justify="space-between" align="middle">
                    <Col>
                        <Text type="secondary">Total de la Venta</Text>
                    </Col>
                    <Col>
                        <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                            {formatVenezuelanPrice(sale.total)}
                        </Title>
                    </Col>
                </Row>
            </Card>

            <Divider>¿Cómo deseas enviar la factura?</Divider>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Button
                    type="primary"
                    icon={<WhatsAppOutlined />}
                    size="large"
                    block
                    style={{ background: '#25D366', borderColor: '#25D366' }}
                    onClick={handleWhatsApp}
                    disabled={!clientPhone || !hasWhatsapp}
                >
                    Enviar por WhatsApp
                    {(!clientPhone || !hasWhatsapp) && <Text type="secondary" style={{ marginLeft: 8 }}>(No disponible)</Text>}
                </Button>

                <Button
                    type="primary"
                    icon={<MailOutlined />}
                    size="large"
                    block
                    style={{ background: '#1890ff' }}
                    onClick={handleEmail}
                    disabled={!clientEmail}
                >
                    Enviar por Email
                    {!clientEmail && <Text type="secondary" style={{ marginLeft: 8 }}>(No disponible)</Text>}
                </Button>

                <Button
                    type="default"
                    icon={<PrinterOutlined />}
                    size="large"
                    block
                    onClick={handlePrint}
                >
                    Imprimir Factura (SENIAT)
                </Button>

                <Divider style={{ margin: '8px 0' }} />

                <Button
                    type="text"
                    icon={<CloseOutlined />}
                    size="large"
                    block
                    onClick={handleSkip}
                >
                    No imprimir ahora
                </Button>
            </Space>
        </Modal>
    );
};
