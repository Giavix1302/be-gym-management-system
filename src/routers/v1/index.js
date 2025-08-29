import express from 'express'
import { StatusCodes } from 'http-status-codes'
import { userRoute } from '~/modules/user/router/user.route.js'
import { cartRoute } from './cart.route.js'
import { productRoute } from './product.route.js'
import { authRoute } from '~/modules/auth/router/auth.route.js'

import { memberRoute } from '~/modules/membership/router/membership.router.js'
import { paymentRoute } from '~/modules/payment/router/payment.router.js'
import { subscriptionRoute } from '~/modules/subscription/router/subscription.router.js'

const Router = express.Router()

// Health check route
Router.get('/status', (req, res) => {
  res.status(StatusCodes.OK).json({
    message: 'API is running',
  })
})

Router.use('/auths', authRoute)

Router.use('/users', userRoute)

Router.use('/carts', cartRoute)

Router.use('/products', productRoute)

Router.use('/memberships', memberRoute)

Router.use('/payments', paymentRoute)

Router.use('/subscriptions', subscriptionRoute)

export const APIs_V1 = Router
