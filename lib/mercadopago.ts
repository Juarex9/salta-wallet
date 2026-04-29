import MercadoPago from 'mercadopago'

// Configure MercadoPago with access token
 MercadoPago.configure({
  access_token: process.env.MP_ACCESS_TOKEN,
})

export { MercadoPago }

// Get account balance
export async function getMPSBalance() {
  try {
    const response = await MercadoPago.balance.get()
    return {
      available: response.response.available,
      pending: response.response.pending,
      currency: response.response.currency,
    }
  } catch (error) {
    console.error('MP Balance error:', error)
    return null
  }
}

// Get user account info
export async function getMPUser() {
  try {
    const response = await MercadoPago.users.get()
    return response.response
  } catch (error) {
    console.error('MP User error:', error)
    return null
  }
}

// Create payment QR
export async function createPaymentQR(amount: number, description: string) {
  try {
    const payment = await MercadoPago.payment.create({
      transaction_amount: amount,
      description,
      payment_method_id: 'qr',
      payer: {
        email: 'payer@example.com',
      },
    })
    return payment.response
  } catch (error) {
    console.error('MP Payment error:', error)
    return null
  }
}

// Create preference (link de pago)
export async function createPaymentLink(
  amount: number,
  description: string,
  externalReference: string
) {
  try {
    const preference = await MercadoPago.preferences.create({
      items: [
        {
          title: description,
          unit_amount: amount,
          currency_id: 'ARS',
        },
      ],
      external_reference: externalReference,
    })
    return preference.response
  } catch (error) {
    console.error('MP Preference error:', error)
    return null
  }
}