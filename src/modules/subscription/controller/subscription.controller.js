import { StatusCodes } from 'http-status-codes'
import { subscriptionService } from '../service/subscription.service'

const subscribeMembership = async (req, res, next) => {
  try {
    const result = await subscriptionService.subscribeMembership(req.body)

    if (result.success) {
      res.status(StatusCodes.OK).json(result)
    } else {
      res.status(StatusCodes.UNPROCESSABLE_ENTITY).json(result)
    }
  } catch (error) {
    next(error)
  }
}

export const subscriptionController = {
  subscribeMembership,
}
