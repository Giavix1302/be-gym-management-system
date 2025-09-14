import { membershipModel } from '../model/membership.model'
import { sanitize } from '~/utils/utils'

const addMembership = async (req) => {
  try {
    // check duplicate

    // handle data
    const image = req.file
    const { imgUrl, ...rest } = req.body

    const membershipToAdd = {
      ...rest,
      features: JSON.parse(req.body.features),
      bannerURL: image.path,
    }
    console.log('🚀 ~ addMembership ~ membershipToAdd:', membershipToAdd)

    // create membership
    const result = await membershipModel.createNew(membershipToAdd)

    // Get the newly created membership
    const membership = await membershipModel.getDetailById(result.insertedId)
    return {
      success: true,
      message: 'Membership created successfully',
      membership: membership,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const getListMembership = async () => {
  try {
    const list = await membershipModel.getListWithQuantityUser()

    const arr = Object.values(list)
    console.log('🚀 ~ getListMembership ~ arr:', arr)

    return {
      success: true,
      message: 'Get list membership successfully',
      memberships: arr,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const updateMemberShip = async (req) => {
  try {
    // transform data
    const membershipId = req.params.id
    const banner = req.file
    const features = req.body.features

    const updateData = {
      ...req.body,
      ...(banner && { bannerURL: banner.path }),
      ...(features && { features: JSON.parse(req.body.features) }),
      updatedAt: Date.now(),
    }
    console.log('🚀 ~ updateMemberShip ~ updateData:', updateData)

    const updatedMembership = await membershipModel.updateInfo(membershipId, updateData)

    // check membership exist
    if (updatedMembership === null) {
      return {
        success: false,
        message: 'Product does not exist.',
      }
    }

    return {
      success: true,
      message: 'Membership updated successfully',
      updatedMembership,
    }
  } catch (error) {
    throw new Error(error)
  }
}

const deleteMembership = async (productId) => {
  try {
    // handle data
    const result = await membershipModel.deleteMembership(productId)
    // const memberships = await membershipModel.getListWithQuantityUser()
    return {
      success: result === 1,
      message: result === 1 ? 'Delete done!' : 'Delete false!',
      // memberships: result === 1 ? [...memberships] : '',
    }
  } catch (error) {
    throw new Error(error)
  }
}

export const membershipService = {
  addMembership,
  getListMembership,
  updateMemberShip,
  deleteMembership,
}
