
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Section,
  Row,
  Column,
  Button,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface OrderConfirmationEmailProps {
  customerName: string
  orderId: string
  orderItems: Array<{
    name: string
    quantity: number
    price: number
  }>
  totalAmount: number
  shippingAddress: {
    firstName: string
    lastName: string
    address: string
    city: string
    state: string
    zipCode: string
    phone: string
  }
  isAdminEmail?: boolean
  shipToken?: string
}

export const OrderConfirmationEmail = ({
  customerName,
  orderId,
  orderItems,
  totalAmount,
  shippingAddress,
  isAdminEmail = false,
  shipToken,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>{isAdminEmail ? 'New Order Received' : 'Order Confirmation'} - #{orderId.slice(0, 8)}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>
          {isAdminEmail ? '🔔 New Order Received!' : '✅ Order Confirmed!'}
        </Heading>
        
        <Text style={text}>
          {isAdminEmail 
            ? `A new order has been placed by ${customerName}.`
            : `Hi ${customerName}, your order has been confirmed and is being processed.`
          }
        </Text>

        <Section style={orderDetails}>
          <Text style={sectionTitle}>Order Details</Text>
          <Text style={orderInfo}>Order ID: #{orderId.slice(0, 8)}</Text>
          <Text style={orderInfo}>Total Amount: ₹{totalAmount.toFixed(2)}</Text>
        </Section>

        <Section style={itemsSection}>
          <Text style={sectionTitle}>Items Ordered</Text>
          {orderItems.map((item, index) => (
            <Row key={index} style={itemRow}>
              <Column style={itemName}>{item.name}</Column>
              <Column style={itemDetails}>Qty: {item.quantity}</Column>
              <Column style={itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Column>
            </Row>
          ))}
        </Section>

        <Section style={addressSection}>
          <Text style={sectionTitle}>Shipping Address</Text>
          <Text style={addressText}>
            {shippingAddress.firstName} {shippingAddress.lastName}<br/>
            {shippingAddress.address}<br/>
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br/>
            Phone: {shippingAddress.phone}
          </Text>
        </Section>

        {isAdminEmail && shipToken && (
          <Section style={adminActions}>
            <Text style={sectionTitle}>Admin Actions</Text>
            <Button
              href={`https://bxexpxnknhkgnihnumgh.supabase.co/functions/v1/update-shipping-status?token=${shipToken}&orderId=${orderId}&status=shipped`}
              style={shipButton}
            >
              Mark as Shipped
            </Button>
          </Section>
        )}

        <Text style={footer}>
          {isAdminEmail 
            ? 'This email was sent to notify you of a new order.'
            : 'Thank you for your order! We\'ll send you tracking information once your order ships.'
          }
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px',
  maxWidth: '600px',
}

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px 0',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 20px 0',
}

const orderDetails = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
}

const sectionTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 10px 0',
}

const orderInfo = {
  color: '#666',
  fontSize: '14px',
  margin: '5px 0',
}

const itemsSection = {
  margin: '20px 0',
}

const itemRow = {
  borderBottom: '1px solid #eee',
  padding: '10px 0',
}

const itemName = {
  fontSize: '14px',
  fontWeight: 'bold',
}

const itemDetails = {
  fontSize: '14px',
  color: '#666',
  textAlign: 'center' as const,
}

const itemPrice = {
  fontSize: '14px',
  fontWeight: 'bold',
  textAlign: 'right' as const,
}

const addressSection = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
}

const addressText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}

const adminActions = {
  backgroundColor: '#e3f2fd',
  padding: '20px',
  borderRadius: '8px',
  margin: '20px 0',
  textAlign: 'center' as const,
}

const shipButton = {
  backgroundColor: '#4caf50',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
}

const footer = {
  color: '#888',
  fontSize: '12px',
  marginTop: '40px',
  textAlign: 'center' as const,
}
