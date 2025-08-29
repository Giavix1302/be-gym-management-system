import { membershipModel } from '~/modules/membership/model/membership.model'
import { paymentService } from '~/modules/payment/service/payment.service'
import { userModel } from '~/modules/user/model/user.model'
import { sanitize } from '~/utils/utils'
import { SUBSCRIPTION_STATUS, PAYMENT_STATUS } from '~/utils/constants.js'
import { subscriptionModel } from '../model/subscription.model'

const subscribeMembership = async (data) => {
  try {
    const { userId, membershipId } = data

    // check id
    const isUserExist = await userModel.getDetailById(userId)
    console.log('🚀 ~ subscribeMembership ~ isUserExist:', isUserExist)
    if (isUserExist === null) return { success: false, message: 'User not found' }

    const isMembershipExist = await membershipModel.getDetailById(membershipId)
    console.log('🚀 ~ subscribeMembership ~ isMembershipExist:', isMembershipExist)
    if (isMembershipExist === null) return { success: false, message: 'Membership not found' }

    const dataToSave = {
      userId,
      membershipId,
      status: SUBSCRIPTION_STATUS.EXPIRED,
      paymentStatus: PAYMENT_STATUS.UNPAID,
      remainingSessions: 0,
    }

    await subscriptionModel.createNew(dataToSave)

    // handle create

    return {
      success: true,
      message: 'Subscription created successfully',
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const subscriptionService = {
  subscribeMembership,
}
