import { membershipModel } from '~/modules/membership/model/membership.model'
import { paymentService } from '~/modules/payment/service/payment.service'
import { userModel } from '~/modules/user/model/user.model'
import { countRemainingDays, sanitize } from '~/utils/utils'
import { SUBSCRIPTION_STATUS, PAYMENT_STATUS } from '~/utils/constants.js'
import { subscriptionModel } from '../model/subscription.model'
import { getLinkPaymentTemp } from '~/utils/redis'

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

    const result = await subscriptionModel.createNew(dataToSave)

    // handle create

    return {
      success: true,
      message: 'Subscription created successfully',
      subscriptionId: result.insertedId,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getSubDetailByUserId = async (userId) => {
  try {
    // check id
    const existingSub = await subscriptionModel.getDetailByUserId(userId)
    console.log('🚀 ~ getSubDetailByUserId ~ existingSub:', existingSub)
    // get sub
    if (existingSub === null)
      return {
        success: false,
        message: 'Subscription not found',
        myMembership: {
          remainingSessions: 0,
          startDate: '',
          endDate: '',
          status: '',
          name: '',
          durationMonth: 0,
          bannerURL: '',
          totalCheckin: 0,
        },
      }
    const { status, endDate, _id, membershipId } = existingSub
    const updateRemainingSessions = countRemainingDays(endDate)

    let updatedStatus = status
    if (updateRemainingSessions === 0) {
      updatedStatus = SUBSCRIPTION_STATUS.EXPIRED
    }

    const dataToUpdate = {
      status: updatedStatus,
      remainingSessions: updateRemainingSessions,
    }
    // update
    const result = await subscriptionModel.updateInfo(_id, dataToUpdate)
    console.log('🚀 ~ getSubDetailByUserId ~ result:', result)

    // get data membership
    const membershipInfo = await membershipModel.getDetailById(membershipId)

    const { name, durationMonth, bannerURL } = membershipInfo

    let paymentInfo = {}
    // check thanh toán chưa
    if (result.paymentStatus === PAYMENT_STATUS.UNPAID) {
      const data = await getLinkPaymentTemp(_id)
      paymentInfo = { ...data }
    }

    const dataFinal = {
      ...sanitize(result),
      name,
      durationMonth,
      bannerURL,
      totalCheckin: 0,
      ...(result.paymentStatus === PAYMENT_STATUS.UNPAID && { paymentInfo }),
    }

    return {
      success: true,
      message: 'Subscription got successfully',
      subscription: dataFinal,
    }
  } catch (error) {
    throw new Error(error)
  }
}

// unable
const updateSubscription = async (subscriptionId, data) => {
  try {
    // check id
    const isSubscriptionExist = await subscriptionModel.getDetailById(subscriptionId)
    console.log('🚀 ~ subscribeMembership ~ isSubscriptionExist:', isSubscriptionExist)
    if (isSubscriptionExist === null) return { success: false, message: 'User not found' }

    const dataToSave = {}

    const result = await subscriptionModel.createNew(dataToSave)

    // handle create

    return {
      success: true,
      message: 'Subscription created successfully',
      _id: result.insertedId,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteSubscription = async (subscriptionId) => {
  try {
    // check id
    const result = await subscriptionModel.deleteSubscription(subscriptionId)
    // handle create

    return {
      success: true,
      message: 'Subscription delete successfully',
      result,
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const subscriptionService = {
  subscribeMembership,
  updateSubscription,
  getSubDetailByUserId,
  deleteSubscription,
}
